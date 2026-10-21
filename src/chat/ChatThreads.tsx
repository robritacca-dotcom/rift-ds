'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  ThreadPanel,
  type ThreadPanelProfile,
  type ThreadPanelProps,
} from '../components/ThreadPanel/ThreadPanel';
import { useChatWidget } from './context';

export interface ChatThreadsProps {
  /** The widget seated the rail as a sheet over the conversation rather than beside it. */
  overlay: boolean;
  /** Closes the sheet; a no-op on the inline rail. */
  close: () => void;
  /** The brand row's mark, in both seats. */
  logo?: ReactNode;
  /** The brand row's text. Shown only on the sheet, where the chat header is hidden behind it; the inline rail leaves it out. */
  logoText?: string;
  /** The signed-in person, shown on the inline rail. */
  profile?: ThreadPanelProfile;
  /** Whether the inline rail can collapse to its icon strip. */
  collapsible?: boolean;
  /**
   * Whether the inline rail starts expanded. Defaults to `false`: it starts
   * collapsed to its icon strip. The sheet, and a rail that is not
   * `collapsible`, always show expanded.
   */
  defaultExpanded?: boolean;
  /** Accessible heading over the history. */
  historyLabel?: string;
  /**
   * The words the ThreadPanel writes, merged over its English defaults: the
   * spoken pin and status text ("Pinned", "Working"…), each row's menu
   * trigger ("Thread options"), the rename field ("Rename thread"), the
   * projects header and its add button ("Projects", "New project"), and the
   * collapse toggle ("Collapse the panel", "Expand the panel"). The history's
   * own name is `historyLabel`.
   */
  threadPanelLabels?: Pick<
    ThreadPanelProps,
    | 'statusLabels'
    | 'pinnedLabel'
    | 'threadMenuLabel'
    | 'renameLabel'
    | 'projectsLabel'
    | 'newProjectLabel'
    | 'collapseLabel'
    | 'expandLabel'
  >;
  /** The rows of each thread's menu, by action; a key left out keeps its English. Defaults to "Pin", "Unpin", "Rename" and "Delete". */
  actionLabels?: Partial<Record<'pin' | 'unpin' | 'rename' | 'delete', string>>;
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
  threadPanelLabels,
  actionLabels,
}: ChatThreadsProps) {
  const { threads } = useChatWidget();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasProjects = threads.projects.length > 0;

  /* The lifecycle writes each row's menu in English; the labels are
     relabelled here by action id, so the ids the menu reports stay the ones
     `runAction` reads. Pin and unpin share an id, so the thread's own pin
     state says which word it wears. */
  const groups = useMemo(() => {
    if (!actionLabels) return threads.groups;
    return threads.groups.map((group) => ({
      ...group,
      threads: group.threads.map((thread) =>
        thread.actions
          ? {
              ...thread,
              actions: thread.actions.map((action) => {
                const key = action.id === 'pin' ? (thread.pinned ? 'unpin' : 'pin') : action.id;
                const label = actionLabels[key as keyof typeof actionLabels];
                return label === undefined ? action : { ...action, label };
              }),
            }
          : thread
      ),
    }));
  }, [threads.groups, actionLabels]);

  return (
    <ThreadPanel
      {...threadPanelLabels}
      groups={groups}
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
