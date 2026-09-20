"use client";

/**
 * The roadmap planner template: the planning screen for Waypoint, a fictional
 * product roadmap tool, built from the design system alone. The shell is the
 * template family's (floating AppSidebar, slim top bar, docked mock
 * assistant); the page is a controls row and a two-pane board. The
 * GanttChart holds the stage, and a rail beside it carries the selected
 * initiative: owner, window, progress, and the dependency chain, with
 * clicks on a bar or a dependency moving the rail, so the two panes stay
 * one screen rather than two widgets. The controls row is three matching
 * compact selects, the sales pipeline's toolbar convention: the window
 * select redraws the timeline over a quarter or the half, and the team and
 * status selects thin the board. Every colour, radius, space, and type
 * style is a semantic token; every control is a library component.
 *
 * "Today" is pinned (the GanttChart's `today` prop), so the statically built
 * HTML and the hydrating client can never disagree about where the rule
 * sits. All of it is fictional, so the route is excluded from the chat
 * corpus (see EXCLUDED_ROUTES in generate-site-corpus.mjs). The assistant is
 * the shared TemplateAssistant mock, answering over this plan.
 */

import React from "react";
import { AiButton } from "@robr0/design-system/components/AiButton/AiButton";
import {
  AppSidebar,
  type AppSidebarSection,
} from "@robr0/design-system/components/AppSidebar/AppSidebar";
import { Avatar } from "@robr0/design-system/components/Avatar/Avatar";
import { Badge } from "@robr0/design-system/components/Badge/Badge";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { Divider } from "@robr0/design-system/components/Divider/Divider";
import {
  Dropdown,
  type DropdownOption,
} from "@robr0/design-system/components/Dropdown/Dropdown";
import {
  GanttChart,
  type GanttChartColor,
  type GanttChartItem,
  type GanttChartMilestone,
} from "@robr0/design-system/components/GanttChart/GanttChart";
import { Input } from "@robr0/design-system/components/Input/Input";
import { Kbd } from "@robr0/design-system/components/Kbd/Kbd";
import { Panel } from "@robr0/design-system/components/Panel/Panel";
import { ProgressBar } from "@robr0/design-system/components/ProgressBar/ProgressBar";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import styles from "./RoadmapPlanner.module.css";

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    items: [
      { key: "home", icon: "home", label: "Home" },
      { key: "roadmap", icon: "route", label: "Roadmap" },
      { key: "backlog", icon: "stacks", label: "Backlog" },
      { key: "releases", icon: "new_releases", label: "Releases" },
      { key: "teams", icon: "group", label: "Teams" },
      { key: "reports", icon: "monitoring", label: "Reports" },
    ],
  },
  {
    items: [
      { key: "support", icon: "headset_mic", label: "Support" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

/* Today is pinned so the rule, the canned answers, and the prerendered HTML
   all describe the same mid-September. */
const TODAY = "2026-09-15";

type TeamId = "platform" | "growth" | "mobile";

const TEAMS: { id: TeamId; label: string; color: GanttChartColor }[] = [
  { id: "platform", label: "Platform", color: "cobalt" },
  { id: "growth", label: "Growth", color: "mint" },
  { id: "mobile", label: "Mobile", color: "violet" },
];

type Status = "shipped" | "on-track" | "at-risk" | "planned";

const STATUS_META: Record<
  Status,
  { label: string; variant: "positive" | "info" | "warning" | "neutral" }
> = {
  shipped: { label: "Shipped", variant: "positive" },
  "on-track": { label: "On track", variant: "info" },
  "at-risk": { label: "At risk", variant: "warning" },
  planned: { label: "Planned", variant: "neutral" },
};

interface Initiative {
  id: string;
  title: string;
  team: TeamId;
  status: Status;
  start: string;
  end: string;
  /** Completion, absent for planned work */
  progress?: number;
  /** Display window for planned work, e.g. "Target: December" */
  target?: string;
  owner: string;
  summary: string;
  /** Ids of the initiatives this one waits on */
  dependsOn?: string[];
}

const INITIATIVES: Initiative[] = [
  {
    id: "p1",
    title: "Billing engine rewrite",
    team: "platform",
    status: "shipped",
    start: "2026-07-01",
    end: "2026-08-14",
    progress: 100,
    owner: "Maya Okafor",
    summary:
      "The metering and invoicing core moved onto the new ledger, closing out the double-charge class of bugs and unblocking usage-based pricing.",
  },
  {
    id: "p2",
    title: "Multi-region failover",
    team: "platform",
    status: "on-track",
    start: "2026-08-03",
    end: "2026-10-09",
    progress: 55,
    owner: "Daniel Reyes",
    summary:
      "Read replicas promoted automatically across three regions. The write path cut over behind a flag in staging; the production drill is scheduled for the first week of October.",
    dependsOn: ["p1"],
  },
  {
    id: "p3",
    title: "Audit log API",
    team: "platform",
    status: "at-risk",
    start: "2026-09-01",
    end: "2026-10-23",
    progress: 30,
    owner: "Maya Okafor",
    summary:
      "Every workspace action becomes a queryable event. Slipping: the retention review pushed the schema back two weeks, and enterprise trials wait on this.",
  },
  {
    id: "p4",
    title: "Zero-downtime migrations",
    team: "platform",
    status: "planned",
    start: "2026-11-02",
    end: "2026-12-18",
    target: "Target: December",
    owner: "Daniel Reyes",
    summary:
      "Schema changes applied in stages behind the failover layer, so releases stop needing a maintenance window.",
    dependsOn: ["p2"],
  },
  {
    id: "g1",
    title: "Self-serve onboarding",
    team: "growth",
    status: "shipped",
    start: "2026-07-06",
    end: "2026-08-28",
    progress: 100,
    owner: "Anika Patel",
    summary:
      "A guided first-run that gets a workspace to its first shipped roadmap without a sales call. Activation moved eleven points in the launch cohort.",
  },
  {
    id: "g2",
    title: "Usage-based pricing",
    team: "growth",
    status: "on-track",
    start: "2026-08-17",
    end: "2026-10-30",
    progress: 45,
    owner: "Tom Whitfield",
    summary:
      "Plans metered on active editors, priced off the new billing ledger. The calculator and plan page shipped; migration tooling for existing accounts is in review.",
    dependsOn: ["p1"],
  },
  {
    id: "g3",
    title: "Referral programme",
    team: "growth",
    status: "at-risk",
    start: "2026-09-07",
    end: "2026-11-06",
    progress: 20,
    owner: "Anika Patel",
    summary:
      "Workspace invites that credit both sides. At risk while the incentive accounting waits on legal review in two markets.",
  },
  {
    id: "g4",
    title: "Enterprise trials",
    team: "growth",
    status: "planned",
    start: "2026-10-19",
    end: "2026-12-11",
    target: "Target: late Q4",
    owner: "Tom Whitfield",
    summary:
      "Time-boxed full-feature trials for procurement-led buyers, gated on the audit log so security review can happen inside the trial.",
    dependsOn: ["p3"],
  },
  {
    id: "m1",
    title: "Offline mode",
    team: "mobile",
    status: "shipped",
    start: "2026-07-13",
    end: "2026-09-04",
    progress: 100,
    owner: "Lena Fischer",
    summary:
      "Boards read and edit locally with sync on reconnect. The conflict model reuses the web editor's merge rules, so nothing forks.",
  },
  {
    id: "m2",
    title: "Push notification centre",
    team: "mobile",
    status: "on-track",
    start: "2026-08-24",
    end: "2026-10-16",
    progress: 60,
    owner: "Marcus Chen",
    summary:
      "Mentions, status changes, and slipped dates as native pushes, with per-board controls. Digest batching is the last open piece.",
    dependsOn: ["m1"],
  },
  {
    id: "m3",
    title: "Tablet layouts",
    team: "mobile",
    status: "planned",
    start: "2026-10-12",
    end: "2026-11-27",
    target: "Target: November",
    owner: "Lena Fischer",
    summary:
      "The timeline and board views re-laid for the iPad's width, with the rail docked beside the chart the way the web app holds it.",
  },
  {
    id: "m4",
    title: "Widget gallery",
    team: "mobile",
    status: "planned",
    start: "2026-11-16",
    end: "2026-12-18",
    target: "Target: December",
    owner: "Marcus Chen",
    summary:
      "Home-screen widgets for the initiatives a person owns: window, progress, and the next milestone at a glance.",
  },
];

interface Milestone {
  id: string;
  title: string;
  team: TeamId;
  date: string;
}

const MILESTONES: Milestone[] = [
  { id: "beta", title: "2.0 beta cut", team: "platform", date: "2026-09-24" },
  { id: "pricing-ga", title: "Pricing GA", team: "growth", date: "2026-10-30" },
  { id: "mobile-5", title: "Mobile 5.0", team: "mobile", date: "2026-10-16" },
  { id: "year-end", title: "Year-end release", team: "platform", date: "2026-12-18" },
];

/* The window select's views. H2 is the default: the whole plan on one
   screen, with the quarters as the zoomed readings. */
const VIEWS = [
  { value: "h2", label: "H2 2026", start: "2026-07-01", end: "2026-12-31" },
  { value: "q3", label: "Q3 2026", start: "2026-07-01", end: "2026-09-30" },
  { value: "q4", label: "Q4 2026", start: "2026-10-01", end: "2026-12-31" },
];

/* The controls row's three selects share one option shape, the sales
   pipeline's toolbar convention. */
const VIEW_OPTIONS: DropdownOption[] = VIEWS.map(({ value, label }) => ({
  value,
  label,
}));

const TEAM_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All teams" },
  ...TEAMS.map((t) => ({ value: t.id, label: t.label })),
];

const STATUS_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All statuses" },
  ...(Object.keys(STATUS_META) as Status[]).map((s) => ({
    value: s,
    label: STATUS_META[s].label,
  })),
];

const CHAT_SUGGESTIONS = [
  { id: "risk", label: "What's at risk?" },
  { id: "q4", label: "What lands in Q4?" },
  { id: "blocked", label: "What blocks enterprise trials?" },
];

const CHAT_REPLIES: Record<string, string> = {
  risk: "Two initiatives are at risk. The audit log API sits at 30% with the schema pushed back two weeks by the retention review, and enterprise trials wait on it. The referral programme sits at 20% while incentive accounting clears legal review in two markets. Everything else in flight is on track.",
  q4: "Q4 carries the close of multi-region failover and the push notification centre in October, usage-based pricing reaching GA on the 30th, then the planned work: tablet layouts through November, enterprise trials in late Q4, and zero-downtime migrations and the widget gallery landing on the year-end release, December 18.",
  blocked:
    "Enterprise trials depend on the audit log API: security review has to happen inside the trial, which needs every workspace action queryable. The audit log is at risk after the retention review pushed its schema back two weeks, so the trials' late-Q4 target is the first date to watch.",
};

/* The rail's milestone diamonds reuse the bars' team accents, mapped to
   module classes so the colour stays a token. */
const DOT_CLASS: Partial<Record<GanttChartColor, string>> = {
  cobalt: styles.dotCobalt,
  mint: styles.dotMint,
  violet: styles.dotViolet,
};

const CHAT_FALLBACK =
  "This assistant is a mock, so only the suggested questions have real answers. In the live product this reply would come from the plan behind this screen.";

/* ------------------------------------------------------------- helpers */

const teamOf = (id: TeamId) => TEAMS.find((t) => t.id === id)!;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-10-09" → "Oct 9, 2026", formatted by hand so the server and the
 *  client can never disagree over a locale. */
function formatDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}, ${y}`;
}

const overlaps = (item: { start: string; end: string }, view: { start: string; end: string }) =>
  item.start <= view.end && item.end >= view.start;

/* ---------------------------------------------------------------- page */

export default function RoadmapPlanner() {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [view, setView] = React.useState("h2");
  const [teamFilter, setTeamFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedId, setSelectedId] = React.useState<string | null>("p2");

  const activeView = VIEWS.find((v) => v.value === view) ?? VIEWS[0];

  const visible = INITIATIVES.filter(
    (i) =>
      (teamFilter === "all" || i.team === teamFilter) &&
      (statusFilter === "all" || i.status === statusFilter) &&
      overlaps(i, activeView),
  );
  const visibleMilestones = MILESTONES.filter(
    (m) =>
      (teamFilter === "all" || m.team === teamFilter) &&
      m.date >= activeView.start &&
      m.date <= activeView.end,
  );

  const ganttItems: GanttChartItem[] = visible.map((i) => ({
    id: i.id,
    label: i.title,
    start: i.start,
    end: i.end,
    color: teamOf(i.team).color,
    group: teamOf(i.team).label,
    progress: i.status === "planned" ? undefined : i.progress,
    projected: i.status === "planned",
    detail:
      i.status === "at-risk" ? "At risk" : i.status === "planned" ? i.target : undefined,
  }));

  const ganttMilestones: GanttChartMilestone[] = visibleMilestones.map((m) => ({
    id: `ms-${m.id}`,
    label: m.title,
    date: m.date,
    color: teamOf(m.team).color,
    group: teamOf(m.team).label,
  }));

  const selected = INITIATIVES.find((i) => i.id === selectedId) ?? null;
  const selectedDeps = (selected?.dependsOn ?? [])
    .map((id) => INITIATIVES.find((i) => i.id === id))
    .filter((i): i is Initiative => Boolean(i));
  const selectedDependents = selected
    ? INITIATIVES.filter((i) => i.dependsOn?.includes(selected.id))
    : [];

  return (
    // data-bg-hidden: the planner sits on the flat page colour, the same
    // switch the other templates use.
    <div className={styles.shell} data-bg-hidden="">
      <div className={styles.sidebar}>
        <AppSidebar
          sections={NAV_SECTIONS}
          profile={{ name: "Jonas Lindqvist", email: "jonas@waypoint.app" }}
          activeKey="roadmap"
          expanded={sidebarExpanded}
          onExpandedChange={setSidebarExpanded}
          logoText="Waypoint"
          floating
          footerSlot={<ThemeToggle />}
        />
      </div>

      <main
        className={`${styles.main} ${
          sidebarExpanded ? styles.mainExpanded : ""
        } ${chatOpen ? styles.mainChatOpen : ""}`}
      >
        <div className={styles.content}>
          <div className={styles.topBar}>
            <div className={styles.search}>
              <Input
                placeholder="Search initiatives"
                iconLeft="search"
                aria-label="Search initiatives"
              />
              <span className={styles.searchKbd} aria-hidden="true">
                <Kbd size="compact">⌘</Kbd>
                <Kbd size="compact">K</Kbd>
              </span>
            </div>
            <div className={styles.topBarActions}>
              <AiButton
                label="Ask AI"
                size="compact"
                onClick={() => setChatOpen(true)}
              />
              <CircularButton
                icon="notifications"
                variant="secondary"
                size="compact"
                ariaLabel="Notifications"
              />
            </div>
          </div>

          {/* ------------------------------------------- controls row */}
          <div className={styles.controls}>
            <div className={styles.controlsFilters}>
              <Dropdown
                size="compact"
                options={VIEW_OPTIONS}
                value={view}
                onValueChange={setView}
                aria-label="Timeline window"
                className={styles.filterSelect}
              />
              <Dropdown
                size="compact"
                options={TEAM_OPTIONS}
                value={teamFilter}
                onValueChange={setTeamFilter}
                aria-label="Filter by team"
                className={styles.filterSelect}
              />
              <Dropdown
                size="compact"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onValueChange={setStatusFilter}
                aria-label="Filter by status"
                className={styles.filterSelect}
              />
            </div>
            <Button
              variant="primary"
              size="compact"
              label="New initiative"
              iconLeft="add"
            />
          </div>

          {/* ------------------------------------------------- board */}
          <div className={styles.board}>
            <section className={styles.stage} aria-label="Roadmap timeline">
              <GanttChart
                items={ganttItems}
                milestones={ganttMilestones}
                range={{ start: activeView.start, end: activeView.end }}
                today={TODAY}
                selectedId={selectedId ?? undefined}
                onItemClick={(item) =>
                  setSelectedId((current) => (current === item.id ? null : item.id))
                }
                title={`${activeView.label} roadmap`}
                subtitle="Click a bar to inspect the initiative"
              />
            </section>

            {/* --------------------------------------------- the rail */}
            <Panel className={styles.rail} aria-label="Initiative detail">
              {selected ? (
                <>
                  <div className={styles.railHeader}>
                    <span className={styles.railTeam}>
                      {teamOf(selected.team).label}
                    </span>
                    <Badge
                      variant={STATUS_META[selected.status].variant}
                      label={STATUS_META[selected.status].label}
                    />
                  </div>
                  <h1 className={styles.railTitle}>{selected.title}</h1>

                  <div className={styles.ownerRow}>
                    <Avatar name={selected.owner} size="sm" />
                    <div className={styles.ownerMeta}>
                      <span className={styles.ownerName}>{selected.owner}</span>
                      <span className={styles.ownerRole}>Initiative owner</span>
                    </div>
                  </div>

                  <div className={styles.metaGrid}>
                    <span className={styles.metaLabel}>Window</span>
                    <span className={styles.metaValue}>
                      {selected.status === "planned" && selected.target
                        ? selected.target
                        : `${formatDay(selected.start)} to ${formatDay(selected.end)}`}
                    </span>
                  </div>

                  {selected.status !== "planned" && (
                    <div className={styles.progressBlock}>
                      <div className={styles.progressHead}>
                        <span className={styles.metaLabel}>Progress</span>
                        <span className={styles.progressValue}>
                          {selected.progress ?? 0}%
                        </span>
                      </div>
                      <ProgressBar
                        value={selected.progress ?? 0}
                        ariaLabel={`${selected.title} progress`}
                      />
                    </div>
                  )}

                  <p className={styles.railSummary}>{selected.summary}</p>

                  {(selectedDeps.length > 0 || selectedDependents.length > 0) && (
                    <>
                      <Divider />
                      {selectedDeps.length > 0 && (
                        <div className={styles.depGroup}>
                          <span className={styles.groupLabel}>Waits on</span>
                          {selectedDeps.map((dep) => (
                            <button
                              key={dep.id}
                              type="button"
                              className={styles.depRow}
                              onClick={() => setSelectedId(dep.id)}
                            >
                              <span className={styles.depTitle}>{dep.title}</span>
                              <Badge
                                variant={STATUS_META[dep.status].variant}
                                label={STATUS_META[dep.status].label}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                      {selectedDependents.length > 0 && (
                        <div className={styles.depGroup}>
                          <span className={styles.groupLabel}>Unblocks</span>
                          {selectedDependents.map((dep) => (
                            <button
                              key={dep.id}
                              type="button"
                              className={styles.depRow}
                              onClick={() => setSelectedId(dep.id)}
                            >
                              <span className={styles.depTitle}>{dep.title}</span>
                              <Badge
                                variant={STATUS_META[dep.status].variant}
                                label={STATUS_META[dep.status].label}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <h1 className={styles.railTitle}>Nothing selected</h1>
                  <p className={styles.railSummary}>
                    Click a bar on the timeline to inspect its owner, window,
                    progress, and dependency chain.
                  </p>
                </>
              )}

              <Divider />

              <div className={styles.depGroup}>
                <span className={styles.groupLabel}>Milestones in window</span>
                {visibleMilestones.length > 0 ? (
                  <ul className={styles.milestoneList}>
                    {visibleMilestones.map((m) => (
                      <li key={m.id} className={styles.milestoneRow}>
                        <span
                          className={`${styles.milestoneDot} ${DOT_CLASS[teamOf(m.team).color] ?? ""}`}
                          aria-hidden="true"
                        />
                        <span className={styles.milestoneTitle}>{m.title}</span>
                        <span className={styles.milestoneDate}>
                          {formatDay(m.date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.railSummary}>
                    No milestones inside this window.
                  </p>
                )}
              </div>
            </Panel>
          </div>
        </div>
      </main>

      <TemplateAssistant
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Waypoint AI"
        askLine="Ask about risk, the quarter, or a dependency chain"
        suggestions={CHAT_SUGGESTIONS}
        replies={CHAT_REPLIES}
        fallback={CHAT_FALLBACK}
        disclaimer="A mock assistant with canned answers over this plan."
      />
    </div>
  );
}
