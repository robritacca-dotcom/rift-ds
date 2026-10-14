'use client';

import { ArtifactPanel } from '../components/ArtifactPanel/ArtifactPanel';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { useChatWidget } from './context';
import type { ChatArtifact } from './types';

/* An artifact's URL is data a model or a server wrote, so it is framed only
   when it is plainly a page: http(s), or a same-site path. Anything else
   (a script URL, a data URL) is not framed at all. */
const FRAMEABLE_URL = /^(?:https?:\/\/|\/(?!\/))/i;

export interface ChatArtifactPaneProps {
  /** The artifact on stage, or null for the empty state: the panel opened before the conversation has made anything. */
  artifact: ChatArtifact | null;
  /** Whether the widget is showing the pane at its expanded size. */
  expanded?: boolean;
  /** Fires with the next state from the expand toggle; omit where the seat has one size. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Fires from the pane's close button; omit where another control closes the seat. */
  onClose?: () => void;
}

/**
 * The built-in artifact pane: an ArtifactPanel drawn from a `ChatArtifact`.
 * A kind the provider's `artifactRenderers` knows is live React content;
 * otherwise the artifact's document, URL or source decides the preview. The
 * widget owns the seat (beside the conversation, or a sheet over it).
 */
export function ChatArtifactPane({ artifact, expanded, onExpandedChange, onClose }: ChatArtifactPaneProps) {
  const { artifactRenderers } = useChatWidget();
  if (!artifact) {
    return (
      <ArtifactPanel title="Artifacts" icon="space_dashboard" onClose={onClose}>
        <div className="ds-chat-widget__artifact-empty">
          <EmptyState
            size="compact"
            icon="draft"
            title="Nothing here yet"
            description="What the chat makes for you, like a dashboard or a page, opens in this panel."
          />
        </div>
      </ArtifactPanel>
    );
  }
  const custom = Object.hasOwn(artifactRenderers, artifact.kind);
  const render = artifactRenderers[artifact.kind];
  const src = artifact.url && FRAMEABLE_URL.test(artifact.url) ? artifact.url : undefined;
  return (
    <ArtifactPanel
      /* Keyed by artifact, so the view switch and any frame state start
         fresh when another one takes the stage. */
      key={artifact.id}
      title={artifact.title}
      meta={artifact.meta}
      icon={artifact.icon}
      html={custom ? undefined : artifact.html}
      src={custom ? undefined : src}
      code={artifact.code ?? (custom ? undefined : artifact.html)}
      language={artifact.language ?? (artifact.code === undefined && artifact.html !== undefined ? 'html' : undefined)}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      onClose={onClose}
    >
      {custom ? render(artifact) : undefined}
    </ArtifactPanel>
  );
}
