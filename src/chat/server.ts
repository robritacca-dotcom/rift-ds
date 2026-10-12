/**
 * rift-ds/chat/server: the widget's backend, as web-standard request
 * handlers. Mount `createChatHandler` on a POST route (Next's app router,
 * Remix, Hono, a plain Node server over the fetch API) and the fetch
 * transport in the widget speaks to it unchanged. Its two siblings serve
 * the follow-up questions and the thumbs verdicts the widget sends.
 *
 * The protocol is fixed here; the configuration is the host's. Fixed: the
 * NDJSON framing, the event order (`status`, `model`, `models`, then status
 * and delta events, an optional `notice`, `exchange`, and always `done`
 * last), the body caps, the rule that guardrail outcomes are 200 plus a
 * `notice` (a rate limit reads as a reply, not a broken widget; non-2xx is
 * reserved for malformed requests), and the rule that `error` is only ever
 * emitted before the first delta (an error event replaces streamed text, so
 * once text is flowing a failure ends the turn with `done` and the partial
 * stands). The host supplies the system prompt, the model list, the tools,
 * the guardrails and the copy.
 *
 * Needs the optional peer `@anthropic-ai/sdk`. No Next.js import anywhere:
 * the route file a host writes (or `npx rift-ds init chat` writes for it)
 * owns the segment config and the environment reads.
 */
import Anthropic from '@anthropic-ai/sdk';
import { SUGGESTION_MAX_CHARS, fitsChip } from './suggestions';
import type { ChatCard, ChatEvent, ChatFeedbackVerdict, ChatModelOption, ChatTransportMessage } from './types';

/* ============================================
   Tools
   ============================================ */

/** What a tool hands back: text for the model, and optionally a card for the visitor. */
export interface ChatToolResult {
  /** The tool result the model reads. */
  text: string;
  /** Rich content streamed to the widget as a `card` event, drawn by the provider's renderers. */
  card?: ChatCard;
}

/** One deterministic tool the model may call. */
export interface ChatTool {
  /** The Anthropic tool definition: name, description, input schema. */
  definition: Anthropic.Messages.Tool;
  /** Runs the tool. Return a string for the model, or a result with a card for the visitor too. Never throw for bad input: return an error string the model can recover from. */
  execute: (input: Record<string, unknown>) => string | ChatToolResult | Promise<string | ChatToolResult>;
  /** The trace point shown while the round runs, e.g. "Checked the Button prop contract". */
  tracePoint?: (input: Record<string, unknown>) => string;
}

/* ============================================
   Guardrails
   ============================================ */

/**
 * How much of the day's budget remains, as a model policy: `open` means the
 * default model serves, `reduced` means the budget model is the default (the
 * better one stays selectable), `locked` means only the budget model serves.
 */
export type ModelTier = 'open' | 'reduced' | 'locked';

export type GuardrailVerdict =
  | { allowed: true; tier: ModelTier }
  | { allowed: false; notice: string };

/** Anthropic's usage block, narrowed to the fields a spend estimate needs. */
export interface TokenUsage {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

/** One logged exchange: what was asked, what came back, and the numbers. */
export interface ExchangeLog {
  /** Minted per request and streamed to the widget, so a feedback verdict can be joined back to this line. */
  id: string;
  question: string;
  answer: string;
  /** The sanitised context the request carried, or null. */
  path: string | null;
  /** The model id that served, absent on guardrail notices. */
  model?: string;
  usage?: TokenUsage;
  /** Milliseconds from request to the stream closing. */
  latencyMs: number;
  /** Milliseconds to the first response text, what the visitor feels. */
  firstTextMs: number | null;
  /** True when the answer is a guardrail notice, not a model response. */
  notice: boolean;
  /** The opaque per-visitor key. */
  visitor: string;
}

/**
 * The hooks the handlers call around a request. Every member is optional
 * and every one fails open: a missing hook means no limit, no log, no
 * tiering. `rift-ds/chat/upstash` implements the set over Redis.
 */
export interface ChatGuardrails {
  /** Rate limits and the daily breaker. Return a notice to answer with instead of calling the model. */
  check?: (request: Request) => Promise<GuardrailVerdict>;
  /** A stable, opaque key for the visitor (a salted hash, never an address). */
  visitorKey?: (request: Request) => Promise<string> | string;
  /** Called with the real token counts after every model call. */
  onUsage?: (usage: TokenUsage, modelId: string) => Promise<void>;
  /** Called once per exchange. Its presence is what makes the handler stream an `exchange` id, and so what shows the thumbs. */
  onExchange?: (entry: ExchangeLog) => Promise<void>;
  /** Per-visitor limit for the follow-ups handler. */
  checkFollowups?: (request: Request) => Promise<boolean>;
  /** Per-visitor limit for the feedback handler. */
  checkFeedback?: (request: Request) => Promise<boolean>;
  /** Stores one verdict per exchange id. */
  onFeedback?: (exchangeId: string, verdict: ChatFeedbackVerdict, visitor: string) => Promise<void>;
}

/* ============================================
   The chat handler
   ============================================ */

export interface ChatLimits {
  /** Turns kept from the client's history. Older context is dropped. */
  maxTurns: number;
  /** Longest single message accepted, in characters. */
  maxMessageChars: number;
  /** Longest whole conversation accepted, summed across every kept turn. */
  maxTotalChars: number;
  /** Hard ceiling on the raw request body, rejected before it is parsed. */
  maxBodyChars: number;
  /** Trace points shown under the status label before the rest is dropped. */
  maxTracePoints: number;
}

export const DEFAULT_CHAT_LIMITS: ChatLimits = {
  maxTurns: 10,
  maxMessageChars: 4000,
  maxTotalChars: 40000,
  maxBodyChars: 64 * 1024,
  maxTracePoints: 8,
};

export interface ChatHandlerCopy {
  /** The reply when the chat is switched off or unconfigured. */
  disabled: string;
  /** The reply to a message over `maxMessageChars`. */
  tooLong: string;
  /** The reply when the model refuses and nothing was streamed. */
  refusal: string;
  /** Appended when the answer hit the token cap. */
  cutOff: string;
  /** The first status label, proving the stream opened. */
  reading: string;
  /** The status label while thinking. */
  thinking: string;
  /** The status label while a tool round runs. */
  lookingUp: string;
  /** The error for a busy or overloaded model. */
  busy: string;
  /** The error for a rejected key. */
  unauthorised: string;
  /** The error for anything else before the first text. */
  failed: string;
}

export const DEFAULT_CHAT_COPY: ChatHandlerCopy = {
  disabled: 'This chat is switched off at the moment.',
  tooLong: 'That message is longer than this chat can take. Trim it to the essentials and send it again.',
  refusal: 'That one is outside what this chat covers.',
  cutOff: '\n\n(Cut off at the length limit.)',
  reading: 'Reading',
  thinking: 'Thinking',
  lookingUp: 'Looking it up',
  busy: 'The model is busy right now. Give it a moment and ask again.',
  unauthorised: 'This chat is not configured correctly at the moment.',
  failed: 'Something went wrong reaching the model. Try that again in a moment.',
};

export type SystemBlocks = Anthropic.Messages.TextBlockParam[];

export interface ChatHandlerOptions {
  /** An Anthropic client to reuse, or `apiKey` to build one from. */
  client?: Anthropic;
  apiKey?: string;
  /** The off switch. Defaults to whether a client or key is present. */
  enabled?: boolean;
  /**
   * The system prompt, as blocks. A string is one block; a function builds
   * them per request from the sanitised context. Put `cache_control` on the
   * block that holds your corpus, and nothing volatile before it.
   */
  system: string | SystemBlocks | ((context: { path: string | null }) => string | SystemBlocks);
  /**
   * An uncached trailing block built from the request's context, after the
   * cache breakpoint. Defaults to naming the page; return null for none.
   */
  contextBlock?: (path: string) => string | null;
  /** The models on offer. The client sends a `value`; the handler calls the matching `id`. */
  models: ChatModelOption[];
  /** The wire value that serves when the budget has headroom and the visitor has not chosen. Defaults to the first model. */
  defaultModel?: string;
  /** The wire value that serves once the budget steps down, and the only one past the lock. Defaults to `defaultModel`. */
  budgetModel?: string;
  tools?: ChatTool[];
  /** Model calls per exchange: the first pass plus tool rounds. The last allowed pass withholds the tools. */
  maxModelCalls?: number;
  /** Caps thinking and response text together. */
  maxTokens?: number;
  /** Adaptive thinking's effort dial, for models that take it. */
  effort?: 'low' | 'medium' | 'high';
  guardrails?: ChatGuardrails;
  limits?: Partial<ChatLimits>;
  copy?: Partial<ChatHandlerCopy>;
  /** Turns the request's raw `path` into context, or null to drop it. The default accepts lowercase slug paths only. */
  sanitiseContext?: (value: unknown) => string | null;
  /** Keeps a fire-and-forget promise alive on platforms that end work with the response. */
  waitUntil?: (promise: Promise<unknown>) => void;
}

const NDJSON_HEADERS = {
  'Content-Type': 'application/x-ndjson; charset=utf-8',
  'Cache-Control': 'no-store',
  // Proxies that buffer by default would hold the whole reply and destroy the
  // streaming choreography the widget exists to show.
  'X-Accel-Buffering': 'no',
} as const;

const encoder = new TextEncoder();
const serialise = (event: ChatEvent) => encoder.encode(`${JSON.stringify(event)}\n`);

/** A complete response made of known events, for the paths that never call the model. */
function ndjson(...events: ChatEvent[]): Response {
  return new Response(events.map((event) => `${JSON.stringify(event)}\n`).join(''), {
    headers: NDJSON_HEADERS,
  });
}

/**
 * The request's context, sanitised as untrusted input: it lands in a system
 * block, a stronger position than the user turn. Lowercase slug segments
 * only, capped short; nothing expressible in that alphabet can carry an
 * instruction. Anything else is dropped, never rejected.
 */
export function sanitisePath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (value === '/') return '/';
  return /^\/[a-z0-9-]+(?:\/[a-z0-9-]+){0,3}$/.test(value) && value.length <= 64 ? value : null;
}

type ParsedBody =
  | { ok: true; messages: ChatTransportMessage[]; path: string | null; model: ChatModelOption | null }
  | { ok: false; status: number; reason: string };

function parseBody(
  payload: unknown,
  limits: ChatLimits,
  models: ChatModelOption[],
  sanitise: (value: unknown) => string | null
): ParsedBody {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false, status: 400, reason: 'body must be an object' };
  }
  const { messages, path, model } = payload as { messages?: unknown; path?: unknown; model?: unknown };
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, status: 400, reason: 'messages must be a non-empty array' };
  }

  const parsed: ChatTransportMessage[] = [];
  for (const entry of messages) {
    if (typeof entry !== 'object' || entry === null) {
      return { ok: false, status: 400, reason: 'each message must be an object' };
    }
    const { role, content } = entry as { role?: unknown; content?: unknown };
    if (role !== 'user' && role !== 'assistant') {
      return { ok: false, status: 400, reason: "role must be 'user' or 'assistant'" };
    }
    if (typeof content !== 'string') {
      return { ok: false, status: 400, reason: 'content must be a string' };
    }
    if (content.trim()) parsed.push({ role, content });
  }
  if (parsed.length === 0) return { ok: false, status: 400, reason: 'no messages with content' };

  // The conversation must start with a user turn; dropping old turns can
  // leave an assistant one first.
  const trimmed = parsed.slice(-limits.maxTurns);
  while (trimmed.length > 0 && trimmed[0].role === 'assistant') trimmed.shift();
  if (trimmed.length === 0) {
    return { ok: false, status: 400, reason: 'no user message in the recent turns' };
  }

  const totalChars = trimmed.reduce((sum, message) => sum + message.content.length, 0);
  if (totalChars > limits.maxTotalChars) {
    return { ok: false, status: 413, reason: 'conversation is too large' };
  }

  // The model field is a request, resolved like the path: an allowlisted
  // value or nothing. An unrecognised one falls back to the tier default.
  const requested =
    typeof model === 'string' ? (models.find((option) => option.value === model) ?? null) : null;
  return { ok: true, messages: trimmed, path: sanitise(path), model: requested };
}

/* Summarised thinking arrives as prose. Each finished sentence becomes one
   trace point under the status label, which is what the Reasoning component
   renders while the response is still being composed. */
function cleanPoint(text: string): string {
  const flat = text.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  if (flat.length <= 200) return flat;
  const cut = flat.slice(0, 200);
  return `${cut.slice(0, cut.lastIndexOf(' ')) || cut}…`;
}

function createReasoningBuffer(limit: number, emit: (point: string) => void) {
  let buffer = '';
  let emitted = 0;
  const flush = (final: boolean) => {
    if (emitted >= limit) {
      buffer = '';
      return;
    }
    const sentences = buffer.split(/(?<=[.!?])\s+/);
    // The trailing fragment is usually mid-sentence, so hold it until either
    // more text arrives or the thinking block closes.
    buffer = final ? '' : (sentences.pop() ?? '');
    for (const sentence of sentences) {
      if (emitted >= limit) break;
      const point = cleanPoint(sentence);
      if (point.length < 12) continue;
      emit(point);
      emitted += 1;
    }
  };
  return {
    push(text: string) {
      buffer += text;
      flush(false);
    },
    close() {
      flush(true);
    },
  };
}

function friendlyError(error: unknown, copy: ChatHandlerCopy): string {
  const status = (error as { status?: number })?.status;
  if (status === 429 || status === 529) return copy.busy;
  if (status === 401 || status === 403) return copy.unauthorised;
  return copy.failed;
}

const toBlocks = (system: string | SystemBlocks): SystemBlocks =>
  typeof system === 'string' ? [{ type: 'text', text: system }] : system;

/**
 * The chat handler: `(request) => Response`, streaming NDJSON `ChatEvent`s.
 */
export function createChatHandler(options: ChatHandlerOptions): (request: Request) => Promise<Response> {
  const limits = { ...DEFAULT_CHAT_LIMITS, ...options.limits };
  const copy = { ...DEFAULT_CHAT_COPY, ...options.copy };
  const sanitise = options.sanitiseContext ?? sanitisePath;
  const tools = options.tools ?? [];
  const toolDefinitions = tools.map((tool) => tool.definition);
  const toolByName = new Map(tools.map((tool) => [tool.definition.name, tool]));
  const maxModelCalls = options.maxModelCalls ?? 3;
  const maxTokens = options.maxTokens ?? 3000;
  const effort = options.effort ?? 'low';
  const guardrails = options.guardrails ?? {};
  const contextBlock =
    options.contextBlock ?? ((path: string) => `The visitor is currently on the page ${path}.`);
  const client =
    options.client ?? (options.apiKey ? new Anthropic({ apiKey: options.apiKey }) : null);
  const enabled = options.enabled ?? client !== null;

  const defaultModel =
    options.models.find((option) => option.value === options.defaultModel) ?? options.models[0];
  const budgetModel =
    options.models.find((option) => option.value === options.budgetModel) ?? defaultModel;
  if (!defaultModel) throw new Error('createChatHandler: `models` must name at least one model.');

  /* The one place client preference meets budget policy. The tier is the
     trump: past the lock only the budget model serves. Inside the lock, an
     explicit pick is honoured, and no pick follows the tier's default. */
  const resolveServingModel = (requested: ChatModelOption | null, tier: ModelTier) => {
    if (tier === 'locked') return budgetModel;
    if (requested) return requested;
    return tier === 'reduced' ? budgetModel : defaultModel;
  };

  const runTool = async (name: string, input: unknown): Promise<ChatToolResult> => {
    const args = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;
    const tool = toolByName.get(name);
    if (!tool) return { text: JSON.stringify({ error: `Unknown tool ${JSON.stringify(name)}.` }) };
    try {
      const result = await tool.execute(args);
      return typeof result === 'string' ? { text: result } : result;
    } catch (error) {
      return { text: JSON.stringify({ error: String((error as Error)?.message ?? error) }) };
    }
  };

  return async function chatHandler(request: Request): Promise<Response> {
    // Off switch first, before any parsing or network. A route can deploy
    // ahead of its environment on purpose, so an unconfigured one has to
    // answer politely rather than throw.
    if (!enabled || !client) {
      return ndjson({ type: 'notice', text: copy.disabled }, { type: 'done' });
    }

    let payload: unknown;
    try {
      const raw = await request.text();
      if (raw.length > limits.maxBodyChars) {
        return Response.json({ error: 'request body too large' }, { status: 413 });
      }
      payload = JSON.parse(raw);
    } catch {
      return Response.json({ error: 'invalid JSON' }, { status: 400 });
    }

    const parsed = parseBody(payload, limits, options.models, sanitise);
    if (!parsed.ok) return Response.json({ error: parsed.reason }, { status: parsed.status });

    const latest = parsed.messages[parsed.messages.length - 1];
    if (latest.content.length > limits.maxMessageChars) {
      return ndjson({ type: 'notice', text: copy.tooLong }, { type: 'done' });
    }

    const startedAt = Date.now();
    const visitor = (await guardrails.visitorKey?.(request)) ?? 'anonymous';
    const question = latest.content;
    /* The exchange's log id. Minted before the guardrails so every logged
       line carries one, and streamed to the client only on the model path. */
    const exchangeId = crypto.randomUUID();
    const log = (entry: ExchangeLog) => {
      if (!guardrails.onExchange) return Promise.resolve();
      return guardrails.onExchange(entry).catch(() => {});
    };

    const verdict: GuardrailVerdict = (await guardrails.check?.(request)) ?? { allowed: true, tier: 'open' };
    if (!verdict.allowed) {
      // Guardrail notices are logged too: how often the limits fire, and what
      // people were asking when they did, is exactly what tunes the caps.
      const logged = log({
        id: exchangeId,
        question,
        answer: verdict.notice,
        path: parsed.path,
        latencyMs: Date.now() - startedAt,
        firstTextMs: null,
        notice: true,
        visitor,
      });
      options.waitUntil?.(logged);
      return ndjson({ type: 'notice', text: verdict.notice }, { type: 'done' });
    }

    const serving = resolveServingModel(parsed.model, verdict.tier);
    /* What the picker should offer right now: the tier's default, and which
       values are locked out. Everything but the budget model locks together. */
    const tierDefault = verdict.tier === 'open' ? defaultModel.value : budgetModel.value;
    const lockedValues =
      verdict.tier === 'locked'
        ? options.models.filter((option) => option !== budgetModel).map((option) => option.value)
        : [];

    // Client disconnect and stream cancellation both abort the upstream call,
    // so a visitor closing the tab stops the tokens being billed.
    const upstream = new AbortController();
    request.signal.addEventListener('abort', () => upstream.abort());

    const systemBase = toBlocks(
      typeof options.system === 'function' ? options.system({ path: parsed.path }) : options.system
    );
    const trailing = parsed.path ? contextBlock(parsed.path) : null;
    const system: SystemBlocks = trailing
      ? [...systemBase, { type: 'text', text: trailing }]
      : systemBase;

    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        let closed = false;
        const send = (event: ChatEvent) => {
          if (closed) return;
          try {
            controller.enqueue(serialise(event));
          } catch {
            closed = true;
          }
        };

        let streamedText = false;
        let answerText = '';
        let noticeText: string | null = null;
        let firstTextMs: number | null = null;

        try {
          // First line out. It proves the stream opened, which clears the
          // transport's first-byte watchdog.
          send({ type: 'status', label: copy.reading });
          send({ type: 'model', label: serving.label });
          send({ type: 'models', default: tierDefault, locked: lockedValues });

          const reasoning = createReasoningBuffer(limits.maxTracePoints, (point) =>
            send({ type: 'status', label: copy.thinking, point })
          );

          // The tool loop: stream a pass, and when it ends in tool_use, run
          // the requested tools and stream again with the results appended.
          // Bounded, and the last allowed pass has the tools withheld, so it
          // must answer in text.
          const working: Anthropic.Messages.MessageParam[] = parsed.messages.map(({ role, content }) => ({
            role,
            content,
          }));
          let final: Anthropic.Messages.Message;

          for (let call = 0; ; call += 1) {
            const lastCall = call === maxModelCalls - 1;
            const stream = client.messages.stream(
              {
                model: serving.id,
                max_tokens: maxTokens,
                // A model that predates adaptive thinking and the effort dial
                // rejects both, so it gets a plain request.
                ...(serving.adaptiveThinking
                  ? {
                      thinking: { type: 'adaptive' as const, display: 'summarized' as const },
                      output_config: { effort },
                    }
                  : {}),
                ...(toolDefinitions.length > 0 ? { tools: toolDefinitions } : {}),
                ...(lastCall && toolDefinitions.length > 0 ? { tool_choice: { type: 'none' as const } } : {}),
                system,
                messages: working,
              },
              { signal: upstream.signal }
            );

            for await (const event of stream) {
              if (upstream.signal.aborted) break;
              if (event.type !== 'content_block_delta') continue;
              if (event.delta.type === 'text_delta') {
                if (!streamedText) {
                  reasoning.close();
                  streamedText = true;
                  firstTextMs = Date.now() - startedAt;
                }
                answerText += event.delta.text;
                send({ type: 'delta', text: event.delta.text });
              } else if (event.delta.type === 'thinking_delta') {
                reasoning.push(event.delta.thinking);
              }
            }

            final = await stream.finalMessage();
            // Real token counts per call, so a daily breaker tracks the whole
            // exchange, tool rounds included.
            await guardrails.onUsage?.(final.usage, serving.id).catch(() => {});

            if (final.stop_reason !== 'tool_use' || lastCall || upstream.signal.aborted) break;

            const toolUses = final.content.filter(
              (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
            );
            const results: Anthropic.Messages.ToolResultBlockParam[] = [];
            for (const block of toolUses) {
              const args = (typeof block.input === 'object' && block.input !== null
                ? block.input
                : {}) as Record<string, unknown>;
              send({
                type: 'status',
                label: copy.lookingUp,
                point: toolByName.get(block.name)?.tracePoint?.(args) ?? `Used ${block.name}`,
              });
              const result = await runTool(block.name, block.input);
              if (result.card) send({ type: 'card', card: result.card });
              results.push({ type: 'tool_result', tool_use_id: block.id, content: result.text });
            }
            working.push(
              // The full content blocks go back, thinking included: the API
              // requires the thinking blocks intact on a tool-using turn.
              { role: 'assistant', content: final.content as Anthropic.Messages.ContentBlockParam[] },
              { role: 'user', content: results }
            );
          }

          if (final.stop_reason === 'refusal' && !streamedText) {
            noticeText = copy.refusal;
            send({ type: 'notice', text: noticeText });
          } else if (final.stop_reason === 'max_tokens') {
            send({ type: 'delta', text: copy.cutOff });
          }

          // The exchange log, written before the id goes out so a verdict
          // can never dangle. The id is only streamed when something logs:
          // thumbs on an exchange nobody recorded would rate nothing.
          if (guardrails.onExchange) {
            await log({
              id: exchangeId,
              question,
              answer: noticeText ?? answerText,
              path: parsed.path,
              model: serving.id,
              usage: final.usage,
              latencyMs: Date.now() - startedAt,
              firstTextMs,
              notice: noticeText !== null,
              visitor,
            });
            send({ type: 'exchange', id: exchangeId });
          }
        } catch (error) {
          const aborted =
            upstream.signal.aborted || (error instanceof Error && error.name === 'AbortError');
          if (!aborted && !streamedText) {
            console.error('[chat] upstream failed before any text:', error);
            send({ type: 'error', message: friendlyError(error, copy) });
          } else if (!aborted) {
            // Text is already on screen; an error event would erase it.
            console.error('[chat] upstream failed mid-stream, keeping the partial:', error);
          }
        } finally {
          send({ type: 'done' });
          if (!closed) {
            try {
              controller.close();
            } catch {
              /* already closed by a client disconnect */
            }
          }
        }
      },
      cancel() {
        upstream.abort();
      },
    });

    return new Response(body, { headers: NDJSON_HEADERS });
  };
}

/* ============================================
   The follow-ups handler
   ============================================ */

export interface FollowupsHandlerOptions {
  client?: Anthropic;
  apiKey?: string;
  enabled?: boolean;
  /** The model id that writes the questions. A small one: the job is three short lines. */
  model: string;
  /**
   * What the chat is about, in a phrase the prompt can use: "the Acme
   * workspace app and its documentation". Ignored when `system` is given.
   */
  about?: string;
  /** A complete system prompt, replacing the built-in one. */
  system?: string;
  /** Example questions in the voice wanted, shown to the model. */
  examples?: string[];
  guardrails?: Pick<ChatGuardrails, 'checkFollowups' | 'onUsage'>;
  /** Chips shown. */
  wanted?: number;
  /** Candidates asked for, so a few long ones still leave a full row. */
  candidates?: number;
  /** Cap on the upstream call, inside the widget's own wait. */
  timeoutMs?: number;
}

const DEFAULT_FOLLOWUP_EXAMPLES = [
  'How do I get started?',
  'What does the Team plan include?',
  'Can you show me an example?',
];

/** The built-in follow-ups prompt. */
export function followupsSystemPrompt({
  about,
  candidates,
  examples,
}: {
  about: string;
  candidates: number;
  examples: string[];
}): string {
  return `You write the follow-up questions offered under an answer from a chat assistant about ${about}.

You are given the visitor's last question and the answer they just read. Write the ${candidates} questions that visitor is most likely to want to ask next, best first.

Length matters more than anything else here. Each question is shown on a chip, on one line, in a narrow panel. It must be at most ${SUGGESTION_MAX_CHARS} characters including spaces, which is about six words. A question over that length is thrown away and never shown, so write the short version of the question rather than the complete one. Count the characters before you write each line.

Ask the plain question. Cut any phrase that does not change what is being asked: how long the answer should take, how many points it should have, how simple it should be, and the polite run-up to the question itself. A chip is a question, not a request.

Questions in the length and plainness wanted:
${examples.join('\n')}

The rest of the rules:
- Each question must be answerable by the assistant, about ${about}.
- Move the conversation forward. Never re-ask the question just asked, and never ask something the answer already covered.
- The visitor is asking the assistant: "What does the plan include?", never "What did you build?".
- Plain words, sentence case. No em dashes, no emoji, no quotation marks, no numbering, no markdown.
- Different angles on what was just said, not one question phrased several ways.

Output exactly ${candidates} lines, one question per line, and nothing else.`;
}

/**
 * The model's lines to the chips that are safe to show: plain text, one
 * short question each, no duplicates, at most `wanted`. Anything that does
 * not fit the shape is dropped rather than repaired.
 */
export function parseFollowups(text: string, wanted = 3): string[] {
  const seen = new Set<string>();
  const suggestions: string[] = [];
  for (const line of text.split('\n')) {
    const cleaned = line
      .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '')
      .replace(/[*_`#]/g, '')
      .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length < 12 || !fitsChip(cleaned)) continue;
    if (!cleaned.endsWith('?')) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    suggestions.push(cleaned);
    if (suggestions.length === wanted) break;
  }
  return suggestions;
}

/**
 * The follow-ups handler: POST `{ question, answer }`, respond
 * `{ suggestions: string[] }`, empty on every failure. A second call rather
 * than part of the answer's stream, because the questions are written from
 * the completed answer.
 */
export function createFollowupsHandler(
  options: FollowupsHandlerOptions
): (request: Request) => Promise<Response> {
  const wanted = options.wanted ?? 3;
  const candidates = options.candidates ?? 5;
  const timeoutMs = options.timeoutMs ?? 8_000;
  const client =
    options.client ??
    (options.apiKey ? new Anthropic({ apiKey: options.apiKey, timeout: timeoutMs, maxRetries: 0 }) : null);
  const enabled = options.enabled ?? client !== null;
  const system =
    options.system ??
    followupsSystemPrompt({
      about: options.about ?? 'this product',
      candidates,
      examples: options.examples ?? DEFAULT_FOLLOWUP_EXAMPLES,
    });
  const empty = () => Response.json({ suggestions: [] });

  return async function followupsHandler(request: Request): Promise<Response> {
    if (!enabled || !client) return empty();

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: 'invalid JSON' }, { status: 400 });
    }
    if (typeof payload !== 'object' || payload === null) {
      return Response.json({ error: 'body must be an object' }, { status: 400 });
    }
    const { question, answer } = payload as { question?: unknown; answer?: unknown };
    if (typeof question !== 'string' || question.trim() === '') {
      return Response.json({ error: 'question must be a non-empty string' }, { status: 400 });
    }
    if (typeof answer !== 'string' || answer.trim() === '') {
      return Response.json({ error: 'answer must be a non-empty string' }, { status: 400 });
    }

    if (options.guardrails?.checkFollowups && !(await options.guardrails.checkFollowups(request))) {
      return empty();
    }

    try {
      const message = await client.messages.create(
        {
          model: options.model,
          max_tokens: 200,
          // Thinking would spend the small token cap before the questions are written.
          thinking: { type: 'disabled' },
          system,
          messages: [
            {
              role: 'user',
              content: `The visitor asked:\n${question.slice(0, 4000)}\n\nThe assistant answered:\n${answer.slice(0, 4000)}`,
            },
          ],
        },
        // The visitor moving on stops this being billed; nothing waits on it.
        { signal: request.signal }
      );
      await options.guardrails?.onUsage?.(message.usage, options.model).catch(() => {});
      const text = message.content.map((block) => (block.type === 'text' ? block.text : '')).join('');
      return Response.json({ suggestions: parseFollowups(text, wanted) });
    } catch (error) {
      if (!request.signal.aborted) console.error('[chat] follow-up suggestions failed:', error);
      return empty();
    }
  };
}

/* ============================================
   The feedback handler
   ============================================ */

const EXCHANGE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * The feedback handler: POST `{ id, verdict }`, respond 204. The id is never
 * trusted to exist; a verdict for an id no exchange used is a write nothing
 * will join against, so validation is a shape check, not a lookup.
 */
export function createFeedbackHandler(options: {
  guardrails?: Pick<ChatGuardrails, 'checkFeedback' | 'onFeedback' | 'visitorKey'>;
} = {}): (request: Request) => Promise<Response> {
  const guardrails = options.guardrails ?? {};
  return async function feedbackHandler(request: Request): Promise<Response> {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: 'invalid JSON' }, { status: 400 });
    }
    if (typeof payload !== 'object' || payload === null) {
      return Response.json({ error: 'body must be an object' }, { status: 400 });
    }
    const { id, verdict } = payload as { id?: unknown; verdict?: unknown };
    if (typeof id !== 'string' || !EXCHANGE_ID.test(id)) {
      return Response.json({ error: 'id must be an exchange id' }, { status: 400 });
    }
    if (verdict !== 'up' && verdict !== 'down') {
      return Response.json({ error: "verdict must be 'up' or 'down'" }, { status: 400 });
    }
    if (guardrails.checkFeedback && !(await guardrails.checkFeedback(request))) {
      return new Response(null, { status: 429 });
    }
    const visitor = (await guardrails.visitorKey?.(request)) ?? 'anonymous';
    await guardrails.onFeedback?.(id, verdict, visitor).catch(() => {});
    return new Response(null, { status: 204 });
  };
}
