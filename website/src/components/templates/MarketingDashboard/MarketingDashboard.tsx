"use client";

/**
 * The marketing dashboard template: an analytics app shell with KPI tiles,
 * funnel, channel breakdowns, trend charts, and a campaign table, built from
 * the design system alone. Every colour, radius, space, and type style is a
 * semantic token; every control is a library component. The one sanctioned
 * departure is content, not chrome: the campaign table's publisher marks wear
 * their real brand colours, the way the case-study cover redraws carry the
 * products they depict.
 *
 * Two routes render it: /templates/marketing-dashboard (the public template)
 * and /labs/marketing (where it began, as a fidelity pressure test against a
 * reference product — a shortfall there is a finding about the system, not
 * this page). All data is fictional, so both routes are excluded from the
 * chat corpus (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import React from "react";
import { AiButton } from "@robr0/design-system/components/AiButton/AiButton";
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
  type DataTableRow,
} from "@robr0/design-system/components/DataTable/DataTable";
import {
  Dropdown,
  type DropdownOption,
} from "@robr0/design-system/components/Dropdown/Dropdown";
import { Divider } from "@robr0/design-system/components/Divider/Divider";
import { EmptyState } from "@robr0/design-system/components/EmptyState/EmptyState";
import { FunnelChart } from "@robr0/design-system/components/FunnelChart/FunnelChart";
import { Input } from "@robr0/design-system/components/Input/Input";
import { Kbd } from "@robr0/design-system/components/Kbd/Kbd";
import { LegendTile } from "@robr0/design-system/components/LegendTile/LegendTile";
import { ProgressBar } from "@robr0/design-system/components/ProgressBar/ProgressBar";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { Stat } from "@robr0/design-system/components/Stat/Stat";
import { Tabs } from "@robr0/design-system/components/Tabs/Tabs";
import { AreaChart, ComboChart, RadialChart } from "@robr0/design-system/charts";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import styles from "./MarketingDashboard.module.css";

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    items: [
      { key: "home", icon: "home", label: "Home", badge: 152 },
      { key: "marketing", icon: "campaign", label: "Marketing" },
      { key: "calendar", icon: "calendar_month", label: "Calendar" },
      { key: "projects", icon: "folder", label: "Projects" },
      { key: "reports", icon: "monitoring", label: "Reports" },
      { key: "profile", icon: "person", label: "Profile" },
      { key: "inbox", icon: "inbox", label: "Inbox", badge: 91 },
    ],
  },
  {
    items: [
      { key: "support", icon: "headset_mic", label: "Support" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

const KPIS = [
  {
    icon: "payments",
    value: "$24,380",
    label: "Ad spend",
    delta: "+8.4%",
    trend: "up" as const,
  },
  {
    icon: "visibility",
    value: "1.94M",
    label: "Impressions",
    delta: "+12.6%",
    trend: "up" as const,
  },
  {
    icon: "conversion_path",
    value: "1,286",
    label: "Conversions",
    delta: "+5.2%",
    trend: "up" as const,
  },
  {
    icon: "ads_click",
    value: "$1.24",
    label: "Cost per click",
    delta: "-3.1%",
    trend: "down" as const,
  },
];

const FUNNEL = [
  { key: "visits", label: "Visits", value: "96.4K", pct: 100 },
  { key: "signups", label: "Sign-ups", value: "38.6K", pct: 40 },
  { key: "trials", label: "Trials", value: "14.1K", pct: 15 },
  { key: "customers", label: "Customers", value: "5.2K", pct: 5 },
];

/* Ring values are the share of total spend; dollar figures sum to $24,880. */
const SPEND_BY_CHANNEL = [
  { name: "Paid search", value: 46, amount: "$11,400" },
  { name: "Paid social", value: 31, amount: "$7,620" },
  { name: "Email", value: 13, amount: "$3,180" },
  { name: "Affiliates", value: 11, amount: "$2,680" },
];

const CHANNEL_SHARE = [
  { name: "Google Ads", icon: "search", pct: 39 },
  { name: "Meta", icon: "groups", pct: 25 },
  { name: "X Ads", icon: "tag", pct: 14 },
  { name: "LinkedIn", icon: "work", pct: 8 },
  { name: "Email", icon: "mail", pct: 7 },
  { name: "Affiliates", icon: "handshake", pct: 7 },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/* Monthly ad spend in $K; sums to the $217.7K total shown in the legend.
   ROAS rides the combo chart's second axis and averages the legend's 3.6x. */
const ROAS = [3.0, 3.1, 3.3, 3.2, 3.4, 3.5, 3.6, 3.7, 3.8, 4.0, 4.1, 4.3];
const AD_SPEND = [
  10.2, 11.8, 13.1, 12.6, 15.4, 16.9, 17.8, 19.2, 20.7, 22.6, 26.3, 31.1,
].map((spend, i) => ({ month: MONTHS[i], spend, roas: ROAS[i] }));

/* Monthly visitors in K; each series sums to its legend total. */
const ORGANIC = [4.9, 5.2, 5.6, 5.4, 5.9, 6.3, 6.1, 6.6, 7.0, 6.8, 7.3, 7.4];
const PAID = [2.4, 2.6, 2.9, 2.8, 3.1, 3.3, 3.2, 3.4, 3.6, 3.5, 3.8, 3.9];
const SOCIAL = [1.3, 1.4, 1.6, 1.5, 1.7, 1.8, 1.7, 1.9, 2.0, 1.9, 2.1, 2.5];
const VISITORS = MONTHS.map((month, i) => ({
  month,
  organic: ORGANIC[i],
  paid: PAID[i],
  social: SOCIAL[i],
}));

const CHANNEL_GLYPH: Record<string, string> = {
  google: "search",
  meta: "groups",
  x: "tag",
  linkedin: "work",
  email: "mail",
  web: "language",
};

/* The ad publishers get their real marks in brand colour (an inherently
   off-token exception, like the case-study cover redraws); X rides
   currentColor because its mark is monochrome by design, and non-publisher
   channels keep system icons. */
const PUBLISHER_MARKS: Record<
  string,
  { viewBox: string; paths: { d: string; fill?: string }[] }
> = {
  google: {
    viewBox: "0 0 48 48",
    paths: [
      {
        fill: "#EA4335",
        d: "M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z",
      },
      {
        fill: "#4285F4",
        d: "M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z",
      },
      {
        fill: "#FBBC05",
        d: "M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z",
      },
      {
        fill: "#34A853",
        d: "M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z",
      },
    ],
  },
  meta: {
    viewBox: "0 0 16 16",
    paths: [
      {
        fill: "#0081FB",
        d: "M8.217 5.243C9.145 3.988 10.171 3 11.483 3 13.96 3 16 6.153 16.001 9.907c0 2.29-.986 3.725-2.757 3.725-1.543 0-2.395-.866-3.924-3.424l-.667-1.123a123 123 0 0 0-.648-1.074l-1.178 2.08c-1.673 2.925-2.615 3.541-3.923 3.541C1.086 13.632 0 12.217 0 9.973 0 6.388 1.995 3 4.598 3q.477-.001.924.122c.31.086.611.22.913.407.577.359 1.154.915 1.782 1.714m1.516 2.224q.378.61.788 1.316l.523.882c.936 1.587 1.313 1.918 1.9 1.918.586 0 .87-.482.87-1.42 0-2.834-1.253-5.02-2.35-5.02-.579 0-1.09.412-1.731 1.324m-4.855-1.14c-1.204 0-2.24 2.098-2.24 4.288 0 1.101.353 1.735 1.06 1.735.68 0 1.096-.417 2.278-2.4l.943-1.585c-.928-1.417-1.399-2.038-2.041-2.038",
      },
    ],
  },
  x: {
    viewBox: "0 0 16 16",
    paths: [
      {
        d: "M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z",
      },
    ],
  },
  linkedin: {
    viewBox: "0 0 16 16",
    paths: [
      {
        fill: "#0A66C2",
        d: "M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z",
      },
    ],
  },
};

function ChannelMark({ channel }: { channel: string }) {
  const mark = PUBLISHER_MARKS[channel];
  if (!mark) {
    return (
      <span className="material-symbols-rounded">
        {CHANNEL_GLYPH[channel]}
      </span>
    );
  }
  return (
    <svg
      viewBox={mark.viewBox}
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      {mark.paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} />
      ))}
    </svg>
  );
}

/* The middle analytics row is parked while the table carries the page —
   flip this to bring the funnel, spend ring, and channel tabs back. */
const SHOW_MID_ROW = false;

/* The workspace assistant is a mock: canned answers over the page's own
   numbers, rendered by the shared TemplateAssistant panel — the same
   entry-point-and-docked-panel pattern as the site chat. */
const CHAT_SUGGESTIONS = [
  { id: "cpc", label: "Why did cost per click fall?" },
  { id: "month", label: "Summarise this month" },
  { id: "channel", label: "Which channel converts best?" },
];

const CHAT_REPLIES: Record<string, string> = {
  cpc: "Cost per click fell 3.1% to $1.24 because spend shifted toward Paid search, which is winning cheaper auctions. Google Ads now carries 39% of traffic at the lowest cost per conversion on the account.",
  month: "Ad spend is $24,380, up 8.4%, and impressions grew 12.6% to 1.94M. Conversions rose 5.2% to 1,286 while cost per click fell 3.1%: more volume for slightly less money per click.",
  channel: "Paid search converts best: 46% of spend and the largest share of the 1,286 conversions. Meta is second on volume, but its cost per conversion runs about a third higher.",
};

const CHAT_FALLBACK =
  "This assistant is a mock — in the real product this answer would come from your campaign data. Try one of the suggested questions for a canned tour.";

const OBJECTIVE_VARIANT: Record<
  string,
  "info" | "positive" | "warning" | "error" | "neutral"
> = {
  Awareness: "info",
  Traffic: "neutral",
  Conversions: "positive",
  Leads: "warning",
  Retargeting: "error",
};

type Campaign = {
  id: string;
  name: string;
  market: string;
  channel: string;
  delivery: string;
  objective: string;
  updated: string;
  spend: number;
};

const CAMPAIGNS: Campaign[] = [
  { id: "c01", name: "Founder story video", market: "Global", channel: "web", delivery: "active", objective: "Awareness", updated: "2026-07-22", spend: 34800 },
  { id: "c02", name: "Holiday gift guide", market: "Global", channel: "meta", delivery: "paused", objective: "Traffic", updated: "2026-06-16", spend: 30884 },
  { id: "c03", name: "Founder story video", market: "US", channel: "linkedin", delivery: "active", objective: "Conversions", updated: "2026-08-24", spend: 1330 },
  { id: "c04", name: "Newsletter promo", market: "EU", channel: "web", delivery: "paused", objective: "Leads", updated: "2026-08-08", spend: 34445 },
  { id: "c05", name: "Spring launch", market: "UK", channel: "web", delivery: "draft", objective: "Awareness", updated: "2026-04-04", spend: 0 },
  { id: "c06", name: "Brand search", market: "US", channel: "google", delivery: "paused", objective: "Leads", updated: "2026-03-23", spend: 19116 },
  { id: "c07", name: "Cart retargeting", market: "UK", channel: "web", delivery: "draft", objective: "Awareness", updated: "2026-08-21", spend: 0 },
  { id: "c08", name: "Newsletter promo", market: "US", channel: "meta", delivery: "active", objective: "Awareness", updated: "2026-07-24", spend: 28095 },
  { id: "c09", name: "Webinar signups", market: "UK", channel: "x", delivery: "active", objective: "Awareness", updated: "2026-03-08", spend: 25305 },
  { id: "c10", name: "Case study promo", market: "UK", channel: "google", delivery: "active", objective: "Retargeting", updated: "2026-03-01", spend: 333 },
  { id: "c11", name: "Partner co-marketing", market: "Global", channel: "linkedin", delivery: "active", objective: "Leads", updated: "2026-08-12", spend: 12480 },
  { id: "c12", name: "Free tier launch", market: "US", channel: "google", delivery: "active", objective: "Conversions", updated: "2026-08-19", spend: 22940 },
  { id: "c13", name: "Docs search ads", market: "Global", channel: "google", delivery: "paused", objective: "Traffic", updated: "2026-05-30", spend: 8615 },
  { id: "c14", name: "Churn winback email", market: "EU", channel: "email", delivery: "active", objective: "Retargeting", updated: "2026-08-02", spend: 2210 },
  { id: "c15", name: "Product tour video", market: "US", channel: "meta", delivery: "draft", objective: "Awareness", updated: "2026-07-15", spend: 0 },
  { id: "c16", name: "Annual report teaser", market: "Global", channel: "x", delivery: "paused", objective: "Traffic", updated: "2026-02-11", spend: 5720 },
];

const DELIVERY_OPTIONS: DropdownOption[] = [
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Draft", value: "draft" },
  { label: "Completed", value: "completed" },
];

const MONTH_NAMES: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May",
  "06": "Jun", "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct",
  "11": "Nov", "12": "Dec",
};

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${MONTH_NAMES[month]} ${Number(day)}, ${year}`;
}

/* ------------------------------------------------------------- helpers */

/** A compact select that keeps its own value, for the per-panel ranges. */
function RangeSelect({
  options,
  initial,
  label,
}: {
  options: DropdownOption[];
  initial: string;
  label: string;
}) {
  const [value, setValue] = React.useState(initial);
  return (
    <Dropdown
      size="compact"
      options={options}
      value={value}
      onValueChange={setValue}
      aria-label={label}
      className={styles.rangeSelect}
    />
  );
}

const RANGE_30 = [
  { label: "Last 30 days", value: "30d" },
  { label: "Last quarter", value: "quarter" },
  { label: "This year", value: "year" },
];
const RANGE_YEAR = [
  { label: "This year", value: "year" },
  { label: "Last year", value: "last-year" },
  { label: "All time", value: "all" },
];

/** The chart palette token for a 1-based series slot. */
function seriesSwatch(series: number): string {
  return `var(--color-chart-series-${series})`;
}

/* ---------------------------------------------------------------- page */

export default function MarketingDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const [channelTab, setChannelTab] = React.useState("channels");
  const [chatOpen, setChatOpen] = React.useState(false);

  const [delivery, setDelivery] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(CAMPAIGNS.map((c) => [c.id, c.delivery]))
  );

  const columns: DataTableColumn[] = [
    {
      key: "name",
      header: "Campaign",
      sortable: true,
      width: "260px",
      render: (row: DataTableRow) => (
        <span className={styles.campaignCell}>
          <span className={styles.glyphChip} aria-hidden="true">
            <ChannelMark channel={String(row.values.channel)} />
          </span>
          <span className={styles.campaignText}>
            <span className={styles.campaignName}>{row.values.name}</span>
            <span className={styles.campaignMarket}>{row.values.market}</span>
          </span>
        </span>
      ),
    },
    {
      key: "delivery",
      header: "Delivery",
      width: "160px",
      render: (row: DataTableRow) => (
        <Dropdown
          size="compact"
          options={DELIVERY_OPTIONS}
          value={delivery[row.id]}
          onValueChange={(value) =>
            setDelivery((current) => ({ ...current, [row.id]: value }))
          }
          aria-label={`Delivery state for ${row.values.name}`}
          className={styles.deliverySelect}
        />
      ),
    },
    {
      key: "objective",
      header: "Objective",
      sortable: true,
      render: (row: DataTableRow) => (
        <Badge
          variant={OBJECTIVE_VARIANT[String(row.values.objective)] ?? "neutral"}
          label={String(row.values.objective)}
        />
      ),
    },
    {
      key: "updated",
      header: "Last updated",
      sortable: true,
      render: (row: DataTableRow) => (
        <span className={styles.dateCell}>
          {formatDate(String(row.values.updated))}
        </span>
      ),
    },
    {
      key: "spend",
      header: "Spend",
      sortable: true,
      align: "right",
      render: (row: DataTableRow) =>
        `$${Number(row.values.spend).toLocaleString("en-US")}`,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row: DataTableRow) => (
        <span className={styles.rowActions}>
          <CircularButton
            icon="delete"
            variant="tertiary"
            size="compact"
            ariaLabel={`Delete ${row.values.name}`}
          />
          <CircularButton
            icon="edit"
            variant="tertiary"
            size="compact"
            ariaLabel={`Edit ${row.values.name}`}
          />
          <CircularButton
            icon="more_vert"
            variant="tertiary"
            size="compact"
            ariaLabel={`More actions for ${row.values.name}`}
          />
        </span>
      ),
    },
  ];

  const rows: DataTableRow[] = CAMPAIGNS.map((c) => ({
    id: c.id,
    values: {
      name: c.name,
      market: c.market,
      channel: c.channel,
      delivery: c.delivery,
      objective: c.objective,
      updated: c.updated,
      spend: c.spend,
    },
  }));

  return (
    // data-bg-hidden is the layout's own switch for the ambient background
    // (the dotted stages' HiddenBackground marker reads the same way): the
    // dashboard sits on the flat page colour, no gradient.
    <div className={styles.shell} data-bg-hidden="">
      <div className={styles.sidebar}>
        <AppSidebar
          sections={NAV_SECTIONS}
          profile={{
            name: "Mara Esmer",
            email: "mara@boardline.app",
            avatarUrl: "/labs/marketing-avatar.png",
          }}
          activeKey="marketing"
          expanded={sidebarExpanded}
          onExpandedChange={setSidebarExpanded}
          logoText="Boardline"
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
              placeholder="Search campaigns"
              iconLeft="search"
              aria-label="Search campaigns"
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
        <header className={styles.pageHead}>
          <div>
            <Breadcrumb
              items={[
                { label: "Boardline", href: "#" },
                { label: "Team space", href: "#" },
                { label: "Marketing" },
              ]}
            />
            <h1 className={styles.title}>Marketing</h1>
          </div>
          <div className={styles.headActions}>
            <Button
              variant="secondary"
              size="compact"
              label="Filters"
              iconLeft="filter_list"
            />
            <Button
              variant="primary"
              size="compact"
              label="New campaign"
              iconLeft="add"
            />
          </div>
        </header>

        <div className={styles.kpiGrid}>
          {KPIS.map((kpi) => (
            <div key={kpi.label} className={styles.kpi}>
              <span className={styles.kpiIcon} aria-hidden="true">
                <span className="material-symbols-rounded">{kpi.icon}</span>
              </span>
              <Stat
                value={kpi.value}
                label={kpi.label}
                delta={kpi.delta}
                trend={kpi.trend}
                deltaPlacement="inline"
              />
            </div>
          ))}
        </div>

        {SHOW_MID_ROW && (
        <div className={styles.midGrid}>
          <section className={styles.panel} aria-label="Acquisition funnel">
            <header className={styles.panelHead}>
              <Stat
                value="96.4K"
                label="Acquisition funnel"
                delta="+5.8%"
                trend="up"
                deltaPlacement="inline"
              />
              <RangeSelect
                options={RANGE_30}
                initial="30d"
                label="Acquisition funnel date range"
              />
            </header>
            <FunnelChart
              bare
              showLabels={false}
              data={FUNNEL.map((stage) => ({
                label: stage.label,
                value: stage.pct,
                displayValue: stage.value,
              }))}
              height={190}
            />
            <div className={styles.legendRow}>
              {FUNNEL.map((stage, i) => (
                <LegendTile
                  key={stage.key}
                  swatch={seriesSwatch(i + 1)}
                  label={stage.label}
                  value={stage.value}
                />
              ))}
            </div>
          </section>

          <section className={styles.panel} aria-label="Spend by channel">
            <header className={styles.panelHead}>
              <Stat
                value="$24,880"
                label="Spend by channel"
                delta="+8.4%"
                trend="up"
                deltaPlacement="inline"
              />
              <RangeSelect
                options={RANGE_30}
                initial="30d"
                label="Spend by channel date range"
              />
            </header>
            <RadialChart
              data={SPEND_BY_CHANNEL.map(({ name, value }) => ({
                name,
                value,
              }))}
              maxValue={100}
              height={220}
              innerRadius={40}
              outerRadius={92}
              showLegend={false}
              bare
              centerLabel="46%"
              centerSublabel="Paid search"
              className={styles.radial}
            />
            <div className={styles.legendRow}>
              {SPEND_BY_CHANNEL.map((channel, i) => (
                <LegendTile
                  key={channel.name}
                  swatch={seriesSwatch(i + 1)}
                  label={channel.name}
                  value={channel.amount}
                />
              ))}
            </div>
          </section>

          <section className={styles.panel} aria-label="Traffic sources">
            <Tabs
              tabs={[
                { value: "channels", label: "Channels" },
                { value: "campaigns", label: "Campaigns" },
                { value: "landing", label: "Landing pages" },
              ]}
              activeTab={channelTab}
              onTabChange={setChannelTab}
              size="compact"
              ariaLabel="Traffic source breakdowns"
            />
            {channelTab === "channels" ? (
              <div className={styles.channelList}>
                {CHANNEL_SHARE.map((channel) => (
                  <div key={channel.name} className={styles.channelRow}>
                    <div className={styles.channelMeta}>
                      <span className={styles.channelName}>
                        <span
                          className={`material-symbols-rounded ${styles.channelGlyph}`}
                          aria-hidden="true"
                        >
                          {channel.icon}
                        </span>
                        {channel.name}
                      </span>
                      <span className={styles.channelPct}>{channel.pct}%</span>
                    </div>
                    <ProgressBar
                      value={channel.pct}
                      size="compact"
                      ariaLabel={`${channel.name} share of spend`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="query_stats"
                title="Not in this test"
                description="Only the channels view is rebuilt on this page."
                size="compact"
              />
            )}
          </section>
        </div>
        )}

        <div className={styles.chartsGrid}>
          <section className={styles.panel} aria-label="Ad spend by month">
            <header className={styles.panelHead}>
              <Stat
                value="$217.7K"
                label="Ad spend"
                delta="+9.4%"
                trend="up"
                deltaPlacement="inline"
              />
              <RangeSelect
                options={RANGE_YEAR}
                initial="year"
                label="Ad spend date range"
              />
            </header>
            <ComboChart
              data={AD_SPEND}
              xKey="month"
              barKey="spend"
              barLabel="Ad spend ($K)"
              lineKey="roas"
              lineLabel="ROAS"
              height={260}
              bare
            />
            <div className={styles.legendRow}>
              <LegendTile
                swatch={seriesSwatch(1)}
                label="Ad spend, total"
                value="$217.7K"
              />
              <LegendTile
                swatch={seriesSwatch(2)}
                label="ROAS, average"
                value="3.6x"
              />
            </div>
          </section>

          <section className={styles.panel} aria-label="Visitors by month">
            <header className={styles.panelHead}>
              <Stat
                value="134,400"
                label="Visitors"
                delta="+8.8%"
                trend="up"
                deltaPlacement="inline"
              />
              <RangeSelect
                options={RANGE_YEAR}
                initial="year"
                label="Visitors date range"
              />
            </header>
            <AreaChart
              data={VISITORS}
              xKey="month"
              stacked
              series={[
                { dataKey: "organic", label: "Organic" },
                { dataKey: "paid", label: "Paid" },
                { dataKey: "social", label: "Social" },
              ]}
              height={260}
              showLegend={false}
              bare
            />
            <div className={styles.legendRow}>
              <LegendTile swatch={seriesSwatch(1)} label="Organic" value="74,500" />
              <LegendTile swatch={seriesSwatch(2)} label="Paid" value="38,500" />
              <LegendTile swatch={seriesSwatch(3)} label="Social" value="21,400" />
            </div>
          </section>
        </div>

        <section className={styles.tableSection} aria-label="Campaigns">
          <SectionTitle
            title="Campaigns"
            trailing={`${CAMPAIGNS.length} campaigns`}
            divider={false}
          />
          <DataTable
            columns={columns}
            rows={rows}
            caption="Campaigns"
            searchable
            searchPlaceholder="Search campaigns"
            selectable
            pageSize={16}
            defaultSort={{ key: "updated", direction: "desc" }}
            toolbar={
              <div className={styles.tableFilters}>
                <RangeSelect
                  options={[
                    { label: "All channels", value: "all" },
                    { label: "Google Ads", value: "google" },
                    { label: "Meta", value: "meta" },
                    { label: "LinkedIn", value: "linkedin" },
                  ]}
                  initial="all"
                  label="Filter by channel"
                />
                <RangeSelect
                  options={[
                    { label: "All objectives", value: "all" },
                    { label: "Awareness", value: "awareness" },
                    { label: "Conversions", value: "conversions" },
                    { label: "Leads", value: "leads" },
                  ]}
                  initial="all"
                  label="Filter by objective"
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
        title="Boardline AI"
        askLine="Ask about campaigns, channels, spend, or performance"
        suggestions={CHAT_SUGGESTIONS}
        replies={CHAT_REPLIES}
        fallback={CHAT_FALLBACK}
        disclaimer="A mock assistant with canned answers over this page's numbers."
      />
    </div>
  );
}
