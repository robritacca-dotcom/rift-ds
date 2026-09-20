"use client";

/**
 * The sales pipeline template: the companies view of Meridian, a fictional
 * sales CRM, built from the design system alone. The shell is the template
 * family's (floating AppSidebar, slim top bar, docked mock assistant); the
 * page is a breadcrumbed head and then the wired DataTable, which takes
 * the whole screen and sits directly on the page because it brings its own
 * bordered chrome (design.md's Composition rule 2 — a panel around it
 * would double-box it). The table's toolbar carries three matching compact
 * selects (window, owner, motion) beside its built-in search, the
 * campaigns table's convention; each row composes the smaller parts — a
 * motion Badge, the owner's Avatar, a win-probability Meter carrying its
 * own judgement through the status roles, an activity Sparkline. Every
 * colour, radius, space, and type style is a semantic token; every control
 * is a library component.
 *
 * Dates are pinned strings formatted by hand, so the statically built HTML
 * and the hydrating client can never disagree over a locale or a clock.
 * All of it is fictional, so the route is excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs). The assistant is the
 * shared TemplateAssistant mock, answering over this book of business.
 */

import React from "react";
import { AiButton } from "@robr0/design-system/components/AiButton/AiButton";
import {
  AppSidebar,
  type AppSidebarSection,
} from "@robr0/design-system/components/AppSidebar/AppSidebar";
import { Avatar } from "@robr0/design-system/components/Avatar/Avatar";
import { Badge } from "@robr0/design-system/components/Badge/Badge";
import { Breadcrumb } from "@robr0/design-system/components/Breadcrumb/Breadcrumb";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
} from "@robr0/design-system/components/DataTable/DataTable";
import { Divider } from "@robr0/design-system/components/Divider/Divider";
import {
  Dropdown,
  type DropdownOption,
} from "@robr0/design-system/components/Dropdown/Dropdown";
import { Input } from "@robr0/design-system/components/Input/Input";
import { Kbd } from "@robr0/design-system/components/Kbd/Kbd";
import { Meter } from "@robr0/design-system/components/Meter/Meter";
import { Sparkline } from "@robr0/design-system/components/Sparkline/Sparkline";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import styles from "./SalesPipeline.module.css";

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    items: [
      { key: "companies", icon: "domain", label: "Companies" },
      { key: "deals", icon: "view_kanban", label: "Deals board" },
      { key: "forecast", icon: "query_stats", label: "Forecast" },
      { key: "activities", icon: "bolt", label: "Activities" },
      { key: "contacts", icon: "group", label: "Contacts" },
      { key: "sequences", icon: "mail", label: "Sequences" },
    ],
  },
  {
    items: [
      { key: "support", icon: "headset_mic", label: "Support" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

type Segment = "Strategic" | "Enterprise" | "Mid-market" | "SMB";

type Motion = "new-logo" | "expansion" | "renewal" | "churn-risk";

/* The motion colours are the five status roles doing their day job: a new
   logo is news, expansion is good news, a renewal is steady state, and
   churn risk is a warning. */
const MOTION_META: Record<
  Motion,
  { label: string; variant: "info" | "positive" | "neutral" | "warning" }
> = {
  "new-logo": { label: "New logo", variant: "info" },
  expansion: { label: "Expansion", variant: "positive" },
  renewal: { label: "Renewal", variant: "neutral" },
  "churn-risk": { label: "Churn risk", variant: "warning" },
};

type Direction = "up" | "down" | "flat";

const TREND_TONE: Record<Direction, "positive" | "negative" | "neutral"> = {
  up: "positive",
  down: "negative",
  flat: "neutral",
};

interface Company {
  id: string;
  name: string;
  segment: Segment;
  motion: Motion;
  owner: string;
  /** Open deal count */
  deals: number;
  /** Open pipeline value in dollars */
  pipeline: number;
  /** Win probability, 0 to 100 */
  win: number;
  /** Weekly activity counts, oldest first, drawn as the sparkline */
  trend: number[];
  direction: Direction;
  /** Most recent touch, ISO date — string comparison is date comparison */
  lastTouch: string;
  touchType: string;
}

const COMPANIES: Company[] = [
  {
    id: "pallas",
    name: "Pallas Robotics",
    segment: "Strategic",
    motion: "expansion",
    owner: "Priya Raman",
    deals: 8,
    pipeline: 532000,
    win: 86,
    trend: [3, 4, 4, 6, 5, 7, 8, 9],
    direction: "up",
    lastTouch: "2026-09-12",
    touchType: "Exec review",
  },
  {
    id: "harborlight",
    name: "Harborlight Logistics",
    segment: "Enterprise",
    motion: "new-logo",
    owner: "Cole Bennett",
    deals: 6,
    pipeline: 468000,
    win: 62,
    trend: [1, 2, 2, 4, 3, 5, 6, 7],
    direction: "up",
    lastTouch: "2026-09-09",
    touchType: "Demo",
  },
  {
    id: "tidewater",
    name: "Tidewater Energy",
    segment: "Strategic",
    motion: "renewal",
    owner: "Felix Grant",
    deals: 7,
    pipeline: 412000,
    win: 78,
    trend: [5, 5, 6, 5, 6, 5, 5, 6],
    direction: "flat",
    lastTouch: "2026-09-05",
    touchType: "QBR",
  },
  {
    id: "ostrander",
    name: "Ostrander Group",
    segment: "Enterprise",
    motion: "expansion",
    owner: "Cole Bennett",
    deals: 5,
    pipeline: 387000,
    win: 66,
    trend: [2, 3, 3, 5, 4, 6, 6, 7],
    direction: "up",
    lastTouch: "2026-08-28",
    touchType: "Proposal",
  },
  {
    id: "aurelia",
    name: "Aurelia Health",
    segment: "Enterprise",
    motion: "renewal",
    owner: "Amara Diallo",
    deals: 4,
    pipeline: 356000,
    win: 82,
    trend: [4, 4, 5, 4, 5, 5, 4, 5],
    direction: "flat",
    lastTouch: "2026-09-02",
    touchType: "Renewal terms",
  },
  {
    id: "veldt",
    name: "Veldt Analytics",
    segment: "Mid-market",
    motion: "expansion",
    owner: "Sofia Marchetti",
    deals: 4,
    pipeline: 341000,
    win: 71,
    trend: [2, 3, 4, 4, 5, 6, 7, 8],
    direction: "up",
    lastTouch: "2026-09-11",
    touchType: "Pricing",
  },
  {
    id: "marrowfield",
    name: "Marrowfield Bio",
    segment: "Enterprise",
    motion: "churn-risk",
    owner: "Amara Diallo",
    deals: 3,
    pipeline: 298000,
    win: 24,
    trend: [7, 6, 5, 4, 3, 2, 1, 1],
    direction: "down",
    lastTouch: "2026-07-02",
    touchType: "Support call",
  },
  {
    id: "windrose",
    name: "Windrose Travel",
    segment: "Enterprise",
    motion: "new-logo",
    owner: "Sofia Marchetti",
    deals: 5,
    pipeline: 274000,
    win: 38,
    trend: [5, 4, 4, 3, 3, 2, 2, 1],
    direction: "down",
    lastTouch: "2026-08-14",
    touchType: "Security review",
  },
  {
    id: "novabright",
    name: "Novabright",
    segment: "Mid-market",
    motion: "expansion",
    owner: "Priya Raman",
    deals: 3,
    pipeline: 189000,
    win: 54,
    trend: [1, 1, 2, 3, 3, 4, 5, 5],
    direction: "up",
    lastTouch: "2026-09-10",
    touchType: "Demo",
  },
  {
    id: "quillstone",
    name: "Quillstone",
    segment: "Mid-market",
    motion: "renewal",
    owner: "Amara Diallo",
    deals: 2,
    pipeline: 133000,
    win: 74,
    trend: [3, 3, 4, 3, 4, 4, 3, 4],
    direction: "flat",
    lastTouch: "2026-05-29",
    touchType: "Check-in",
  },
  {
    id: "cloudmere",
    name: "Cloudmere",
    segment: "Mid-market",
    motion: "new-logo",
    owner: "Priya Raman",
    deals: 2,
    pipeline: 121000,
    win: 45,
    trend: [0, 1, 1, 2, 2, 3, 4, 5],
    direction: "up",
    lastTouch: "2026-09-14",
    touchType: "Discovery",
  },
  {
    id: "sable",
    name: "Sable & Sons",
    segment: "SMB",
    motion: "renewal",
    owner: "Cole Bennett",
    deals: 2,
    pipeline: 92000,
    win: 61,
    trend: [2, 2, 3, 2, 3, 3, 2, 3],
    direction: "flat",
    lastTouch: "2026-08-21",
    touchType: "Check-in",
  },
  {
    id: "fenwick",
    name: "Fenwick Studios",
    segment: "SMB",
    motion: "new-logo",
    owner: "Sofia Marchetti",
    deals: 2,
    pipeline: 64000,
    win: 58,
    trend: [1, 2, 2, 3, 3, 4, 4, 5],
    direction: "up",
    lastTouch: "2026-09-08",
    touchType: "Pilot check-in",
  },
  {
    id: "kestrel",
    name: "Kestrel Freight",
    segment: "SMB",
    motion: "churn-risk",
    owner: "Felix Grant",
    deals: 1,
    pipeline: 48000,
    win: 19,
    trend: [4, 4, 3, 2, 2, 1, 1, 0],
    direction: "down",
    lastTouch: "2026-06-20",
    touchType: "Billing",
  },
  {
    id: "copperline",
    name: "Copperline Manufacturing",
    segment: "Strategic",
    motion: "expansion",
    owner: "Amara Diallo",
    deals: 6,
    pipeline: 455000,
    win: 74,
    trend: [3, 4, 5, 5, 6, 6, 7, 8],
    direction: "up",
    lastTouch: "2026-09-13",
    touchType: "Pricing",
  },
  {
    id: "vantalux",
    name: "Vantalux",
    segment: "Enterprise",
    motion: "new-logo",
    owner: "Cole Bennett",
    deals: 4,
    pipeline: 329000,
    win: 35,
    trend: [4, 4, 3, 3, 2, 2, 1, 1],
    direction: "down",
    lastTouch: "2026-08-08",
    touchType: "Security review",
  },
  {
    id: "bellwether",
    name: "Bellwether Insurance",
    segment: "Enterprise",
    motion: "renewal",
    owner: "Felix Grant",
    deals: 5,
    pipeline: 310000,
    win: 68,
    trend: [5, 4, 5, 5, 4, 5, 5, 4],
    direction: "flat",
    lastTouch: "2026-09-07",
    touchType: "QBR",
  },
  {
    id: "stratus",
    name: "Stratus Mining",
    segment: "Enterprise",
    motion: "churn-risk",
    owner: "Felix Grant",
    deals: 2,
    pipeline: 205000,
    win: 21,
    trend: [6, 5, 5, 4, 3, 2, 2, 1],
    direction: "down",
    lastTouch: "2026-07-18",
    touchType: "Support call",
  },
  {
    id: "orchard",
    name: "Orchard Grocers",
    segment: "Mid-market",
    motion: "expansion",
    owner: "Sofia Marchetti",
    deals: 3,
    pipeline: 176000,
    win: 57,
    trend: [2, 2, 3, 3, 4, 4, 5, 6],
    direction: "up",
    lastTouch: "2026-09-06",
    touchType: "Proposal",
  },
  {
    id: "halewood",
    name: "Halewood Media",
    segment: "Mid-market",
    motion: "renewal",
    owner: "Cole Bennett",
    deals: 3,
    pipeline: 147000,
    win: 63,
    trend: [3, 4, 3, 4, 3, 4, 3, 4],
    direction: "flat",
    lastTouch: "2026-08-25",
    touchType: "Check-in",
  },
  {
    id: "caldera",
    name: "Caldera Systems",
    segment: "Mid-market",
    motion: "new-logo",
    owner: "Sofia Marchetti",
    deals: 2,
    pipeline: 102000,
    win: 48,
    trend: [1, 1, 2, 2, 3, 3, 4, 4],
    direction: "up",
    lastTouch: "2026-06-30",
    touchType: "Discovery",
  },
  {
    id: "pinebrook",
    name: "Pinebrook Schools",
    segment: "SMB",
    motion: "renewal",
    owner: "Amara Diallo",
    deals: 2,
    pipeline: 71000,
    win: 77,
    trend: [2, 3, 2, 3, 3, 2, 3, 3],
    direction: "flat",
    lastTouch: "2026-08-19",
    touchType: "Renewal terms",
  },
  {
    id: "redgate",
    name: "Redgate Brewing",
    segment: "SMB",
    motion: "expansion",
    owner: "Priya Raman",
    deals: 2,
    pipeline: 58000,
    win: 64,
    trend: [1, 2, 2, 3, 3, 4, 4, 5],
    direction: "up",
    lastTouch: "2026-09-03",
    touchType: "Demo",
  },
  {
    id: "juniper",
    name: "Juniper & Finch",
    segment: "SMB",
    motion: "new-logo",
    owner: "Priya Raman",
    deals: 1,
    pipeline: 38000,
    win: 41,
    trend: [0, 1, 1, 2, 2, 3, 3, 4],
    direction: "up",
    lastTouch: "2026-09-04",
    touchType: "Demo",
  },
];

const COMPANY_BY_ID = new Map(COMPANIES.map((c) => [c.id, c]));

const OWNERS = ["Priya Raman", "Cole Bennett", "Sofia Marchetti", "Amara Diallo", "Felix Grant"];

/* The activity windows are pinned dates, not clock arithmetic: lastTouch is
   an ISO string, so "inside the window" is one string comparison the server
   and the client always agree on. */
const WINDOWS = [
  { value: "30", label: "Last 30 days", since: "2026-08-16" },
  { value: "90", label: "Last 90 days", since: "2026-06-17" },
  { value: "all", label: "All time", since: "" },
];

/* The toolbar's three selects share one option shape, the marketing
   dashboard's RangeSelect convention. */
const WINDOW_OPTIONS: DropdownOption[] = WINDOWS.map(({ value, label }) => ({
  value,
  label,
}));

const OWNER_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All owners" },
  ...OWNERS.map((o) => ({ value: o, label: o })),
];

const MOTION_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All motions" },
  ...(Object.keys(MOTION_META) as Motion[]).map((m) => ({
    value: m,
    label: MOTION_META[m].label,
  })),
];

const CHAT_SUGGESTIONS = [
  { id: "risk", label: "Where's the churn risk?" },
  { id: "owner", label: "Who owns the most pipeline?" },
  { id: "week", label: "What moved this week?" },
];

const CHAT_REPLIES: Record<string, string> = {
  risk: "Three accounts are flagged as churn risk. Marrowfield Bio holds $298,000 but has been silent since a support call on Jul 2, with win probability down to 24%. Stratus Mining sits at $205,000, quiet since Jul 18. Kestrel Freight is smaller at $48,000, last touched about billing on Jun 20. All three need a call before renewal season.",
  owner:
    "Cole Bennett carries the most open pipeline: $1,423,000 across five accounts, led by Harborlight Logistics at $468,000 and Ostrander Group at $387,000. Amara Diallo is next at $1,313,000, with the Copperline Manufacturing expansion the largest piece.",
  week: "The freshest touches are Cloudmere's discovery call on Sep 14, Copperline Manufacturing pricing on Sep 13, and the Pallas Robotics exec review on Sep 12. Pallas is still the one to watch: eight open deals, $532,000 in play, and win probability at 86%.",
};

const CHAT_FALLBACK =
  "This assistant is a mock, so only the suggested questions have real answers. In the live product this reply would come from the book of business behind this screen.";

/* ------------------------------------------------------------- helpers */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-09-12" → "Sep 12", formatted by hand so the server and the client
 *  can never disagree over a locale. */
function formatDay(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

/** 532000 → "$532,000" without touching the runtime locale. */
function formatMoney(value: number): string {
  return `$${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/** Threshold the Meter's status colour: strong, workable, or long odds. */
function winVariant(win: number): "positive" | "info" | "warning" {
  if (win >= 70) return "positive";
  if (win >= 40) return "info";
  return "warning";
}

/* ---------------------------------------------------------------- page */

export default function SalesPipeline() {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [activityWindow, setActivityWindow] = React.useState("90");
  const [ownerFilter, setOwnerFilter] = React.useState("all");
  const [motionFilter, setMotionFilter] = React.useState("all");

  const activeWindow = WINDOWS.find((w) => w.value === activityWindow) ?? WINDOWS[1];

  const visible = COMPANIES.filter(
    (c) =>
      c.lastTouch >= activeWindow.since &&
      (ownerFilter === "all" || c.owner === ownerFilter) &&
      (motionFilter === "all" || c.motion === motionFilter),
  );

  const columns: DataTableColumn[] = [
    {
      key: "company",
      header: "Company",
      sortable: true,
      width: "240px",
      render: (row: DataTableRow) => {
        const c = COMPANY_BY_ID.get(row.id)!;
        return (
          <span className={styles.companyCell}>
            <span className={styles.companyName}>{c.name}</span>
            <span className={styles.companySegment}>{c.segment}</span>
          </span>
        );
      },
    },
    {
      key: "motion",
      header: "Motion",
      sortable: true,
      render: (row: DataTableRow) => {
        const c = COMPANY_BY_ID.get(row.id)!;
        return (
          <Badge
            variant={MOTION_META[c.motion].variant}
            label={MOTION_META[c.motion].label}
          />
        );
      },
    },
    {
      key: "owner",
      header: "Owner",
      sortable: true,
      render: (row: DataTableRow) => {
        const c = COMPANY_BY_ID.get(row.id)!;
        return (
          <span className={styles.ownerCell}>
            <Avatar name={c.owner} size="sm" />
            <span className={styles.ownerName}>{c.owner}</span>
          </span>
        );
      },
    },
    {
      key: "pipeline",
      header: "Pipeline",
      sortable: true,
      align: "right",
      render: (row: DataTableRow) => {
        const c = COMPANY_BY_ID.get(row.id)!;
        return (
          <span className={styles.pipelineCell}>
            <span className={styles.pipelineValue}>{formatMoney(c.pipeline)}</span>
            <span className={styles.pipelineDeals}>
              {c.deals} open deal{c.deals === 1 ? "" : "s"}
            </span>
          </span>
        );
      },
    },
    {
      key: "win",
      header: "Win probability",
      sortable: true,
      width: "170px",
      render: (row: DataTableRow) => {
        const c = COMPANY_BY_ID.get(row.id)!;
        return (
          <span className={styles.winCell}>
            <Meter
              value={c.win}
              size="compact"
              variant={winVariant(c.win)}
              className={styles.winMeter}
              aria-label={`${c.name} win probability`}
            />
            <span className={styles.winValue}>{c.win}%</span>
          </span>
        );
      },
    },
    {
      key: "trend",
      header: "Trend",
      render: (row: DataTableRow) => {
        const c = COMPANY_BY_ID.get(row.id)!;
        return (
          <Sparkline
            data={c.trend}
            variant="area"
            tone={TREND_TONE[c.direction]}
            showDot
            width={80}
            height={28}
            label={`${c.name} activity, trending ${c.direction}`}
          />
        );
      },
    },
    {
      key: "touch",
      header: "Last touch",
      sortable: true,
      render: (row: DataTableRow) => {
        const c = COMPANY_BY_ID.get(row.id)!;
        return (
          <span className={styles.touchCell}>
            <span className={styles.touchDate}>{formatDay(c.lastTouch)}</span>
            <span className={styles.touchType}>{c.touchType}</span>
          </span>
        );
      },
    },
  ];

  const rows: DataTableRow[] = visible.map((c) => ({
    id: c.id,
    values: {
      /* Segment rides in the company value so search matches it too. */
      company: `${c.name} ${c.segment}`,
      motion: MOTION_META[c.motion].label,
      owner: c.owner,
      pipeline: c.pipeline,
      win: c.win,
      trend: null,
      touch: c.lastTouch,
    },
  }));

  return (
    // data-bg-hidden: the pipeline sits on the flat page colour, the same
    // switch the other templates use.
    <div className={styles.shell} data-bg-hidden="">
      <div className={styles.sidebar}>
        <AppSidebar
          sections={NAV_SECTIONS}
          profile={{ name: "Priya Raman", email: "priya@meridianhq.com" }}
          activeKey="companies"
          expanded={sidebarExpanded}
          onExpandedChange={setSidebarExpanded}
          logoText="Meridian"
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
                placeholder="Search Meridian"
                iconLeft="search"
                aria-label="Search Meridian"
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
          <Divider spacing="none" />

          {/* --------------------------------------------- page head */}
          <header className={styles.pageHead}>
            <div>
              <Breadcrumb
                items={[
                  { label: "Meridian", href: "#" },
                  { label: "Sales", href: "#" },
                  { label: "Companies" },
                ]}
              />
              <h1 className={styles.title}>Companies</h1>
            </div>
            <div className={styles.headActions}>
              <Button
                variant="secondary"
                size="compact"
                label="Export"
                iconLeft="download"
              />
              <Button
                variant="primary"
                size="compact"
                label="New company"
                iconLeft="add"
              />
            </div>
          </header>

          {/* ----------------------------------------- table section */}
          {/* The table is the whole page below the head, sitting directly
              on it — the DataTable brings its own bordered chrome, so a
              panel around it would double-box it (the marketing dashboard's
              campaigns section set the idiom). */}
          <section className={styles.tableSection} aria-label="Companies in the pipeline">
            <DataTable
              columns={columns}
              rows={rows}
              selectable
              defaultSort={{ key: "pipeline", direction: "desc" }}
              searchable
              searchPlaceholder="Search companies"
              caption="Companies in the pipeline"
              toolbar={
                <div className={styles.tableFilters}>
                  <Dropdown
                    size="compact"
                    options={WINDOW_OPTIONS}
                    value={activityWindow}
                    onValueChange={setActivityWindow}
                    aria-label="Activity window"
                    className={styles.filterSelect}
                  />
                  <Dropdown
                    size="compact"
                    options={OWNER_OPTIONS}
                    value={ownerFilter}
                    onValueChange={setOwnerFilter}
                    aria-label="Filter by owner"
                    className={styles.filterSelect}
                  />
                  <Dropdown
                    size="compact"
                    options={MOTION_OPTIONS}
                    value={motionFilter}
                    onValueChange={setMotionFilter}
                    aria-label="Filter by motion"
                    className={styles.filterSelect}
                  />
                </div>
              }
            />
          </section>
        </div>
      </main>

      <TemplateAssistant
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Meridian AI"
        askLine="Ask about churn risk, an owner's book, or the week's activity"
        suggestions={CHAT_SUGGESTIONS}
        replies={CHAT_REPLIES}
        fallback={CHAT_FALLBACK}
        disclaimer="A mock assistant with canned answers over this pipeline."
      />
    </div>
  );
}
