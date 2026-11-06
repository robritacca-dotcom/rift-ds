"use client";

/**
 * The analytics template: a realtime overview for Lumenfold, a fictional web
 * analytics product. A world map is the page's backdrop, its cities pulsing
 * with who is on the site this minute, and the charts run on from under it.
 *
 * Composition calls, against design.md's Template screens rules: the shell,
 * top bar and panels are merchant sales' (rule 9), so the two read as
 * siblings, but it has no KPI band: the map earns the top of the viewport
 * (rule 3), the column runs full width over it (rule 5's stage exception),
 * and the headline numbers are one list tile beside the live chart. WorldMap
 * has no pulse of its own, so the module sheet hangs StatusDot's ring on its
 * markers. Map colours are the source each city's traffic leads with, the
 * same series slots as the source chart, so the one key reads for both.
 *
 * Describe, in the table's toolbar, changes the table for real, but through
 * describeCities below, a small interpreter over this page's own data rather
 * than the model route merchant sales uses: the home page plays this screen on
 * a loop, and a loop must never bill a model.
 *
 * Every figure ties out: the cities sum to the 1,284 active users, by lead
 * source to the source chart, and the last five minutes of the bars to the
 * 212. All data is fictional, so the route is excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import React from "react";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { Breadcrumb } from "rift-ds/components/Breadcrumb/Breadcrumb";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
  type DataTableView,
} from "rift-ds/components/DataTable/DataTable";
import {
  Dropdown,
  type DropdownOption,
} from "rift-ds/components/Dropdown/Dropdown";
import { FunnelChart } from "rift-ds/components/FunnelChart/FunnelChart";
import { Input } from "rift-ds/components/Input/Input";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { LegendTile } from "rift-ds/components/LegendTile/LegendTile";
import { MapLegend } from "rift-ds/components/MapLegend/MapLegend";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Stat } from "rift-ds/components/Stat/Stat";
import { StatusDot } from "rift-ds/components/StatusDot/StatusDot";
import {
  TableToolbar,
  type TableToolbarCommandRequest,
  type TableToolbarCommandResult,
} from "rift-ds/components/TableToolbar/TableToolbar";
import {
  WorldMap,
  type WorldMapBounds,
  type WorldMapPoint,
} from "rift-ds/components/WorldMap/WorldMap";
import {
  AreaChart,
  BarChart,
  ComboChart,
  PieChart,
} from "rift-ds/charts";
import { MOTION_AUTOPLAY_INTERVAL_MS } from "rift-ds/tokens/motion";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import { AppFrameTabBar, useAppFrame } from "../AppFrame/AppFrame";
import { ProductMark } from "../ProductMark/ProductMark";
import TemplateShell from "../TemplateShell/TemplateShell";
import StickyTopBar from "../TemplateShell/StickyTopBar";
import { useStagedProductName } from "../useStagedProductName";
import styles from "./Analytics.module.css";

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    items: [
      { key: "home", icon: "home", label: "Home" },
      { key: "realtime", icon: "monitoring", label: "Realtime" },
      {
        key: "audience",
        icon: "groups",
        label: "Audience",
        children: [
          { key: "audience-overview", label: "Overview" },
          { key: "audience-segments", label: "Segments" },
          { key: "audience-retention", label: "Retention" },
        ],
      },
      {
        key: "acquisition",
        icon: "conversion_path",
        label: "Acquisition",
        children: [
          { key: "acquisition-sources", label: "Sources" },
          { key: "acquisition-campaigns", label: "Campaigns" },
        ],
      },
      { key: "events", icon: "bolt", label: "Events" },
      { key: "reports", icon: "description", label: "Reports", badge: 4 },
    ],
  },
  {
    items: [
      { key: "support", icon: "headset_mic", label: "Support" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

type Source = "organic" | "direct" | "paid" | "social" | "referral";

/* Source order is the chart series order, here and on the map. */
const SOURCES: { key: Source; label: string; users: number }[] = [
  { key: "organic", label: "Organic", users: 483 },
  { key: "direct", label: "Direct", users: 433 },
  { key: "paid", label: "Paid", users: 239 },
  { key: "social", label: "Social", users: 72 },
  { key: "referral", label: "Referral", users: 57 },
];

const SOURCE_LABEL = Object.fromEntries(
  SOURCES.map((source) => [source.key, source.label])
) as Record<Source, string>;

/** The chart palette token for a 1-based series slot. */
function seriesSwatch(series: number): string {
  return `var(--color-chart-series-${series})`;
}

function sourceColor(source: Source): string {
  return seriesSwatch(SOURCES.findIndex((s) => s.key === source) + 1);
}

type City = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  users: number;
  views: number;
  source: Source;
};

const CITIES: City[] = [
  { id: "lon", name: "London", country: "United Kingdom", lat: 51.5, lng: -0.1, users: 186, views: 642, source: "direct" },
  { id: "nyc", name: "New York", country: "United States", lat: 40.7, lng: -74, users: 168, views: 588, source: "organic" },
  { id: "tyo", name: "Tokyo", country: "Japan", lat: 35.7, lng: 139.7, users: 127, views: 402, source: "paid" },
  { id: "sfo", name: "San Francisco", country: "United States", lat: 37.8, lng: -122.4, users: 124, views: 451, source: "direct" },
  { id: "bom", name: "Mumbai", country: "India", lat: 19.1, lng: 72.9, users: 109, views: 318, source: "organic" },
  { id: "arn", name: "Stockholm", country: "Sweden", lat: 59.3, lng: 18.1, users: 88, views: 297, source: "organic" },
  { id: "sin", name: "Singapore", country: "Singapore", lat: 1.4, lng: 103.8, users: 83, views: 264, source: "direct" },
  { id: "gru", name: "São Paulo", country: "Brazil", lat: -23.6, lng: -46.6, users: 71, views: 203, source: "paid" },
  { id: "yvr", name: "Vancouver", country: "Canada", lat: 49.3, lng: -123.1, users: 62, views: 196, source: "organic" },
  { id: "tpe", name: "Taipei", country: "Taiwan", lat: 25, lng: 121.5, users: 56, views: 171, source: "organic" },
  { id: "dxb", name: "Dubai", country: "United Arab Emirates", lat: 25.2, lng: 55.3, users: 41, views: 118, source: "paid" },
  { id: "eze", name: "Buenos Aires", country: "Argentina", lat: -34.6, lng: -58.4, users: 40, views: 112, source: "direct" },
  { id: "mex", name: "Mexico City", country: "Mexico", lat: 19.4, lng: -99.1, users: 38, views: 104, source: "social" },
  { id: "syd", name: "Sydney", country: "Australia", lat: -33.9, lng: 151.2, users: 35, views: 109, source: "referral" },
  { id: "los", name: "Lagos", country: "Nigeria", lat: 6.5, lng: 3.4, users: 34, views: 88, source: "social" },
  { id: "cpt", name: "Cape Town", country: "South Africa", lat: -33.9, lng: 18.4, users: 22, views: 61, source: "referral" },
];

const MAP_POINTS: WorldMapPoint[] = CITIES.map((city) => ({
  id: city.id,
  lat: city.lat,
  lng: city.lng,
  label: `${city.name} ${city.users}`,
  color: sourceColor(city.source),
}));

/* Clips the far north and south; the stage's height follows this window's
   shape (Analytics.module.css), so every city stays in frame at any width. */
const MAP_BOUNDS: WorldMapBounds = [-180, -50, 180, 80];

/* Active users per minute, oldest first; the last five sum to 212. */
const PER_MINUTE = [
  31, 36, 34, 42, 39, 45, 41, 37, 44, 48, 52, 47, 43, 50, 56, 61, 54, 49, 46,
  51, 58, 53, 47, 42, 45, 38, 44, 41, 46, 43,
].map((users, i, all) => ({
  minute: i === all.length - 1 ? "Now" : `-${all.length - 1 - i}m`,
  users,
}));

const OVERVIEW = [
  { icon: "group", value: "67.1K", label: "Users", delta: "+6.2%", trend: "up" as const },
  { icon: "ads_click", value: "84.2K", label: "Sessions", delta: "+4.8%", trend: "up" as const },
  { icon: "schedule", value: "2m 51s", label: "Average engagement", delta: "+3.4%", trend: "up" as const },
  { icon: "logout", value: "41.2%", label: "Bounce rate", delta: "-1.8%", trend: "down" as const },
  { icon: "computer", value: "58%", label: "Users on desktop", delta: "+1.2%", trend: "up" as const },
];

const TOP_PAGES = [
  { path: "/pricing", pct: 28 },
  { path: "/docs", pct: 24 },
  { path: "/blog", pct: 19 },
  { path: "/changelog", pct: 11 },
  { path: "/signup", pct: 10 },
  { path: "/about", pct: 8 },
];

/* Thousands of events; the bars sum to the panel's 398K. */
const EVENTS = [
  { event: "Views", count: 214 },
  { event: "Scrolls", count: 96 },
  { event: "Clicks", count: 71 },
  { event: "Sign-ups", count: 12 },
  { event: "Sales", count: 5 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* Daily users in K; the series sum to their legend totals, and those to 67.1K. */
const ORGANIC = [4.2, 4.8, 5.1, 5.0, 4.7, 3.1, 2.9];
const DIRECT = [3.6, 3.9, 4.1, 4.0, 3.8, 2.6, 2.4];
const PAID = [1.9, 2.1, 2.3, 2.2, 2.0, 1.2, 1.1];
const USERS_BY_DAY = DAYS.map((day, i) => ({
  day,
  organic: ORGANIC[i],
  direct: DIRECT[i],
  paid: PAID[i],
}));

/* Daily sessions in K sum to 84.2K; engagement in minutes averages 2.9. */
const ENGAGEMENT = [2.8, 3.0, 3.1, 3.2, 3.0, 2.5, 2.4];
const SESSIONS_BY_DAY = [12.4, 13.6, 14.5, 14.1, 13.0, 8.6, 8.0].map(
  (sessions, i) => ({ day: DAYS[i], sessions, engagement: ENGAGEMENT[i] })
);

const FUNNEL = [
  { label: "Users", value: 100, displayValue: "67.1K" },
  { label: "Saw pricing", value: 32, displayValue: "21.4K" },
  { label: "Signed up", value: 18, displayValue: "12K" },
  { label: "Bought", value: 8, displayValue: "5K" },
];

const RANGE_WEEK: DropdownOption[] = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "This quarter", value: "quarter" },
];

const CHAT_SUGGESTIONS = [
  { id: "who", label: "Who is on the site now?" },
  { id: "week", label: "Summarise this week" },
  { id: "funnel", label: "Where does the funnel leak?" },
];

const CHAT_REPLIES: Record<string, string> = {
  who: "1,284 people in the last 30 minutes, 212 of them in the last five. London leads with 186, then New York with 168 and Tokyo with 127. Organic search brought the most, at 483.",
  week: "67.1K users across 84.2K sessions, up 6.2% and 4.8%. Engagement rose 3.4% to 2m 51s and bounce rate fell 1.8% to 41.2%. Wednesday was the busiest day.",
  funnel: "The biggest drop is the first step: 32% of users see pricing. After that, more than half of those people sign up, and 5K of the 12K who sign up go on to buy.",
};

const CHAT_REASONING: Record<string, string[]> = {
  who: ["Reading active users for the last 30 minutes", "Grouping them by city", "Ranking the cities and their sources"],
  week: ["Pulling this week's users and sessions", "Comparing them with last week", "Finding the busiest day"],
  funnel: ["Loading the conversion funnel", "Measuring the drop at each step", "Picking out the biggest one"],
};

const CHAT_FALLBACK =
  "This assistant is a mock. In the real product this answer would come from your analytics. Try one of the suggested questions for a canned tour.";

/* ------------------------------------------------------------- helpers */

/** A compact select that keeps its own value, for the per-panel ranges. */
function RangeSelect({ label }: { label: string }) {
  const [value, setValue] = React.useState("7d");
  return (
    <Dropdown
      size="compact"
      options={RANGE_WEEK}
      value={value}
      onValueChange={setValue}
      aria-label={label}
      className={styles.rangeSelect}
    />
  );
}

function renderCityCard(point: WorldMapPoint) {
  const city = CITIES.find((c) => c.id === point.id);
  if (!city) return null;
  return (
    <span className={styles.card}>
      <span className={styles.cardName}>{city.name}</span>
      <span className={styles.cardMeta}>{city.country}</span>
      <span className={styles.cardMeta}>
        {city.users} active · {city.views} views
      </span>
      <span className={styles.cardMeta}>Led by {SOURCE_LABEL[city.source]}</span>
    </span>
  );
}

const CITY_COLUMNS: DataTableColumn[] = [
  { key: "name", header: "City", rowHeader: true, sortable: true },
  { key: "country", header: "Country", sortable: true },
  {
    key: "source",
    header: "Lead source",
    sortable: true,
    options: SOURCES.map((source) => ({ value: source.key, label: source.label })),
    render: (row: DataTableRow) => (
      <span className={styles.sourceCell}>
        <span
          className={styles.sourceSwatch}
          style={{ backgroundColor: sourceColor(row.values.source as Source) }}
          aria-hidden="true"
        />
        {SOURCE_LABEL[row.values.source as Source]}
      </span>
    ),
  },
  { key: "users", header: "Active users", type: "number", sortable: true },
  { key: "views", header: "Views", type: "number", sortable: true },
];

const CITY_ROWS: DataTableRow[] = CITIES.map((city) => ({
  id: city.id,
  values: {
    name: city.name,
    country: city.country,
    source: city.source,
    users: city.users,
    views: city.views,
  },
}));

/* The pause while Describe "thinks", so its working state shows. */
const DESCRIBE_THINK_MS = MOTION_AUTOPLAY_INTERVAL_MS / 4;

const DESCRIBE_PLACEHOLDER = "Organic cities over 60 users, most views first";

const DESCRIBE_FALLBACK =
  "This demo understands sources, a number of users or views, and an order. Try the sentence in the field.";

/** Reads one sentence into a table setup: which sources, how many users or
    views, and what order. Everything it does not recognise, it leaves alone. */
async function describeCities({
  text,
  signal,
}: TableToolbarCommandRequest): Promise<TableToolbarCommandResult> {
  await new Promise((resolve) => setTimeout(resolve, DESCRIBE_THINK_MS));
  signal.throwIfAborted();
  const asked = text.toLowerCase();

  const sources = SOURCES.filter((source) => asked.includes(source.key)).map((source) => source.key);
  const threshold = asked.match(/\b(over|above|more than|under|below|fewer than|less than)\s+(\d+)/);
  const measure = (phrase: string) => (asked.includes(`${phrase} views`) ? "views" : "users");

  const filters: NonNullable<DataTableView["filters"]> = [];
  if (sources.length > 0) {
    filters.push({ id: "source-1", column: "source", operator: "isAnyOf", value: sources });
  }
  const limit = threshold ? Number(threshold[2]) : 0;
  const lower = threshold ? /under|below|fewer|less/.test(threshold[1]) : false;
  if (threshold) {
    filters.push({
      id: "measure-1",
      column: measure(`${threshold[1]} ${threshold[2]}`),
      operator: lower ? "lt" : "gt",
      value: limit,
    });
  }

  const order = asked.match(/\b(most|fewest|least|top|bottom)\s+(views|users)\b|\bby\s+(views|users)\b/);
  const sorts: NonNullable<DataTableView["sorts"]> = order
    ? [{ key: order[2] ?? order[3], direction: /fewest|least|bottom/.test(order[1] ?? "") ? "asc" : "desc" }]
    : [{ key: "users", direction: "desc" }];

  if (filters.length === 0 && !order) return { message: DESCRIBE_FALLBACK };

  const found = CITIES.filter((city) => {
    if (sources.length > 0 && !sources.includes(city.source)) return false;
    if (!threshold) return true;
    const value = filters[filters.length - 1].column === "views" ? city.views : city.users;
    return lower ? value < limit : value > limit;
  }).length;
  return {
    view: { version: 1, filters, sorts },
    message: `Showing ${found} of ${CITIES.length} cities.`,
  };
}

/* ---------------------------------------------------------------- page */

export default function Analytics() {
  /* The playground's Product name lever, when staged there. */
  const productName = useStagedProductName("Lumenfold");
  /* The templates carousel's Mobile mode: previewed as a phone app. */
  const appFrame = useAppFrame();
  const [chatOpen, setChatOpen] = React.useState(false);

  return (
    <TemplateShell
      sidebar={{
        sections: NAV_SECTIONS,
        profile: { name: "Ines Okafor", email: "ines@lumenfold.example" },
        activeKey: "realtime",
        logo: <ProductMark />,
        logoText: productName,
      }}
      chatOpen={chatOpen}
      frame={{ title: "Realtime", subtitle: `${productName} · All sites` }}
      contentClassName={styles.content}
      tabBar={
        <AppFrameTabBar
          sections={NAV_SECTIONS}
          activeKey="realtime"
          productName={productName}
          onAsk={() => setChatOpen(true)}
        />
      }
      assistant={
        <TemplateAssistant
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          title={`${productName} AI`}
          askLine="Ask about visitors, sources, pages, or conversions"
          suggestions={CHAT_SUGGESTIONS}
          replies={CHAT_REPLIES}
          fallback={CHAT_FALLBACK}
          reasoning={CHAT_REASONING}
          disclaimer="A mock assistant with canned answers over this page's numbers."
        />
      }
    >
      {/* The backdrop: it sits behind the whole first screen and dissolves
          into the page as the panels take over. */}
      <div className={`${styles.map} ${appFrame ? styles.mapApp : ""}`}>
        <WorldMap
          points={MAP_POINTS}
          bounds={MAP_BOUNDS}
          fit="cover"
          showLabels
          renderHoverCard={renderCityCard}
          label="Active users by city"
        />
      </div>

      {!appFrame && (
        <StickyTopBar>
          <div className={styles.topBar}>
            <div className={styles.search}>
              <Input
                placeholder="Search reports"
                iconLeft="search"
                aria-label="Search reports"
              />
              <span className={styles.searchKbd} aria-hidden="true">
                <Kbd size="compact">⌘</Kbd>
                <Kbd size="compact">K</Kbd>
              </span>
            </div>
            <div className={styles.topBarActions}>
              <CircularButton
                icon="search"
                variant="secondary"
                tone="neutral"
                ariaLabel="Search reports"
                className={styles.searchIconMobile}
              />
              <AiButton label="Ask AI" onClick={() => setChatOpen(true)} />
              <CircularButton
                icon="notifications"
                variant="secondary"
                tone="neutral"
                ariaLabel="Notifications"
              />
            </div>
          </div>
        </StickyTopBar>
      )}

      {/* The stage passes the pointer through its gaps, so the markers
          around the title and the key stay hoverable; the key sits on the open ocean
          at the lower left, where no city's card opens. */}
      <div className={`${styles.stage} ${appFrame ? styles.stageApp : ""}`}>
        {!appFrame && (
          <header className={styles.pageHead}>
            <div className={styles.pageName}>
              <Breadcrumb
                items={[
                  { label: productName, href: "#" },
                  { label: "All sites", href: "#" },
                  { label: "Realtime" },
                ]}
              />
              <h1 className={styles.title}>Realtime</h1>
            </div>
          </header>
        )}

        {!appFrame && (
          <MapLegend
            className={styles.legend}
            title="Lead source"
            items={SOURCES.map((source) => ({
              /* WorldMap's dot is its own, so a flat-map key passes it as a node. */
              glyph: (
                <span
                  className={styles.sourceSwatch}
                  style={{ backgroundColor: sourceColor(source.key) }}
                />
              ),
              label: source.label,
            }))}
          />
        )}

      </div>

      <div className={styles.flow}>
        <div className={styles.halvesGrid}>
          <section className={styles.panel} aria-label="Active users per minute">
            <header className={styles.panelHead}>
              <div className={styles.liveStats}>
                <Stat value="1,284" label="Active users, last 30 minutes" />
                <Stat value="212" label="Last 5 minutes" />
              </div>
              <StatusDot variant="positive" pulse label="Live" />
            </header>
            <BarChart
              data={PER_MINUTE}
              xKey="minute"
              yKey="users"
              dataLabel="Active users"
              height={380}
              bare
            />
          </section>

          <section className={styles.panel} aria-label="This week's overview">
            <header className={styles.panelHead}>
              <SectionTitle title="This week" divider={false} />
              <RangeSelect label="Overview date range" />
            </header>
            <ul className={styles.statList}>
              {OVERVIEW.map((stat) => (
                <li key={stat.label} className={styles.statRow}>
                  <span className={styles.statIcon} aria-hidden="true">
                    <span className="material-symbols-rounded">{stat.icon}</span>
                  </span>
                  <Stat
                    value={stat.value}
                    label={stat.label}
                    delta={stat.delta}
                    trend={stat.trend}
                    deltaPlacement="inline"
                  />
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.panel} aria-label="Active users by source">
            <header className={styles.panelHead}>
              <Stat value="1,284" label="Active users by source" />
            </header>
            <PieChart
              data={SOURCES.map((source) => ({
                name: source.label,
                value: source.users,
              }))}
              height={200}
              innerRadius={60}
              outerRadius={90}
              showLegend={false}
              bare
            />
            <div className={`${styles.legendRow} ${styles.sourceLegend}`}>
              {SOURCES.map((source, i) => (
                <LegendTile
                  key={source.key}
                  swatch={seriesSwatch(i + 1)}
                  label={source.label}
                  value={source.users}
                />
              ))}
            </div>
          </section>

          <section className={styles.panel} aria-label="Users by day">
            <header className={styles.panelHead}>
              <Stat value="67.1K" label="Users" delta="+6.2%" trend="up" deltaPlacement="inline" />
              <RangeSelect label="Users date range" />
            </header>
            <AreaChart
              data={USERS_BY_DAY}
              xKey="day"
              stacked
              series={[
                { dataKey: "organic", label: "Organic" },
                { dataKey: "direct", label: "Direct" },
                { dataKey: "paid", label: "Paid" },
              ]}
              height={260}
              showLegend={false}
              bare
            />
            <div className={styles.legendRow}>
              <LegendTile swatch={seriesSwatch(1)} label="Organic" value="29.8K" />
              <LegendTile swatch={seriesSwatch(2)} label="Direct" value="24.4K" />
              <LegendTile swatch={seriesSwatch(3)} label="Paid" value="12.9K" />
            </div>
          </section>

          <section className={styles.panel} aria-label="Sessions and engagement by day">
            <header className={styles.panelHead}>
              <Stat value="84.2K" label="Sessions" delta="+4.8%" trend="up" deltaPlacement="inline" />
              <RangeSelect label="Sessions date range" />
            </header>
            <ComboChart
              data={SESSIONS_BY_DAY}
              xKey="day"
              barKey="sessions"
              barLabel="Sessions (K)"
              lineKey="engagement"
              lineLabel="Engagement (min)"
              height={260}
              bare
            />
            <div className={styles.legendRow}>
              <LegendTile swatch={seriesSwatch(1)} label="Sessions, total" value="84.2K" />
              <LegendTile swatch={seriesSwatch(2)} label="Engagement" value="2.9 min avg" />
            </div>
          </section>

          <section className={styles.panel} aria-label="Views by page">
            <header className={styles.panelHead}>
              <Stat value="214K" label="Views by page" delta="+7.1%" trend="up" deltaPlacement="inline" />
              <RangeSelect label="Views by page date range" />
            </header>
            <div className={styles.pageList}>
              {TOP_PAGES.map((page) => (
                <div key={page.path} className={styles.pageRow}>
                  <div className={styles.pageMeta}>
                    <span className={styles.pagePath}>{page.path}</span>
                    <span className={styles.pagePct}>{page.pct}%</span>
                  </div>
                  <ProgressBar
                    value={page.pct}
                    size="compact"
                    ariaLabel={`${page.path} share of views`}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel} aria-label="Events by name">
            <header className={styles.panelHead}>
              <Stat value="398K" label="Events" delta="+5.5%" trend="up" deltaPlacement="inline" />
              <RangeSelect label="Events date range" />
            </header>
            <BarChart
              data={EVENTS}
              xKey="event"
              yKey="count"
              dataLabel="Events (K)"
              height={240}
              bare
            />
          </section>

          <section className={styles.panel} aria-label="Conversion funnel">
            <header className={styles.panelHead}>
              <Stat value="7.5%" label="Users who bought" delta="+0.6%" trend="up" deltaPlacement="inline" />
              <RangeSelect label="Conversion funnel date range" />
            </header>
            <FunnelChart bare showLabels={false} data={FUNNEL} height={190} />
            <div className={styles.legendRow}>
              {FUNNEL.map((stage, i) => (
                <LegendTile
                  key={stage.label}
                  swatch={seriesSwatch(i + 1)}
                  label={stage.label}
                  value={stage.displayValue}
                />
              ))}
            </div>
          </section>

        </div>

        <section className={styles.tableSection} aria-label="Active users by city">
          <SectionTitle
            title="Cities"
            trailing={`${CITIES.length} cities`}
            divider={false}
          />
          <DataTable
            columns={CITY_COLUMNS}
            rows={CITY_ROWS}
            caption="Active users by city"
            phoneLayout="stack"
            defaultPageSize={8}
            pageSizeOptions={[8, 16]}
            defaultSort={{ key: "users", direction: "desc" }}
            toolbar={
              <TableToolbar
                command={{ onSubmit: describeCities }}
                labels={{ commandPlaceholder: DESCRIBE_PLACEHOLDER }}
              />
            }
          />
        </section>
      </div>
    </TemplateShell>
  );
}
