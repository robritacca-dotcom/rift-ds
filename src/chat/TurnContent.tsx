'use client';

import { useContext } from 'react';
import { cardArtifact } from './artifacts';
import { ChatArtifactCard } from './ChatArtifactCard';
import { ArtifactSeatContext, useChatWidget } from './context';
import type { ChatCard } from './types';

/**
 * One of a turn's cards, drawn through the provider's renderers. A kind with
 * no renderer draws nothing, so an unknown kind degrades to the words alone,
 * or to nothing on a reply that is only a card. The one
 * built-in kind is the artifact, drawn as its tile unless the host has
 * taken the kind over with a renderer of its own.
 */
export function TurnCard({ card }: { card: ChatCard }) {
  const { renderers } = useChatWidget();
  const artifactSeat = useContext(ArtifactSeatContext);
  const render = renderers[card.kind];
  if (!render) {
    /* No seat, no tile: a widget with `artifacts` off has no panel for the
       tile to open, and the answer already stands in its text. */
    const artifact = artifactSeat ? cardArtifact(card) : null;
    return artifact ? <ChatArtifactCard artifact={artifact} /> : null;
  }
  return <>{render(card.data)}</>;
}
