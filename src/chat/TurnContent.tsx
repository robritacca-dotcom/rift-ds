'use client';

import { useContext } from 'react';
import { cardArtifact } from './artifacts';
import { ChatArtifactCard } from './ChatArtifactCard';
import { ArtifactSeatContext, useChatWidget } from './context';
import type { ChatCard } from './types';

/**
 * A turn's `card`, drawn through the provider's renderers. A kind with no
 * renderer draws nothing: a card is an enrichment of an answer that already
 * stands in text, so an unknown kind degrades to the words alone. The one
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
