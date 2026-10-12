'use client';

import { useState, type ReactNode } from 'react';
import { ThreadPanel, type ThreadPanelProfile } from '../components/ThreadPanel/ThreadPanel';
import { useChatWidget } from './context';

export interface ChatThreadsProps {
  /** The widget seated the rail as a sheet over the conversation rather than beside it. */
  overlay: boolean;
  /** Closes the sheet; a no-op on the inline rail. */
  close: () => void;
  /** The brand row's mark, in both seats. */
  logo?: ReactNode;
  /** The brand row's text. Shown on the sheet by default, where the chat header is hidden behind it. */
  logoText?: string;
  /** The signed-in person, shown on the inline rail. */
  profile?: ThreadPanelProfile;
  /** Whether the inline rail can collapse to its icon strip. */
  collapsible?: boolean;
  /** Whether the rail starts collapsed. */
  defaultExpanded?: boolean;
  /** Accessible heading over the history. */
  historyLabel?: string;
}

/**
 * The built-in session-history rail: a ThreadPanel over the provider's
 * thread lifecycle (`useThreads`). The widget seats it inline on a wide
 * host and as a slide-over sheet on a narrow one, and tells it which.
 */
export function ChatThreads({
  overlay,
  close,
  logo,
  logoText,
  profile,
  collapsible = true,
  defaultExpanded = false,
  historyLabel = 'Chat history',
}: ChatThreadsProps) {
  const { threads } = useChatWidget();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasProjects = threads.projects.length > 0;

  return (
    <ThreadPanel
      groups={threads.groups}
      activeThreadId={threads.activeThreadId}
      onThreadSelect={(id) => {
        threads.select(id);
        close();
      }}
      onThreadAction={threads.runAction}
      renamingThreadId={threads.renamingId ?? undefined}
      onThreadRename={threads.rename}
      onRenameCancel={() => threads.setRenamingId(null)}
      newThreadLabel={threads.newThreadLabel}
      onNewThread={() => {
        threads.startNew();
        close();
      }}
      historyLabel={historyLabel}
      projects={hasProjects ? threads.projects : undefined}
      activeProjectId={threads.activeProjectId}
      onProjectSelect={(id) => {
        threads.selectProject(id);
        close();
      }}
      onProjectCreate={hasProjects ? threads.createProject : undefined}
      logo={logo}
      logoText={overlay ? logoText : undefined}
      expanded={overlay || !collapsible ? true : expanded}
      onExpandedChange={overlay || !collapsible ? undefined : setExpanded}
      profile={overlay ? undefined : profile}
    />
  );
}
