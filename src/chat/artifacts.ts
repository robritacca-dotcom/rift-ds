import { ARTIFACT_CARD_KIND, type ChatArtifact, type ChatCard } from './types';

/* A card's data crossed a network, so it is checked before it is trusted
   with the panel: an artifact needs an id, a name and a kind to be one. */
const isArtifact = (data: unknown): data is ChatArtifact => {
  const candidate = data as Partial<ChatArtifact> | null;
  return (
    typeof candidate === 'object' &&
    candidate !== null &&
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.kind === 'string'
  );
};

/** The artifact a card carries, or null when it is some other kind of card. */
export const cardArtifact = (card: ChatCard | undefined): ChatArtifact | null =>
  card?.kind === ARTIFACT_CARD_KIND && isArtifact(card.data) ? card.data : null;

/** The cards a turn draws: all it carried, or the one set by hand. */
export const turnCards = (turn: { card?: ChatCard; cards?: ChatCard[] }): ChatCard[] =>
  turn.cards ?? (turn.card ? [turn.card] : []);

/** Wraps an artifact as the card a transport sends. */
export const artifactCard = (artifact: ChatArtifact): ChatCard => ({
  kind: ARTIFACT_CARD_KIND,
  data: artifact,
});
