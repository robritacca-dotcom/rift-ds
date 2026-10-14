'use client';

import { ArtifactCard } from '../components/ArtifactCard/ArtifactCard';
import { useChatWidget } from './context';
import type { ChatArtifact } from './types';

export interface ChatArtifactCardProps {
  /** The artifact this tile stands for. */
  artifact: ChatArtifact;
}

/**
 * An artifact's place in the thread: an ArtifactCard wired to the provider,
 * which opens its artifact in the artifact panel. Pressing the tile of the
 * artifact already on stage closes the panel again, so the tile is one
 * control both ways. The widget draws it for every `artifact` card; a host
 * building its own thread renders it the same way.
 */
export function ChatArtifactCard({ artifact }: ChatArtifactCardProps) {
  const { artifact: onStage, openArtifact, closeArtifact } = useChatWidget();
  const open = onStage?.id === artifact.id;
  return (
    <ArtifactCard
      title={artifact.title}
      meta={artifact.meta}
      icon={artifact.icon}
      open={open}
      onClick={() => (open ? closeArtifact() : openArtifact(artifact))}
    />
  );
}
