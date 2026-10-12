import type { ChatEvent, ChatTransport, ChatTransportMessage } from './types';

/* ============================================
   The fetch transport.

   Posts the conversation to a server handler (createChatHandler, or any
   endpoint speaking the same NDJSON protocol) and yields the events it
   streams back. Same event shapes as the scripted transport, so the widget
   cannot tell which one it is running on.

   Three obligations come from the ChatTransport contract: close the reader
   in a finally (the consumer breaks on `done`, which invokes the iterator's
   return()), check the signal between yields, and run its own first-byte
   watchdog because the consumer has no timeout of its own.
   ============================================ */

/**
 * How long to wait for the first byte before giving up. Generous on purpose:
 * a cold prompt cache costs several seconds before the model starts, and a
 * false timeout is worse than a slow answer.
 */
export const FIRST_BYTE_TIMEOUT_MS = 15_000;

/** Turns sent upstream. The handler re-enforces this; sending less saves bytes. */
export const MAX_TRANSPORT_TURNS = 10;

/** The copy a failed request becomes, by its HTTP status. */
export interface FetchTransportCopy {
  /** The request could not be sent at all. */
  unreachable: string;
  /** 400: the server rejected the message shape. */
  badRequest: string;
  /** 429: too many requests. */
  rateLimited: string;
  /** 5xx. */
  serverError: string;
  /** Anything else. */
  other: string;
}

export const DEFAULT_FETCH_COPY: FetchTransportCopy = {
  unreachable: 'Could not reach the chat backend. Check your connection and try again.',
  badRequest: 'That message did not go through. Try rephrasing it.',
  rateLimited: 'That is a lot of questions at once. Give it a minute and try again.',
  serverError: 'The chat backend is having trouble. Try again in a moment.',
  other: 'Something went wrong sending that. Try again.',
};

function httpErrorMessage(status: number, copy: FetchTransportCopy): string {
  if (status === 400) return copy.badRequest;
  if (status === 429) return copy.rateLimited;
  if (status >= 500) return copy.serverError;
  return copy.other;
}

export interface FetchTransportOptions {
  /**
   * The visitor's explicit model pick (a wire value from the host's model
   * list), read at send time so a mid-conversation switch applies from the
   * next message. Null means no pick was made: the server applies its own
   * default, which is the distinction that lets a budget tier move the
   * default without fighting a visitor who never touched the picker.
   */
  getModel?: () => string | null;
  /**
   * The context the request carries as `path`: by default the page the
   * visitor is on, read at send time so a conversation that spans several
   * pages sends each question with the page it was asked from. The handler
   * treats it as untrusted input and sanitises it. Return null to send none.
   */
  getContext?: () => string | null;
  /** Replacement copy for the failure messages. */
  copy?: Partial<FetchTransportCopy>;
}

/**
 * A transport over `fetch` to an NDJSON chat endpoint.
 *
 * `endpoint` defaults to `/api/chat`, which is where `npx rift-ds init chat`
 * writes the server handler; a host with its own URL passes it.
 */
export function createFetchTransport(
  endpoint = '/api/chat',
  options: FetchTransportOptions = {}
): ChatTransport {
  const copy = { ...DEFAULT_FETCH_COPY, ...options.copy };
  const getContext =
    options.getContext ??
    (() => (typeof window !== 'undefined' ? window.location.pathname : null));

  return async function* fetchTransport(
    messages: ChatTransportMessage[],
    signal: AbortSignal
  ): AsyncGenerator<ChatEvent> {
    const path = getContext() ?? undefined;
    const model = options.getModel?.() ?? undefined;
    // One controller for both stop conditions: the caller aborting, and the
    // watchdog firing. The fetch only ever sees this composed signal.
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort);

    let watchdog: ReturnType<typeof setTimeout> | null = setTimeout(
      abort,
      FIRST_BYTE_TIMEOUT_MS
    );
    const clearWatchdog = () => {
      if (watchdog !== null) {
        clearTimeout(watchdog);
        watchdog = null;
      }
    };

    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

    try {
      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            /* Role and text, named field by field: a message may carry
               attachment details for a scripted chat, and nothing about a
               file is ever sent to the server. */
            messages: messages
              .slice(-MAX_TRANSPORT_TURNS)
              .map(({ role, content }) => ({ role, content })),
            path,
            model,
          }),
          signal: controller.signal,
        });
      } catch {
        // An abort from the caller is not a failure to report: the hook
        // already handles a stopped stream, and an error event would replace
        // whatever text had arrived.
        if (signal.aborted) return;
        yield { type: 'error', message: copy.unreachable };
        return;
      }

      if (!response.ok || !response.body) {
        yield { type: 'error', message: httpErrorMessage(response.status, copy) };
        return;
      }

      reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        if (signal.aborted) return;

        const { done, value } = await reader.read();

        // The stream is open, so the connection is no longer at risk of
        // hanging before it starts.
        clearWatchdog();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // The last segment is whatever arrived after the final newline, which
        // is usually a partial line. Hold it until the rest turns up.
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const event = parseEvent(line);
          if (!event) continue;
          yield event;
          if (signal.aborted) return;
        }
      }

      // A well-formed stream ends with a newline, so this is normally empty.
      const trailing = parseEvent(buffer);
      if (trailing) yield trailing;
    } finally {
      clearWatchdog();
      signal.removeEventListener('abort', abort);
      if (reader) {
        // Releases the connection when the consumer breaks out early.
        await reader.cancel().catch(() => {});
      }
    }
  };
}

/** One NDJSON line to an event, ignoring blank or malformed lines. */
function parseEvent(line: string): ChatEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as ChatEvent;
  } catch {
    // A truncated final line is expected when a stream is cut mid-write;
    // dropping it is better than failing the whole turn.
    return null;
  }
}
