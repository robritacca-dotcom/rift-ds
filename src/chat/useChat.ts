'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { revokeAttachmentUrls } from '../components/Attachment/useAttachments';
import type { AttachmentItem } from '../components/Attachment/fileTypes';
import { createStreamReveal } from '../components/StreamingText/useStreamReveal';
import { prefersReducedMotion } from '../behaviors/reducedMotion';
import { describeAnswers, sanitizeQuestionSet, serializeReply } from './questions';
import type {
  ChatQuestionAnswer,
  ChatReply,
  ChatTransport,
  ChatTransportMessage,
  ChatTurn,
  LiveResponse,
} from './types';

let nextId = 0;
const makeId = () => `turn-${++nextId}`;

/* ============================================
   Display pacing.

   A real model's deltas arrive in phrase-sized clumps at irregular
   intervals. Rendering each one the moment it lands is honest but reads as
   blocky text, however smoothly the markdown renders: the unevenness is in
   the arrival times, not the drawing. So hold what has arrived and reveal it
   at a steady rate.

   The engine that does the holding is createStreamReveal, the pacing inside
   StreamingText, published headless for exactly this shape of consumer: one
   that streams markdown and must render it itself. The rate scales with the
   backlog rather than being fixed, so whatever is waiting drains within
   MOTION_STREAM_DRAIN_MS and a thin trickle still moves at
   MOTION_STREAM_FLOOR_CPS, both from tokens/motion.
   ============================================ */

/** The copy the hook writes itself: the status line of a reply that has not started, and the reply it shows when a transport ends a turn with nothing to show. */
export interface ChatPlaceholderCopy {
  /** A completion that produced no text. */
  empty: string;
  /** The reader stopped the response before any text arrived. */
  stopped: string;
  /** The transport failed before any text arrived. */
  failed: string;
  /**
   * The status line of a reply in flight before the transport reports one of
   * its own. Defaults to "Thinking". Optional so a full object written
   * against the earlier shape still type-checks.
   */
  thinking?: string;
}

export const DEFAULT_PLACEHOLDER_COPY: Required<ChatPlaceholderCopy> = {
  empty: 'The reply came back empty. Try sending that again.',
  stopped: 'Stopped before a reply arrived.',
  failed: 'Something went wrong while replying. Try sending that again.',
  thinking: 'Thinking',
};

/** What `useChat` returns: the conversation and the actions that move it. */
export interface ChatState {
  /** The committed turns, oldest first. */
  turns: ChatTurn[];
  /** The assistant turn in flight, or null between exchanges. */
  live: LiveResponse | null;
  /** Whether a response is in flight. */
  streaming: boolean;
  /** Display label of the model the transport last reported, null before the first exchange. */
  modelLabel: string | null;
  /** The transport's current model offer (default + locked values), null before it first reports. */
  modelPolicy: { default: string; locked: string[] } | null;
  /**
   * Send a message. Returns whether the send was accepted: false while a
   * response is in flight or for an empty draft, so the caller knows not to
   * clear its input. Files alone are a whole message, so an empty draft is
   * accepted when there are some.
   */
  send: (
    text: string,
    options?: { content?: ReactNode; attachments?: AttachmentItem[]; reply?: ChatReply }
  ) => boolean;
  /**
   * Answer the questions an assistant turn asked: records the answers on
   * that turn, so its card renders the record, and sends them as the next
   * message. Returns false, recording nothing, when the send is refused
   * (a response in flight) or the turn asks nothing.
   */
  answerQuestion: (turnId: string, answers: ChatQuestionAnswer[]) => boolean;
  /** Decline the questions an assistant turn asked. Records the skip and sends nothing. */
  skipQuestion: (turnId: string) => void;
  /**
   * Send a follow-up chip from under a turn and record which it was, so the
   * row keeps the choice. Returns whether the send was accepted.
   */
  chooseFollowup: (turnId: string, label: string) => boolean;
  /** Stop the in-flight response, keeping the text that already arrived. */
  stop: () => void;
  /** New chat: abort anything in flight and clear the conversation. */
  reset: () => void;
  /**
   * Append a committed turn directly, bypassing the transport. Injected turns
   * are stage dressing: they never enter the transport history, so a live
   * model is never fed words it did not say.
   */
  injectTurn: (turn: Omit<ChatTurn, 'id'>) => void;
  /** Record the visitor's thumbs verdict on a committed turn. State only: the caller tells the server. */
  setTurnFeedback: (turnId: string, feedback: 'up' | 'down') => void;
  /**
   * Attach follow-up questions to a committed turn. State only: the caller
   * produces them. Writing an empty array records that the attempt was made
   * and came back with nothing, so it is never repeated for that turn.
   */
  setTurnFollowups: (turnId: string, followups: string[]) => void;
}

/**
 * useChat owns the conversation: the committed turns, the assistant turn in
 * flight, and the phase machine that drives the AgentStatus, Reasoning and
 * streamed-text choreography. It knows nothing about rendering or about
 * where events come from; the transport decides that.
 */
export function useChat(
  transport: ChatTransport,
  placeholders: ChatPlaceholderCopy = DEFAULT_PLACEHOLDER_COPY
): ChatState {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [live, setLive] = useState<LiveResponse | null>(null);
  /* The model label the transport last reported, null until a first exchange.
     Survives reset on purpose: the serving model is a fact about the
     backend, not about one conversation. */
  const [modelLabel, setModelLabel] = useState<string | null>(null);
  /* The transport's current model offer (default + locked values), null until
     it first reports. Survives reset like the label. */
  const [modelPolicy, setModelPolicy] = useState<{
    default: string;
    locked: string[];
  } | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  /* The transport-facing history, maintained in event handlers only so it
     can be read synchronously when a send starts. UI-only placeholder text
     (stop/error/empty fallbacks) never enters it: the real model must not
     receive our apologies as its own prior speech. */
  const historyRef = useRef<ChatTransportMessage[]>([]);
  /* Bumped on reset. A send whose generation is stale must not touch state,
     otherwise new-chat during a stream repaints the aborted turn into the
     fresh conversation. */
  const generationRef = useRef(0);

  /* Leaving the page mid-stream: abort so a real transport's connection
     does not run to completion against an unmounted consumer. */
  useEffect(() => () => abortRef.current?.abort(), []);

  /* The turns as they stand, for the two moments that release what they
     hold: a reset and the unmount. Sent files keep their preview URLs alive
     for as long as the thread shows them, and no longer. */
  const turnsRef = useRef<ChatTurn[]>(turns);
  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);
  const releaseAttachments = useCallback(() => {
    for (const turn of turnsRef.current) {
      if (turn.attachments) revokeAttachmentUrls(turn.attachments);
    }
  }, []);
  useEffect(() => releaseAttachments, [releaseAttachments]);

  const streaming = live !== null;

  /**
   * Move the finished live response into the committed turns.
   * `historyText` is what the transport history records: null when the
   * turn is a UI-only placeholder that must not reach the model.
   */
  const commit = useCallback(
    (finished: LiveResponse, startedAt: number, historyText: string | null) => {
      if (historyText !== null && historyText !== '') {
        historyRef.current = [
          ...historyRef.current,
          { role: 'assistant', content: historyText },
        ];
      }
      setLive(null);
      setTurns((prev) => [
        ...prev,
        {
          id: finished.id,
          role: 'assistant',
          text: finished.text,
          tracePoints: finished.tracePoints,
          exchangeId: finished.exchangeId,
          followups: finished.followups,
          content: finished.content,
          card: finished.card,
          question: finished.question,
          durationSeconds:
            finished.durationSeconds ??
            Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
        },
      ]);
    },
    []
  );

  const send = useCallback<ChatState['send']>(
    (text, options) => {
      const trimmed = text.trim();
      const attachments = options?.attachments?.length ? options.attachments : undefined;
      if ((trimmed === '' && !attachments) || busyRef.current) return false;
      busyRef.current = true;

      const controller = new AbortController();
      abortRef.current = controller;
      const generation = generationRef.current;
      const startedAt = Date.now();

      const history: ChatTransportMessage[] = [
        ...historyRef.current,
        {
          role: 'user',
          content: trimmed,
          attachments: attachments?.map(({ name, kind, size }) => ({ name, kind, size })),
        },
      ];
      historyRef.current = history;

      // The user turn and the live assistant turn appear in the same update,
      // so ChatThread anchors the user turn to the top of the viewport.
      const userTurnId = makeId();
      setTurns((prev) => [
        ...prev,
        {
          id: userTurnId,
          role: 'user',
          text: trimmed,
          content: options?.content,
          attachments,
          reply: options?.reply,
        },
      ]);

      let current: LiveResponse = {
        id: makeId(),
        phase: 'thinking',
        statusLabel: placeholders.thinking ?? DEFAULT_PLACEHOLDER_COPY.thinking,
        tracePoints: [],
        text: '',
      };
      setLive(current);

      const update = (next: LiveResponse) => {
        current = next;
        setLive(next);
      };

      /* The engine holds what the transport has yielded and moves the
         on-screen slice towards it once a frame, which also coalesces
         renders: a fast stream never re-parses the markdown more than once
         a frame. `onUpdate` merges into `current`, so the phase and duration
         recorded at arrival ride along with the next slice. */
      const reveal = createStreamReveal({
        onUpdate: (visible) => update({ ...current, text: visible }),
        /* Someone who has asked for less motion is asking for less of this. */
        paced: !prefersReducedMotion(),
      });

      const run = async () => {
        try {
          for await (const event of transport(history, controller.signal)) {
            /* A transport may deliver one more event after an abort or
               reset resolves: never let it touch the fresh conversation. */
            if (generation !== generationRef.current || controller.signal.aborted) break;
            switch (event.type) {
              case 'model':
                setModelLabel(event.label);
                break;
              case 'models':
                setModelPolicy({ default: event.default, locked: event.locked });
                break;
              case 'exchange':
                /* A fact about the turn, not about what is on screen: no
                   render needed; commit carries it into the turn. */
                current = { ...current, exchangeId: event.id };
                break;
              case 'followups':
                // Same: nothing renders until the turn commits with them.
                current = { ...current, followups: event.items };
                break;
              case 'content':
                // Same: the rich element appears when the turn commits.
                current = { ...current, content: event.node };
                break;
              case 'card':
                current = { ...current, card: event.card };
                break;
              case 'question': {
                /* Checked again here, whatever the transport did: the set is
                   about to be drawn as choices the host appears to offer. */
                const set = sanitizeQuestionSet(event.set, `${current.id}-questions`);
                if (set) current = { ...current, question: set };
                break;
              }
              case 'status':
                update({
                  ...current,
                  statusLabel: event.label,
                  tracePoints: event.point
                    ? [...current.tracePoints, event.point]
                    : current.tracePoints,
                });
                break;
              case 'delta':
                /* The phase and duration are facts about arrival, not about
                   the reveal, so they are recorded here; the reveal loop
                   carries them into the next render along with the text. */
                current = {
                  ...current,
                  phase: 'streaming',
                  // Thinking ends at the first delta; freeze the duration then.
                  durationSeconds:
                    current.durationSeconds ??
                    Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
                };
                reveal.append(event.text);
                break;
              /* A guardrail line and a failure are not the model speaking, so
                 they are not paced like it: they appear whole. */
              case 'notice':
              case 'error':
                current = {
                  ...current,
                  phase: 'streaming',
                  durationSeconds: current.durationSeconds ?? 1,
                };
                reveal.showWhole(event.type === 'notice' ? event.text : event.message);
                break;
              case 'done':
                break;
            }
            if (event.type === 'done') break;
          }
          /* The transport is done, but the reveal may not be. Committing now
             would pop the unrevealed remainder in whole, undoing the pacing
             at the very end of every response, so let it finish first.
             A stop or a reset does not wait: it shows what arrived and ends. */
          if (controller.signal.aborted || generation !== generationRef.current) {
            reveal.flush();
          } else {
            await reveal.drained();
          }
          reveal.cancel();
          if (generation !== generationRef.current) return;
          if (current.text === '') {
            // A completion that never produced text is a failure, not a reply.
            commit({ ...current, text: placeholders.empty }, startedAt, null);
          } else {
            commit(current, startedAt, current.text);
          }
        } catch (err) {
          reveal.flush();
          if (generation !== generationRef.current) {
            // The conversation was reset out from under this send: drop it.
          } else if (controller.signal.aborted) {
            // Stopped by the reader: keep whatever streamed in; the partial
            // is real assistant speech, so it belongs in the history too.
            if (current.text === '') {
              commit({ ...current, text: placeholders.stopped }, startedAt, null);
            } else {
              commit(current, startedAt, current.text);
            }
          } else {
            // Keep any partial (it is real); placeholder only when empty.
            if (current.text === '') {
              commit({ ...current, text: placeholders.failed }, startedAt, null);
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
    [transport, commit, placeholders]
  );

  const setTurnFeedback = useCallback((turnId: string, feedback: 'up' | 'down') => {
    setTurns((prev) =>
      prev.map((turn) => (turn.id === turnId ? { ...turn, feedback } : turn))
    );
  }, []);

  const setTurnFollowups = useCallback((turnId: string, followups: string[]) => {
    setTurns((prev) =>
      prev.map((turn) => (turn.id === turnId ? { ...turn, followups } : turn))
    );
  }, []);

  const patchTurn = useCallback((turnId: string, patch: Partial<ChatTurn>) => {
    setTurns((prev) => prev.map((turn) => (turn.id === turnId ? { ...turn, ...patch } : turn)));
  }, []);

  const answerQuestion = useCallback(
    (turnId: string, answers: ChatQuestionAnswer[]) => {
      const set = turnsRef.current.find((turn) => turn.id === turnId)?.question;
      if (!set) return false;
      const reply = describeAnswers(set, answers);
      /* Sent first, recorded after: a refused send leaves the card open to
         try again rather than marked with an answer nobody received. */
      if (!send(serializeReply(reply), { reply })) return false;
      patchTurn(turnId, { answers });
      return true;
    },
    [send, patchTurn]
  );

  const skipQuestion = useCallback(
    (turnId: string) => patchTurn(turnId, { answers: [] }),
    [patchTurn]
  );

  const chooseFollowup = useCallback(
    (turnId: string, label: string) => {
      if (!send(label)) return false;
      patchTurn(turnId, { followupChosen: label });
      return true;
    },
    [send, patchTurn]
  );

  const injectTurn = useCallback((turn: Omit<ChatTurn, 'id'>) => {
    setTurns((prev) => [...prev, { ...turn, id: makeId() }]);
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    generationRef.current += 1;
    abortRef.current?.abort();
    // The generation guard makes the old stream inert, so the fresh
    // conversation accepts sends immediately.
    busyRef.current = false;
    historyRef.current = [];
    releaseAttachments();
    setTurns([]);
    setLive(null);
  }, [releaseAttachments]);

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
    answerQuestion,
    skipQuestion,
    chooseFollowup,
  };
}
