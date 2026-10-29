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
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { Breadcrumb } from "rift-ds/components/Breadcrumb/Breadcrumb";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
} from "rift-ds/components/DataTable/DataTable";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import {
  Dropdown,
  type DropdownOption,
} from "rift-ds/components/Dropdown/Dropdown";
import { EmptyState } from "rift-ds/components/EmptyState/EmptyState";
import { FunnelChart } from "rift-ds/components/FunnelChart/FunnelChart";
import { Input } from "rift-ds/components/Input/Input";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { LegendTile } from "rift-ds/components/LegendTile/LegendTile";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Stat } from "rift-ds/components/Stat/Stat";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { AreaChart, ComboChart, RadialChart } from "rift-ds/charts";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import styles from "./MarketingDashboard.module.css";
import { useStagedProductName } from "../useStagedProductName";
import { AppFrameTabBar, useAppFrame } from "../AppFrame/AppFrame";
import TemplateShell from "../TemplateShell/TemplateShell";
import StickyTopBar from "../TemplateShell/StickyTopBar";
import { PUBLISHER_MARKS, PublisherMark } from "../PublisherMarks/PublisherMarks";
import { ProductMark } from "../ProductMark/ProductMark";

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    items: [
      { key: "home", icon: "home", label: "Home", badge: 152 },
      { key: "marketing", icon: "campaign", label: "Marketing" },
      { key: "calendar", icon: "calendar_month", label: "Calendar" },
      {
        key: "projects",
        icon: "folder",
        label: "Projects",
        children: [
          { key: "projects-q4-launch", label: "Q4 launch" },
          { key: "projects-brand-refresh", label: "Brand refresh" },
          { key: "projects-partner-week", label: "Partner week" },
        ],
      },
      {
        key: "reports",
        icon: "monitoring",
        label: "Reports",
        children: [
          { key: "reports-overview", label: "Overview" },
          { key: "reports-attribution", label: "Attribution" },
          { key: "reports-channels", label: "Channels" },
          { key: "reports-exports", label: "Exports" },
        ],
      },
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

function ChannelMark({ channel }: { channel: string }) {
  if (PUBLISHER_MARKS[channel]) return <PublisherMark id={channel} size={16} />;
  return (
    <span className="material-symbols-rounded">
      {CHANNEL_GLYPH[channel]}
    </span>
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

/* Delivery as a status: each state in its role, in the order a campaign
   moves through them. */
const DELIVERY_OPTIONS = [
  { label: "Draft", value: "draft", status: "neutral" as const },
  { label: "Active", value: "active", status: "positive" as const },
  { label: "Paused", value: "paused", status: "warning" as const },
  { label: "Completed", value: "completed", status: "info" as const },
];

/* The channels a campaign runs on, for the Channel filter. */
const CHANNEL_OPTIONS = [
  { value: "google", label: "Google Ads" },
  { value: "meta", label: "Meta" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "email", label: "Email" },
  { value: "web", label: "Web" },
];

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
  /* The playground's Product name lever, when staged there. */
  const productName = useStagedProductName("Boardline");
  /* The templates carousel's Mobile mode: previewed as a phone app. */
  const appFrame = useAppFrame();
  const [channelTab, setChannelTab] = React.useState("channels");
  const [chatOpen, setChatOpen] = React.useState(false);

  const [delivery, setDelivery] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(CAMPAIGNS.map((c) => [c.id, c.delivery]))
  );

  const columns: DataTableColumn[] = [
    {
      key: "name",
      header: "Campaign",
      rowHeader: true,
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
      // A status that edits in place: the cell reads as its Badge, and a double click or Enter picks another.
      type: "status",
      editable: true,
      sortable: true,
      width: "150px",
      options: DELIVERY_OPTIONS,
    },
    {
      key: "objective",
      header: "Objective",
      type: "status",
      sortable: true,
      options: Object.entries(OBJECTIVE_VARIANT).map(([value, status]) => ({ value, label: value, status })),
    },
    {
      key: "channel",
      header: "Channel",
      // Hidden by default: the campaign cell already shows the channel's mark, so this column is there to filter by.
      defaultHidden: true,
      options: CHANNEL_OPTIONS,
    },
    {
      key: "updated",
      header: "Last updated",
      type: "date",
      sortable: true,
    },
    {
      key: "spend",
      header: "Spend",
      type: "currency",
      sortable: true,
    },
  ];

  const rows: DataTableRow[] = CAMPAIGNS.map((c) => ({
    id: c.id,
    values: {
      name: c.name,
      market: c.market,
      channel: c.channel,
      delivery: delivery[c.id],
      objective: c.objective,
      updated: c.updated,
      spend: c.spend,
    },
  }));

  return (
    <TemplateShell
      sidebar={{
        sections: NAV_SECTIONS,
        profile: {
          name: "Mara Esmer",
          email: "mara@boardline.example",
        },
        activeKey: "marketing",
        logo: <ProductMark />,
        logoText: productName,
      }}
      chatOpen={chatOpen}
      frame={{ title: "Marketing", subtitle: `${productName} · Team space` }}
      contentClassName={styles.content}
      tabBar={
        <AppFrameTabBar
          sections={NAV_SECTIONS}
          activeKey="marketing"
          productName={productName}
          onAsk={() => setChatOpen(true)}
        />
      }
      assistant={
        <TemplateAssistant
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          title={`${productName} AI`}
          askLine="Ask about campaigns, channels, spend, or performance"
          suggestions={CHAT_SUGGESTIONS}
          replies={CHAT_REPLIES}
          fallback={CHAT_FALLBACK}
          disclaimer="A mock assistant with canned answers over this page's numbers."
        />
      }
    >
        {!appFrame && (
        <>
        <StickyTopBar>
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
              {/* Mobile: the full search field folds to this icon, riding
                  with the other actions on the right. */}
              <CircularButton
                icon="search"
                variant="secondary"
                ariaLabel="Search campaigns"
                className={styles.searchIconMobile}
              />
              <AiButton
                label="Ask AI"
                onClick={() => setChatOpen(true)}
              />
              <CircularButton
                icon="notifications"
                variant="secondary"
                ariaLabel="Notifications"
              />
            </div>
          </div>
        </StickyTopBar>
        </>
        )}
        <header className={styles.pageHead}>
          {!appFrame && (
          <div>
            <Breadcrumb
              items={[
                { label: productName, href: "#" },
                { label: "Team space", href: "#" },
                { label: "Marketing" },
              ]}
            />
            <h1 className={styles.title}>Marketing</h1>
          </div>
          )}
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
                deltaPlacement="auto"
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
              value={channelTab}
              onValueChange={setChannelTab}
              size="compact"
              aria-label="Traffic source breakdowns"
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
            selectable
            multiSort
            columnMenu
            phoneLayout="stack"
            defaultPageSize={16}
            pageSizeOptions={[8, 16, 32]}
            defaultSort={{ key: "updated", direction: "desc" }}
            onCellEdit={({ row, key, value }) => {
              if (key === "delivery") setDelivery((current) => ({ ...current, [row.id]: String(value) }));
            }}
            rowActions={(row) => [
              { id: "edit", label: `Edit ${row.values.name}`, icon: "edit", inline: true, onSelect: () => {} },
              { id: "duplicate", label: "Duplicate", icon: "content_copy", onSelect: () => {} },
              { id: "delete", label: `Delete ${row.values.name}`, icon: "delete", destructive: true, onSelect: () => {} },
            ]}
            toolbar={
              <TableToolbar
                bulkActions={[
                  { id: "pause", label: "Pause", icon: "pause", onSelect: () => {} },
                  { id: "duplicate", label: "Duplicate", icon: "content_copy", onSelect: () => {} },
                  { id: "delete", label: "Delete", icon: "delete", destructive: true, onSelect: () => {} },
                ]}
              />
            }
          />
        </section>
    </TemplateShell>
  );
}
