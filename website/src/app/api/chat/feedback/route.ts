/**
 * POST /api/chat/feedback — thumbs verdicts on chat answers.
 *
 * The body is `{ id, verdict }`: the exchange id the chat route streamed with
 * the answer, and "up" or "down". One Redis key per id, last write wins, so a
 * switched vote needs no dedupe logic. The response is 204 in every stored or
 * fail-open case: the client renders optimistically and never blocks on this
 * route, so there is nothing useful to say back.
 *
 * The id is never trusted to exist. A verdict for an id no exchange used is a
 * write to a key nothing will ever join against; it expires unread. That makes
 * validation a shape check, not a lookup.
 */
import {
  checkFeedbackLimit,
  recordFeedback,
  visitorKey,
  type FeedbackVerdict,
} from "../guardrails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The UUID the chat route mints, and nothing broader. */
const EXCHANGE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const isVerdict = (value: unknown): value is FeedbackVerdict =>
  value === "up" || value === "down";

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null) {
    return Response.json({ error: "body must be an object" }, { status: 400 });
  }

  const { id, verdict } = payload as { id?: unknown; verdict?: unknown };
  if (typeof id !== "string" || !EXCHANGE_ID.test(id)) {
    return Response.json({ error: "id must be an exchange id" }, { status: 400 });
  }
  if (!isVerdict(verdict)) {
    return Response.json({ error: "verdict must be 'up' or 'down'" }, { status: 400 });
  }

  if (!(await checkFeedbackLimit(request))) {
    return new Response(null, { status: 429 });
  }

  await recordFeedback(id, verdict, visitorKey(request));
  return new Response(null, { status: 204 });
}
