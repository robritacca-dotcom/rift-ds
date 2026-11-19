'use client';

/**
 * The cards of the propose-and-confirm flow, as the chat's renderers.
 *
 * `proposal` is a change the assistant planned: an ActionCard with Confirm
 * and Cancel. Confirm runs the action on the page (`applyPlan`, yours to
 * write), marks the request it sends so the route knows this message was
 * confirmed on its card (a typed "yes" never is), and sends the reader's
 * words as their message. The card then settles to one row.
 *
 * `record` is what was done, which the route sends as the reply's lead card:
 * the same ActionCard, confirmed. Each card's state is kept by its id outside
 * React, so a redraw or a reopened panel never offers Confirm again.
 * renderers.tsx hands both to the chat.
 */
import { useSyncExternalStore } from 'react';
import { ActionCard } from 'rift-ds/components/ActionCard/ActionCard';
import { skippedText, type ActionPlan } from 'rift-ds/chat/actions';
import { useChatWidget } from 'rift-ds/chat';
import { ACTIONS, theseItems, type ActionId } from './actions';
import { confirmation } from './confirmation';

/** Apply a confirmed plan to your page's data. Replace this with your own write. */
function applyPlan(plan: ActionPlan) {
  console.info('Apply', plan.action, 'to', plan.ids);
}

type CardStatus = 'proposed' | 'confirmed' | 'dismissed';
const statuses = new Map<string, CardStatus>();
const listeners = new Set<() => void>();
const setStatus = (id: string, status: CardStatus) => {
  statuses.set(id, status);
  listeners.forEach((listener) => listener());
};
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export type ProposalData = ActionPlan & { id: string };

export function Proposal({ id, action, ids, skipped }: ProposalData) {
  const { send, streaming } = useChatWidget();
  const status = useSyncExternalStore<CardStatus>(subscribe, () => statuses.get(id) ?? 'proposed', () => 'proposed');
  const definition = ACTIONS[action as ActionId];
  if (!definition) return null;
  const left = skippedText(skipped);
  return (
    <ActionCard
      title={`${definition.label}: ${ids.length} ${ids.length === 1 ? 'item' : 'items'}`}
      detail={[definition.effect?.(ids.length), left && `Left alone: ${left}.`].filter(Boolean).join(' ')}
      icon={definition.icon}
      tone={definition.destructive ? 'destructive' : 'default'}
      status={status}
      onConfirm={
        streaming
          ? undefined
          : () => {
              applyPlan({ action, ids, skipped });
              setStatus(id, 'confirmed');
              confirmation.mark({ action: action as ActionId, count: ids.length, ids });
              send(definition.confirm(theseItems(ids.length)));
            }
      }
      onDismiss={() => setStatus(id, 'dismissed')}
    />
  );
}

export function RecordCard({ action, count }: { action: string; count: number }) {
  const definition = ACTIONS[action as ActionId];
  if (!definition) return null;
  return (
    <ActionCard
      title={`${count} ${count === 1 ? 'item' : 'items'} ${definition.done}`}
      icon={definition.icon}
      status="confirmed"
    />
  );
}
