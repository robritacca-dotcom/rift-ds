"use client";

import { AgentRail, type AgentRailTab } from "@robr0/design-system/components/AgentRail/AgentRail";
import { Button } from "@robr0/design-system/components/Button/Button";
import { EmptyState } from "@robr0/design-system/components/EmptyState/EmptyState";
import { NotificationItem } from "@robr0/design-system/components/NotificationCenter/NotificationCenter";
import styles from "./AgentPanel.module.css";

/* The staged product's agent: a generic assistant with a generic record.
   Everything below is fixture data, frozen at module scope — the panes are
   here to be looked at and re-themed, so nothing in them moves. The edit
   affordances render because they are part of the pattern's anatomy; they
   are deliberately not wired to anything yet. */

const NOOP = () => {};

function ActivityPane() {
  return (
    <>
      <div className={styles.group}>
        <p className={styles.heading}>Today</p>
        <NotificationItem title="Watch the Q3 invoices" media="bolt" time="9:13 am">
          Started the hourly check on the billing inbox
        </NotificationItem>
        <NotificationItem title="Draft the renewal note" media="check_circle" time="9:04 am">
          Asked for your choice on the tone
        </NotificationItem>
        <NotificationItem title="Send the approval request" media="check_circle" time="9:02 am">
          Prepared the request and paused for a yes
        </NotificationItem>
        <NotificationItem title="Tidy the workspace roles" media="check_circle" time="8:58 am">
          Interrupted
        </NotificationItem>
      </div>
      <div className={styles.group}>
        <p className={styles.heading}>Yesterday</p>
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
    <div className={styles.group}>
      <p className={styles.heading}>Daily</p>
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

function PersonalizationPane({ name }: { name: string }) {
  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardRow}>
          <span className={styles.cardLabel}>{name}</span>
          <Button variant="secondary" size="compact" iconLeft="edit" onClick={NOOP} label="Edit" />
        </div>
      </div>
      <div className={styles.group}>
        <p className={styles.heading}>What it remembers</p>
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

const APPROVALS_PANE = (
  <EmptyState
    size="compact"
    icon="verified_user"
    title="No approvals yet"
    description="Anything the agent wants to spend or send lands here first."
  />
);

function panes(name: string): AgentRailTab[] {
  return [
    { id: "activity", label: "Activity", icon: "list", content: <ActivityPane /> },
    {
      id: "approvals",
      label: "Approvals",
      icon: "verified_user",
      content: APPROVALS_PANE,
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
      content: <PersonalizationPane name={name} />,
    },
  ];
}

export interface AgentPanelProps {
  /** The agent's name, following the playground's Product name lever. */
  name: string;
  /** The tab on stage, owned by the view so the rail and the sheet agree. */
  activeTab: string;
  /** Fires with the chosen tab's id. */
  onTabChange: (id: string) => void;
  /** The rail is in the bottom sheet, where it fills the width instead of
      holding its own column. */
  overlay: boolean;
}

/** The playground's staged agent rail: the library component filled with
 *  the four panes the pattern is named for. */
export default function AgentPanel({
  name,
  activeTab,
  onTabChange,
  overlay,
}: AgentPanelProps) {
  return (
    <AgentRail
      className={overlay ? styles.railInSheet : undefined}
      profile={{
        name,
        status: "Connected",
        onEdit: NOOP,
        editLabel: `Edit ${name}`,
      }}
      tabs={panes(name)}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />
  );
}
