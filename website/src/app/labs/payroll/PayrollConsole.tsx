"use client";

/**
 * The payroll console: a deliberately small product screen whose real
 * subject is the chrome around it. The chat is docked as a side rail the way
 * the site's own panel docks, and the agent panel opens inside that rail — as
 * a sheet, because the rail is the narrow form and the panel measures the
 * container it is actually in rather than the screen around it. The rail
 * never widens to seat it: a companion panel that shoves the product aside
 * to make room for itself is a worse trade than a sheet. Every colour,
 * radius, space and type style is a semantic token; every control is a
 * library component. Expanding the chat to full screen is the other half of
 * the demonstration: the same widget, now measuring the viewport, seats the
 * panel inline instead. All data is fictional.
 *
 * Not a template: it lives only at /labs/payroll, outside the IA.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiButton } from "@robr0/design-system/components/AiButton/AiButton";
import {
  AgentRail,
  type AgentRailTab,
} from "@robr0/design-system/components/AgentRail/AgentRail";
import {
  AppSidebar,
  type AppSidebarSection,
} from "@robr0/design-system/components/AppSidebar/AppSidebar";
import { Badge } from "@robr0/design-system/components/Badge/Badge";
import { Breadcrumb } from "@robr0/design-system/components/Breadcrumb/Breadcrumb";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import {
  DataTable,
  type DataTableColumn,
} from "@robr0/design-system/components/DataTable/DataTable";
import { Divider } from "@robr0/design-system/components/Divider/Divider";
import { EmptyState } from "@robr0/design-system/components/EmptyState/EmptyState";
import { Input } from "@robr0/design-system/components/Input/Input";
import { Kbd } from "@robr0/design-system/components/Kbd/Kbd";
import { NotificationItem } from "@robr0/design-system/components/NotificationCenter/NotificationCenter";
import { Panel } from "@robr0/design-system/components/Panel/Panel";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { Stat } from "@robr0/design-system/components/Stat/Stat";
import { Stepper } from "@robr0/design-system/components/Stepper/Stepper";
import {
  ThreadPanel,
  type ThreadPanelGroup,
} from "@robr0/design-system/components/ThreadPanel/ThreadPanel";
import { SiteChat } from "@/components/SiteChat/SiteChat";
import { SiteChatProvider, useSiteChat } from "@/components/SiteChat/ChatContext";
import { createSimTransport } from "@/lib/chat-sim";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import styles from "./PayrollConsole.module.css";

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    items: [
      { key: "overview", icon: "space_dashboard", label: "Overview" },
      { key: "run", icon: "payments", label: "Run payroll" },
      { key: "people", icon: "group", label: "People", badge: 38 },
      { key: "time", icon: "schedule", label: "Timesheets", badge: 4 },
      { key: "benefits", icon: "health_and_safety", label: "Benefits" },
      { key: "taxes", icon: "receipt_long", label: "Taxes" },
    ],
  },
  {
    items: [
      { key: "support", icon: "headset_mic", label: "Support" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

/* The run's four totals. Gross less the two tax lines is the net figure. */
const TOTALS = [
  { value: "$412,860", label: "Gross pay", delta: "+2.1%", trend: "up" as const },
  { value: "$68,140", label: "Employee taxes", delta: "+1.8%", trend: "up" as const },
  { value: "$31,470", label: "Employer taxes", delta: "+1.4%", trend: "up" as const },
  { value: "$313,250", label: "Net pay", delta: "+2.3%", trend: "up" as const },
];

const RUN_STEPS = [
  { label: "Timesheets", description: "38 of 38 in" },
  { label: "Review", description: "4 changes to confirm" },
  { label: "Approve", description: "Waiting on you" },
  { label: "Pay", description: "Deposits on 15 Sep" },
];

interface Person {
  id: string;
  name: string;
  role: string;
  type: string;
  hours: string;
  gross: string;
  net: string;
  status: "Ready" | "Needs review" | "On hold";
}

const PEOPLE: Person[] = [
  { id: "1", name: "Mara Esmer", role: "Engineering", type: "Salary", hours: "—", gross: "$9,420", net: "$6,980", status: "Ready" },
  { id: "2", name: "Tomas Reidy", role: "Engineering", type: "Salary", hours: "—", gross: "$8,750", net: "$6,510", status: "Ready" },
  { id: "3", name: "Priya Raval", role: "Design", type: "Salary", hours: "—", gross: "$8,100", net: "$6,040", status: "Ready" },
  { id: "4", name: "Devon Aikers", role: "Support", type: "Hourly", hours: "82.5", gross: "$3,712", net: "$2,868", status: "Needs review" },
  { id: "5", name: "Ines Kovac", role: "Support", type: "Hourly", hours: "76.0", gross: "$3,420", net: "$2,644", status: "Ready" },
  { id: "6", name: "Rafi Oduya", role: "Sales", type: "Salary", hours: "—", gross: "$7,640", net: "$5,690", status: "Ready" },
  { id: "7", name: "Noor Haddad", role: "Sales", type: "Commission", hours: "—", gross: "$9,980", net: "$7,240", status: "Needs review" },
  { id: "8", name: "Lena Sørby", role: "Finance", type: "Salary", hours: "—", gross: "$8,300", net: "$6,180", status: "On hold" },
];

const STATUS_VARIANT = {
  Ready: "positive",
  "Needs review": "warning",
  "On hold": "neutral",
} as const;

const COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Person", sortable: true },
  { key: "role", header: "Team", sortable: true },
  { key: "type", header: "Pay type" },
  { key: "hours", header: "Hours", align: "right" },
  { key: "gross", header: "Gross", align: "right", sortable: true },
  { key: "net", header: "Net", align: "right", sortable: true },
  {
    key: "status",
    header: "Status",
    render: (row) => {
      const status = row.values.status as Person["status"];
      return <Badge variant={STATUS_VARIANT[status]} label={status} />;
    },
  },
];

/* ------------------------------------------------- the agent's own panes */

function ActivityPane() {
  return (
    <>
      <div className={styles.paneGroup}>
        <p className={styles.paneHeading}>Today</p>
        <NotificationItem title="Check the September run" media="bolt" time="9:13 am">
          Flagged four timesheets that changed after close
        </NotificationItem>
        <NotificationItem title="Reconcile the tax lines" media="check_circle" time="9:04 am">
          Employer total matches the filing schedule
        </NotificationItem>
        <NotificationItem title="Hold Lena Sørby" media="check_circle" time="8:51 am">
          Waiting on a bank detail change
        </NotificationItem>
      </div>
      <div className={styles.paneGroup}>
        <p className={styles.paneHeading}>Yesterday</p>
        <NotificationItem title="Close the pay period" media="check_circle" time="6:02 pm">
          Locked timesheets for 38 people
        </NotificationItem>
        <NotificationItem title="Draft the payday note" media="check_circle" time="4:20 pm">
          Shared to the team channel
        </NotificationItem>
      </div>
    </>
  );
}

function ScheduledPane() {
  return (
    <div className={styles.paneGroup}>
      <p className={styles.paneHeading}>Recurring</p>
      <NotificationItem title="Period close" media="schedule" time="Every 15th">
        Locks timesheets at 6pm
      </NotificationItem>
      <NotificationItem title="Timesheet nudge" media="notifications" time="Every Friday">
        Reminds anyone still missing hours
      </NotificationItem>
      <NotificationItem title="Tax filing check" media="receipt_long" time="Monthly">
        Compares withheld against filed
      </NotificationItem>
    </div>
  );
}

function PersonalizationPane() {
  return (
    <>
      <div className={styles.paneCard}>
        <div className={styles.paneCardRow}>
          <span className={styles.paneCardLabel}>Northwind Payroll</span>
          <Button variant="secondary" size="compact" iconLeft="edit" label="Edit" />
        </div>
      </div>
      <div className={styles.paneGroup}>
        <p className={styles.paneHeading}>What it remembers</p>
        <NotificationItem title="Approvals" media="favorite" time="18 Sep">
          Never pays without a yes from you
        </NotificationItem>
        <NotificationItem title="Rounding" media="psychology" time="22 Sep">
          Hours to the quarter, always down
        </NotificationItem>
      </div>
    </>
  );
}

const AGENT_TABS: AgentRailTab[] = [
  { id: "activity", label: "Activity", icon: "list", content: <ActivityPane /> },
  {
    id: "approvals",
    label: "Approvals",
    icon: "verified_user",
    content: (
      <EmptyState
        size="compact"
        icon="verified_user"
        title="No approvals yet"
        description="Anything the agent wants to pay or send lands here first."
      />
    ),
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

/* The assistant's own history. Static staging, like everything else here:
   selecting a thread moves the pill, never the transcript. */
const CHAT_THREADS: ThreadPanelGroup[] = [
  {
    label: "This month",
    threads: [
      { id: "sep-15", title: "September 15 run", meta: "now" },
      { id: "taxes", title: "Q3 tax reconciliation", meta: "2d" },
      { id: "onboard", title: "Onboard two contractors", meta: "6d" },
    ],
  },
  {
    label: "Earlier",
    threads: [
      { id: "aug-31", title: "August 31 run", meta: "3w" },
      { id: "benefits", title: "Benefits renewal questions", meta: "1m" },
    ],
  },
];

/* The one look this page ships in: Ember, whose id in THEME_PRESETS is
   `warm` (the label and the key differ — the key is the original name). */
const PINNED_BRAND = "warm";

const CHAT_STARTERS = [
  { id: "diff", label: "What changed since last run?" },
  { id: "hold", label: "Why is Lena on hold?" },
  { id: "taxes", label: "Break down the tax lines" },
];

/* ------------------------------------------------------------ the chat */

/**
 * The docked chat, and the launcher it collapses to. It lives inside the
 * provider so the close button in the widget's header means something here:
 * the rail leaves, the page reclaims its width, and the corner button brings
 * it back — the site's own panel contract, with the dock always on rather
 * than gated on a viewport width.
 */
function PayrollChat({
  agentTab,
  onTabChange,
  onOpenChange,
}: {
  agentTab: string;
  onTabChange: (id: string) => void;
  onOpenChange: (open: boolean) => void;
}) {
  const { open, setOpen, view, reset, returnFocusRef } = useSiteChat();
  /* The history rail's own state. SiteChat decides where it sits from the
     widget's measured width, so nothing here is a breakpoint: docked, the
     widget is ~420px and the rail arrives as the header's hamburger sheet;
     expanded, it is the viewport and the rail seats inline on the leading
     edge, which is also where New chat moves to. */
  const [activeThread, setActiveThread] = useState("");
  const [railExpanded, setRailExpanded] = useState(true);
  /* Full screen is the rail's other geometry, and the only one wide enough
     for the agent panel to sit inline: docked, the widget measures ~420px
     and the panel comes up as a sheet; expanded, it measures the viewport
     and the panel takes the trailing edge, the playground's stage exactly. */
  const isFull = view === "full";
  const launcherRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);

  /* The provider rests closed (the site's default); this page is about the
     docked rail, so it opens on arrival. */
  useEffect(() => {
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onOpenChange(open);
  }, [open, onOpenChange]);

  /* Closing hands focus to the launcher, so the keyboard never lands on
     <body>. */
  useEffect(() => {
    if (!open) launcherRef.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <div className={styles.launcher}>
        <AiButton
          ref={launcherRef}
          label="Ask Northwind AI"
          icon="forum"
          aria-expanded={false}
          onClick={() => {
            returnFocusRef.current = null;
            setOpen(true);
          }}
        />
      </div>
    );
  }

  return (
    <aside
      className={`${styles.chatRail} ${isFull ? styles.chatRailFull : ""}`}
      aria-label="Northwind assistant"
    >
      <SiteChat
        title="Northwind AI"
        placeholder="Ask about this run"
        tagline="Ask about the run, the totals, or anyone in it"
        logo={null}
        starters={CHAT_STARTERS}
        threads={({ overlay, close }) => (
          <ThreadPanel
            groups={CHAT_THREADS}
            activeThreadId={activeThread}
            onThreadSelect={(id) => {
              setActiveThread(id);
              close();
            }}
            newThreadLabel="New chat"
            onNewThread={() => {
              reset();
              setActiveThread("");
              close();
            }}
            historyLabel="Chat history"
            /* The sheet names the product and skips the collapse (its scrim
               is the dismissal); the inline rail skips the brand, since the
               chat header already says it, and offers the collapse instead. */
            logo={<span className={styles.threadsLogoDot} />}
            logoText={overlay ? "Northwind AI" : undefined}
            expanded={overlay ? true : railExpanded}
            onExpandedChange={overlay ? undefined : setRailExpanded}
            profile={overlay ? undefined : { name: "Ada Whitlock", meta: "Admin" }}
          />
        )}
        aside={({ overlay, close }) => (
          <AgentRail
            className={overlay ? styles.railInSheet : undefined}
            profile={{
              name: "Northwind AI",
              status: "Connected",
              onEdit: () => {},
              editLabel: "Edit the agent profile",
            }}
            tabs={AGENT_TABS}
            activeTab={agentTab}
            onTabChange={onTabChange}
            onCollapse={close}
          />
        )}
      />
    </aside>
  );
}

/* ---------------------------------------------------------------- view */

export default function PayrollConsole() {
  /* The console ships in one look. The attribute is set directly rather than
     through applyBrand, which persists the pick to localStorage: a lab page
     must not rewrite the visitor's own theme for the rest of the site, so the
     previous value is put back on the way out. The theme switcher is left out
     of the sidebar footer for the same reason — one look means one look, and
     the light/dark toggle beside it still works. */
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute("data-brand");
    root.setAttribute("data-brand", PINNED_BRAND);
    return () => {
      if (previous === null) root.removeAttribute("data-brand");
      else root.setAttribute("data-brand", previous);
    };
  }, []);

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const [agentTab, setAgentTab] = useState("activity");

  /* The scripted transport the playground's Simulated mode runs on, with no
     rich content registered: this page is about the chrome, not the story. */
  const transport = useMemo(() => createSimTransport({}), []);

  const rows = useMemo(
    () => PEOPLE.map((person) => ({ id: person.id, values: { ...person } })),
    []
  );

  const handleChatOpen = useCallback((next: boolean) => setChatOpen(next), []);

  return (
    <SiteChatProvider transport={transport}>
    {/* data-bg-hidden is the layout's own switch for the ambient background:
        the console sits on the flat page colour, the marketing dashboard's
        reasoning. */}
    <div
      className={`${styles.shell} ${chatOpen ? styles.shellChatOpen : ""}`}
      data-bg-hidden=""
    >
      <div className={styles.sidebar}>
        <AppSidebar
          sections={NAV_SECTIONS}
          profile={{ name: "Ada Whitlock", email: "ada@northwind.example" }}
          activeKey="run"
          expanded={sidebarExpanded}
          onExpandedChange={setSidebarExpanded}
          logoText="Northwind"
          floating
          footerSlot={<ThemeToggle />}
        />
      </div>

      <main
        className={`${styles.main} ${sidebarExpanded ? styles.mainExpanded : ""}`}
      >
        <div className={styles.content}>
          <div className={styles.topBar}>
            <div className={styles.search}>
              <Input
                placeholder="Search people"
                iconLeft="search"
                aria-label="Search people"
              />
              <span className={styles.searchKbd} aria-hidden="true">
                <Kbd size="compact">⌘</Kbd>
                <Kbd size="compact">K</Kbd>
              </span>
            </div>
            <div className={styles.topBarActions}>
              <CircularButton
                icon="notifications"
                variant="secondary"
                size="compact"
                ariaLabel="Notifications"
              />
            </div>
          </div>
          <Divider spacing="none" />

          <header className={styles.pageHead}>
            <div>
              <Breadcrumb
                items={[
                  { label: "Northwind", href: "#" },
                  { label: "Payroll", href: "#" },
                  { label: "September run" },
                ]}
              />
              <h1 className={styles.title}>September 15 pay run</h1>
              <p className={styles.subtitle}>
                38 people, semi-monthly. Deposits land the morning of the 15th.
              </p>
            </div>
            <div className={styles.headActions}>
              <Button variant="secondary" size="compact" iconLeft="visibility" label="Preview" />
              <Button size="compact" iconLeft="check" label="Approve payroll" />
            </div>
          </header>

          <section className={styles.totals}>
            {TOTALS.map((total) => (
              <Panel key={total.label} padding="compact">
                <Stat
                  value={total.value}
                  label={total.label}
                  delta={total.delta}
                  trend={total.trend}
                  deltaPlacement="inline"
                />
              </Panel>
            ))}
          </section>

          <section className={styles.section}>
            <SectionTitle title="Where the run stands" divider />
            <Panel>
              <Stepper steps={RUN_STEPS} activeStep={2} />
            </Panel>
          </section>

          <section className={styles.section}>
            <SectionTitle title="This run" divider />
            <DataTable
              columns={COLUMNS}
              rows={rows}
              size="compact"
              searchable
              searchPlaceholder="Filter people"
              caption="The people included in the September 15 pay run"
            />
          </section>
        </div>
      </main>

      {/* The chat, docked. A real SiteChat on the scripted transport rather
          than a mock panel, because the point of the page is the widget's own
          behaviour at product scale, the agent panel included. */}
      <PayrollChat
        agentTab={agentTab}
        onTabChange={setAgentTab}
        onOpenChange={handleChatOpen}
      />
    </div>
    </SiteChatProvider>
  );
}
