import { createFeedbackHandler } from 'rift-ds/chat/server';
import { guardrails } from '../guardrails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Thumbs verdicts on answers, stored against the exchange the chat route logged. */
const handler = createFeedbackHandler({ guardrails });

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
