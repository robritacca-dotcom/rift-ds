"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import {
  AgentRail,
  type AgentRailTab,
} from "rift-ds/components/AgentRail/AgentRail";
import { Button } from "rift-ds/components/Button/Button";
import { EmptyState } from "rift-ds/components/EmptyState/EmptyState";
import { NotificationItem } from "rift-ds/components/NotificationCenter/NotificationCenter";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

/* Demo data: Skylark is a fictional agent, and every run, automation and
   memory below is invented set dressing. */

function ActivityPane() {
  return (
    <>
      <div className={styles.paneGroup}>
        <p className={styles.paneHeading}>Today</p>
        <NotificationItem title="Watch the Q3 invoices" media="bolt" time="9:13 am">
          Started the hourly check on the billing inbox
        </NotificationItem>
        <NotificationItem title="Draft the renewal note" media="check_circle" time="9:04 am">
          Asked for your choice on the tone
        </NotificationItem>
        <NotificationItem title="Tidy the workspace roles" media="check_circle" time="9:02 am">
          Interrupted
        </NotificationItem>
      </div>
      <div className={styles.paneGroup}>
        <p className={styles.paneHeading}>Yesterday</p>
        <NotificationItem title="Summarize the standup" media="check_circle" time="4:40 pm">
          Posted the recap to the team channel
        </NotificationItem>
        <NotificationItem title="Retire the stale flags" media="check_circle" time="11:12 am">
          Opened a pull request for review
        </NotificationItem>
      </div>
    </>
  );
}

function ScheduledPane() {
  return (
    <div className={styles.paneGroup}>
      <p className={styles.paneHeading}>Daily</p>
      <NotificationItem title="Morning digest" media="schedule" time="8:00 am">
        Every weekday
      </NotificationItem>
      <NotificationItem title="Inbox sweep" media="mail" time="Every 30m">
        Flags anything still waiting on a reply
      </NotificationItem>
      <NotificationItem title="Invoice watch" media="receipt_long" time="Hourly">
        Asks before it pays anything
      </NotificationItem>
    </div>
  );
}

function PersonalizationPane() {
  return (
    <>
      <div className={styles.paneCard}>
        <div className={styles.paneCardRow}>
          <span className={styles.paneCardLabel}>Skylark</span>
          <Button variant="secondary" size="compact" iconLeft="edit" label="Edit" />
        </div>
      </div>
      <div className={styles.paneGroup}>
        <p className={styles.paneHeading}>What it remembers</p>
        <NotificationItem title="Tone" media="favorite" time="18 Sep">
          Plain and short, no exclamation marks
        </NotificationItem>
        <NotificationItem title="Working hours" media="psychology" time="22 Sep">
          Nothing scheduled before 9am
        </NotificationItem>
      </div>
    </>
  );
}

const APPROVALS_EMPTY = (
  <EmptyState
    size="compact"
    icon="verified_user"
    title="No approvals yet"
    description="Anything the agent wants to spend or send lands here first."
  />
);

const TABS: AgentRailTab[] = [
  { id: "activity", label: "Activity", icon: "list", content: <ActivityPane /> },
  {
    id: "approvals",
    label: "Approvals",
    icon: "verified_user",
    content: APPROVALS_EMPTY,
  },
  {
    id: "scheduled",
    label: "Scheduled",
    icon: "history_toggle_off",
    content: <ScheduledPane />,
  },
  {
    id: "profile",
    label: "You",
    icon: "fingerprint",
    content: <PersonalizationPane />,
  },
];

function FullAnatomy() {
  const [tab, setTab] = React.useState("activity");
  const [shown, setShown] = React.useState(true);
  return (
    <div className={styles.railFrame}>
      {shown ? (
        <AgentRail
          profile={{
            name: "Skylark",
            status: "Connected",
            onEdit: () => {},
            editLabel: "Edit the agent profile",
          }}
          tabs={TABS}
          activeTab={tab}
          onTabChange={setTab}
          onCollapse={() => setShown(false)}
        />
      ) : (
        <div className={styles.railPlaceholder}>
          <Button
            variant="secondary"
            iconLeft="smart_toy"
            label="Show the panel"
            onClick={() => setShown(true)}
          />
        </div>
      )}
    </div>
  );
}

function StatusDemo() {
  return (
    <div className={styles.railRow}>
      {(
        [
          { tone: "positive", label: "Connected" },
          { tone: "warning", label: "Reconnecting" },
          { tone: "error", label: "Disconnected" },
        ] as const
      ).map(({ tone, label }) => (
        <div key={tone} className={`${styles.railFrame} ${styles.railFrameShort}`}>
          <AgentRail
            profile={{ name: "Skylark", status: label, statusTone: tone }}
            tabs={TABS}
            activeTab="approvals"
          />
        </div>
      ))}
    </div>
  );
}

export default function AgentRailPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Agent rail</h1>
            <PageLinks storybookPath="/?path=/docs/components-agentrail--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>The agent, and its record</p>
            <p className={styles.introBody}>
              Agent rail is the mirror of Thread panel. Where the left rail
              holds the sessions a person has had, this one holds the agent
              itself: who it is at the top, and what it has been doing below,
              split across tabs. It is fully controlled and surface-less, so
              the host owns the tab on stage and the band the rail sits on.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="The full anatomy" />
            <p className={styles.demoText}>
              The portrait with its edit affordance, the tab strip, and one
              scrolling pane. The header and the strip stay put while the
              pane changes, so switching tabs never moves the agent&apos;s
              face. With onCollapse wired, a chevron floats over the
              rail&apos;s leading corner rather than sitting in the header,
              which is what keeps the portrait on the centre axis. The
              trailing corner is left to the host, because a rail seated at a
              card&apos;s edge is where the card&apos;s own controls end up. A
              chevron and not a cross, for the same reason: two crosses a few
              pixels apart read as two ways to dismiss the same thing. The way
              back in belongs to the host. Try the tabs, then collapse it.
            </p>
            <FullAnatomy />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Panes are host content" />
            <p className={styles.demoText}>
              The rail owns the shell, not what fills it. The four panes
              here are built from Notification item rows and Empty state, so
              an activity entry and a notification are the same row. A pane
              that spends most of its life empty is the point of the
              pattern: a quiet rail means nothing is waiting on a human.
            </p>
            <div className={`${styles.railFrame} ${styles.railFrameShort}`}>
              <AgentRail
                profile={{ name: "Skylark", status: "Connected" }}
                tabs={TABS}
                activeTab="approvals"
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="What the agent is" />
            <p className={styles.demoText}>
              The status line takes any of the five status roles, so the
              rail can say the agent is connected, retrying, or offline
              without a second component. With no profile at all the rail is
              tabs alone, for a product whose agent has no face of its own.
            </p>
            <StatusDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Tabs say what they are" />
            <p className={styles.demoText}>
              The strip is a content-sized Segmented control, which brings
              its tablist semantics, sliding pill and arrow-key traversal
              along. Labels, never glyphs alone: four unlabelled tabs are a
              guess for anyone who has not used the product before. That is
              also what sets the rail&apos;s width, and what rules the icons
              out here. An icon and its gap cost 28px a tab, so four
              icon-and-label tabs would need 423px, which is more room than
              a conversation&apos;s companion should take. Labels alone fit,
              and a host whose own labels do not gets a sideways scroll
              rather than a clipped last tab.
            </p>
            <div className={`${styles.railFrame} ${styles.railFrameShort}`}>
              <AgentRail tabs={TABS} activeTab="scheduled" />
            </div>
          </section>

          <ComponentInstallStrip slug="agent-rail" />
        </main>
      </div>
    </>
  );
}
