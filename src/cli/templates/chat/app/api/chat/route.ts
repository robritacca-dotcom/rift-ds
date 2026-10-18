import { createChatHandler } from 'rift-ds/chat/server';
import { CHAT_MODELS, DEFAULT_CHAT_MODEL } from '../../../components/chat/models';
import { guardrails } from './guardrails';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * What the assistant knows and how it behaves. Replace this with your own
 * instructions and whatever the model should read: your docs, your product's
 * facts, your rules. Put `cache_control` on the block that holds the bulk
 * of it, so repeat visitors hit the prompt cache.
 */
const SYSTEM = `You are the assistant on this site. Answer from what you know about the product, plainly and briefly. If you do not know, say so.`;

const handler = createChatHandler({
  apiKey: process.env.ANTHROPIC_API_KEY,
  // Off until both are set, so a deploy ahead of its environment answers
  // politely rather than throwing.
  enabled: process.env.CHAT_ENABLED === 'true' && Boolean(process.env.ANTHROPIC_API_KEY),
  system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
  models: CHAT_MODELS,
  defaultModel: DEFAULT_CHAT_MODEL,
  // tools: [], // Deterministic lookups the model may call; a tool can answer with a card.
  // A reply can end in a question with answers to pick, drawn as a card the
  // visitor taps. Asking ends the exchange; the answer arrives as the next message.
  askUser: true,
  guardrails,
});

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
