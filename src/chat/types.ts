import type { ReactNode } from 'react';
import type { AttachmentItem } from '../components/Attachment/fileTypes';
import type { QuestionCardAnswer, QuestionCardQuestion } from '../components/QuestionCard/QuestionCard';

/* ============================================
   The chat event contract.

   A transport turns a conversation into a stream of these events. The
   scripted transport plays them from a script; the fetch transport parses
   the same shapes off an NDJSON response the server handler streams; a
   consumer's own transport yields whatever it likes. Swapping transports is
   the whole integration: the widget cannot tell which one it is running on.
   ============================================ */

/**
 * Rich content that can cross a network: a kind the host knows how to draw
 * and the data to draw it from. The provider's `renderers` map turns one
 * into a React node when the turn renders. A tool can answer with one from
 * the server handler, and a script can attach one to a reply.
 */
export interface ChatCard {
  /** The renderer key, e.g. "chart" or "plan". Unknown kinds render nothing. */
  kind: string;
  /** Whatever the renderer for `kind` expects. Must survive JSON. */
  data: unknown;
}

/**
 * Something the chat made that is worth more room than a turn can give it: a
 * dashboard, a document, a page, a site. It travels as an ordinary card of
 * kind `ARTIFACT_CARD_KIND`, so any transport that can send a card can send
 * one; the thread draws it as a tile, and the tile opens the artifact panel
 * beside the conversation.
 */
export interface ChatArtifact {
  /** Stable identity: the same id reopened is the same artifact. */
  id: string;
  /** The artifact's name, on the tile and in the panel's header. */
  title: string;
  /**
   * How to draw it. `html` frames the `html` document, `url` frames the
   * `url`, `code` shows the `code` alone; any other kind is drawn by the
   * provider's `artifactRenderers`. An unknown kind with no renderer falls
   * back to whichever of `html`, `url` and `code` it carries.
   */
  kind: string;
  /** A quiet line beside the name: what it is, or which version. */
  meta?: string;
  /** A Material Symbol name for the tile and the header. */
  icon?: string;
  /** A complete HTML document, drawn in a sandboxed frame. */
  html?: string;
  /** A page to frame. Only http(s) URLs and same-site paths are framed. */
  url?: string;
  /** The source, offered as the panel's Code view. An `html` artifact offers its document when this is absent. */
  code?: string;
  /** The source's language. */
  language?: string;
  /** Whatever a custom renderer for `kind` expects. Must survive JSON. */
  data?: unknown;
}

/** The card kind an artifact travels as. Its `data` is a `ChatArtifact`. */
export const ARTIFACT_CARD_KIND = 'artifact';

/** One question the agent asks: a prompt and the answers on offer. The shape QuestionCard draws. */
export type ChatQuestion = QuestionCardQuestion;

/** What the visitor answered to one question. */
export type ChatQuestionAnswer = QuestionCardAnswer;

/**
 * Questions the agent asks at the end of a reply, with the answers it can
 * list: one question or a short set, each taking one option or several.
 * The reply's text asks in words too, so a transport or a renderer that
 * drops the set still leaves a conversation that reads correctly.
 */
export interface ChatQuestionSet {
  /** Stable identity within the conversation. */
  id: string;
  /** Asked one at a time when there is more than one. A set of more than one holds the composer until it is answered or skipped. */
  questions: ChatQuestion[];
}

/**
 * The answers to a question set as a user turn draws them: each question's
 * prompt and the labels picked. The turn's `text` is the same answers as
 * the plain message the model reads.
 */
export interface ChatReply {
  items: { prompt: string; answers: string[] }[];
}

export type ChatEvent =
  /** A live status step: the AgentStatus label, with an optional reasoning trace point. */
  | { type: 'status'; label: string; point?: string }
  /** The model serving this exchange, as a display label ("Sonnet 5").
      The server's per-answer ground truth; kept in state but not rendered
      by the widget today, whose picker follows the `models` offer event. */
  | { type: 'model'; label: string }
  /** What the server is offering right now: the wire value it defaults to,
      and any values the day's budget has locked out. The picker follows
      this: the server owns the default and the lock, the client only
      expresses a preference. */
  | { type: 'models'; default: string; locked: string[] }
  /** A chunk of response text. The first delta ends the thinking phase. */
  | { type: 'delta'; text: string }
  /** The server-side log id for this exchange. Feedback references it, so a
      thumbs verdict can be joined back to the logged question and answer.
      A transport that never sends one hides the thumbs, which is what a
      script does. */
  | { type: 'exchange'; id: string }
  /** Follow-up questions to offer under the finished answer. A transport that
      can produce them yields this before `done`; the fetch transport cannot
      (they are written from the completed answer, so waiting for them would
      hold the turn open) and the provider fetches them after the turn
      commits instead. */
  | { type: 'followups'; items: string[] }
  /** Rich content to render with the committed turn, as a React node. Only
      an in-browser transport can yield one (a script, or `injectTurn`); the
      network form is `card`. */
  | { type: 'content'; node: ReactNode }
  /** Rich content to render with the committed turn, as serialisable data
      the provider's `renderers` draw. The form a server can send. */
  | { type: 'card'; card: ChatCard }
  /** Questions the agent asks with answers to pick, drawn under the committed
      turn in place of follow-ups: a turn that asks is never asked about. */
  | { type: 'question'; set: ChatQuestionSet }
  /** Terminal: the response is complete. */
  | { type: 'done' }
  /** A guardrail response (rate limit, circuit breaker): rendered as a normal assistant message. */
  | { type: 'notice'; text: string }
  /** A failure the user should see, phrased for humans. */
  | { type: 'error'; message: string };

/** Every event kind, for documentation that enumerates the protocol. */
export const CHAT_EVENT_KINDS = [
  'status',
  'model',
  'models',
  'delta',
  'exchange',
  'followups',
  'content',
  'card',
  'question',
  'done',
  'notice',
  'error',
] as const satisfies readonly ChatEvent['type'][];

export interface ChatTransportMessage {
  role: 'user' | 'assistant';
  content: string;
  /**
   * What was attached to a user message: names and kinds, never bytes. The
   * scripted transport reads it to answer about the files. The fetch
   * transport drops it before the request is built, so nothing about an
   * attachment reaches the server.
   */
  attachments?: { name: string; kind: AttachmentItem['kind']; size?: number }[];
}

/**
 * A transport streams events for one exchange. Abort the signal to stop it.
 *
 * Contract notes for implementations:
 * - The consumer `break`s out of its `for await` loop on `done` (and on
 *   abort), which invokes the iterator's `return()`: close any underlying
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
  role: 'user' | 'assistant';
  text: string;
  /** Reasoning trace points gathered while the response was live (assistant turns). */
  tracePoints?: string[];
  /** Seconds spent before the first response text (assistant turns). */
  durationSeconds?: number;
  /** The server's log id for the exchange, absent on scripted and placeholder turns. */
  exchangeId?: string;
  /** The visitor's thumbs verdict on this turn, kept for the session only. */
  feedback?: 'up' | 'down';
  /**
   * Follow-up questions offered under this answer. Undefined means none have
   * been asked for yet; an empty array means they were and none came back,
   * which is what stops a failed attempt being retried on every render.
   */
  followups?: string[];
  /**
   * Files sent with a user turn, drawn above its bubble. Their picture
   * previews are object URLs the hook owns from the moment of the send:
   * they are revoked on reset and on unmount.
   */
  attachments?: AttachmentItem[];
  /**
   * Rich content rendered with the turn as a React node: a tool call, a
   * card. Set by `injectTurn` or carried from a transport's `content` event.
   * Assistant turns render it between the reasoning and the prose; user
   * turns stack it above the bubble, like an attachment.
   */
  content?: ReactNode;
  /**
   * Rich content rendered with the turn through the provider's `renderers`,
   * carried from a transport's `card` event. Drawn where `content` is.
   */
  card?: ChatCard;
  /**
   * Questions this assistant turn asks, drawn under it as a QuestionCard in
   * place of follow-ups. Carried from a transport's `question` event.
   */
  question?: ChatQuestionSet;
  /**
   * The answers given to `question`. Undefined while it is open; an empty
   * array records a skip. Kept on the asking turn, so the card renders its
   * answered state where it was asked.
   */
  answers?: ChatQuestionAnswer[];
  /**
   * The answers a user turn carries, drawn as the bubble when there is more
   * than one to show. Its `text` is the same answers as a plain message.
   */
  reply?: ChatReply;
  /**
   * The follow-up chip the visitor sent from under this turn. Once set the
   * row is a record: the chip marked, the rest dimmed and inert.
   */
  followupChosen?: string;
  /**
   * Render `content` on its own in the thread, outside any message chrome,
   * for conversation furniture like a day marker.
   */
  bare?: boolean;
}

export type LivePhase = 'thinking' | 'streaming';

/** The assistant turn currently in flight, rendered after the committed turns. */
export interface LiveResponse {
  /**
   * The turn's stable id, minted at send time and kept when the turn
   * commits, so the rendered element keeps its identity and React
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
  /** Carried from the transport's `card` event into the committed turn. */
  card?: ChatCard;
  /** Carried from the transport's `question` event into the committed turn. */
  question?: ChatQuestionSet;
}

/* ============================================
   Shared option shapes
   ============================================ */

/**
 * One model the widget can offer in its picker and the server handler can
 * serve. Shared by both halves so the wire value the client sends is one the
 * server knows.
 */
export interface ChatModelOption {
  /** Stable wire value: what the picker holds and the client sends. */
  value: string;
  /** The provider's model id the server calls. */
  id: string;
  /** Display name in the picker. */
  label: string;
  /** One line under the name in the picker. */
  description: string;
  /**
   * Whether the model takes adaptive thinking and the effort dial. A model
   * that predates them rejects both, so the handler sends it a plain request.
   */
  adaptiveThinking: boolean;
}

/** One conversation starter on the welcome screen. */
export interface Starter {
  id: string;
  label: string;
}

/** The thumbs verdict a visitor can give an answer. */
export type ChatFeedbackVerdict = 'up' | 'down';
