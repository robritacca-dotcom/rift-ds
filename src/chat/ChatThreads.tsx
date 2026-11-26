'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  AppSidebar,
  type AppSidebarSection,
} from '../components/AppSidebar/AppSidebar';
import type { DrillMenuEntry } from '../components/DrillMenu/DrillMenu';
import { PixelAvatar } from '../components/PixelAvatar/PixelAvatar';
import { ThreadHistory } from '../components/ThreadHistory/ThreadHistory';
import type { ThreadPanelProfile, ThreadPanelProps } from '../components/ThreadPanel/ThreadPanel';
import { useChatWidget } from './context';
import { useRailSeat } from './rail-seat';

export interface ChatThreadsProps {
  /** The widget seated the rail as a sheet over the conversation rather than beside it. A rail outside the widget's own seat (a custom `threads` slot) draws itself expanded there. */
  overlay: boolean;
  /** Closes the sheet; a no-op on the inline rail. */
  close: () => void;
  /** The brand row's mark. Defaults to a generated pixel avatar seeded by `logoText`. */
  logo?: ReactNode;
  /** The brand row's text, beside the mark while the rail is expanded. */
  logoText?: string;
  /** The signed-in person, shown at the rail's foot. */
  profile?: ThreadPanelProfile;
  /** Rendered in the rail's footer above the profile row: a theme toggle, a link out. Fades out while the rail is collapsed. */
  footerSlot?: ReactNode;
  /** Let the reader fold the projects, each labelled history group and the host's `sections` under their headings. Every section starts open. */
  collapsibleSections?: boolean;
  /** Sections folded at first, by heading text, when `collapsibleSections` is on. */
  defaultCollapsedSections?: string[];
  /** Rendered below the profile row, such as a full-width Button back to an index. It fades out while the rail is collapsed. */
  footerAction?: ReactNode;
  /** Rendered in the rail's footer while it is collapsed, in `footerSlot`'s place: the same controls at their smallest, stacked on the rail's axis, crossfading with the full form. */
  collapsedFooterSlot?: ReactNode;
  /**
   * The host's own sections after the history, in AppSidebar's shape: a
   * section of setting rows (Appearance) whose choices open in the side
   * panel beside the rail and drill in on the drawer, as the app rail's do.
   */
  sections?: AppSidebarSection[];
  /** Rows above the sections in the drawer, in DrillMenu's shape, such as a workspace switcher that drills into its choices. */
  drawerTopEntries?: DrillMenuEntry[];
  /** Rows after the sections in the drawer, in DrillMenu's shape. */
  drawerBottomEntries?: DrillMenuEntry[];
  /** Whether the rail can collapse to its icon strip. */
  collapsible?: boolean;
  /**
   * Whether the rail starts expanded. Defaults to `false`: it starts
   * collapsed to its icon strip. The drawer, and a rail that is not
   * `collapsible`, always show expanded.
   */
  defaultExpanded?: boolean;
  /** Accessible name of the history inside the rail. */
  historyLabel?: string;
  /** Accessible name of the rail's navigation landmark. */
  railLabel?: string;
  /**
   * The words the rail writes, merged over their English defaults: the
   * spoken pin and status text ("Pinned", "Working"…), each row's menu
   * trigger ("Thread options"), the rename field ("Rename thread"), the
   * projects heading and its add button ("Projects", "New project"), and the
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
 * The built-in session-history rail: an AppSidebar over the provider's
 * thread lifecycle (`useThreads`), so a chat's rail has the app rail's
 * shell, sizes, side panel and drawer, and only its content is its own.
 * New chat leads, the projects follow as a section with an add action, the
 * history is a section's content (ThreadHistory, the rows ThreadPanel
 * draws), and the host's `sections` come after. The widget seats it and
 * says which form its room allows: the rail beside the conversation, or
 * the drawer over the widget, opened from the header's menu button.
 */
export function ChatThreads({
  overlay,
  close,
  logo,
  logoText,
  profile,
  footerSlot,
  footerAction,
  collapsibleSections = false,
  defaultCollapsedSections,
  collapsedFooterSlot,
  sections: hostSections,
  drawerTopEntries,
  drawerBottomEntries,
  collapsible = true,
  defaultExpanded = false,
  historyLabel = 'Chat history',
  railLabel = 'Chats',
  threadPanelLabels,
  actionLabels,
}: ChatThreadsProps) {
  const { threads } = useChatWidget();
  const seat = useRailSeat();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [collapsedSections, setCollapsedSections] = useState<string[]>(() => defaultCollapsedSections ?? []);
  const hasProjects = threads.projects.length > 0;
  const projectsLabel = threadPanelLabels?.projectsLabel ?? 'Projects';

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

  /* A rail outside the widget's seat in a sheet of its own (a custom slot)
     has nowhere to collapse to. */
  const fixedOpen = !seat && overlay;

  const sections: AppSidebarSection[] = [
    {
      items: [
        {
          key: 'new-chat',
          icon: 'edit_square',
          label: threads.newThreadLabel,
          onClick: () => {
            threads.startNew();
            close();
          },
        },
      ],
    },
    ...(hasProjects
      ? [
          {
            category: projectsLabel,
            action: {
              label: threadPanelLabels?.newProjectLabel ?? 'New project',
              icon: 'add',
              onClick: threads.createProject,
            },
            items: threads.projects.map((project) => ({
              key: `project-${project.id}`,
              label: project.label,
              ...(project.icon ? { icon: project.icon } : { pixelAvatar: project.pixelAvatar ?? project.id }),
              value: project.meta,
              href: project.href,
              onClick: () => {
                threads.selectProject(project.id);
                close();
              },
            })),
          },
        ]
      : []),
    {
      items: [],
      content: ({ closeDrawer }) => (
        <ThreadHistory
          aria-label={historyLabel}
          statusLabels={threadPanelLabels?.statusLabels}
          pinnedLabel={threadPanelLabels?.pinnedLabel}
          threadMenuLabel={threadPanelLabels?.threadMenuLabel}
          renameLabel={threadPanelLabels?.renameLabel}
          groups={groups}
          activeThreadId={threads.activeThreadId}
          onThreadSelect={(id) => {
            threads.select(id);
            closeDrawer();
            close();
          }}
          onThreadAction={threads.runAction}
          renamingThreadId={threads.renamingId ?? undefined}
          onThreadRename={threads.rename}
          onRenameCancel={() => threads.setRenamingId(null)}
          collapsibleSections={collapsibleSections}
          collapsedSections={collapsedSections}
          onCollapsedSectionsChange={setCollapsedSections}
        />
      ),
    },
    ...(hostSections ?? []),
  ];

  return (
    <AppSidebar
      aria-label={railLabel}
      id={seat?.id}
      className="ds-chat-widget__history"
      fixed={false}
      responsive={seat?.form ?? 'rail'}
      layout={seat?.layout}
      showMobileTrigger={false}
      drawerOpen={seat?.drawerOpen ?? false}
      onDrawerOpenChange={seat?.setDrawerOpen}
      subNav="panel"
      defaultPanelOpen={false}
      foldForPanel
      collapsible={collapsible && !fixedOpen}
      expanded={expanded}
      onExpandedChange={setExpanded}
      logo={logo ?? <PixelAvatar name={logoText ?? railLabel} />}
      logoText={logoText ?? ''}
      sections={sections}
      activeKey={threads.activeProjectId ? `project-${threads.activeProjectId}` : undefined}
      collapsibleSections={collapsibleSections}
      collapsedSections={collapsedSections}
      onCollapsedSectionsChange={setCollapsedSections}
      collapseLabel={threadPanelLabels?.collapseLabel ?? 'Collapse the panel'}
      expandLabel={threadPanelLabels?.expandLabel ?? 'Expand the panel'}
      profile={profile ? { name: profile.name, email: profile.meta, avatar: profile.avatar } : undefined}
      footerSlot={footerSlot}
      collapsedFooterSlot={collapsedFooterSlot}
      footerAction={footerAction}
      drawerTopEntries={drawerTopEntries}
      drawerBottomEntries={drawerBottomEntries}
    />
  );
}
