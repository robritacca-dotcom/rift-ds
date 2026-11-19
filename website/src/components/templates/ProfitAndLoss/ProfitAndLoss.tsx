"use client";

/**
 * The profit and loss template: the quarterly statement screen for
 * Tallyfold, a fictional bookkeeping product, showing an invented company's
 * quarter. The shell is the family's (TemplateShell's switchable rail and
 * surface, slim top bar, docked mock assistant); the stage is the statement
 * itself, so there is no KPI band (design.md's Template screens rule 3).
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
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { Input } from "rift-ds/components/Input/Input";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { PageHeader } from "rift-ds/components/PageHeader/PageHeader";
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
              <CircularButton
                icon="search"
                variant="secondary"
                tone="neutral"
                ariaLabel="Search accounts"
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

        <div className={styles.statement}>
          <Table
            caption="Profit and loss, July to September 2026"
            captionHidden
            bordered
            columns={COLUMNS}
            rows={ROWS}
          />
        </div>
      </div>
    </TemplateShell>
  );
}
