/**
 * The table command's model route, for the merchant sales template and the labs bench: one sentence and the table's current
 * setup in, a new setup and a one-line account out. Claude never sees the
 * rows wholesale. It reads the schema, asks the ledger questions through two
 * tools that run here over the same seeded rows the browser shows, and answers
 * in a schema that can only name real columns. Public, so it runs behind the
 * site chat's guardrails: the same per-visitor limits, daily breaker and budget,
 * with its own caps on the request's size and the number of turns. Nothing is
 * stored here, and the ledger is seeded and fictional.
 */

import Anthropic from '@anthropic-ai/sdk';
import { guardrails } from '../chat/guardrails';
import { LEDGER_TODAY, ROW_COUNT } from '@/data/order-ledger';
import { LEDGER_COLUMNS_TEXT, LEDGER_TOOLS, VIEW_SCHEMA, columnValues, describeQuery, matchingRows, queryData, viewProblems, type ColumnValuesInput, type QueryInput } from '@/lib/order-ledger-tools';
import { nextView, type LedgerViewChange } from '@/lib/order-ledger-view';
import type { TableView } from '../../../../../src/components/DataTable/views';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = 'claude-sonnet-5-5';
const MAX_TURNS = 6;
/* Lookups stop here and the model must answer: at low effort Sonnet can re-run a query it already has the answer to until the turns run out. */
const MAX_LOOKUP_TURNS = 3;
const MAX_TEXT_CHARS = 300;
const MAX_BODY_CHARS = 16 * 1024;
const client = new Anthropic();

const ANSWER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['message', 'view'],
  properties: {
    message: { type: 'string' },
    view: VIEW_SCHEMA,
  },
};

type Answer = { message: string; view: LedgerViewChange };

const SYSTEM = `You drive a data table for someone exploring an order ledger. They type one instruction; you set the table up to show what they asked for.

The ledger has ${ROW_COUNT.toLocaleString('en-US')} orders. Today is ${LEDGER_TODAY}. Resolve relative dates against today into YYYY-MM-DD values.

${LEDGER_COLUMNS_TEXT}

Your answer sets the table's new state. For each field of view, null leaves it as it is and a value replaces it whole, so to add a filter send the existing filters plus the new one, and to clear filters send an empty list. visibleColumns is the complete ordered list of columns to show; keep orderId first unless told otherwise, and bring in the columns the instruction is about. Each table groups by one column at a time. Filters always combine with AND. Group rows show each column's built-in aggregate, and groups cannot be ordered by an aggregate.

Before answering, use query_data whenever the instruction depends on the data: a threshold ("unusually large", "above average"), a ranking of groups ("worst carrier", "top 10 customers"), or an exact name the person only half typed (column_values). Turn what you learn into filters, for example a top-10 becomes customer isAnyOf those ten names. Only cite numbers a tool gave you. The ledger never changes, so run a query once and never repeat one; as soon as you have what you need, answer.

message is one or two plain sentences saying what the table now shows and, if you looked anything up, what you found, with the figures. If part of the request can't be done with these controls (editing data, charts, totals footers), do what you can and say which part you left out. If the instruction has nothing to do with the table, leave every view field null and say so.`;

export async function POST(request: Request) {
  const started = Date.now();
  if (process.env.CHAT_ENABLED !== 'true' || !process.env.ANTHROPIC_API_KEY)
    return Response.json({ error: 'The table command is switched off right now.' }, { status: 503 });
  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) return Response.json({ error: 'That request is too large.' }, { status: 413 });
  let text: unknown;
  let view: TableView;
  try {
    ({ text, view } = JSON.parse(raw) as { text: unknown; view: TableView });
  } catch {
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  }
  if (typeof text !== 'string' || !text.trim() || !view || typeof view !== 'object')
    return Response.json({ error: 'That request could not be read.' }, { status: 400 });
  if (text.length > MAX_TEXT_CHARS)
    return Response.json({ error: `Keep it under ${MAX_TEXT_CHARS} characters.` }, { status: 413 });
  const verdict = (await guardrails.check?.(request)) ?? { allowed: true as const, tier: 'open' as const };
  if (!verdict.allowed) return Response.json({ error: verdict.notice }, { status: 429 });
  if (verdict.tier !== 'open')
    return Response.json({ error: 'The table command has hit its budget for today. Try again tomorrow.' }, { status: 429 });
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    { role: 'user', content: `The table's current setup:\n${JSON.stringify({ ...view, columnWidths: undefined })}\n\nInstruction: ${text}` },
  ];
  const usage = { input: 0, cached: 0, cacheWrite: 0, output: 0 };
  const steps: string[] = [];

  try {
    for (let turn = 0; turn < MAX_TURNS; turn += 1) {
      const response = await client.beta.messages.create(
        {
          model: MODEL,
          max_tokens: 16000,
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          output_config: { effort: 'low', format: { type: 'json_schema', schema: ANSWER_SCHEMA } },
          system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
          tools: LEDGER_TOOLS,
          tool_choice: { type: turn >= MAX_LOOKUP_TURNS ? 'none' : 'auto' },
          messages,
        } as unknown as Anthropic.Beta.Messages.MessageCreateParamsNonStreaming,
        { signal: request.signal },
      );
      await guardrails.onUsage?.(response.usage, MODEL);
      usage.input += response.usage.input_tokens;
      usage.cached += response.usage.cache_read_input_tokens ?? 0;
      usage.cacheWrite += response.usage.cache_creation_input_tokens ?? 0;
      usage.output += response.usage.output_tokens;
      messages.push({ role: 'assistant', content: response.content });

      if (response.stop_reason === 'refusal') return Response.json({ error: 'The model declined that instruction. The table has not changed.' }, { status: 422 });
      if (response.stop_reason === 'max_tokens') return Response.json({ error: 'The answer ran too long. The table has not changed.' }, { status: 502 });

      if (response.stop_reason === 'tool_use') {
        const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
        for (const block of response.content) {
          if (block.type !== 'tool_use') continue;
          const output = block.name === 'query_data' ? queryData(block.input as QueryInput) : columnValues(block.input as ColumnValuesInput);
          steps.push(block.name === 'query_data' ? describeQuery(block.input as QueryInput) : `values of ${(block.input as { column: string }).column}`);
          results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(output), is_error: 'error' in output });
        }
        messages.push({ role: 'user', content: results });
        continue;
      }

      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') return Response.json({ error: 'The model gave no answer. The table has not changed.' }, { status: 502 });
      const answer = JSON.parse(textBlock.text) as Answer;
      const problems = viewProblems(answer.view);
      if (problems.length) {
        steps.push('corrected its own filters');
        messages.push({ role: 'user', content: `That setup can't be applied: ${problems.join(' ')} Answer again.` });
        continue;
      }
      const applied = nextView(view, answer.view);
      return Response.json({
        view: applied,
        message: answer.message,
        trace: {
          steps,
          turns: turn + 1,
          ms: Date.now() - started,
          usage,
          matching: matchingRows(applied.filters ?? []).length,
        },
      });
    }
    return Response.json({ error: 'That took too many steps. The table has not changed.' }, { status: 502 });
  } catch (error) {
    if (error instanceof Anthropic.APIUserAbortError) return new Response(null, { status: 499 });
    if (error instanceof Anthropic.AuthenticationError) return Response.json({ error: 'The table command is unavailable right now.' }, { status: 502 });
    if (error instanceof Anthropic.RateLimitError) return Response.json({ error: 'Rate limited. Try again in a moment.' }, { status: 429 });
    if (error instanceof Anthropic.APIConnectionError) return Response.json({ error: 'Could not reach the model. The table has not changed.' }, { status: 502 });
    if (error instanceof Anthropic.APIError) return Response.json({ error: 'The model call failed. The table has not changed.' }, { status: 502 });
    throw error;
  }
}
