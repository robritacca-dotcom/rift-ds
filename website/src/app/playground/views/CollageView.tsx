"use client";

import { useState } from "react";
import { AreaChart, BarChart, LineChart, PieChart, RadialChart, StackedBarChart, Treemap } from "rift-ds/charts";
import { Accordion } from "rift-ds/components/Accordion/Accordion";
import { Alert } from "rift-ds/components/Alert/Alert";
import { Banner } from "rift-ds/components/Banner/Banner";
import { BentoTile } from "rift-ds/components/BentoTile/BentoTile";
import { Breadcrumb } from "rift-ds/components/Breadcrumb/Breadcrumb";
import { ContributionGraph } from "rift-ds/components/ContributionGraph/ContributionGraph";
import { DataTable } from "rift-ds/components/DataTable/DataTable";
import { GanttChart } from "rift-ds/components/GanttChart/GanttChart";
import { Meter } from "rift-ds/components/Meter/Meter";
import { Spinner } from "rift-ds/components/Spinner/Spinner";
import { StatusDot } from "rift-ds/components/StatusDot/StatusDot";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import {
  CHANNEL_DATA,
  CONTRIBUTION_DAYS,
  CONTRIBUTION_TOTAL,
  ROLLOUT_ITEMS,
  ROLLOUT_MILESTONES,
  TREEMAP_DATA,
  USAGE_DATA,
  shade,
} from "../sections/ChartsSection";
import { ACCOUNT_COLUMNS, ACCOUNT_ROWS, TOKEN_COLUMNS, TOKEN_ROWS } from "../sections/TablesSection";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Button } from "rift-ds/components/Button/Button";
import { Checkbox } from "rift-ds/components/Checkbox/Checkbox";
import { Chip } from "rift-ds/components/Chip/Chip";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { Dropdown } from "rift-ds/components/Dropdown/Dropdown";
import { Gauge } from "rift-ds/components/Gauge/Gauge";
import { Input } from "rift-ds/components/Input/Input";
import { Pagination } from "rift-ds/components/Pagination/Pagination";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { RadioButton } from "rift-ds/components/RadioButton/RadioButton";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Rating } from "rift-ds/components/Rating/Rating";
import { Slider } from "rift-ds/components/Slider/Slider";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import { SplitButton } from "rift-ds/components/SplitButton/SplitButton";
import { Stat } from "rift-ds/components/Stat/Stat";
import { Textarea } from "rift-ds/components/Textarea/Textarea";
import { Table, type TableColumn, type TableRow } from "rift-ds/components/Table/Table";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
import styles from "./CollageView.module.css";

/* ============================================
   The component collage: one mosaic of real components, packed so most of
   the library's character reads on the first screen. Everything here is a
   live component under the same levers as the full list.
   ============================================ */

const WEEK = [
  { label: "Mon", value: 320 },
  { label: "Tue", value: 480 },
  { label: "Wed", value: 260 },
  { label: "Thu", value: 540 },
  { label: "Fri", value: 610 },
  { label: "Sat", value: 380 },
  { label: "Sun", value: 290 },
];

const TREND = [
  { month: "Jan", sessions: 180, signups: 60 },
  { month: "Feb", sessions: 300, signups: 110 },
  { month: "Mar", sessions: 240, signups: 90 },
  { month: "Apr", sessions: 420, signups: 170 },
  { month: "May", sessions: 380, signups: 210 },
  { month: "Jun", sessions: 520, signups: 260 },
];

const TRENDS = [
  { label: "Revenue", value: "$48k", data: [12, 14, 13, 17, 16, 21, 24, 23, 28], tone: "accent" as const },
  { label: "Churn", value: "1.2%", data: [9, 8, 9, 7, 7, 6, 5, 6, 4], tone: "positive" as const },
  { label: "Latency", value: "210ms", data: [3, 4, 3, 5, 6, 5, 7, 8, 9], tone: "error" as const },
];

const PUBLISH_ITEMS = [
  { label: "Schedule for later", icon: "schedule" },
  { label: "Save as draft", icon: "draft" },
];

const FAQ = [
  {
    id: "levers",
    title: "What do the levers reach?",
    content: "Every component here reads the same tokens, so one move repaints the whole page.",
  },
  {
    id: "export",
    title: "How does a theme leave?",
    content: "Export it as one AGENTS.md, or copy the CSS alone.",
  },
  {
    id: "source",
    title: "Where does a file go?",
    content: "Nowhere. A dropped file is read in this tab and never uploaded.",
  },
];

const CRUMBS = [
  { label: "Home", href: "#" },
  { label: "Projects", href: "#" },
  { label: "Design system" },
];

const ROLES = [
  { label: "Designer", value: "designer" },
  { label: "Engineer", value: "engineer" },
];

const COLUMNS: TableColumn[] = [
  { key: "account", header: "Account", rowHeader: true },
  { key: "stage", header: "Stage" },
  { key: "value", header: "Value" },
];

const ROWS: TableRow[] = [
  { id: "a", cells: { account: "Northwind", stage: <Badge label="Won" variant="positive" />, value: "$48,000" } },
  { id: "b", cells: { account: "Fabrikam", stage: <Badge label="Trial" variant="info" />, value: "$12,500" } },
  { id: "c", cells: { account: "Contoso", stage: <Badge label="At risk" variant="warning" />, value: "$31,200" } },
];

export function CollageView({ brand }: { brand: string }) {
  const [role, setRole] = useState("designer");
  const [range, setRange] = useState("week");
  const [page, setPage] = useState(2);
  const [cadence, setCadence] = useState("daily");
  const [rating, setRating] = useState(4);
  const shades = [brand, shade(brand, 0.35), shade(brand, 0.63)];

  return (
    <div className={styles.root}>
    <div className={styles.collage}>
      <div className={`${styles.stack} ${styles.span5}`}>
        <BarChart data={WEEK} title="Weekly views" dataLabel="Views" barColor={brand} height={220} />
        {/* Takes whatever the row has left, so the column ends level with
            its neighbours whatever height a theme's type gives them. */}
        <div className={`${styles.tile} ${styles.grow} ${styles.trends}`}>
          {TRENDS.map((trend) => (
            <div key={trend.label} className={styles.trend}>
              <span className={styles.trendLabel}>{trend.label}</span>
              <span className={styles.trendValue}>{trend.value}</span>
              <Sparkline
                data={trend.data}
                tone={trend.tone}
                variant="area"
                width={120}
                height={32}
                label={`${trend.label} trend`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.tile} ${styles.span4}`}>
        <span className={styles.tileTitle}>Invite a teammate</span>
        <Input label="Email" placeholder="name@company.com" />
        <Dropdown label="Role" value={role} options={ROLES} onValueChange={setRole} />
        <Textarea label="Note" placeholder="Add a line for them" />
        <Checkbox label="Send a welcome note" defaultChecked />
        <div className={styles.row}>
          <Button label="Send invite" variant="primary" />
          <Button label="Cancel" variant="tertiary" />
        </div>
      </div>

      <div className={`${styles.stack} ${styles.span3}`}>
        <div className={`${styles.tile} ${styles.grow}`}>
          <Stat value="12.4k" label="Active users" delta="+8% this week" trend="up" />
        </div>
        <div className={`${styles.tile} ${styles.grow}`}>
          <Stat value="98.2%" label="Uptime" delta="-0.1% this week" trend="down" />
        </div>
        <div className={`${styles.tile} ${styles.grow}`}>
          <Stat value="$48.2k" label="Revenue" delta="No change" trend="neutral" />
        </div>
      </div>

      <div className={`${styles.tile} ${styles.span3}`}>
        <span className={styles.tileTitle}>Actions</span>
        <div className={styles.row}>
          <Button label="Primary" variant="primary" />
          <Button label="Secondary" variant="secondary" />
          <Button label="Tertiary" variant="tertiary" />
          <Button label="Delete" variant="secondary" tone="destructive" iconLeft="delete" />
        </div>
        <div className={styles.row}>
          <CircularButton icon="add" variant="primary" ariaLabel="Add" />
          <CircularButton icon="edit" variant="secondary" ariaLabel="Edit" />
          <CircularButton icon="favorite" variant="tertiary" ariaLabel="Favourite" />
          <SplitButton label="Publish" iconLeft="send" items={PUBLISH_ITEMS} />
        </div>
      </div>

      <div className={`${styles.tile} ${styles.span5}`}>
        <Table columns={COLUMNS} rows={ROWS} caption="Accounts" />
        <Pagination page={page} pageCount={8} onPageChange={setPage} size="compact" />
      </div>

      <div className={`${styles.stack} ${styles.span4}`}>
        <Alert variant="positive" title="Theme applied" size="compact" />
        <Alert variant="warning" title="Two tokens left at their base" size="compact" />
        <div className={`${styles.tile} ${styles.grow}`}>
          <span className={styles.tileTitle}>Onboarding</span>
          <ProgressBar value={64} ariaLabel="Onboarding progress" />
          <div className={styles.row}>
            <Avatar name="Avery Chen" status="online" />
            <Avatar name="Priya Shah" />
            <Avatar name="Jonas Berg" size="sm" />
            <Chip label="Design" />
            <Chip label="Tokens" tone="neutral" />
          </div>
        </div>
      </div>

      <div className={`${styles.tile} ${styles.span4}`}>
        <SegmentedControl
          segments={[
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
            { value: "year", label: "Year" },
          ]}
          value={range}
          onValueChange={setRange}
          aria-label="Range"
        />
        <Slider defaultValue={64} aria-label="Volume" />
        <div className={styles.row}>
          <ToggleSwitch label="Alerts" defaultChecked showLabel />
          <RadioButton label="Daily" value="daily" checked={cadence === "daily"} onValueChange={() => setCadence("daily")} />
          <RadioButton label="Weekly" value="weekly" checked={cadence === "weekly"} onValueChange={() => setCadence("weekly")} />
        </div>
        <Tabs
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "activity", label: "Activity" },
            { value: "settings", label: "Settings" },
          ]}
          defaultValue="overview"
          aria-label="Collage tabs"
        />
        <div className={styles.row}>
          <Rating value={rating} onValueChange={setRating} label="Theme rating" />
          <Badge label="New" variant="info" />
          <Badge label="Beta" variant="neutral" />
        </div>
        <Input placeholder="Search" iconLeft="search" aria-label="Search" />
      </div>

      <div className={styles.span5}>
        <LineChart
          data={TREND}
          xKey="month"
          series={[
            { dataKey: "sessions", label: "Sessions", color: brand },
            { dataKey: "signups", label: "Signups", color: brand, strokeDasharray: "5 4" },
          ]}
          title="Growth"
          height={220}
        />
      </div>

      <div className={`${styles.tile} ${styles.span3}`}>
        <Gauge bare value={68} label="Budget used" title="Monthly spend" />
      </div>

      <div className={`${styles.chart} ${styles.span8}`}>
        <ContributionGraph
          days={CONTRIBUTION_DAYS}
          title="Theme edits"
          caption={`${CONTRIBUTION_TOTAL} edits in the last year`}
        />
      </div>

      <div className={`${styles.tile} ${styles.span4}`}>
        <Breadcrumb items={CRUMBS} aria-label="Collage breadcrumb" />
        <Accordion items={FAQ} defaultExpanded={["levers"]} />
      </div>

      <div className={`${styles.chart} ${styles.span12}`}>
        <GanttChart
          items={ROLLOUT_ITEMS}
          milestones={ROLLOUT_MILESTONES}
          today="2026-10-14"
          title="Theme rollout"
        />
      </div>

      <div className={styles.span4}>
        <BentoTile title="Revenue that themes itself" description="A stat on the first ambient pair." highlight={1}>
          <Stat label="Monthly revenue" value="$48,210" delta="+12.4%" trend="up" />
        </BentoTile>
      </div>

      <div className={styles.span4}>
        <BentoTile title="Seats this week" description="The third ambient pair." highlight={3}>
          <Sparkline data={TRENDS[0].data} tone="accent" variant="area" width={240} height={48} label="Seats, last nine days" />
        </BentoTile>
      </div>

      <div className={`${styles.tile} ${styles.span4}`}>
        <Table columns={TOKEN_COLUMNS} rows={TOKEN_ROWS} bordered caption="What re-themes a table" captionHidden />
      </div>

      <div className={`${styles.chart} ${styles.span5}`}>
        <AreaChart
          data={USAGE_DATA}
          xKey="week"
          stacked
          series={[
            { dataKey: "docs", label: "Docs pages", color: shades[0] },
            { dataKey: "api", label: "API calls", color: shades[1] },
          ]}
          title="Usage"
          height={240}
        />
      </div>

      <div className={`${styles.chart} ${styles.span3}`}>
        <PieChart
          data={[
            { name: "Components", value: 46, color: shades[0] },
            { name: "Tokens", value: 31, color: shades[1] },
            { name: "Docs", value: 23, color: shades[2] },
          ]}
          title="Time spent"
          innerRadius={52}
          outerRadius={84}
          height={240}
        />
      </div>

      <div className={`${styles.chart} ${styles.span4}`}>
        <StackedBarChart
          data={CHANNEL_DATA}
          xKey="quarter"
          series={[
            { dataKey: "organic", label: "Organic", color: shades[0] },
            { dataKey: "referral", label: "Referral", color: shades[1] },
            { dataKey: "direct", label: "Direct", color: shades[2] },
          ]}
          title="Traffic by channel"
          height={240}
        />
      </div>

      <div className={styles.span12}>
        <DataTable
          columns={ACCOUNT_COLUMNS}
          rows={ACCOUNT_ROWS}
          caption="Accounts"
          selectable
          defaultSort={{ key: "value", direction: "desc" }}
          pageSize={5}
          toolbar={
            <TableToolbar
              secondaryActions={[{ id: "export", label: "Export", icon: "download", onSelect: () => {} }]}
              primaryAction={{ id: "new", label: "New account", icon: "add", onSelect: () => {} }}
              bulkActions={[
                { id: "assign", label: "Assign", icon: "person_add", onSelect: () => {} },
                { id: "archive", label: "Archive", icon: "archive", destructive: true, onSelect: () => {} },
              ]}
            />
          }
        />
      </div>

      <div className={`${styles.chart} ${styles.span3}`}>
        <RadialChart
          data={[
            { name: "Tokens", value: 82, color: shades[0] },
            { name: "Components", value: 64, color: shades[1] },
            { name: "Docs", value: 41, color: shades[2] },
          ]}
          title="Coverage"
          innerRadius={36}
          outerRadius={92}
          height={240}
        />
      </div>

      <div className={`${styles.chart} ${styles.span5}`}>
        <Treemap
          data={TREEMAP_DATA.map((item, i) => ({ ...item, color: shades[i % shades.length] }))}
          title="Components by category"
          height={240}
        />
      </div>

      <div className={`${styles.tile} ${styles.span4}`}>
        <span className={styles.tileTitle}>System health</span>
        <Meter label="Storage" value={72} showValue variant="info" />
        <Meter label="Monthly tokens" value={91} showValue variant="warning" />
        <div className={styles.row}>
          <StatusDot variant="positive" label="Operational" />
          <StatusDot variant="warning" label="Degraded" />
          <StatusDot variant="error" label="Recording" pulse />
        </div>
        <div className={styles.row}>
          <StatusDot variant="neutral" label="Paused" />
          <Spinner size="sm" label="Loading" />
        </div>
      </div>

      <div className={styles.span12}>
        <Banner variant="warning" title="Scheduled maintenance.">
          The editor goes read-only on Sunday from 02:00 to 03:00 UTC.
        </Banner>
      </div>

    </div>
    </div>
  );
}
