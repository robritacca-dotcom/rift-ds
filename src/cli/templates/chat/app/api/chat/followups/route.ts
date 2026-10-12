import { createFollowupsHandler } from 'rift-ds/chat/server';
import { FOLLOWUP_MODEL } from '../../../../components/chat/models';
import { guardrails } from '../guardrails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The three follow-up questions offered under a finished answer, written by
 * a small model from the question-and-answer pair. Say what the chat is
 * about in `about`, so the questions stay on your subject.
 */
const handler = createFollowupsHandler({
  apiKey: process.env.ANTHROPIC_API_KEY,
  enabled: process.env.CHAT_ENABLED === 'true' && Boolean(process.env.ANTHROPIC_API_KEY),
  model: FOLLOWUP_MODEL,
  about: 'this product and its documentation',
  guardrails,
});

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
