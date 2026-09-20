"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import {
  ThreadTabs,
  type ThreadTab,
} from "@robr0/design-system/components/ThreadTabs/ThreadTabs";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

/* Demo data: Skylark is a fictional product, atlas-* fictional repos. */

const TABS: ThreadTab[] = [
  { id: "onboarding", label: "Rework the onboarding flow", icon: "forum" },
  { id: "search", label: "Speed up the search index", icon: "forum" },
  { id: "billing", label: "Untangle the billing webhooks", icon: "forum" },
];

function SelectionDemo() {
  const [active, setActive] = React.useState("search");
  return (
    <div className={styles.stripFrame}>
      <ThreadTabs tabs={TABS} activeId={active} onTabSelect={setActive} />
    </div>
  );
}

/* The lifecycle demo: open tabs with the trailing "+", close them from
   their pills, and watch each change animate — state lives here and dies
   with the page. */
const LIFECYCLE_NAMES = [
  "Plan the beta invite list",
  "Summarize the weekly standup",
  "Draft the pricing FAQ",
  "Tidy up the workspace roles",
];

function LifecycleDemo() {
  const seq = React.useRef(0);
  const [tabs, setTabs] = React.useState<ThreadTab[]>(TABS.slice(0, 2));
  const [active, setActive] = React.useState("search");

  const addTab = () => {
    const id = `new-${seq.current}`;
    const label = LIFECYCLE_NAMES[seq.current % LIFECYCLE_NAMES.length];
    seq.current += 1;
    setTabs((current) => [...current, { id, label, icon: "forum" }]);
    setActive(id);
  };

  const closeTab = (id: string) => {
    setTabs((current) => {
      const index = current.findIndex((tab) => tab.id === id);
      const next = current.filter((tab) => tab.id !== id);
      setActive((activeId) =>
        activeId === id
          ? ((current[index + 1] ?? current[index - 1])?.id ?? "")
          : activeId,
      );
      return next;
    });
  };

  return (
    <div className={styles.stripFrame}>
      <ThreadTabs
        tabs={tabs}
        activeId={active}
        onTabSelect={setActive}
        onTabClose={closeTab}
        onAdd={addTab}
      />
    </div>
  );
}

function UnreadDemo() {
  const [active, setActive] = React.useState("search");
  const [tabs, setTabs] = React.useState<ThreadTab[]>([
    { ...TABS[0], unread: true },
    TABS[1],
    { ...TABS[2], unread: true },
  ]);
  const select = (id: string) => {
    setActive(id);
    setTabs((current) =>
      current.map((tab) => (tab.id === id ? { ...tab, unread: false } : tab)),
    );
  };
  return (
    <div className={styles.stripFrame}>
      <ThreadTabs tabs={tabs} activeId={active} onTabSelect={select} />
    </div>
  );
}

function LongLabelsDemo() {
  const [active, setActive] = React.useState("long");
  return (
    <div className={styles.stripFrame}>
      <ThreadTabs
        tabs={[
          {
            id: "long",
            label:
              "Investigate why the nightly import job quietly drops rows mid-file",
            icon: "forum",
          },
          { id: "short", label: "Fix the favicon", icon: "forum" },
        ]}
        activeId={active}
        onTabSelect={setActive}
        onTabClose={() => {}}
      />
    </div>
  );
}

export default function ThreadTabsPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Thread tabs</h1>
            <PageLinks storybookPath="/?path=/docs/components-threadtabs--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>The open sessions, one strip</p>
            <p className={styles.introBody}>
              Thread tabs is the top edge of a chat or agent product: every
              open session as a pill tab, the active one filled the way
              Thread panel fills its active row, with a hover-revealed close
              button and a trailing new-tab action. It is fully controlled
              and surface-less (the host owns which tabs exist and which is
              active), while the strip owns the choreography of a tab
              arriving and leaving.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Selection" />
            <p className={styles.demoText}>
              Clicking a tab moves the controlled selection; the active pill
              fills and announces aria-current. Arrow keys, Home and End move
              focus along the strip.
            </p>
            <SelectionDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Opening and closing" />
            <p className={styles.demoText}>
              The strip animates its own changes: a new tab glides open in
              place, and a closed one folds away while its neighbours slide
              over. No measurement, just a grid track collapsing. The close
              button always holds its seat and only fades in on hover,
              keyboard focus, or the active tab, so revealing it never
              shifts the label; Delete closes the focused tab too. Try it:
              open a few sessions with the plus, then close them.
            </p>
            <LifecycleDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Unseen activity" />
            <p className={styles.demoText}>
              A tab with unseen activity leads its label with the small
              status dot, Thread panel&apos;s unread marker restated at tab
              scale. Here, selecting a tab clears its dot.
            </p>
            <UnreadDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Long labels" />
            <p className={styles.demoText}>
              A long session title caps the tab&apos;s width and dissolves
              under a trailing mask rather than clipping to an ellipsis; the
              full text stays in the tab&apos;s tooltip. A crowded strip
              scrolls sideways.
            </p>
            <LongLabelsDemo />
          </section>
        </main>
      </div>
    </>
  );
}
