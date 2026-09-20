"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import {
  ThreadPanel,
  type ThreadPanelThread,
} from "@robr0/design-system/components/ThreadPanel/ThreadPanel";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

/* Demo data: Skylark is a fictional product, atlas-* fictional repos. */

const GROUPS = [
  {
    label: "atlas-app",
    threads: [
      { id: "onboarding", title: "Rework the onboarding flow" },
      { id: "search", title: "Speed up the search index" },
      { id: "billing", title: "Untangle the billing webhooks" },
      { id: "flags", title: "Retire the stale feature flags" },
    ],
  },
  {
    label: "atlas-docs",
    threads: [
      { id: "quickstart", title: "Rewrite the quickstart guide" },
      { id: "api-ref", title: "Generate the API reference" },
      { id: "broken-links", title: "Fix the broken changelog links" },
    ],
  },
];

const CONTROLS = [
  { id: "projects", icon: "folder", label: "Projects" },
  { id: "automations", icon: "schedule", label: "Automations" },
  { id: "settings", icon: "settings", label: "Settings" },
];

function FullAnatomy() {
  const [active, setActive] = React.useState("search");
  return (
    <div className={styles.railFrame}>
      <ThreadPanel
        logoText="Skylark"
        groups={GROUPS}
        activeThreadId={active}
        onThreadSelect={setActive}
        newThreadLabel="New thread"
        newThreadShortcut={["Ctrl", "N"]}
        controls={CONTROLS}
        moreLabel="Show 12 more"
        profile={{ name: "Robin Vale", meta: "Team" }}
      />
    </div>
  );
}

function CollapseDemo() {
  const [expanded, setExpanded] = React.useState(true);
  return (
    <div className={styles.railFrame}>
      <ThreadPanel
        logo={
          <span
            className="material-symbols-rounded"
            style={{ "--icon-size": "var(--icon-size-md)" } as React.CSSProperties}
          >
            flare
          </span>
        }
        logoText="Skylark"
        groups={GROUPS}
        activeThreadId="search"
        expanded={expanded}
        onExpandedChange={setExpanded}
        newThreadLabel="New thread"
        newThreadShortcut={["Ctrl", "N"]}
        controls={CONTROLS}
        profile={{ name: "Robin Vale", meta: "Team" }}
      />
    </div>
  );
}

/* The lifecycle demo simulates a title-generation call: a new thread
   shimmers as "New chat" until its name arrives a beat later. State lives
   here and dies with the page. */
const LIFECYCLE_NAMES = [
  "Plan the beta invite list",
  "Summarize the weekly standup",
  "Draft the pricing FAQ",
  "Tidy up the workspace roles",
];
const NAMING_DELAY_MS = 1600;

function LifecycleDemo() {
  const seq = React.useRef(0);
  const cursor = React.useRef(0);
  const timers = React.useRef(new Map<string, number>());
  const [threads, setThreads] = React.useState<ThreadPanelThread[]>([
    { id: "onboarding", title: "Rework the onboarding flow" },
    { id: "search", title: "Speed up the search index" },
    { id: "billing", title: "Untangle the billing webhooks" },
  ]);
  const [active, setActive] = React.useState("onboarding");
  const [renaming, setRenaming] = React.useState<string | null>(null);

  React.useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const createThread = () => {
    seq.current += 1;
    const id = `new-${seq.current}`;
    setThreads((list) => [{ id, title: "New chat", pending: true }, ...list]);
    setActive(id);
    const timer = window.setTimeout(() => {
      timers.current.delete(id);
      const title = LIFECYCLE_NAMES[cursor.current % LIFECYCLE_NAMES.length];
      cursor.current += 1;
      setThreads((list) =>
        list.map((thread) => (thread.id === id ? { id, title } : thread))
      );
    }, NAMING_DELAY_MS);
    timers.current.set(id, timer);
  };

  const deleteThread = (id: string) => {
    const timer = timers.current.get(id);
    if (timer != null) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    const next = threads.filter((thread) => thread.id !== id);
    setThreads(next);
    if (renaming === id) setRenaming(null);
    if (active === id) setActive(next[0] ? next[0].id : "");
  };

  return (
    <div className={`${styles.railFrame} ${styles.railFrameShort}`}>
      <ThreadPanel
        groups={[{ label: "atlas-app", threads }]}
        activeThreadId={active}
        onThreadSelect={setActive}
        newThreadLabel="New chat"
        onNewThread={createThread}
        threadActions={[
          { id: "rename", label: "Rename", icon: "edit" },
          { id: "delete", label: "Delete", icon: "delete", destructive: true },
        ]}
        onThreadAction={(threadId, actionId) => {
          if (actionId === "rename") setRenaming(threadId);
          else if (actionId === "delete") deleteThread(threadId);
        }}
        renamingThreadId={renaming ?? undefined}
        onThreadRename={(threadId, title) => {
          setThreads((list) =>
            list.map((thread) =>
              thread.id === threadId ? { ...thread, title } : thread
            )
          );
          setRenaming(null);
        }}
        onRenameCancel={() => setRenaming(null)}
      />
    </div>
  );
}

function DetailsDemo() {
  const [active, setActive] = React.useState("search");
  return (
    <div className={`${styles.railFrame} ${styles.railFrameShort}`}>
      <ThreadPanel
        groups={[
          {
            label: "Today",
            threads: [
              {
                id: "onboarding",
                title: "Rework the onboarding flow",
                description: "atlas-app · main",
                unread: true,
                icon: "cloud",
                meta: "32m",
              },
              {
                id: "search",
                title: "Speed up the search index",
                description: "atlas-app · perf/search-index",
                icon: "cloud",
                meta: "1h",
              },
              {
                id: "billing",
                title: "Untangle the billing webhooks",
                description: "atlas-app · fix/webhook-retries",
                unread: true,
                meta: "3h",
              },
            ],
          },
        ]}
        activeThreadId={active}
        onThreadSelect={setActive}
      />
    </div>
  );
}

/* The pin demo owns the grouping: pinning moves a thread into the leading
   Pinned group, unpinning returns it home — the panel only marks the rows. */
type PinnedThread = ThreadPanelThread & { home: string };

const PIN_SEED: PinnedThread[] = [
  { id: "billing", title: "Untangle the billing webhooks", home: "atlas-app", pinned: true },
  { id: "onboarding", title: "Rework the onboarding flow", home: "atlas-app" },
  { id: "search", title: "Speed up the search index", home: "atlas-app" },
  { id: "quickstart", title: "Rewrite the quickstart guide", home: "atlas-docs", pinned: true },
  { id: "api-ref", title: "Generate the API reference", home: "atlas-docs" },
];

function PinnedDemo() {
  const [threads, setThreads] = React.useState<PinnedThread[]>(PIN_SEED);
  const [active, setActive] = React.useState("billing");
  const groups = React.useMemo(() => {
    const pinned = threads.filter((thread) => thread.pinned);
    const homes = ["atlas-app", "atlas-docs"].map((home) => ({
      label: home,
      threads: threads.filter((thread) => !thread.pinned && thread.home === home),
    }));
    return [{ label: "Pinned", threads: pinned }, ...homes];
  }, [threads]);
  return (
    <div className={styles.railFrame}>
      <ThreadPanel
        groups={groups}
        activeThreadId={active}
        onThreadSelect={setActive}
        threadActions={[
          { id: "pin", label: "Pin", icon: "keep" },
          { id: "delete", label: "Delete", icon: "delete", destructive: true },
        ]}
        onThreadAction={(threadId, actionId) => {
          if (actionId === "pin") {
            setThreads((list) =>
              list.map((thread) =>
                thread.id === threadId
                  ? { ...thread, pinned: !thread.pinned }
                  : thread
              )
            );
          } else if (actionId === "delete") {
            setThreads((list) => list.filter((thread) => thread.id !== threadId));
          }
        }}
      />
    </div>
  );
}

function ProjectsDemo() {
  const seq = React.useRef(0);
  const [projects, setProjects] = React.useState([
    { id: "atlas-app", label: "Atlas app", meta: "1m" },
    { id: "atlas-docs", label: "Atlas docs", meta: "2d" },
  ]);
  const [activeProject, setActiveProject] = React.useState("atlas-app");
  const [active, setActive] = React.useState("search");
  return (
    <div className={styles.railFrame}>
      <ThreadPanel
        logoText="Skylark"
        groups={GROUPS}
        activeThreadId={active}
        onThreadSelect={setActive}
        newThreadLabel="New thread"
        projects={projects}
        activeProjectId={activeProject}
        onProjectSelect={setActiveProject}
        onProjectCreate={() => {
          seq.current += 1;
          const id = `project-${seq.current}`;
          setProjects((list) => [
            ...list,
            { id, label: `New project ${seq.current}`, meta: "now" },
          ]);
          setActiveProject(id);
        }}
        profile={{ name: "Robin Vale", meta: "Team" }}
      />
    </div>
  );
}

function MetaDemo() {
  const [active, setActive] = React.useState("onboarding");
  return (
    <div className={`${styles.railFrame} ${styles.railFrameShort}`}>
      <ThreadPanel
        groups={[
          {
            label: "atlas-app",
            threads: [
              { id: "onboarding", title: "Rework the onboarding flow", meta: "now" },
              { id: "search", title: "Speed up the search index", meta: "2h" },
              { id: "billing", title: "Untangle the billing webhooks", meta: "1d" },
              { id: "flags", title: "Retire the stale feature flags", meta: "3d" },
            ],
          },
        ]}
        activeThreadId={active}
        onThreadSelect={setActive}
      />
    </div>
  );
}

export default function ThreadPanelPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Thread panel</h1>
            <PageLinks storybookPath="/?path=/docs/components-threadpanel--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The session history, one rail
            </p>
            <p className={styles.introBody}>
              Thread panel is the left edge of a chat or agent product: the
              brand, a new-thread action with its shortcut hint, standing
              controls, the grouped history, and the profile footer. It is
              fully controlled and surface-less, so the host owns the active
              thread, the navigation, and the band colour it sits on. It
              began as the agent workbench template&apos;s threads panel and
              graduated into the library once the shape proved out.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="The full anatomy" />
            <p className={styles.demoText}>
              Every section is optional and renders only when its props do.
              Here the panel carries all of them; clicking a thread moves the
              controlled selection, and the history is the one region that
              scrolls.
            </p>
            <FullAnatomy />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Collapse to a rail" />
            <p className={styles.demoText}>
              With onExpandedChange wired, the header grows a toggle and the
              panel folds to App sidebar&apos;s 64px icon rail: the panel
              animates its own width, labels fade under the sweeping clip,
              rows become circular icon buttons, and the history steps out
              of the way. Collapsed, the logo is the expand button. Try it.
            </p>
            <CollapseDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Threads alone" />
            <p className={styles.demoText}>
              With nothing but groups, the panel is a bare history list. A
              flat list is one group with no label.
            </p>
            <div className={styles.railRow}>
              <div className={`${styles.railFrame} ${styles.railFrameShort}`}>
                <ThreadPanel groups={GROUPS} activeThreadId="quickstart" />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="The thread lifecycle" />
            <p className={styles.demoText}>
              Rows carry a real history&apos;s lifecycle, all controlled from
              outside. A pending thread holds its title&apos;s place with a
              shimmer while the host generates a name; threadActions hangs an
              overflow menu on every row, revealed only on hover or focus
              and built from the compact Dropdown menu; and
              renamingThreadId swaps a row to an inline rename field, where
              Enter commits and Escape cancels. Long titles fade out under a
              trailing mask rather than clipping, so the revealed trigger
              never collides with text. Try it: start a new chat, then
              rename or delete it from the row&apos;s menu.
            </p>
            <LifecycleDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Timestamps on the trailing edge" />
            <p className={styles.demoText}>
              Each thread can carry a small meta caption, the usual home for
              a relative time.
            </p>
            <MetaDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Detail rows" />
            <p className={styles.demoText}>
              A row scales from a bare title to the full detail anatomy: an
              unread dot leading the title, a quiet description line under
              the same trailing fade, and a trailing cluster pairing a
              session glyph with the meta caption.
            </p>
            <DetailsDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Pinned threads" />
            <p className={styles.demoText}>
              Pinning is a grouping the host owns: a pinned thread carries
              the pin mark and lives in its own leading group, and pin or
              unpin travel through the row menu like any other thread
              action. Try it from a row&apos;s overflow menu.
            </p>
            <PinnedDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Projects" />
            <p className={styles.demoText}>
              Between the standing controls and the history, the panel can
              carry a projects section: rows with the controls&apos; anatomy
              under their own overline header, with a quiet new-project
              button. The active project fills like an active thread, and
              collapsed the rows fold to icon circles while the header steps
              aside.
            </p>
            <ProjectsDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Rows as links" />
            <p className={styles.demoText}>
              Give a thread an href and its row renders as a real anchor,
              with the active row announcing aria-current. Rendered this way
              the panel needs no callbacks at all, so it can come straight
              from a Server Component.
            </p>
            <div className={`${styles.railFrame} ${styles.railFrameShort}`}>
              <ThreadPanel
                activeThreadId="search"
                groups={[
                  {
                    label: "atlas-app",
                    threads: [
                      { id: "onboarding", title: "Rework the onboarding flow", href: "#onboarding" },
                      { id: "search", title: "Speed up the search index", href: "#search" },
                      { id: "billing", title: "Untangle the billing webhooks", href: "#billing" },
                    ],
                  },
                ]}
                newThreadLabel="New thread"
                newThreadHref="#new"
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
