import {
  confirmationLine,
  createChatHandler,
  planAction,
  sanitiseConfirmation,
  sanitisePath,
  type ActionConfirmation,
  type ChatTool,
} from 'rift-ds/chat/server';
import { CHAT_MODELS, DEFAULT_CHAT_MODEL } from '../../../components/chat/models';
import { ACTIONS, SAMPLE_ITEMS, itemNoun, type ActionId } from '../../../components/chat/actions';
import { guardrails } from './guardrails';

export const maxDuration = 60;

/**
 * The propose-and-confirm chat. The model can only propose: its tool plans
 * an action over the records the request means and sends the plan as a
 * `proposal` card, which the reader confirms on the page (ProposalCard.tsx).
 * Nothing here writes. A confirmed message arrives with the page's mark in
 * its context; the route rebuilds it as untrusted input, tells the model
 * whether this message was confirmed on its card, and opens the reply with
 * the record of what was done as a `lead` card.
 */
const SYSTEM = `You are the assistant on this page. You can propose changes to the items with the propose_change tool, but you never make a change yourself: the reader confirms it on the card. Say a change is made only when you are told this message was confirmed on its card.`;

/** The context the page sends: its path, and the confirmation the page marked, if any. */
type RequestContext = { path: string | null; confirmation: ActionConfirmation | null };

const isItem = (id: string) => id in SAMPLE_ITEMS;

/* The browser's context is untrusted: keep a slug path and a confirmation
   rebuilt against the real actions and records, and nothing else. */
function sanitiseContext(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length > 4000) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    const context: RequestContext = {
      path: sanitisePath(value.path),
      confirmation: sanitiseConfirmation(value.confirmation, { actions: ACTIONS, isId: isItem, maxCount: 500 }),
    };
    return JSON.stringify(context);
  } catch {
    return null;
  }
}

const readContext = (context: string | null): RequestContext =>
  context ? (JSON.parse(context) as RequestContext) : { path: null, confirmation: null };

const proposeChange: ChatTool = {
  definition: {
    name: 'propose_change',
    description: `Propose a change for the reader to confirm. Actions: ${Object.keys(ACTIONS).join(', ')}. Items: ${Object.entries(SAMPLE_ITEMS)
      .map(([id, item]) => `${id} "${item.title}" (${item.state})`)
      .join('; ')}.`,
    input_schema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: Object.keys(ACTIONS) },
        ids: { type: 'array', items: { type: 'string' } },
      },
      required: ['action', 'ids'],
    },
  },
  tracePoint: () => 'Planned a change',
  execute: (input) => {
    const action = ACTIONS[input.action as ActionId];
    const ids = Array.isArray(input.ids) ? input.ids.filter((id): id is string => typeof id === 'string' && isItem(id)) : [];
    if (!action) return JSON.stringify({ error: 'Unknown action.' });
    const plan = planAction(action, ids.map((id) => ({ id, values: SAMPLE_ITEMS[id] })));
    if (plan.ids.length === 0) return JSON.stringify({ error: 'None of those items can take that change.', skipped: plan.skipped });
    return {
      text: `Proposed on a card for the reader to confirm: ${plan.ids.length} ${itemNoun(plan.ids.length)}. Nothing has changed yet.`,
      card: { kind: 'proposal', data: { ...plan, id: crypto.randomUUID() } },
    };
  },
};

const handler = createChatHandler({
  apiKey: process.env.ANTHROPIC_API_KEY,
  enabled: process.env.CHAT_ENABLED === 'true' && Boolean(process.env.ANTHROPIC_API_KEY),
  system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
  models: CHAT_MODELS,
  defaultModel: DEFAULT_CHAT_MODEL,
  tools: [proposeChange],
  sanitiseContext,
  /* What the model reads about this request, after the cached block. */
  contextBlock: (context) => {
    const { path, confirmation } = readContext(context);
    return [
      path ? `The reader is on the page ${path}.` : null,
      confirmationLine(confirmation, { actions: ACTIONS, noun: itemNoun }),
    ]
      .filter(Boolean)
      .join('\n\n');
  },
  /* A confirmed message's reply opens with the record of what was done. */
  lead: ({ context }) => {
    const { confirmation } = readContext(context);
    return confirmation ? [{ kind: 'record', data: { action: confirmation.action, count: confirmation.count } }] : [];
  },
  guardrails,
});

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
