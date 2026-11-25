"use client";

/**
 * The profit and loss template: the quarterly statement screen for
 * Tallyfold, a fictional bookkeeping product, showing an invented company's
 * quarter. The shell is the family's (TemplateShell's switchable rail and
 * surface, slim top bar, docked mock assistant). The statement is the stage
 * and takes the room; a band of four figures over it (revenue, the two
 * margins, net profit, each against the quarter before) and two charts
 * beside it (net profit by month, where the operating money went) read its
 * shape at a glance, in merchant sales' stat and chart card. Every figure
 * there is worked out from the statement's own lines, so the band, the
 * charts and the table always agree.
 *
 * The statement is one bordered Table: each section opens on a `heading` row
 * and closes on a `total` row, and the lines between subtract down to the
 * bottom line, with this quarter, the last and the change side by side. Every
 * amount is a decimal string, added and subtracted with rift-ds/format's
 * sumDecimal and subtractDecimal and written with formatMoney, so no figure
 * passes through a float and every total ties out to its lines. The locale is
 * pinned, so the prerendered HTML and the hydrating client can never
 * disagree.
 *
 * All of it is fictional, so the route is excluded from the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs). The assistant is the shared
 * TemplateAssistant mock, answering over this quarter.
 */

import React from "react";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { Button } from "rift-ds/components/Button/Button";
import { IconButton } from "rift-ds/components/IconButton/IconButton";
import { Input } from "rift-ds/components/Input/Input";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { LegendTile } from "rift-ds/components/LegendTile/LegendTile";
import { PageHeader } from "rift-ds/components/PageHeader/PageHeader";
import { Stat } from "rift-ds/components/Stat/Stat";
import { BarChart, PieChart } from "rift-ds/charts";
import {
  Table,
  type TableColumn,
  type TableRow,
} from "rift-ds/components/Table/Table";
import {
  compareDecimal,
  formatMoney,
  subtractDecimal,
  sumDecimal,
  type DecimalString,
} from "rift-ds/format";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import { AppFrameTabBar, useAppFrame } from "../AppFrame/AppFrame";
import TemplateShell from "../TemplateShell/TemplateShell";
import StickyTopBar from "../TemplateShell/StickyTopBar";
import { ProductMark } from "../ProductMark/ProductMark";
import styles from "./ProfitAndLoss.module.css";

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    category: "Finance",
    items: [
      { key: "home", icon: "home", label: "Home" },
      { key: "transactions", icon: "receipt_long", label: "Transactions" },
      { key: "invoices", icon: "request_quote", label: "Invoices" },
      {
        key: "reports",
        icon: "monitoring",
        label: "Reports",
        children: [
          { key: "reports-pl", label: "Profit and loss" },
          { key: "reports-balance", label: "Balance sheet" },
          { key: "reports-cash", label: "Cash flow" },
        ],
      },
      {
        key: "accounts",
        icon: "account_balance",
        label: "Accounts",
        children: [
          { key: "accounts-bank", label: "Bank accounts" },
          { key: "accounts-chart", label: "Chart of accounts" },
        ],
      },
    ],
  },
  {
    category: "Account",
    items: [
      { key: "support", icon: "headset_mic", label: "Support" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

const CURRENCY = "USD";
const LOCALE = "en-US";

type Line = {
  id: string;
  label: string;
  now: DecimalString;
  before: DecimalString;
};
type Section = { id: string; label: string; total: string; lines: Line[] };

/* One quarter against the last. Every figure is a decimal string. */
const REVENUE: Section = {
  id: "revenue",
  label: "Revenue",
  total: "Total revenue",
  lines: [
    { id: "r1", label: "Product sales", now: "412850.00", before: "388120.00" },
    { id: "r2", label: "Subscriptions", now: "96400.00", before: "91250.00" },
    { id: "r3", label: "Services", now: "38275.50", before: "41960.00" },
  ],
};

const COST_OF_SALES: Section = {
  id: "cost",
  label: "Cost of sales",
  total: "Total cost of sales",
  lines: [
    { id: "c1", label: "Materials", now: "151320.40", before: "143870.00" },
    { id: "c2", label: "Fulfilment", now: "38610.00", before: "36240.00" },
    { id: "c3", label: "Payment fees", now: "14204.65", before: "13385.10" },
  ],
};

const OPERATING: Section = {
  id: "operating",
  label: "Operating expenses",
  total: "Total operating expenses",
  lines: [
    { id: "o1", label: "Salaries", now: "142500.00", before: "138000.00" },
    {
      id: "o2",
      label: "Rent and utilities",
      now: "21600.00",
      before: "21600.00",
    },
    { id: "o3", label: "Marketing", now: "33840.00", before: "27410.00" },
    { id: "o4", label: "Software", now: "9215.30", before: "8870.30" },
    { id: "o5", label: "Travel", now: "4128.75", before: "6302.40" },
  ],
};

const OTHER: Section = {
  id: "other",
  label: "Other income and tax",
  total: "Total other",
  lines: [
    { id: "x1", label: "Interest earned", now: "1840.20", before: "1612.75" },
    { id: "x2", label: "Income tax", now: "-27340.00", before: "-24690.00" },
  ],
};

/* ------------------------------------------------------------- helpers */

const totalOf = (section: Section, key: "now" | "before") =>
  sumDecimal(section.lines.map((line) => line[key]));
const money = (value: DecimalString) =>
  formatMoney(value, { currency: CURRENCY, locale: LOCALE });
const percent = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

/** The change from last quarter as a share of it, or a dash-free "New" when there was nothing before. */
function change(now: DecimalString, before: DecimalString): string {
  if (compareDecimal(before, "0") === 0) return "New";
  return percent.format(
    (Number(now) - Number(before)) / Math.abs(Number(before)),
  );
}

const figures = (now: DecimalString, before: DecimalString) => ({
  now: money(now),
  before: money(before),
  change: change(now, before),
});

/* The subtractions down the statement, worked out once. */
const revenueNow = totalOf(REVENUE, "now");
const revenueBefore = totalOf(REVENUE, "before");
const costNow = totalOf(COST_OF_SALES, "now");
const costBefore = totalOf(COST_OF_SALES, "before");
const grossNow = subtractDecimal(revenueNow, costNow);
const grossBefore = subtractDecimal(revenueBefore, costBefore);
const operatingNow = totalOf(OPERATING, "now");
const operatingBefore = totalOf(OPERATING, "before");
const operatingProfitNow = subtractDecimal(grossNow, operatingNow);
const operatingProfitBefore = subtractDecimal(grossBefore, operatingBefore);
const otherNow = totalOf(OTHER, "now");
const otherBefore = totalOf(OTHER, "before");
const netNow = sumDecimal([operatingProfitNow, otherNow]);
const netBefore = sumDecimal([operatingProfitBefore, otherBefore]);

function sectionRows(section: Section): TableRow[] {
  return [
    {
      id: `${section.id}-heading`,
      variant: "heading",
      cells: { line: section.label, now: "", before: "", change: "" },
    },
    ...section.lines.map((line) => ({
      id: line.id,
      cells: { line: line.label, ...figures(line.now, line.before) },
    })),
    {
      id: `${section.id}-total`,
      variant: "total" as const,
      cells: {
        line: section.total,
        ...figures(totalOf(section, "now"), totalOf(section, "before")),
      },
    },
  ];
}

const resultRow = (
  id: string,
  label: string,
  now: DecimalString,
  before: DecimalString,
): TableRow => ({
  id,
  variant: "total",
  cells: { line: label, ...figures(now, before) },
});

const COLUMNS: TableColumn[] = [
  { key: "line", header: "Line", rowHeader: true },
  { key: "now", header: "Jul to Sep", align: "end" },
  { key: "before", header: "Apr to Jun", align: "end" },
  { key: "change", header: "Change", align: "end" },
];

const ROWS: TableRow[] = [
  ...sectionRows(REVENUE),
  ...sectionRows(COST_OF_SALES),
  resultRow("gross", "Gross profit", grossNow, grossBefore),
  ...sectionRows(OPERATING),
  resultRow(
    "operating-profit",
    "Operating profit",
    operatingProfitNow,
    operatingProfitBefore,
  ),
  ...sectionRows(OTHER),
  resultRow("net", "Net profit", netNow, netBefore),
];

/* ------------------------------------------------------- the summary */

/* Margins are a share of revenue, for display only: the amounts behind
   them stay decimal strings. */
const share = (part: DecimalString, whole: DecimalString) => Number(part) / Number(whole);
const plainPercent = new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits: 1 });
const points = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1, signDisplay: "exceptZero" });
const trendOf = (delta: number) => (delta > 0 ? "up" : delta < 0 ? "down" : "neutral") as "up" | "down" | "neutral";

const grossMarginNow = share(grossNow, revenueNow);
const grossMarginBefore = share(grossBefore, revenueBefore);
const operatingMarginNow = share(operatingProfitNow, revenueNow);
const operatingMarginBefore = share(operatingProfitBefore, revenueBefore);
/* A margin's move in points, its arrow read from the figure as written, so
   "0 pts" never wears an arrow. */
const pointsMove = (now: number, before: number) => {
  const written = Number(((now - before) * 100).toFixed(1));
  return { delta: `${points.format(written)} pts`, trend: trendOf(written) };
};
const amountMove = (now: DecimalString, before: DecimalString) => ({
  delta: change(now, before),
  trend: trendOf(compareDecimal(now, before)),
});

const SUMMARY = [
  { id: "revenue", icon: "payments", label: "Revenue", value: money(revenueNow), ...amountMove(revenueNow, revenueBefore) },
  { id: "gross", icon: "percent", label: "Gross margin", value: plainPercent.format(grossMarginNow), ...pointsMove(grossMarginNow, grossMarginBefore) },
  { id: "operating", icon: "trending_up", label: "Operating margin", value: plainPercent.format(operatingMarginNow), ...pointsMove(operatingMarginNow, operatingMarginBefore) },
  { id: "net", icon: "account_balance_wallet", label: "Net profit", value: money(netNow), ...amountMove(netNow, netBefore) },
];

/* Net profit by month: July and August as booked, September what is left
   of the quarter, so the three bars add up to the statement's bottom line. */
const JULY = "33120.40";
const AUGUST = "35904.15";
const SEPTEMBER = subtractDecimal(netNow, sumDecimal([JULY, AUGUST]));
const compactMoney = (value: number) => formatMoney(value, { currency: CURRENCY, locale: LOCALE, notation: "compact" });
/* The month the quarter's profit averaged, for the chart's header. */
const MONTHLY_AVERAGE = money(String((Number(netNow) / 3).toFixed(2)));
const NET_BY_MONTH = [
  { month: "Jul", net: Number(JULY) },
  { month: "Aug", net: Number(AUGUST) },
  { month: "Sep", net: Number(SEPTEMBER) },
];

/* Where the operating money went: each line's share of the section. */
const seriesSwatch = (series: number) => `var(--color-chart-series-${series})`;
const SPEND = OPERATING.lines.map((line, index) => ({
  name: line.label,
  value: Number(line.now),
  color: seriesSwatch(index + 1),
}));

const CHAT_SUGGESTIONS = [
  { id: "net", label: "How did the quarter end?" },
  { id: "margin", label: "What is the gross margin?" },
  { id: "costs", label: "Which costs grew most?" },
];

const CHAT_REPLIES: Record<string, string> = {
  net: `Net profit for July to September is ${money(netNow)}, against ${money(netBefore)} the quarter before, a change of ${change(netNow, netBefore)}. Revenue grew faster than the costs under it.`,
  margin: `Gross profit is ${money(grossNow)} on ${money(revenueNow)} of revenue, a gross margin of ${percent.format(Number(grossNow) / Number(revenueNow)).replace("+", "")}.`,
  costs:
    "Marketing grew the most, up by about a quarter on the last, then materials with sales. Travel fell by about a third, and rent held flat.",
};

const CHAT_FALLBACK =
  "This assistant is a mock, so only the suggested questions have real answers. In the live product this reply would come from the books behind this statement.";

/* ---------------------------------------------------------------- page */

export default function ProfitAndLoss() {
  const [chatOpen, setChatOpen] = React.useState(false);
  /* The templates carousel's Mobile mode: previewed as a phone app. */
  const appFrame = useAppFrame();

  return (
    <TemplateShell
      sidebar={{
        sections: NAV_SECTIONS,
        profile: { name: "Ines Albrecht", email: "ines@tallyfold.example" },
        activeKey: "reports",
        logo: <ProductMark />,
        logoText: "Tallyfold",
      }}
      chatOpen={chatOpen}
      frame={{ title: "Profit and loss", subtitle: "Jul to Sep 2026" }}
      contentClassName={styles.content}
      tabBar={
        <AppFrameTabBar
          sections={NAV_SECTIONS}
          activeKey="reports"
          productName="Tallyfold"
          onAsk={() => setChatOpen(true)}
        />
      }
      assistant={
        <TemplateAssistant
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          title="Tallyfold AI"
          askLine="Ask about the quarter, the margins or a line"
          suggestions={CHAT_SUGGESTIONS}
          replies={CHAT_REPLIES}
          fallback={CHAT_FALLBACK}
          disclaimer="A mock assistant with canned answers over this statement."
        />
      }
    >
      {!appFrame && (
        <StickyTopBar>
          <div className={styles.topBar}>
            <div className={styles.search}>
              <Input
                placeholder="Search accounts"
                iconLeft="search"
                aria-label="Search accounts"
              />
              <span className={styles.searchKbd} aria-hidden="true">
                <Kbd size="compact">⌘</Kbd>
                <Kbd size="compact">K</Kbd>
              </span>
            </div>
            <div className={styles.topBarActions}>
              <IconButton
                icon="search"
                variant="secondary"
                tone="neutral"
                label="Search accounts"
                className={styles.searchIconMobile}
              />
              <AiButton label="Ask AI" onClick={() => setChatOpen(true)} />
              <IconButton
                icon="notifications"
                variant="secondary"
                tone="neutral"
                label="Notifications"
              />
            </div>
          </div>
        </StickyTopBar>
      )}

      <div className={styles.page}>
        {!appFrame && (
          <PageHeader
            title="Profit and loss"
            description="Brightwater Goods, July to September 2026, against the quarter before."
            actions={
              <Button variant="secondary" label="Export" iconLeft="download" />
            }
          />
        )}

        {/* The quarter in four figures, each against the quarter before. */}
        <section className={styles.stats} aria-label="The quarter at a glance">
          {SUMMARY.map((stat) => (
            <div key={stat.id} className={styles.card}>
              <Stat
                icon={stat.icon}
                caption="Jul to Sep"
                value={stat.value}
                label={stat.label}
                delta={stat.delta}
                trend={stat.trend}
                deltaPlacement="auto"
              />
            </div>
          ))}
        </section>

        <div className={styles.spread}>
          {/* The statement is the stage; the charts beside it show its shape. */}
          <div className={styles.statement}>
            <Table
              caption="Profit and loss, July to September 2026"
              captionHidden
              bordered
              columns={COLUMNS}
              rows={ROWS}
            />
          </div>

          <aside className={styles.summary} aria-label="The quarter's shape">
            <section className={styles.card} aria-label="Net profit by month">
              <Stat value={MONTHLY_AVERAGE} label="Net profit, monthly average" />
              <BarChart data={NET_BY_MONTH} xKey="month" yKey="net" dataLabel="Net profit" yAxisFormatter={compactMoney} height={180} bare />
            </section>

            <section className={styles.card} aria-label="Operating expenses">
              {/* No arrow: a cost that rises is not good news, and the statement beside it says by how much. */}
              <Stat value={money(operatingNow)} label="Operating expenses" />
              <PieChart data={SPEND} innerRadius="62%" height={200} showLegend={false} bare />
              <div className={styles.legend}>
                {SPEND.map((slice) => (
                  <LegendTile key={slice.name} swatch={slice.color} label={slice.name} value={compactMoney(slice.value)} />
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </TemplateShell>
  );
}
