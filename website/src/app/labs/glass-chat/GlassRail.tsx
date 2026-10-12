"use client";

/**
 * The glass chat's threads rail: the library's ThreadPanel with every part
 * of its surface in use, as a showcase of the panel under glass. Brand row
 * and collapse, the new-chat row with its shortcut, standing controls,
 * projects, a grouped history with detail-rich rows (descriptions, meta,
 * unread dots, trailing icons, pins, a pending title), the row menu with
 * pin, rename and delete, the show-more row, the footer slot and the
 * profile.
 *
 * Only two things here touch the real chat: New chat resets it, and the
 * leading row is the live conversation, titled by its first question. The
 * site chat keeps one conversation and stores no history, so every other
 * row is set dressing held in local state: pinning, renaming, deleting and
 * project picking all work, and none of it loads a different transcript.
 */

import React from "react";
import Image from "next/image";
import {
  ThreadPanel,
  type ThreadPanelGroup,
  type ThreadPanelProject,
  type ThreadPanelThread,
} from "rift-ds/components/ThreadPanel/ThreadPanel";
import { useSiteChat } from "@/components/SiteChat/ChatContext";
import SidebarSwitchers from "@/components/templates/SidebarSwitchers/SidebarSwitchers";
import { ASSISTANT_NAME } from "@/config/brand.generated";

/* ---------------------------------------------------------------- data */

const LIVE_ID = "live";

type RailThread = ThreadPanelThread & { day: string };

const HISTORY: RailThread[] = [
  {
    id: "tokens",
    day: "Today",
    title: "How the three token tiers chain",
    description: "Primitives, semantic tokens, component CSS",
    meta: "2h",
    pinned: true,
  },
  {
    id: "presets",
    day: "Today",
    title: "Adding a theme preset",
    description: "Every lever, then the contrast gate",
    meta: "4h",
    unread: true,
  },
  {
    id: "composer",
    day: "Today",
    title: "Composer radius and the send button",
    meta: "6h",
    icon: "cloud",
  },
  {
    id: "mcp",
    day: "Yesterday",
    title: "Connecting an agent over MCP",
    description: "The endpoint, its tools, a first call",
    meta: "1d",
    icon: "cloud",
    unread: true,
  },
  {
    id: "overlay",
    day: "Yesterday",
    title: "Which overlays share the dismissal stack",
    meta: "1d",
  },
  {
    id: "charts",
    day: "Yesterday",
    title: "Why charts are a separate import",
    description: "An optional peer, kept out of the main barrel",
    meta: "1d",
    pinned: true,
  },
];

/* Behind the show-more row until it is pressed. */
const OLDER: RailThread[] = [
  {
    id: "registry",
    day: "Last week",
    title: "Installing one component with shadcn",
    meta: "5d",
  },
  {
    id: "motion",
    day: "Last week",
    title: "Where JavaScript timings live",
    description: "The motion constants, not literals",
    meta: "6d",
  },
  {
    id: "a11y",
    day: "Last week",
    title: "What the axe pass does not catch",
    meta: "1w",
    icon: "cloud",
  },
];

const CONTROLS = [
  { id: "library", icon: "widgets", label: "Components", href: "/components" },
  { id: "themes", icon: "palette", label: "Themes", href: "/foundations/themes" },
  { id: "docs", icon: "menu_book", label: "Docs", href: "/docs" },
];

const PROJECTS: ThreadPanelProject[] = [
  { id: "system", label: "Design system", icon: "deployed_code", meta: "Now" },
  { id: "site", label: "Docs site", icon: "language", meta: "2d" },
  { id: "evals", label: "Chat evals", icon: "science", meta: "1w" },
];

const DAYS = ["Today", "Yesterday", "Last week"];

/* ---------------------------------------------------------------- rail */

export default function GlassRail({
  overlay,
  close,
  className,
}: {
  /** The chat is narrow and showing the rail as a slide-over sheet. */
  overlay: boolean;
  /** Closes the sheet; a no-op while the rail is seated inline. */
  close: () => void;
  className?: string;
}) {
  const { turns, live, reset } = useSiteChat();

  const [expanded, setExpanded] = React.useState(true);
  const [threads, setThreads] = React.useState<RailThread[]>(HISTORY);
  const [showOlder, setShowOlder] = React.useState(false);
  const [activeThread, setActiveThread] = React.useState(LIVE_ID);
  const [renaming, setRenaming] = React.useState<string | undefined>();
  const [projects, setProjects] = React.useState(PROJECTS);
  const [activeProject, setActiveProject] = React.useState("system");

  /* The live conversation's row: titled by its first question once there
     is one, a shimmer while the first answer is on its way. It has no
     menu, because the conversation it stands for is not this rail's to
     rename or delete. */
  const firstQuestion = turns.find((turn) => turn.role === "user")?.text;
  const liveThread: ThreadPanelThread = {
    id: LIVE_ID,
    title: firstQuestion ?? "New chat",
    pending: !firstQuestion && Boolean(live),
    meta: "Now",
    actions: [],
  };

  const visible = showOlder ? [...threads, ...OLDER] : threads;
  const withMenus = visible.map(({ day, ...thread }) => ({
    day,
    thread: {
      ...thread,
      actions: [
        { id: "pin", label: thread.pinned ? "Unpin" : "Pin", icon: "keep" },
        { id: "rename", label: "Rename", icon: "edit" },
        { id: "delete", label: "Delete", icon: "delete", destructive: true },
      ],
    },
  }));

  /* Pinned threads lead in a group of their own; the rest fall under the
     day they were last touched, with the live conversation heading today. */
  const pinned = withMenus.filter(({ thread }) => thread.pinned);
  const groups: ThreadPanelGroup[] = [
    ...(pinned.length
      ? [{ label: "Pinned", threads: pinned.map(({ thread }) => thread) }]
      : []),
    ...DAYS.map((day) => ({
      label: day,
      threads: [
        ...(day === "Today" ? [liveThread] : []),
        ...withMenus
          .filter((row) => row.day === day && !row.thread.pinned)
          .map(({ thread }) => thread),
      ],
    })).filter((group) => group.threads.length > 0),
  ];

  /* The older rows start as constants, so pressing show-more moves them
     into the editable list, where the row menu can reach them. */
  const edit = (id: string, change: (thread: RailThread) => RailThread | null) =>
    setThreads((current) =>
      current.flatMap((thread) => {
        if (thread.id !== id) return [thread];
        const next = change(thread);
        return next ? [next] : [];
      })
    );

  return (
    <ThreadPanel
      className={className}
      /* Brand row. The sheet names the assistant; the inline rail leaves
         that to the chat header beside it and offers the collapse. */
      logo={<Image src="/logos/mark.svg" alt="" width={24} height={24} />}
      logoText={overlay ? ASSISTANT_NAME : undefined}
      expanded={overlay ? true : expanded}
      onExpandedChange={overlay ? undefined : setExpanded}
      collapseLabel="Collapse the sidebar"
      expandLabel="Expand the sidebar"
      /* New chat: the one row wired to the real conversation. */
      newThreadLabel="New chat"
      newThreadIcon="edit_square"
      newThreadShortcut={["Ctrl", "N"]}
      onNewThread={() => {
        reset();
        setActiveThread(LIVE_ID);
        close();
      }}
      /* Standing controls: real links into the site. */
      controls={CONTROLS}
      onControlSelect={close}
      /* Projects. */
      projects={projects}
      projectsLabel="Projects"
      activeProjectId={activeProject}
      onProjectSelect={(id) => {
        setActiveProject(id);
        close();
      }}
      onProjectCreate={() => {
        const id = `project-${projects.length}`;
        setProjects((current) => [
          ...current,
          { id, label: "Untitled project", meta: "Now" },
        ]);
        setActiveProject(id);
      }}
      newProjectLabel="New project"
      /* History. */
      groups={groups}
      historyLabel="Chat history"
      activeThreadId={activeThread}
      onThreadSelect={(id) => {
        setActiveThread(id);
        edit(id, (thread) => ({ ...thread, unread: false }));
        close();
      }}
      threadMenuLabel="Options for"
      onThreadAction={(threadId, actionId) => {
        if (actionId === "rename") setRenaming(threadId);
        else if (actionId === "pin") {
          edit(threadId, (thread) => ({ ...thread, pinned: !thread.pinned }));
        } else if (actionId === "delete") {
          edit(threadId, () => null);
          if (activeThread === threadId) setActiveThread(LIVE_ID);
        }
      }}
      renamingThreadId={renaming}
      renameLabel="Rename the chat"
      onThreadRename={(threadId, title) => {
        edit(threadId, (thread) => ({ ...thread, title }));
        setRenaming(undefined);
      }}
      onRenameCancel={() => setRenaming(undefined)}
      moreLabel={showOlder ? undefined : `Show ${OLDER.length} more`}
      onShowMore={() => {
        setThreads((current) => [...current, ...OLDER]);
        setShowOlder(true);
      }}
      /* Footer. Visitors are anonymous, so the profile says so. */
      footerSlot={<SidebarSwitchers />}
      profile={{ name: "Guest", meta: "Visitor" }}
    />
  );
}
