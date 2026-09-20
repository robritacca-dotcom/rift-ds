import type { ChatEvent, ChatTransport, ChatTransportMessage } from "@/hooks/useChat";

/* ============================================
   Real chat transport.

   Posts the conversation to /api/chat and yields the newline-delimited JSON
   events the route streams back. Same event shapes as the sim transport, so
   the widget cannot tell which one it is running on.

   Three obligations come from the ChatTransport contract in useChat:
   close the reader in a finally (the consumer breaks on `done`, which invokes
   the iterator's return()), check the signal between yields, and run its own
   first-byte watchdog because the consumer has no timeout of its own.
   ============================================ */

/**
 * How long to wait for the first byte before giving up. Generous on purpose:
 * a cold prompt cache costs several seconds before the model starts, and a
 * false timeout is worse than a slow answer.
 */
const FIRST_BYTE_TIMEOUT_MS = 15_000;

/** Turns sent upstream. The route re-enforces this; sending less saves bytes. */
const MAX_TURNS = 10;

/** Maps a failed request to something a visitor can act on. */
function httpErrorMessage(status: number): string {
  if (status === 400) {
    return "That message did not go through. Try rephrasing it.";
  }
  if (status === 429) {
    return "That is a lot of questions at once. Give it a minute and try again.";
  }
  if (status >= 500) {
    return "The chat backend is having trouble. Try again in a moment.";
  }
  return "Something went wrong sending that. Try again.";
}

export function createFetchTransport(
  endpoint = "/api/chat",
  /**
   * The visitor's explicit model pick (a wire value from CHAT_MODELS), read
   * at send time so a mid-conversation switch applies from the next message.
   * Null means no pick was made — the server applies its own default, which
   * is the distinction that lets the budget tier move the default without
   * fighting a visitor who never touched the picker.
   */
  getModel?: () => string | null
): ChatTransport {
  return async function* fetchTransport(
    messages: ChatTransportMessage[],
    signal: AbortSignal
  ): AsyncGenerator<ChatEvent> {
    /* The page the visitor is on, read at send time so a conversation that
       spans several pages sends each question with the page it was asked
       from. The route treats it as untrusted input and sanitises it. */
    const path = typeof window !== "undefined" ? window.location.pathname : undefined;
    const model = getModel?.() ?? undefined;
    // One controller for both stop conditions: the caller aborting, and the
    // watchdog firing. The fetch only ever sees this composed signal.
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener("abort", abort);

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
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: messages.slice(-MAX_TURNS), path, model }),
          signal: controller.signal,
        });
      } catch {
        // An abort from the caller is not a failure to report: the hook
        // already handles a stopped stream, and an error event would replace
        // whatever text had arrived.
        if (signal.aborted) return;
        yield {
          type: "error",
          message: "Could not reach the chat backend. Check your connection and try again.",
        };
        return;
      }

      if (!response.ok || !response.body) {
        yield { type: "error", message: httpErrorMessage(response.status) };
        return;
      }

      reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

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
      signal.removeEventListener("abort", abort);
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
