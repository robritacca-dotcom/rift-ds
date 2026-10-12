/**
 * POST /api/chat/feedback: thumbs verdicts on chat answers, as the package's
 * feedback handler over the site's guardrails. The body is `{ id, verdict }`,
 * the exchange id the chat route streamed with the answer and "up" or
 * "down"; one Redis key per id, last write wins, and the response is 204 in
 * every stored or fail-open case. Joining the verdicts against the exchange
 * log is what turns a dislike into a golden-set candidate for the eval.
 */
import { createFeedbackHandler } from "rift-ds/chat/server";

import { guardrails } from "../guardrails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createFeedbackHandler({ guardrails });

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
