'use client';

import type { ChatCard } from './types';
import { useChatWidget } from './context';

/**
 * A turn's `card`, drawn through the provider's renderers. A kind with no
 * renderer draws nothing: a card is an enrichment of an answer that already
 * stands in text, so an unknown kind degrades to the words alone.
 */
export function TurnCard({ card }: { card: ChatCard }) {
  const { renderers } = useChatWidget();
  const render = renderers[card.kind];
  if (!render) return null;
  return <>{render(card.data)}</>;
}
