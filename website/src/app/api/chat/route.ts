/**
 * POST /api/chat — the chat widget's backend.
 *
 * Streams newline-delimited JSON, one `ChatEvent` per line, in the same shape
 * the sim transport produces. The event type is imported from useChat so the
 * server is type-checked against the contract the client consumes.
 *
 * Two rules shape the error handling, both from how useChat renders events:
 *
 *   - Guardrail outcomes are 200 plus a `notice`, never a non-2xx. A notice
 *     renders as an ordinary assistant message, which is what makes a rate
 *     limit or a paused budget read as a reply rather than a broken widget.
 *     Non-2xx is reserved for malformed requests.
 *
 *   - An `error` event REPLACES any text already streamed. So `error` is only
 *     ever emitted before the first delta. Once text is flowing, a failure
 *     ends the turn with `done` and the partial answer stands, which matches
 *     how the hook treats an aborted stream.
 *
 * The stream always terminates. An unterminated stream leaves the widget
 * spinning with no way back.
 *
 * The model carries two deterministic tools (get_component and
 * get_design_tokens — see CHAT_TOOLS below), because the corpus deliberately
 * omits the generated prop API and token registry. Tool rounds run locally
 * as in-memory reads and surface to the visitor only as trace points; the
 * loop is bounded by MAX_MODEL_CALLS and the final pass withholds tool
 * choice so an exchange always ends in text.
 */
import Anthropic from "@anthropic-ai/sdk";

import { siteCorpus } from "@/data/site-corpus.generated";
import type { ChatEvent, ChatTransportMessage } from "@/hooks/useChat";
import {
  BUDGET_CHAT_MODEL,
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL,
  chatModelByValue,
  type ChatModelOption,
} from "@/lib/chat-model";
import { lookupComponent, lookupTokens } from "@/lib/site-tools";

import { EASTER_EGGS } from "./easter-eggs";
import {
  checkGuardrails,
  recordExchange,
  recordSpend,
  visitorKey,
  type ModelTier,
} from "./guardrails";
import { PERSONA } from "./persona";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/** Caps thinking and response text together, so leave room for both. */
const MAX_TOKENS = 3000;

/**
 * Measured, not assumed: with this corpus in the system prompt, adaptive
 * thinking does not engage. Ten runs across low, medium and high effort, on
 * lookup, synthesis, judgement and comparison questions, produced zero
 * thinking blocks. A persona nudge asking the model to work the answer out
 * first changed nothing. The same request with no system prompt and a genuine
 * multi-step problem does think, so the wiring is sound: the model is simply
 * right that reading an answer out of supplied context needs no reasoning.
 *
 * Effort is therefore a cost and latency dial here, not a reasoning dial, so
 * it sits at the cheap end. The thinking-to-trace-point mapping below stays in
 * place and fires correctly on the rare question that does provoke reasoning.
 */
const EFFORT = "low";

/** Turns kept from the client's history. Older context is dropped server-side. */
const MAX_TURNS = 10;

/** Longest single message accepted, in characters. */
const MAX_MESSAGE_CHARS = 4000;

/** Longest whole conversation accepted, summed across every kept turn. The
    per-message cap bounds the latest turn; this bounds the history behind it. */
const MAX_TOTAL_CHARS = 40000;

/** Hard byte ceiling on the raw request body, rejected before it is parsed.
    Far above a real 10-turn conversation, far below Vercel's platform limit. */
const MAX_BODY_BYTES = 64 * 1024;

/** Trace points shown under the status label before the rest is dropped. */
const MAX_TRACE_POINTS = 8;

/* ============================================
   Tools

   Two deterministic lookups over generated registry data, shared with the
   public MCP endpoint through @/lib/site-tools. The corpus carries the site's
   prose but deliberately not the prop API or the token registry (they would
   cost tens of thousands of tokens for data most questions never touch), so
   without these the model answers prop- and token-level questions from
   plausible convention rather than the published contract. Same security
   boundary as the corpus: generated, already-published data only.
   ============================================ */

/** Model calls per exchange: the first pass plus at most two tool rounds. */
const MAX_MODEL_CALLS = 3;

const CHAT_TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: "get_component",
    description:
      "The exact prop contract for one design-system component: every own prop " +
      "with its type, default, requiredness, deprecation status and description, " +
      "plus import paths, generated from the same source as the published .d.ts. " +
      "Use it whenever the answer needs prop-level specifics (names, types, " +
      "defaults, what is deprecated and what replaces it). Never state a prop " +
      "fact from memory when this can confirm it.",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Component name, label or docs slug, e.g. Button or agent-plan",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "get_design_tokens",
    description:
      "The semantic design-token registry: every token name grouped by category, " +
      "with per-category counts. Use it to enumerate or count tokens, or to check " +
      "whether a token exists. Values and usage guidance stay on the foundations " +
      "pages; link those for the numbers behind a token.",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "A token category to filter by, e.g. colour or motion",
        },
      },
    },
  },
];

/** Runs one tool call locally. Unknown names and bad input come back as an
    error string for the model to recover from, never a thrown error. */
function runChatTool(name: string, input: unknown): string {
  const args = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  if (name === "get_component") {
    return JSON.stringify(lookupComponent(String(args.name ?? "")));
  }
  if (name === "get_design_tokens") {
    const category = typeof args.category === "string" ? args.category : undefined;
    return JSON.stringify(lookupTokens(category));
  }
  return JSON.stringify({ error: `Unknown tool ${JSON.stringify(name)}.` });
}

/** The trace point shown while a tool round runs. */
function toolTracePoint(name: string, input: unknown): string {
  const args = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  if (name === "get_component" && typeof args.name === "string" && args.name.trim()) {
    return `Checked the ${args.name.trim()} prop contract`;
  }
  if (name === "get_design_tokens") {
    return typeof args.category === "string" && args.category.trim()
      ? `Read the ${args.category.trim()} token registry`
      : "Read the token registry";
  }
  return "Checked the component API";
}

const NDJSON_HEADERS = {
  "Content-Type": "application/x-ndjson; charset=utf-8",
  "Cache-Control": "no-store",
  // Proxies that buffer by default would hold the whole reply and destroy the
  // streaming choreography this widget exists to demonstrate.
  "X-Accel-Buffering": "no",
} as const;

const encoder = new TextEncoder();
const serialise = (event: ChatEvent) => encoder.encode(`${JSON.stringify(event)}\n`);

/** A complete response made of known events, for the paths that never call the model. */
function ndjson(...events: ChatEvent[]): Response {
  return new Response(events.map((event) => `${JSON.stringify(event)}\n`).join(""), {
    headers: NDJSON_HEADERS,
  });
}

/* ============================================
   Request validation
   ============================================ */

type ParsedBody =
  | {
      ok: true;
      messages: ChatTransportMessage[];
      path: string | null;
      /** The visitor's explicit model pick, or null when following the default. */
      model: ChatModelOption | null;
    }
  | { ok: false; status: number; reason: string };

/**
 * The visitor's current page, sanitised as untrusted input. A crafted URL
 * would otherwise be visitor-controlled text landing in a system block — a
 * stronger position than the user turn the persona already defends. The
 * charset does the guarding: lowercase slug segments only, no spaces, no
 * uppercase, no punctuation beyond `/` and `-`, capped short. Nothing
 * expressible in that alphabet can carry an instruction. A junk-but-clean
 * path ("/nonexistent") is inert: the model is told a page name, not given
 * a command. Anything else is dropped, never rejected — page context is a
 * nicety, not a requirement.
 */
function sanitisePath(path: unknown): string | null {
  if (typeof path !== "string") return null;
  if (path === "/") return "/";
  return /^\/[a-z0-9-]+(?:\/[a-z0-9-]+){0,3}$/.test(path) && path.length <= 64 ? path : null;
}

function parseBody(payload: unknown): ParsedBody {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, status: 400, reason: "body must be an object" };
  }

  const { messages, path, model } = payload as {
    messages?: unknown;
    path?: unknown;
    model?: unknown;
  };
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, status: 400, reason: "messages must be a non-empty array" };
  }

  const parsed: ChatTransportMessage[] = [];
  for (const entry of messages) {
    if (typeof entry !== "object" || entry === null) {
      return { ok: false, status: 400, reason: "each message must be an object" };
    }
    const { role, content } = entry as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") {
      return { ok: false, status: 400, reason: "role must be 'user' or 'assistant'" };
    }
    if (typeof content !== "string") {
      return { ok: false, status: 400, reason: "content must be a string" };
    }
    if (content.trim()) parsed.push({ role, content });
  }

  if (parsed.length === 0) {
    return { ok: false, status: 400, reason: "no messages with content" };
  }

  // Anthropic requires the conversation to start with a user turn; dropping
  // old turns can leave an assistant one first.
  const trimmed = parsed.slice(-MAX_TURNS);
  while (trimmed.length > 0 && trimmed[0].role === "assistant") trimmed.shift();
  if (trimmed.length === 0) {
    return { ok: false, status: 400, reason: "no user message in the recent turns" };
  }

  const totalChars = trimmed.reduce((sum, message) => sum + message.content.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    return { ok: false, status: 413, reason: "conversation is too large" };
  }

  // The model field is a request, resolved like the path: an allowlisted
  // value or nothing. A visitor can put any string in the body, so an
  // unrecognised one falls back to the tier default rather than erroring —
  // the server owns the choice either way (see resolveServingModel).
  return { ok: true, messages: trimmed, path: sanitisePath(path), model: chatModelByValue(model) };
}

/**
 * The one place client preference meets budget policy. The tier is the
 * trump: past the lock only the budget model serves. Inside the lock, an
 * explicit pick is honoured (a reduced-tier visitor may still choose the
 * better model), and no pick follows the tier's default.
 */
function resolveServingModel(
  requested: ChatModelOption | null,
  tier: ModelTier
): ChatModelOption {
  if (tier === "locked") return BUDGET_CHAT_MODEL;
  if (requested) return requested;
  return tier === "reduced" ? BUDGET_CHAT_MODEL : DEFAULT_CHAT_MODEL;
}

/* ============================================
   Live reasoning

   Summarized thinking arrives as prose. Each finished sentence becomes one
   trace point under the AgentStatus label, which is what the Reasoning
   component renders while the response is still being composed.
   ============================================ */

/** Strips markdown emphasis and bounds the length so one point stays one line. */
function cleanPoint(text: string): string {
  const flat = text.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
  if (flat.length <= 200) return flat;
  const cut = flat.slice(0, 200);
  return `${cut.slice(0, cut.lastIndexOf(" ")) || cut}…`;
}

function createReasoningBuffer(emit: (point: string) => void) {
  let buffer = "";
  let emitted = 0;

  const flush = (final: boolean) => {
    if (emitted >= MAX_TRACE_POINTS) {
      buffer = "";
      return;
    }
    const sentences = buffer.split(/(?<=[.!?])\s+/);
    // The trailing fragment is usually mid-sentence, so hold it until either
    // more text arrives or the thinking block closes.
    buffer = final ? "" : (sentences.pop() ?? "");

    for (const sentence of sentences) {
      if (emitted >= MAX_TRACE_POINTS) break;
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

/* ============================================
   Handler
   ============================================ */

export async function POST(request: Request): Promise<Response> {
  // Off switch first, before any parsing or network. The route deploys ahead
  // of its environment variables on purpose, so an unconfigured deploy has to
  // answer politely rather than throw.
  if (process.env.CHAT_ENABLED !== "true" || !process.env.ANTHROPIC_API_KEY) {
    return ndjson(
      {
        type: "notice",
        text: "This chat is switched off at the moment. The case studies cover most of what people ask, and /contact reaches Rob directly.",
      },
      { type: "done" }
    );
  }

  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return Response.json({ error: "request body too large" }, { status: 413 });
    }
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const parsed = parseBody(payload);
  if (!parsed.ok) {
    return Response.json({ error: parsed.reason }, { status: parsed.status });
  }

  const latest = parsed.messages[parsed.messages.length - 1];
  if (latest.content.length > MAX_MESSAGE_CHARS) {
    return ndjson(
      {
        type: "notice",
        text: "That message is longer than this chat can take. Trim it to the essentials and send it again.",
      },
      { type: "done" }
    );
  }

  const startedAt = Date.now();
  const visitor = visitorKey(request);
  const question = latest.content;
  /* The exchange's log id. Minted before the guardrails so every logged
     line carries one, streamed to the client (model path only) so the
     thumbs buttons can reference the line they are rating. */
  const exchangeId = crypto.randomUUID();

  const verdict = await checkGuardrails(request);
  if (!verdict.allowed) {
    // Guardrail notices are logged too: how often the limits fire, and what
    // people were asking when they did, is exactly what tunes the caps.
    void recordExchange({
      id: exchangeId,
      question,
      answer: verdict.notice,
      path: parsed.path,
      latencyMs: Date.now() - startedAt,
      firstTextMs: null,
      notice: true,
      visitor,
    });
    return ndjson({ type: "notice", text: verdict.notice }, { type: "done" });
  }

  const serving = resolveServingModel(parsed.model, verdict.tier);
  /* What the picker should offer right now: the tier's default, and which
     values are locked out. Everything but the budget model locks together —
     today that is one model, but the rule survives a third entry. */
  const tierDefault =
    verdict.tier === "open" ? DEFAULT_CHAT_MODEL.value : BUDGET_CHAT_MODEL.value;
  const lockedValues =
    verdict.tier === "locked"
      ? CHAT_MODELS.filter((option) => option !== BUDGET_CHAT_MODEL).map(
          (option) => option.value
        )
      : [];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Client disconnect and stream cancellation both abort the upstream call, so
  // a visitor closing the tab stops the tokens being billed.
  const upstream = new AbortController();
  request.signal.addEventListener("abort", () => upstream.abort());

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
      let answerText = "";
      let noticeText: string | null = null;
      let firstTextMs: number | null = null;

      try {
        // First line out. It proves the stream opened, which is what clears
        // the client's first-byte watchdog, and it replaces the hook's default
        // label with one that is true.
        send({ type: "status", label: "Reading the site" });
        // Which model is actually serving this exchange — the resolved
        // choice, not the requested one. Informational today (no client
        // renders it), but it is the stream's ground truth for a per-answer
        // label.
        send({ type: "model", label: serving.label });
        // What is on offer is what the picker actually consumes: it follows
        // this default and greys out anything the day's budget has locked,
        // which is how a clamp reaches the composer honestly.
        send({ type: "models", default: tierDefault, locked: lockedValues });

        const reasoning = createReasoningBuffer((point) =>
          send({ type: "status", label: "Thinking", point })
        );

        const system: Anthropic.Messages.TextBlockParam[] = [
          { type: "text", text: PERSONA },
          { type: "text", text: EASTER_EGGS },
          // The cache breakpoint sits on this block, so the persona and
          // easter eggs cache together with the corpus. Nothing volatile
          // may precede it (the tools array serialises ahead of the system
          // blocks, which is fine — it is as stable as the persona). The
          // 1-hour TTL matches how visitors actually arrive: most gaps
          // between exchanges are 10-50 minutes, which the default 5-minute
          // cache never survives — so nearly every visitor was paying a
          // full corpus rewrite. Writes cost 2x instead of 1.25x, but there
          // are far fewer of them; the guardrails price table must agree
          // (cacheWrite = 2x input).
          {
            type: "text",
            text: siteCorpus,
            cache_control: { type: "ephemeral", ttl: "1h" },
          },
          // Page context rides AFTER the breakpoint: it changes per
          // request, and a trailing uncached block leaves the cached
          // prefix untouched. The path is sanitised to a slug charset
          // in parseBody — see sanitisePath for why that is the guard.
          ...(parsed.path
            ? [
                {
                  type: "text" as const,
                  text: `The visitor is currently on the page ${parsed.path} of the site.`,
                },
              ]
            : []),
        ];

        // The tool loop: stream a pass, and when it ends in tool_use, run
        // the requested lookups locally (synchronous in-memory reads) and
        // stream again with the results appended. Bounded so a pathological
        // exchange cannot spend more than MAX_MODEL_CALLS calls; the last
        // allowed pass has the tools withheld, so it must answer in text.
        const working: Anthropic.Messages.MessageParam[] = [...parsed.messages];
        let final: Anthropic.Messages.Message;

        for (let call = 0; ; call += 1) {
          const lastCall = call === MAX_MODEL_CALLS - 1;
          const stream = client.messages.stream(
            {
              model: serving.id,
              max_tokens: MAX_TOKENS,
              // Haiku 4.5 predates adaptive thinking and the effort dial and
              // rejects both with a 400, so it gets a plain request — which
              // also means no "Thinking" trace points on its answers, honestly.
              ...(serving.adaptiveThinking
                ? {
                    thinking: { type: "adaptive" as const, display: "summarized" as const },
                    output_config: { effort: EFFORT },
                  }
                : {}),
              tools: CHAT_TOOLS,
              ...(lastCall ? { tool_choice: { type: "none" as const } } : {}),
              system,
              messages: working,
            },
            { signal: upstream.signal }
          );

          for await (const event of stream) {
            if (upstream.signal.aborted) break;
            if (event.type !== "content_block_delta") continue;

            if (event.delta.type === "text_delta") {
              if (!streamedText) {
                reasoning.close();
                streamedText = true;
                firstTextMs = Date.now() - startedAt;
              }
              answerText += event.delta.text;
              send({ type: "delta", text: event.delta.text });
            } else if (event.delta.type === "thinking_delta") {
              reasoning.push(event.delta.thinking);
            }
          }

          final = await stream.finalMessage();
          // Real token counts per call, so the daily breaker tracks the
          // whole exchange, tool rounds included.
          await recordSpend(final.usage, serving.id);

          if (final.stop_reason !== "tool_use" || lastCall || upstream.signal.aborted) {
            break;
          }

          const toolUses = final.content.filter(
            (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use"
          );
          for (const block of toolUses) {
            send({
              type: "status",
              label: "Looking it up",
              point: toolTracePoint(block.name, block.input),
            });
          }
          working.push(
            // The full content blocks go back, thinking included — the API
            // requires the thinking blocks intact on a tool-using turn.
            { role: "assistant", content: final.content as Anthropic.Messages.ContentBlockParam[] },
            {
              role: "user",
              content: toolUses.map((block) => ({
                type: "tool_result" as const,
                tool_use_id: block.id,
                content: runChatTool(block.name, block.input),
              })),
            }
          );
        }

        if (final.stop_reason === "refusal" && !streamedText) {
          noticeText =
            "That one is outside what this chat covers. Ask about Rob's work, the case studies, or the design system and it can help.";
          send({ type: "notice", text: noticeText });
        } else if (final.stop_reason === "max_tokens") {
          send({ type: "delta", text: "\n\n(Cut off at the length limit.)" });
        }

        // The exchange log: the ground truth the golden set grows from.
        await recordExchange({
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
        // After the log line exists, so a verdict can never dangle. Not sent
        // on the guardrail path: thumbs on a rate-limit notice rate the
        // guardrail copy, not an answer.
        send({ type: "exchange", id: exchangeId });
      } catch (error) {
        const aborted =
          upstream.signal.aborted ||
          (error instanceof Error && error.name === "AbortError");

        if (!aborted && !streamedText) {
          console.error("[chat] upstream failed before any text:", error);
          send({ type: "error", message: friendlyError(error) });
        } else if (!aborted) {
          // Text is already on screen; an error event would erase it.
          console.error("[chat] upstream failed mid-stream, keeping the partial:", error);
        }
      } finally {
        send({ type: "done" });
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
}

/** Maps an upstream failure to something a visitor can act on. */
function friendlyError(error: unknown): string {
  const status = (error as { status?: number })?.status;

  if (status === 429 || status === 529) {
    return "The model is busy right now. Give it a moment and ask again.";
  }
  if (status === 401 || status === 403) {
    return "This chat is not configured correctly at the moment. The contact page at /contact still works.";
  }
  return "Something went wrong reaching the model. Try that again, or use /contact if it keeps happening.";
}
