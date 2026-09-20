"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createStreamReveal } from "@robr0/design-system/components/StreamingText/useStreamReveal";

/* ============================================
   The chat event contract.

   A transport turns a conversation into a stream of these events. The sim
   transport scripts them; the real /api/chat transport (Build 2) will parse
   the same shapes off an NDJSON response — swapping transports is the whole
   integration.
   ============================================ */

export type ChatEvent =
  /** A live status step: the AgentStatus label, with an optional reasoning trace point. */
  | { type: "status"; label: string; point?: string }
  /** The model serving this exchange, as a display label ("Sonnet 5").
      The server's per-answer ground truth; kept in state but not rendered
      anywhere today — the composer's picker follows the `models` offer
      event instead. */
  | { type: "model"; label: string }
  /** What the server is offering right now: the wire value it defaults to,
      and any values the day's budget has locked out. The picker follows
      this — the server owns the default and the lock, the client only
      expresses a preference. */
  | { type: "models"; default: string; locked: string[] }
  /** A chunk of response text. The first delta ends the thinking phase. */
  | { type: "delta"; text: string }
  /** The server-side log id for this exchange. Feedback references it, so a
      thumbs verdict can be joined back to the logged question and answer.
      The sim transport never sends one, which is what hides the thumbs in
      the playground's Chat view. */
  | { type: "exchange"; id: string }
  /** Follow-up questions to offer under the finished answer. A transport that
      can produce them yields this before `done`; the site's real transport
      cannot (they are written from the completed answer, so waiting for them
      would hold the turn open) and fetches them after the turn commits
      instead — see lib/chat-followups. */
  | { type: "followups"; items: string[] }
  /** Rich content to render with the committed turn — a card, a chart, a
      tool call. Only a scripted transport can yield one (the playground's
      sim story does); the live transports produce text alone, so the site
      widget never sees this event. */
  | { type: "content"; node: ReactNode }
  /** Terminal: the response is complete. */
  | { type: "done" }
  /** A guardrail response (rate limit, circuit breaker): rendered as a normal assistant message. */
  | { type: "notice"; text: string }
  /** A failure the user should see, phrased for humans. */
  | { type: "error"; message: string };

export interface ChatTransportMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * A transport streams events for one exchange. Abort the signal to stop it.
 *
 * Contract notes for implementations:
 * - The consumer `break`s out of its `for await` loop on `done` (and on
 *   abort), which invokes the iterator's `return()` — close any underlying
 *   reader or connection in a `try/finally`.
 * - Check the signal between yields; the consumer also guards its own loop,
 *   but a transport that ignores abort keeps its own work running.
 * - There is no first-event timeout on the consumer side: a transport that
 *   can hang before its first yield should implement its own watchdog.
 */
export type ChatTransport = (
  messages: ChatTransportMessage[],
  signal: AbortSignal
) => AsyncIterable<ChatEvent>;

/* ============================================
   Conversation state
   ============================================ */

/** One committed turn. Assistant turns keep their reasoning for the collapsed disclosure. */
export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** Reasoning trace points gathered while the response was live (assistant turns). */
  tracePoints?: string[];
  /** Seconds spent before the first response text (assistant turns). */
  durationSeconds?: number;
  /** The server's log id for the exchange, absent on sim and placeholder turns. */
  exchangeId?: string;
  /** The visitor's thumbs verdict on this turn, kept for the session only. */
  feedback?: "up" | "down";
  /**
   * Follow-up questions offered under this answer. Undefined means none have
   * been asked for yet; an empty array means they were and none came back,
   * which is what stops a failed attempt being retried on every render.
   */
  followups?: string[];
  /**
   * Injected rich content rendered with the turn: a tool call, a card, an
   * attachment chip. Set by `injectTurn` (the playground's event director)
   * or carried from a scripted transport's `content` event (the sim story);
   * the live transports produce text alone, so the site widget never
   * carries one. Assistant turns render it between the reasoning and the
   * prose; user turns stack it above the bubble, like an attachment.
   */
  content?: ReactNode;
  /**
   * Render `content` on its own in the thread, outside any message chrome —
   * for conversation furniture like a day marker.
   */
  bare?: boolean;
}

export type LivePhase = "thinking" | "streaming";

/** The assistant turn currently in flight, rendered after the committed turns. */
export interface LiveResponse {
  /**
   * The turn's stable id, minted at send time and kept when the turn
   * commits — so the rendered element keeps its identity and React
   * reconciles the finished response in place instead of remounting it.
   */
  id: string;
  phase: LivePhase;
  /** Current AgentStatus label while thinking. */
  statusLabel: string;
  tracePoints: string[];
  text: string;
  durationSeconds?: number;
  /** Carried from the transport's `exchange` event into the committed turn. */
  exchangeId?: string;
  /** Carried from the transport's `followups` event into the committed turn. */
  followups?: string[];
  /** Carried from the transport's `content` event into the committed turn. */
  content?: ReactNode;
}

let nextId = 0;
const makeId = () => `turn-${++nextId}`;

/* ============================================
   Display pacing.

   A real model's deltas arrive in phrase-sized clumps at irregular
   intervals. Rendering each one the moment it lands is honest but reads as
   blocky text, however smoothly the markdown renders — the unevenness is in
   the arrival times, not the drawing. So hold what has arrived and reveal it
   at a steady rate.

   The engine that does the holding is the library's: createStreamReveal,
   the pacing inside StreamingText, published headless for exactly this
   shape of consumer — one that streams markdown and must render it itself.
   Its policy started here and moved into the library with the engine: the
   rate scales with the backlog rather than being fixed, so whatever is
   waiting drains within MOTION_STREAM_DRAIN_MS and a thin trickle still
   moves at MOTION_STREAM_FLOOR_CPS, both from tokens/motion.
   ============================================ */

/**
 * useChat owns the conversation: the committed turns, the assistant turn in
 * flight, and the phase machine that drives the AgentStatus → Reasoning →
 * streamed-text choreography. It knows nothing about rendering or about
 * where events come from — the transport decides that.
 */
export function useChat(transport: ChatTransport) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [live, setLive] = useState<LiveResponse | null>(null);
  /* The model label the server last reported, null until a first exchange.
     Survives reset on purpose: the serving model is a fact about the
     backend, not about one conversation. */
  const [modelLabel, setModelLabel] = useState<string | null>(null);
  /* The server's current model offer (default + locked values), null until
     it first reports. Survives reset like the label: what is on offer is a
     fact about the backend's budget, not about one conversation. */
  const [modelPolicy, setModelPolicy] = useState<{
    default: string;
    locked: string[];
  } | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  /* The transport-facing history, maintained in event handlers only so it
     can be read synchronously when a send starts. UI-only placeholder text
     (stop/error/empty fallbacks) never enters it — the real model must not
     receive our apologies as its own prior speech. */
  const historyRef = useRef<ChatTransportMessage[]>([]);
  /* Bumped on reset. A send whose generation is stale must not touch state —
     otherwise new-chat during a stream repaints the aborted turn into the
     fresh conversation. */
  const generationRef = useRef(0);

  /* Leaving the page mid-stream: abort so a real transport's connection
     does not run to completion against an unmounted consumer. */
  useEffect(() => () => abortRef.current?.abort(), []);

  const streaming = live !== null;

  /**
   * Move the finished live response into the committed turns.
   * `historyText` is what the transport history records — null when the
   * turn is a UI-only placeholder that must not reach the model.
   */
  const commit = useCallback(
    (finished: LiveResponse, startedAt: number, historyText: string | null) => {
      if (historyText !== null && historyText !== "") {
        historyRef.current = [
          ...historyRef.current,
          { role: "assistant", content: historyText },
        ];
      }
      setLive(null);
      setTurns((prev) => [
        ...prev,
        {
          id: finished.id,
          role: "assistant",
          text: finished.text,
          tracePoints: finished.tracePoints,
          exchangeId: finished.exchangeId,
          followups: finished.followups,
          content: finished.content,
          durationSeconds:
            finished.durationSeconds ??
            Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
        },
      ]);
    },
    []
  );

  /**
   * Send a message. Returns whether the send was accepted — false while a
   * response is in flight or for an empty draft, so the caller knows not to
   * clear its input.
   *
   * `options.content` attaches rich content to the user turn — an attachment
   * chip above the bubble, the way a dropped file lands. Playground staging
   * only: the transport still receives the text alone.
   */
  const send = useCallback(
    (text: string, options?: { content?: ReactNode }): boolean => {
      const trimmed = text.trim();
      if (trimmed === "" || busyRef.current) return false;
      busyRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;
      const generation = generationRef.current;
      const startedAt = Date.now();

      const history: ChatTransportMessage[] = [
        ...historyRef.current,
        { role: "user", content: trimmed },
      ];
      historyRef.current = history;

      // The user turn and the live assistant turn appear in the same update,
      // so ChatThread anchors the user turn to the top of the viewport.
      const userTurnId = makeId();
      setTurns((prev) => [
        ...prev,
        { id: userTurnId, role: "user", text: trimmed, content: options?.content },
      ]);

      let current: LiveResponse = {
        id: makeId(),
        phase: "thinking",
        statusLabel: "Thinking",
        tracePoints: [],
        text: "",
      };
      setLive(current);

      const update = (next: LiveResponse) => {
        current = next;
        setLive(next);
      };

      /* The engine holds what the transport has yielded and moves the
         on-screen slice towards it once a frame, which also coalesces
         renders — a fast stream never re-parses the markdown more than
         once a frame. `onUpdate` merges into `current`, so the phase and
         duration recorded at arrival ride along with the next slice. */
      const reveal = createStreamReveal({
        onUpdate: (visible) => update({ ...current, text: visible }),
        /* Someone who has asked for less motion is asking for less of this. */
        paced: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });

      const run = async () => {
        try {
          for await (const event of transport(history, controller.signal)) {
            /* A transport may deliver one more event after an abort or
               reset resolves — never let it touch the fresh conversation. */
            if (generation !== generationRef.current || controller.signal.aborted) break;
            switch (event.type) {
              case "model":
                setModelLabel(event.label);
                break;
              case "models":
                setModelPolicy({ default: event.default, locked: event.locked });
                break;
              case "exchange":
                /* A fact about the turn, not about what is on screen — no
                   render needed; commit carries it into the turn. */
                current = { ...current, exchangeId: event.id };
                break;
              case "followups":
                // Same: nothing renders until the turn commits with them.
                current = { ...current, followups: event.items };
                break;
              case "content":
                // Same: the rich element appears when the turn commits.
                current = { ...current, content: event.node };
                break;
              case "status":
                update({
                  ...current,
                  statusLabel: event.label,
                  tracePoints: event.point
                    ? [...current.tracePoints, event.point]
                    : current.tracePoints,
                });
                break;
              case "delta":
                /* The phase and duration are facts about arrival, not about
                   the reveal, so they are recorded here — the reveal loop
                   carries them into the next render along with the text. */
                current = {
                  ...current,
                  phase: "streaming",
                  // Thinking ends at the first delta; freeze the duration then.
                  durationSeconds:
                    current.durationSeconds ??
                    Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
                };
                reveal.append(event.text);
                break;
              /* A guardrail line and a failure are not the model speaking, so
                 they are not paced like it — they appear whole. */
              case "notice":
              case "error":
                current = {
                  ...current,
                  phase: "streaming",
                  durationSeconds: current.durationSeconds ?? 1,
                };
                reveal.showWhole(event.type === "notice" ? event.text : event.message);
                break;
              case "done":
                break;
            }
            if (event.type === "done") break;
          }
          /* The transport is done, but the reveal may not be. Committing now
             would pop the unrevealed remainder in whole, undoing the pacing
             at the very end of every response — so let it finish first.
             A stop or a reset does not wait: it shows what arrived and ends. */
          if (controller.signal.aborted || generation !== generationRef.current) {
            reveal.flush();
          } else {
            await reveal.drained();
          }
          reveal.cancel();
          if (generation !== generationRef.current) return;
          if (current.text === "") {
            // A completion that never produced text is a failure, not a reply.
            commit(
              { ...current, text: "The reply came back empty. Try sending that again." },
              startedAt,
              null
            );
          } else {
            commit(current, startedAt, current.text);
          }
        } catch (err) {
          reveal.flush();
          if (generation !== generationRef.current) {
            // The conversation was reset out from under this send — drop it.
          } else if (controller.signal.aborted) {
            // Stopped by the reader: keep whatever streamed in; the partial
            // is real assistant speech, so it belongs in the history too.
            if (current.text === "") {
              commit(
                { ...current, text: "Stopped before a reply arrived." },
                startedAt,
                null
              );
            } else {
              commit(current, startedAt, current.text);
            }
          } else {
            // Keep any partial (it is real); placeholder only when empty.
            if (current.text === "") {
              commit(
                {
                  ...current,
                  text: "Something went wrong while replying. Try sending that again.",
                },
                startedAt,
                null
              );
            } else {
              commit(current, startedAt, current.text);
            }
            // Surface the real cause for the person building, not the visitor.
            console.error(err);
          }
        } finally {
          if (generation === generationRef.current) busyRef.current = false;
        }
      };

      void run();
      return true;
    },
    [transport, commit]
  );

  /**
   * Record the visitor's thumbs verdict on a committed turn. State only —
   * the caller owns telling the server, because only it knows the endpoint.
   */
  const setTurnFeedback = useCallback((turnId: string, feedback: "up" | "down") => {
    setTurns((prev) =>
      prev.map((turn) => (turn.id === turnId ? { ...turn, feedback } : turn))
    );
  }, []);

  /**
   * Attach follow-up questions to a committed turn. State only — the caller
   * owns producing them, because only it knows where they come from. Writing
   * an empty array records that the attempt was made and came back with
   * nothing, so it is never repeated for that turn.
   */
  const setTurnFollowups = useCallback((turnId: string, followups: string[]) => {
    setTurns((prev) =>
      prev.map((turn) => (turn.id === turnId ? { ...turn, followups } : turn))
    );
  }, []);

  /**
   * Append a committed turn directly, bypassing the transport — the
   * playground's event director stages cards, tool calls, and markers with
   * this. Injected turns are stage dressing: they never enter the transport
   * history, so a live model is never fed words it did not say.
   */
  const injectTurn = useCallback((turn: Omit<ChatTurn, "id">) => {
    setTurns((prev) => [...prev, { ...turn, id: makeId() }]);
  }, []);

  /** Stop the in-flight response, keeping the text that already arrived. */
  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /** New chat: abort anything in flight and clear the conversation. */
  const reset = useCallback(() => {
    generationRef.current += 1;
    abortRef.current?.abort();
    // The generation guard makes the old stream inert, so the fresh
    // conversation accepts sends immediately.
    busyRef.current = false;
    historyRef.current = [];
    setTurns([]);
    setLive(null);
  }, []);

  return {
    turns,
    live,
    streaming,
    modelLabel,
    modelPolicy,
    send,
    stop,
    reset,
    injectTurn,
    setTurnFeedback,
    setTurnFollowups,
  };
}
