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
import type { DataTableRow } from 'rift-ds/components/DataTable/DataTable';
import { COLUMN_KEYS, LEDGER_COLUMNS, LEDGER_TODAY, ROW_COUNT, ledgerRows } from '@/data/order-ledger';
import { TYPE_DEFAULTS, type ColumnType } from '../../../../../src/components/DataTable/columnTypes';
import { OPERATORS, VALUELESS, matches, type Filter, type FilterKind, type FilterOperator } from '../../../../../src/components/DataTable/filterModel';
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

type LooseColumn = { key: string; header: string; type?: ColumnType; options?: { value: string }[]; groupable?: boolean };
const COLUMNS = LEDGER_COLUMNS as readonly LooseColumn[];
const BY_KEY = new Map(COLUMNS.map((col) => [col.key, col]));

const kindOf = (col: LooseColumn): FilterKind => (col.type ? TYPE_DEFAULTS[col.type].filter : col.options ? 'enum' : 'text');
/* The two free-text columns also take a list, which is how a top-N becomes a filter. */
const operatorsFor = (col: LooseColumn): FilterOperator[] =>
  col.type || col.options ? OPERATORS[kindOf(col)] : [...OPERATORS.text, 'isAnyOf', 'isNoneOf'];

const ALL_OPERATORS = [...new Set(Object.values(OPERATORS).flat()), 'isAnyOf', 'isNoneOf'] as FilterOperator[];

const FILTER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['column', 'operator', 'value'],
  properties: {
    column: { type: 'string', enum: COLUMN_KEYS },
    operator: { type: 'string', enum: [...new Set(ALL_OPERATORS)] },
    value: {
      description: 'A string or number; a list of strings for set operators; a [low, high] list of strings for between; null for operators that take no value.',
      anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'array', items: { type: 'string' } }, { type: 'null' }],
    },
  },
} as const;

const nullable = (schema: object) => ({ anyOf: [schema, { type: 'null' }] });

const ANSWER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['message', 'view'],
  properties: {
    message: { type: 'string' },
    view: {
      type: 'object',
      additionalProperties: false,
      required: ['search', 'filters', 'sorts', 'visibleColumns', 'pinnedColumns', 'grouping', 'density'],
      properties: {
        search: nullable({ type: 'string' }),
        filters: nullable({ type: 'array', items: FILTER_SCHEMA }),
        sorts: nullable({
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['key', 'direction'],
            properties: { key: { type: 'string', enum: COLUMN_KEYS }, direction: { type: 'string', enum: ['asc', 'desc'] } },
          },
        }),
        visibleColumns: nullable({ type: 'array', items: { type: 'string', enum: COLUMN_KEYS } }),
        pinnedColumns: nullable({ type: 'array', items: { type: 'string', enum: COLUMN_KEYS } }),
        grouping: nullable({ type: 'array', items: { type: 'string', enum: COLUMN_KEYS } }),
        density: nullable({ type: 'string', enum: ['default', 'compact'] }),
      },
    },
  },
};

type Answer = {
  message: string;
  view: {
    search: string | null;
    filters: Omit<Filter, 'id'>[] | null;
    sorts: { key: string; direction: 'asc' | 'desc' }[] | null;
    visibleColumns: string[] | null;
    pinnedColumns: string[] | null;
    grouping: string[] | null;
    density: 'default' | 'compact' | null;
  };
};

const SYSTEM = `You drive a data table for someone exploring an order ledger. They type one instruction; you set the table up to show what they asked for.

The ledger has ${ROW_COUNT.toLocaleString('en-US')} orders. Today is ${LEDGER_TODAY}. Resolve relative dates against today into YYYY-MM-DD values.

Columns (key | header | type | filter operators | choices):
${COLUMNS.map((col) =>
  [col.key, col.header, col.type ?? 'text', operatorsFor(col).join(','), col.options?.map((option) => option.value).join(', ') ?? ''].join(' | ') +
  (col.groupable ? ' | groupable' : ''),
).join('\n')}

Your answer sets the table's new state. For each field of view, null leaves it as it is and a value replaces it whole, so to add a filter send the existing filters plus the new one, and to clear filters send an empty list. visibleColumns is the complete ordered list of columns to show; keep orderId first unless told otherwise, and bring in the columns the instruction is about. Each table groups by one column at a time. Filters always combine with AND. Group rows show each column's built-in aggregate, and groups cannot be ordered by an aggregate.

Before answering, use query_data whenever the instruction depends on the data: a threshold ("unusually large", "above average"), a ranking of groups ("worst carrier", "top 10 customers"), or an exact name the person only half typed (column_values). Turn what you learn into filters, for example a top-10 becomes customer isAnyOf those ten names. Only cite numbers a tool gave you. The ledger never changes, so run a query once and never repeat one; as soon as you have what you need, answer.

message is one or two plain sentences saying what the table now shows and, if you looked anything up, what you found, with the figures. If part of the request can't be done with these controls (editing data, charts, totals footers), do what you can and say which part you left out. If the instruction has nothing to do with the table, leave every view field null and say so.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'query_data',
    description: 'Runs a count or calculation over the ledger, optionally filtered and grouped, and returns the top results. Filters use the same columns and operators as the table.',
    strict: true,
    input_schema: {
      type: 'object',
      additionalProperties: false,
      required: ['filters', 'group_by', 'metric', 'metric_column', 'order', 'limit'],
      properties: {
        filters: { type: 'array', items: FILTER_SCHEMA },
        group_by: nullable({ type: 'string', enum: COLUMN_KEYS }),
        metric: { type: 'string', enum: ['count', 'sum', 'avg', 'min', 'max', 'p50', 'p90', 'p95', 'p99'] },
        metric_column: nullable({ type: 'string', enum: COLUMN_KEYS }),
        order: { type: 'string', enum: ['asc', 'desc'] },
        limit: { type: 'integer' },
      },
    } as unknown as Anthropic.Tool['input_schema'],
  },
  {
    name: 'column_values',
    description: "Lists a column's distinct values with how many orders hold each, most common first, optionally only those containing some text. Use it to find exact names.",
    strict: true,
    input_schema: {
      type: 'object',
      additionalProperties: false,
      required: ['column', 'contains', 'limit'],
      properties: {
        column: { type: 'string', enum: COLUMN_KEYS },
        contains: nullable({ type: 'string' }),
        limit: { type: 'integer' },
      },
    } as unknown as Anthropic.Tool['input_schema'],
  },
];

const filterRows = (rows: DataTableRow[], filters: Omit<Filter, 'id'>[]) =>
  filters.length === 0
    ? rows
    : rows.filter((row) =>
        filters.every((filter) => matches({ ...filter, id: '' } as Filter, row.values[filter.column] as Parameters<typeof matches>[1])),
      );

const calculate = (metric: string, values: number[]) => {
  if (metric === 'count') return values.length;
  if (values.length === 0) return null;
  if (metric === 'sum') return values.reduce((a, b) => a + b, 0);
  if (metric === 'avg') return values.reduce((a, b) => a + b, 0) / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  if (metric === 'min') return sorted[0];
  if (metric === 'max') return sorted[sorted.length - 1];
  return sorted[Math.min(sorted.length - 1, Math.floor((Number(metric.slice(1)) / 100) * sorted.length))];
};

const round = (value: number | null) => (value === null ? null : Math.round(value * 100) / 100);

function queryData(input: { filters: Omit<Filter, 'id'>[]; group_by: string | null; metric: string; metric_column: string | null; order: 'asc' | 'desc'; limit: number }) {
  const problems = filterProblems(input.filters);
  if (problems.length) return { error: problems.join(' ') };
  if (input.metric !== 'count' && !input.metric_column) return { error: `${input.metric} needs a metric_column.` };
  const rows = filterRows(ledgerRows(), input.filters);
  const numbers = (list: DataTableRow[]) =>
    input.metric === 'count' ? new Array<number>(list.length).fill(0) : list.map((row) => row.values[input.metric_column!]).filter((value): value is number => typeof value === 'number');
  if (!input.group_by) return { matching_orders: rows.length, value: round(calculate(input.metric, numbers(rows))) };
  const groups = new Map<string, DataTableRow[]>();
  for (const row of rows) {
    const raw = row.values[input.group_by];
    const key = raw == null || raw === '' ? '(empty)' : String(raw);
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  }
  const results = [...groups].map(([group, list]) => ({ group, orders: list.length, value: round(calculate(input.metric, numbers(list))) }));
  results.sort((a, b) => ((a.value ?? 0) - (b.value ?? 0)) * (input.order === 'asc' ? 1 : -1));
  return { matching_orders: rows.length, group_count: results.length, results: results.slice(0, Math.min(input.limit, 100)) };
}

function columnValues(input: { column: string; contains: string | null; limit: number }) {
  const counts = new Map<string, number>();
  const needle = input.contains?.toLowerCase();
  for (const row of ledgerRows()) {
    const raw = row.values[input.column];
    for (const value of Array.isArray(raw) ? raw : [raw]) {
      if (value == null || value === '') continue;
      const text = String(value);
      if (needle && !text.toLowerCase().includes(needle)) continue;
      counts.set(text, (counts.get(text) ?? 0) + 1);
    }
  }
  return { distinct: counts.size, values: [...counts].sort((a, b) => b[1] - a[1]).slice(0, Math.min(input.limit, 100)).map(([value, orders]) => ({ value, orders })) };
}

/** What is wrong with a set of filters: a condition the column doesn't take, or a value of the wrong shape. */
function filterProblems(filters: Omit<Filter, 'id'>[]) {
  const problems: string[] = [];
  for (const filter of filters) {
    const col = BY_KEY.get(filter.column);
    if (!col) problems.push(`Unknown column ${filter.column}.`);
    else if (!operatorsFor(col).includes(filter.operator)) problems.push(`${filter.column} does not take ${filter.operator}; it takes ${operatorsFor(col).join(', ')}.`);
    else if (filter.operator === 'between' && !(Array.isArray(filter.value) && filter.value.length === 2)) problems.push(`${filter.column} between needs a [low, high] list.`);
    else if (['isAnyOf', 'isNoneOf', 'hasAnyOf', 'hasAllOf', 'hasNoneOf'].includes(filter.operator) && !Array.isArray(filter.value)) problems.push(`${filter.column} ${filter.operator} needs a list.`);
    else if (!VALUELESS.has(filter.operator) && (filter.value == null || filter.value === '')) problems.push(`${filter.column} ${filter.operator} needs a value.`);
  }
  return problems;
}

function answerProblems(answer: Answer) {
  const problems = filterProblems(answer.view.filters ?? []);
  for (const key of answer.view.grouping ?? []) if (!BY_KEY.get(key)?.groupable) problems.push(`${key} cannot be grouped.`);
  return problems;
}

/** The current view with the answer laid over it. */
function nextView(current: TableView, { view }: Answer): TableView {
  const next: TableView = { ...current, version: 1 };
  if (view.search !== null) next.search = view.search;
  if (view.filters) next.filters = view.filters.map((filter, index) => ({ ...filter, id: `${filter.column}-${index + 1}`, value: VALUELESS.has(filter.operator) ? undefined : filter.value }));
  if (view.sorts) next.sorts = view.sorts;
  if (view.visibleColumns) {
    next.hiddenColumns = COLUMN_KEYS.filter((key) => !view.visibleColumns!.includes(key));
    next.columnOrder = [...view.visibleColumns, ...next.hiddenColumns];
  }
  if (view.pinnedColumns) next.columnPinning = { start: view.pinnedColumns, end: current.columnPinning?.end ?? [] };
  if (view.grouping) next.grouping = view.grouping;
  if (view.density) next.size = view.density;
  return next;
}

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
          tools: TOOLS,
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
          const output = block.name === 'query_data' ? queryData(block.input as Parameters<typeof queryData>[0]) : columnValues(block.input as Parameters<typeof columnValues>[0]);
          steps.push(block.name === 'query_data' ? describeQuery(block.input as Parameters<typeof queryData>[0]) : `values of ${(block.input as { column: string }).column}`);
          results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(output), is_error: 'error' in output });
        }
        messages.push({ role: 'user', content: results });
        continue;
      }

      const textBlock = response.content.find((block) => block.type === 'text');
      if (!textBlock || textBlock.type !== 'text') return Response.json({ error: 'The model gave no answer. The table has not changed.' }, { status: 502 });
      const answer = JSON.parse(textBlock.text) as Answer;
      const problems = answerProblems(answer);
      if (problems.length) {
        steps.push('corrected its own filters');
        messages.push({ role: 'user', content: `That setup can't be applied: ${problems.join(' ')} Answer again.` });
        continue;
      }
      const applied = nextView(view, answer);
      return Response.json({
        view: applied,
        message: answer.message,
        trace: {
          steps,
          turns: turn + 1,
          ms: Date.now() - started,
          usage,
          matching: filterRows(ledgerRows(), applied.filters ?? []).length,
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

const describeQuery = (input: { filters: unknown[]; group_by: string | null; metric: string; metric_column: string | null }) =>
  `${input.metric}${input.metric_column ? ` of ${input.metric_column}` : ''}${input.group_by ? ` by ${input.group_by}` : ''}${input.filters.length ? ` (${input.filters.length} filters)` : ''}`;
