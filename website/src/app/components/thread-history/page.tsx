"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { ThreadHistory } from "rift-ds/components/ThreadHistory/ThreadHistory";
import type { ThreadPanelGroup } from "rift-ds/components/ThreadPanel/ThreadPanel";
import { AppSidebar } from "rift-ds/components/AppSidebar/AppSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

/* Demo data: atlas-* are fictional repos. */

const GROUPS: ThreadPanelGroup[] = [
  {
    label: "atlas-app",
    threads: [
      { id: "onboarding", title: "Rework the onboarding flow", meta: "2h" },
      { id: "search", title: "Speed up the search index", meta: "1d" },
      { id: "billing", title: "Untangle the billing webhooks", meta: "3d" },
    ],
  },
  {
    label: "atlas-docs",
    threads: [
      { id: "quickstart", title: "Rewrite the quickstart guide", meta: "4d" },
      { id: "broken-links", title: "Fix the broken changelog links", meta: "1w" },
    ],
  },
];

const DETAILED: ThreadPanelGroup[] = [
  {
    label: "Pinned",
    threads: [
      { id: "plan", title: "Plan the launch week", description: "Waiting on the beta invite list", status: "waiting", pinned: true, meta: "32m" },
    ],
  },
  {
    label: "This week",
    threads: [
      { id: "invoices", title: "Import last year’s invoices", description: "212 of 340 matched", status: "working", icon: "cloud", meta: "2m" },
      { id: "roles", title: "Set up roles for the team", status: "unread", meta: "5d" },
      { id: "notify", title: "Quiet the mention notifications", status: "error", meta: "1w" },
    ],
  },
];

const ACTIONS = [
  { id: "rename", label: "Rename", icon: "edit" },
  { id: "delete", label: "Delete", icon: "delete", destructive: true },
];

function GroupsDemo() {
  const [active, setActive] = React.useState("search");
  const [collapsed, setCollapsed] = React.useState<string[]>([]);
  return (
    <div className={styles.historyFrame}>
      <ThreadHistory
        groups={GROUPS}
        activeThreadId={active}
        onThreadSelect={setActive}
        collapsibleSections
        collapsedSections={collapsed}
        onCollapsedSectionsChange={setCollapsed}
        moreLabel="Show 12 more"
      />
    </div>
  );
}

function LifecycleDemo() {
  const [groups, setGroups] = React.useState(GROUPS);
  const [renaming, setRenaming] = React.useState<string | undefined>();
  return (
    <div className={styles.historyFrame}>
      <ThreadHistory
        groups={groups}
        threadActions={ACTIONS}
        onThreadAction={(id, action) => {
          if (action === "rename") setRenaming(id);
          if (action === "delete") {
            setGroups((all) => all.map((group) => ({ ...group, threads: group.threads.filter((thread) => thread.id !== id) })));
          }
        }}
        renamingThreadId={renaming}
        onThreadRename={(id, title) => {
          setGroups((all) =>
            all.map((group) => ({
              ...group,
              threads: group.threads.map((thread) => (thread.id === id ? { ...thread, title } : thread)),
            })),
          );
          setRenaming(undefined);
        }}
        onRenameCancel={() => setRenaming(undefined)}
      />
    </div>
  );
}

function SidebarDemo() {
  const [active, setActive] = React.useState("search");
  return (
    <div className={styles.sidebarFrame}>
      <AppSidebar
        fixed={false}
        defaultExpanded
        logoText="Skylark"
        sections={[
          { items: [{ key: "new", icon: "edit_square", label: "New chat", keys: "mod+shift+o" }] },
          {
            category: "Projects",
            action: { label: "New project", icon: "add", onClick: () => {} },
            items: [
              { key: "atlas-app", label: "Atlas app", pixelAvatar: "atlas-app" },
              { key: "atlas-docs", label: "Atlas docs", pixelAvatar: "atlas-docs" },
            ],
          },
          {
            items: [],
            content: <ThreadHistory groups={GROUPS} activeThreadId={active} onThreadSelect={setActive} />,
          },
        ]}
        profile={{ name: "Robin Vale", email: "Team" }}
      />
    </div>
  );
}

export default function ThreadHistoryPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Thread history</h1>
        <PageLinks storybookPath="/?path=/docs/components-threadhistory--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>A chat&apos;s threads, in any rail</p>
        <p className={styles.introBody}>
          Thread history is the list of a chat&apos;s threads: labelled groups of rows, each a title with
          its status, meta and menu. Thread panel seats it in its own rail, and an App sidebar section seats
          it through its content, so a chat built on the app rail draws exactly the same rows. It is fully
          controlled and renders on the server when its rows are links.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="Groups and rows" />
        <p className={styles.demoText}>
          Each group takes a label, and a row press reports its thread. With collapsibleSections a group
          folds under its heading, and moreLabel adds a quiet row that reveals older threads.
        </p>
        <GroupsDemo />
      </section>

      <section className={styles.section}>
        <SectionTitle title="Detail rows" />
        <p className={styles.demoText}>
          A row scales from a bare title to the full anatomy: a status dot leading the title, a description
          line, a trailing glyph, the pin mark and the meta caption. Once one thread carries a status every
          row draws a dot, so the titles share an edge, and each state but idle is read aloud after the title.
        </p>
        <div className={styles.historyFrame}>
          <ThreadHistory groups={DETAILED} />
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Menus and rename" />
        <p className={styles.demoText}>
          threadActions hangs an overflow menu on every row, shown on hover or focus and always on a touch
          screen. renamingThreadId swaps a row to an inline field, where Enter commits and Escape cancels.
          Try renaming or deleting a thread from its menu.
        </p>
        <LifecycleDemo />
      </section>

      <section className={styles.section}>
        <SectionTitle title="In an app sidebar" />
        <p className={styles.demoText}>
          A section&apos;s content seats the history inside App sidebar, after New chat and the projects,
          so the rail keeps the app shell&apos;s sizes, side panel and phone drawer. Collapsed, the rail has
          no room for the history and folds it away.
        </p>
        <SidebarDemo />
      </section>

      <ComponentInstallStrip slug="thread-history" />
    </div>
  );
}
