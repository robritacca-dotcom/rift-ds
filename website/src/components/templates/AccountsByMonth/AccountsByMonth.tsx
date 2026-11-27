"use client";

/**
 * The accounts by month template: the balances screen of Fernhouse, a
 * fictional household money app that reads every account a family holds at
 * every bank and keeps nothing itself. It shows an invented family, the
 * Marlowes, across three invented banks (their marks from InstitutionMarks)
 * and their house. The shell is the family's (TemplateShell's switchable
 * rail and surface, slim top bar, docked mock assistant).
 *
 * The month-end table is the stage and takes the room: a DataTable with
 * one row per account (its bank's invented mark, its type, and the bank and
 * number under it), grouped by owner so each group's row carries its
 * subtotal, the latest month pinned at the end edge and the owner and the
 * account at the start, and a totals row held to the bottom: net worth in
 * the Balance view, the net change in the Change view. Each value is green
 * when it rose from the month before and red when it fell. The table's
 * TableToolbar carries search, filters, sorts, grouping, the Columns panel
 * (the section, bank and type columns start hidden) and density, with a
 * SegmentedControl in its actions that flips the cells between balances,
 * the change and the change as a percentage. Its Describe goes through
 * describeAccounts below, a small interpreter over this page's own data, as
 * the analytics template's does, so the demo never bills a model. Two charts
 * above it (net worth at each month end over the year, stacked by whose
 * accounts hold it, and each month's change) read its shape at a glance, in
 * the family's stat and chart card.
 *
 * Every balance is a decimal string, added and subtracted with rift-ds/format
 * and written with formatMoney in a pinned locale, so every total ties out to
 * its rows and the prerendered HTML and the hydrating client never disagree.
 * Both charts and the table are worked out from the same rows.
 *
 * All of it is fictional, so the route is excluded from the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs). The assistant is the shared
 * TemplateAssistant mock, answering over these balances.
 */

import React from "react";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { Icon } from "rift-ds/components/Icon/Icon";
import { AvatarGroup } from "rift-ds/components/AvatarGroup/AvatarGroup";
import { Button } from "rift-ds/components/Button/Button";
import { PageHeader } from "rift-ds/components/PageHeader/PageHeader";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Stat } from "rift-ds/components/Stat/Stat";
import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
  type DataTableTotal,
} from "rift-ds/components/DataTable/DataTable";
import {
  TableToolbar,
  type TableToolbarCommandRequest,
  type TableToolbarCommandResult,
} from "rift-ds/components/TableToolbar/TableToolbar";
import { MOTION_AUTOPLAY_INTERVAL_MS } from "rift-ds/tokens/motion";
import { AreaChart, BarChart } from "rift-ds/charts";
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
import TemplateToolbar from "../TemplateShell/TemplateToolbar";
import { PORTRAITS } from "@/lib/attachment-demo";
import { ProductMark } from "../ProductMark/ProductMark";
import {
  INSTITUTION_MARKS,
  InstitutionMark,
  type InstitutionMarkId,
} from "../InstitutionMarks/InstitutionMarks";
import styles from "./AccountsByMonth.module.css";

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    category: "Money",
    items: [
      { key: "home", icon: "home", label: "Home" },
      {
        key: "accounts",
        icon: "account_balance",
        label: "Accounts",
        children: [
          { key: "accounts-all", label: "All accounts" },
          { key: "accounts-month", label: "By month" },
          { key: "accounts-connections", label: "Connections" },
        ],
      },
      { key: "transactions", icon: "receipt_long", label: "Transactions" },
      { key: "spending", icon: "donut_small", label: "Spending" },
      {
        key: "payments",
        icon: "payments",
        label: "Payments",
        children: [
          { key: "payments-bills", label: "Bill pay" },
          { key: "payments-transfers", label: "e-Transfer contacts" },
        ],
      },
    ],
  },
  {
    category: "Household",
    items: [
      { key: "family", icon: "family_restroom", label: "Family" },
      { key: "documents", icon: "folder", label: "Documents" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

const CURRENCY = "CAD";
const LOCALE = "en-CA";

type PersonId = "maya" | "daniel" | "leo" | "ivy";
const PEOPLE: Record<PersonId, string> = {
  maya: "Maya Marlowe",
  daniel: "Daniel Marlowe",
  leo: "Leo Marlowe",
  ivy: "Ivy Marlowe",
};
/* Each person's portrait from the demo sample set; the Avatar falls back to
   their initials if a picture fails to load. */
const PORTRAIT: Record<PersonId, string> = {
  maya: PORTRAITS.woman,
  daniel: PORTRAITS.man,
  leo: PORTRAITS.boy,
  ivy: PORTRAITS.girl,
};

type InstitutionId = InstitutionMarkId | "property";
const INSTITUTIONS: { id: InstitutionId; label: string }[] = [
  { id: "regal", label: INSTITUTION_MARKS.regal.name },
  { id: "albion", label: INSTITUTION_MARKS.albion.name },
  { id: "wealthclear", label: INSTITUTION_MARKS.wealthclear.name },
  { id: "property", label: "Property" },
];

type Kind =
  | "Chequing"
  | "Savings"
  | "Credit card"
  | "Mortgage"
  | "Line of credit"
  | "Car loan"
  | "RESP"
  | "TFSA"
  | "RRSP"
  | "Investing"
  | "Home estimate";

type Account = {
  id: string;
  institution: InstitutionId;
  label: string;
  kind: Kind;
  owners: PersonId[];
  /** Who holds it, written out: "Joint", or a child's account with the parent beside them. */
  holding: string;
  /** The balance at each month end, Dec 31 2025 to Nov 30 2026. A debt is negative. */
  balances: DecimalString[];
};

/* Month ends from Dec 31 2025 to Nov 30 2026, pinned strings. */
const MONTH_ENDS = [
  { short: "Dec", end: "Dec 31" },
  { short: "Jan", end: "Jan 31" },
  { short: "Feb", end: "Feb 28" },
  { short: "Mar", end: "Mar 31" },
  { short: "Apr", end: "Apr 30" },
  { short: "May", end: "May 31" },
  { short: "Jun", end: "Jun 30" },
  { short: "Jul", end: "Jul 31" },
  { short: "Aug", end: "Aug 31" },
  { short: "Sep", end: "Sep 30" },
  { short: "Oct", end: "Oct 31" },
  { short: "Nov", end: "Nov 30" },
];
const LAST = MONTH_ENDS.length - 1;
/* The table shows the last six month ends; the charts show all twelve. */
const TABLE_MONTHS = [6, 7, 8, 9, 10, 11];

const ACCOUNTS: Account[] = [
  { id: "joint-chequing", institution: "regal", label: "Joint chequing ••4410", kind: "Chequing", owners: ["maya", "daniel"], holding: "Joint", balances: ["9017.63", "7217.63", "7451.42", "7472.86", "6905.25", "7062.54", "7076.65", "7014.82", "7778.40", "7885.99", "7800.27", "8412.37"] },
  { id: "maya-chequing", institution: "regal", label: "Maya's chequing ••2281", kind: "Chequing", owners: ["maya"], holding: "Maya", balances: ["2846.68", "2939.13", "3062.27", "3434.08", "3819.83", "3453.33", "3608.08", "3855.80", "3528.34", "3371.06", "3046.36", "2906.14"] },
  { id: "leo-youth", institution: "regal", label: "Leo's youth account ••9034", kind: "Chequing", owners: ["leo"], holding: "Leo, with Maya", balances: ["58.30", "139.39", "172.25", "207.92", "191.53", "200.56", "203.38", "190.53", "233.94", "215.74", "214.64", "412.80"] },
  { id: "ivy-resp", institution: "regal", label: "RESP for Ivy ••5160", kind: "RESP", owners: ["maya", "daniel"], holding: "Joint, for Ivy", balances: ["17458.70", "17821.04", "18223.10", "18671.81", "19121.11", "19354.56", "19641.76", "19990.49", "20290.42", "20632.51", "20938.25", "21340.55"] },
  { id: "maya-visa", institution: "regal", label: "Maya's Visa ••7712", kind: "Credit card", owners: ["maya"], holding: "Maya", balances: ["-551.59", "-758.79", "-642.28", "-734.60", "-761.61", "-1022.86", "-710.28", "-812.42", "-902.06", "-1288.86", "-1532.16", "-1842.60"] },
  { id: "mortgage", institution: "regal", label: "Mortgage ••0098", kind: "Mortgage", owners: ["maya", "daniel"], holding: "Joint", balances: ["-503925.74", "-502317.67", "-500705.89", "-499098.53", "-497490.92", "-495882.44", "-494274.73", "-492663.18", "-491050.40", "-489441.40", "-487833.88", "-486220.00"] },
  { id: "heloc", institution: "regal", label: "Home equity line ••0412", kind: "Line of credit", owners: ["maya", "daniel"], holding: "Joint", balances: ["-15150.00", "-14900.00", "-14650.00", "-14400.00", "-14150.00", "-13900.00", "-13650.00", "-13400.00", "-13150.00", "-12900.00", "-12650.00", "-12400.00"] },
  { id: "daniel-chequing", institution: "albion", label: "Daniel's chequing ••5520", kind: "Chequing", owners: ["daniel"], holding: "Daniel", balances: ["2367.60", "2856.90", "2457.23", "2599.07", "2953.45", "2847.72", "2558.43", "2943.30", "2747.45", "3050.86", "3521.79", "3118.92"] },
  { id: "joint-savings", institution: "albion", label: "Joint savings ••6671", kind: "Savings", owners: ["maya", "daniel"], holding: "Joint", balances: ["18063.37", "18621.47", "19150.91", "19707.53", "20224.74", "20740.61", "21274.32", "21810.64", "22382.46", "22913.12", "23440.18", "24500.00"] },
  { id: "ivy-savings", institution: "albion", label: "Ivy's savings ••1187", kind: "Savings", owners: ["ivy"], holding: "Ivy, with Daniel", balances: ["-1.18", "20.18", "43.35", "51.43", "60.09", "82.42", "98.91", "113.58", "137.76", "151.82", "164.25", "186.25"] },
  { id: "daniel-visa", institution: "albion", label: "Daniel's Visa ••3309", kind: "Credit card", owners: ["daniel"], holding: "Daniel", balances: ["-3146.91", "-2948.59", "-3134.50", "-2843.15", "-2659.03", "-2242.62", "-2599.16", "-2505.98", "-2100.86", "-1704.50", "-1983.68", "-4915.08"] },
  { id: "car-loan", institution: "albion", label: "Car loan ••4402", kind: "Car loan", owners: ["daniel"], holding: "Daniel", balances: ["-25616.46", "-25012.84", "-24410.74", "-23807.52", "-23200.02", "-22596.34", "-21990.65", "-21383.54", "-20778.18", "-20174.81", "-19572.40", "-18960.00"] },
  { id: "maya-tfsa", institution: "wealthclear", label: "Maya's TFSA ••3321", kind: "TFSA", owners: ["maya"], holding: "Maya", balances: ["42644.41", "43426.89", "44791.78", "45995.47", "46247.33", "46084.17", "46714.07", "46977.88", "46895.14", "46603.96", "47006.23", "48210.33"] },
  { id: "daniel-rrsp", institution: "wealthclear", label: "Daniel's RRSP ••8870", kind: "RRSP", owners: ["daniel"], holding: "Daniel", balances: ["86345.43", "87681.22", "87049.25", "89430.12", "90973.22", "93185.90", "92543.16", "91955.42", "91704.53", "92874.74", "94386.65", "96775.10"] },
  { id: "joint-investing", institution: "wealthclear", label: "Joint investing ••4105", kind: "Investing", owners: ["maya", "daniel"], holding: "Joint", balances: ["13163.35", "13405.56", "13667.81", "14027.93", "14290.13", "14437.79", "14302.95", "14722.56", "14733.90", "14992.20", "15101.54", "15402.66"] },
  { id: "house", institution: "property", label: "The house · 14 Larchmount Ave", kind: "Home estimate", owners: ["maya", "daniel"], holding: "Joint", balances: ["790000.00", "792000.00", "794000.00", "796000.00", "798000.00", "800000.00", "802000.00", "804000.00", "806000.00", "808000.00", "808000.00", "812000.00"] },
];

/* ------------------------------------------------------------- helpers */

const money = (value: DecimalString) =>
  formatMoney(value, { currency: CURRENCY, locale: LOCALE });
const signedMoney = (value: DecimalString) =>
  formatMoney(value, { currency: CURRENCY, locale: LOCALE, signDisplay: "exceptZero" });
const compactMoney = (value: number) =>
  formatMoney(value, { currency: CURRENCY, locale: LOCALE, notation: "compact" });
const percent = new Intl.NumberFormat(LOCALE, {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

const sumAt = (accounts: Account[], month: number) =>
  sumDecimal(accounts.map((account) => account.balances[month]));
const changeAt = (accounts: Account[], month: number) =>
  subtractDecimal(sumAt(accounts, month), sumAt(accounts, month - 1));
/* The change as a share of the month before, against its size, so paying
   down a debt reads as a rise. For display only. */
const percentAt = (accounts: Account[], month: number) => {
  const before = sumAt(accounts, month - 1);
  if (compareDecimal(before, "0") === 0) return "New";
  return percent.format(Number(changeAt(accounts, month)) / Math.abs(Number(before)));
};
const trendOf = (value: DecimalString): "up" | "down" | "neutral" => {
  const order = compareDecimal(value, "0");
  return order > 0 ? "up" : order < 0 ? "down" : "neutral";
};

const ofKinds = (...kinds: Kind[]) =>
  ACCOUNTS.filter((account) => kinds.includes(account.kind));
const OWED = ofKinds("Credit card", "Mortgage", "Line of credit", "Car loan");

/* Whose money it is: a joint account is the couple's, any other its one
   owner's, so the bands stack to net worth. */
const holderOf = (person: PersonId) => ({
  key: person as string,
  label: PEOPLE[person].split(" ")[0],
  accounts: ACCOUNTS.filter((a) => a.owners.length === 1 && a.owners[0] === person),
});
const HOLDERS = [
  holderOf("maya"),
  holderOf("daniel"),
  { key: "joint", label: "Joint", accounts: ACCOUNTS.filter((a) => a.owners.length > 1) },
  holderOf("leo"),
  holderOf("ivy"),
];
const NET_BY_HOLDER = MONTH_ENDS.map((month, index) => {
  const point: Record<string, string | number> = { month: month.short };
  for (const holder of HOLDERS) point[holder.key] = Number(sumAt(holder.accounts, index));
  return point;
});
const CHANGE_BY_MONTH = MONTH_ENDS.slice(1).map((month, index) => ({
  month: month.short,
  change: Number(changeAt(ACCOUNTS, index + 1)),
}));
const YEAR_CHANGE = subtractDecimal(sumAt(ACCOUNTS, LAST), sumAt(ACCOUNTS, 0));
const AVERAGE_MONTH = money((Number(YEAR_CHANGE) / LAST).toFixed(2));

/* --------------------------------------------------------- the table */

type View = "balance" | "change" | "percent";
const VIEWS = [
  { value: "balance", label: "Balance", icon: "account_balance_wallet" },
  { value: "change", label: "Change", icon: "swap_vert" },
  { value: "percent", label: "% change", icon: "percent" },
];

/** One month's cell for a set of accounts (one account, a bank, or all), in the chosen view. */
/* Each value is green when it rose from the month before and red when it
   fell, in every view. A debt that shrinks rises toward zero, so paying one
   down reads green too. The sign is said in the text as well (a change
   carries its + or -), so the colour is never the only signal. */
function Tinted({ change, children }: { change: DecimalString; children: React.ReactNode }) {
  const order = compareDecimal(change, "0");
  const tone = order > 0 ? styles.up : order < 0 ? styles.down : undefined;
  return <span className={tone}>{children}</span>;
}

function cell(accounts: Account[], month: number, view: View): React.ReactNode {
  if (month === 0) return view === "balance" ? money(sumAt(accounts, month)) : "";
  const change = changeAt(accounts, month);
  const text =
    view === "change"
      ? signedMoney(change)
      : view === "percent"
        ? percentAt(accounts, month)
        : money(sumAt(accounts, month));
  return <Tinted change={change}>{text}</Tinted>;
}

/* The table reads like the family's own spreadsheet, grouped by whose
   money it is. What they have, what they owe and the house are a column of
   their own, hidden to start, that the toolbar can show, filter or group by. */
const SECTIONS: { id: string; label: string; kinds: Kind[] }[] = [
  { id: "cash", label: "Cash and investments", kinds: ["Chequing", "Savings", "RESP", "TFSA", "RRSP", "Investing"] },
  { id: "owed", label: "Owed", kinds: ["Credit card", "Line of credit", "Car loan", "Mortgage"] },
  { id: "property", label: "Property", kinds: ["Home estimate"] },
];

/* The account's type as the sheet writes it, short. */
const SHORT_KIND: Partial<Record<Kind, string>> = {
  Investing: "Non-reg",
  "Line of credit": "Home equity line",
  "Home estimate": "Home",
};
const shortKind = (account: Account) => SHORT_KIND[account.kind] ?? account.kind;
const institutionOf = (account: Account) => INSTITUTIONS.find((i) => i.id === account.institution)!;
const holderFor = (account: Account) => HOLDERS.find((h) => h.accounts.includes(account))!;
const sectionFor = (account: Account) => SECTIONS.find((s) => s.kinds.includes(account.kind))!;
const ACCOUNT_BY_ID = new Map(ACCOUNTS.map((account) => [account.id, account]));
const accountsOf = (rows: DataTableRow[]) => rows.map((row) => ACCOUNT_BY_ID.get(row.id)!);

function OwnerCell({ holder }: { holder: (typeof HOLDERS)[number] }) {
  const people: PersonId[] = holder.key === "joint" ? ["maya", "daniel"] : [holder.key as PersonId];
  return (
    <span className={styles.owners}>
      <AvatarGroup size="sm">
        {people.map((person) => (
          <Avatar key={person} name={PEOPLE[person]} src={PORTRAIT[person]} alt="" size="sm" />
        ))}
      </AvatarGroup>
      <span className={styles.ownerName}>{holder.label}</span>
    </span>
  );
}

function AccountName({ account }: { account: Account }) {
  const institution = institutionOf(account);
  const number = account.label.split("••")[1];
  const name =
    institution.id === "property"
      ? "14 Larchmount Ave, estimate"
      : `${institution.label}${number ? ` ••${number}` : ""}`;
  return (
    <span className={styles.account}>
      {institution.id === "property" ? (
        <Icon name="home" tile className={styles.mark} />
      ) : (
        <InstitutionMark id={institution.id} decorative className={styles.mark} />
      )}
      <span className={styles.accountText}>
        <span className={styles.kind}>{shortKind(account)}</span>
        <span className={styles.secondary}>{name}</span>
      </span>
    </span>
  );
}

/* Each row's raw values follow the view, so a sort, a filter and the
   totals footer work on what the cells show: the balance, the change in
   dollars, or the change as a number of percent. */
function valueAt(account: Account, month: number, view: View): number {
  if (view === "balance") return Number(account.balances[month]);
  const change = Number(changeAt([account], month));
  if (view === "change") return change;
  const before = Number(account.balances[month - 1]);
  return before === 0 ? 0 : Number(((change / Math.abs(before)) * 100).toFixed(1));
}

function rowsFor(view: View): DataTableRow[] {
  return ACCOUNTS.map((account) => {
    const values: DataTableRow["values"] = {
      owner: holderFor(account).label,
      account: `${shortKind(account)} ${institutionOf(account).label} ${account.label}`,
      section: sectionFor(account).label,
      bank: institutionOf(account).label,
      type: shortKind(account),
    };
    for (const month of TABLE_MONTHS) values[`m${month}`] = valueAt(account, month, view);
    return { id: account.id, values };
  });
}

const optionsOf = (labels: string[]) => [...new Set(labels)].map((label) => ({ value: label, label }));

const HOLDER_LABELS = HOLDERS.map((holder) => holder.label);

/* Starting widths, in pixels: room for the owner's portraits and name, the
   account's mark and two lines, and a full six-figure amount per month. */
const COLUMN_WIDTHS: Record<string, number> = {
  owner: 170,
  account: 280,
  section: 200,
  bank: 180,
  type: 160,
  ...Object.fromEntries(TABLE_MONTHS.map((month) => [`m${month}`, 150])),
};
const MONTH_KEYS = TABLE_MONTHS.map((month) => `m${month}`);

const withWidths = (columns: DataTableColumn[]) =>
  columns.map((column) => ({ ...column, width: `${COLUMN_WIDTHS[column.key]}px` }));

function columnsFor(view: View): DataTableColumn[] {
  return withWidths([
    {
      key: "owner",
      header: "Owner",
      pin: "start",
      groupable: true,
      groupOrder: HOLDER_LABELS,
      options: optionsOf(HOLDER_LABELS),
      hideable: false,
      render: (row) => <OwnerCell holder={holderFor(ACCOUNT_BY_ID.get(row.id)!)} />,
    },
    {
      key: "account",
      header: "Account",
      rowHeader: true,
      pin: "start",
      hideable: false,
      filterable: false,
      render: (row) => <AccountName account={ACCOUNT_BY_ID.get(row.id)!} />,
    },
    {
      key: "section",
      header: "Section",
      groupable: true,
      groupOrder: SECTIONS.map((section) => section.label),
      options: optionsOf(SECTIONS.map((section) => section.label)),
      defaultHidden: true,
    },
    {
      key: "bank",
      header: "Bank",
      groupable: true,
      options: optionsOf(INSTITUTIONS.map((institution) => institution.label)),
      defaultHidden: true,
    },
    {
      key: "type",
      header: "Type",
      groupable: true,
      options: optionsOf(ACCOUNTS.map(shortKind)),
      defaultHidden: true,
    },
    ...TABLE_MONTHS.map(
      (month): DataTableColumn => ({
        key: `m${month}`,
        header: MONTH_ENDS[month].end,
        type: view === "percent" ? "number" : "currency",
        format: { currency: CURRENCY, locale: LOCALE },
        align: "end",
        sortable: true,
        /* The latest month holds at the end edge while the rest scroll. */
        pin: month === LAST ? "end" : undefined,
        render: (row) => cell([ACCOUNT_BY_ID.get(row.id)!], month, view),
        /* A group's row: its accounts added up, tinted against the month before. */
        aggregate: (_values, rows) => cell(accountsOf(rows), month, view),
      }),
    ),
  ]);
}

/* The footer adds up the rows shown: net worth in the Balance view and the
   net change in the Change view. Percentages do not add up, so the
   % change view leaves it empty. */
const totalsFor = (view: View): Record<string, DataTableTotal> =>
  Object.fromEntries(MONTH_KEYS.map((key) => [key, view === "percent" ? "none" : "sum"]));

/* ------------------------------------------------------------ describe */

/* The pause while Describe "thinks", so its working state shows. */
const DESCRIBE_THINK_MS = MOTION_AUTOPLAY_INTERVAL_MS / 4;

const DESCRIBE_PLACEHOLDER = "Maya's registered accounts, last 3 months, biggest first";

const DESCRIBE_FALLBACK =
  "This demo understands people, banks, account types, what you own or owe, a number of months, a grouping and an order. Try the sentence in the field.";

/* The words Describe knows, each mapped to the values a filter matches. */
const PEOPLE_WORDS: [RegExp, string[]][] = [
  [/\bmaya/, ["Maya"]],
  [/\bdaniel/, ["Daniel"]],
  [/\bjoint|\bshared/, ["Joint"]],
  [/\bleo\b/, ["Leo"]],
  [/\bivy\b/, ["Ivy"]],
  [/\bkids?\b|\bchildren/, ["Leo", "Ivy"]],
];
const TYPE_WORDS: [RegExp, string[]][] = [
  [/\bregistered|\bretirement/, ["RESP", "TFSA", "RRSP"]],
  [/\bresp\b/, ["RESP"]],
  [/\btfsa/, ["TFSA"]],
  [/\brrsp/, ["RRSP"]],
  [/non-?reg|\binvesting/, ["Non-reg"]],
  [/chequing|checking/, ["Chequing"]],
  [/\bsavings/, ["Savings"]],
  [/credit cards?|\bvisa/, ["Credit card"]],
  [/mortgage/, ["Mortgage"]],
  [/home equity|heloc/, ["Home equity line"]],
  [/car loan/, ["Car loan"]],
];
const SECTION_WORDS: [RegExp, string[]][] = [
  [/\bcash\b|\bassets|what we (have|own)/, ["Cash and investments"]],
  [/\bowe\b|\bowed\b|\bdebts?\b|liabilit/, ["Owed"]],
  [/\bhouse\b|\bproperty\b/, ["Property"]],
];
const BANK_WORDS: [RegExp, string][] = INSTITUTIONS.filter((i) => i.id !== "property").map((i) => [
  new RegExp(i.label.split(" ")[0].toLowerCase()),
  i.label,
]);
const GROUP_WORDS: [RegExp, string][] = [
  [/by (bank|institution)/, "bank"],
  [/by (type|account type)/, "type"],
  [/by section/, "section"],
  [/by (owner|person|people|who)/, "owner"],
];
const NUMBER_WORDS: Record<string, number> = { two: 2, three: 3, four: 4, five: 5, six: 6 };

const matching = (asked: string, words: [RegExp, string[]][]) => [
  ...new Set(words.filter(([pattern]) => pattern.test(asked)).flatMap(([, values]) => values)),
];

/** Reads one sentence into a table setup: whose accounts, which banks and
    types, what is owned or owed, how many months, the grouping and the
    order. Everything it does not recognise, it leaves as it was. */
async function describeAccounts({
  text,
  view,
  signal,
}: TableToolbarCommandRequest): Promise<TableToolbarCommandResult> {
  await new Promise((resolve) => setTimeout(resolve, DESCRIBE_THINK_MS));
  signal.throwIfAborted();
  const asked = text.toLowerCase();

  const people = matching(asked, PEOPLE_WORDS);
  const types = matching(asked, TYPE_WORDS);
  const sections = matching(asked, SECTION_WORDS);
  const banks = BANK_WORDS.filter(([pattern]) => pattern.test(asked)).map(([, label]) => label);
  const filters: NonNullable<typeof view.filters> = [];
  for (const [column, values] of [
    ["owner", people],
    ["type", types],
    ["section", sections],
    ["bank", banks],
  ] as const) {
    if (values.length > 0) filters.push({ id: `${column}-1`, column, operator: "isAnyOf", value: [...values] });
  }

  const grouping = GROUP_WORDS.find(([pattern]) => pattern.test(asked))?.[1];
  const months = asked.match(/last (\d|two|three|four|five|six) months?/);
  const shown = months ? Number(months[1]) || NUMBER_WORDS[months[1]] : 0;
  const order = asked.match(/\b(biggest|largest|most|highest|smallest|least|lowest)\b/);

  if (filters.length === 0 && !grouping && shown === 0 && !order) return { message: DESCRIBE_FALLBACK };

  const otherHidden = (view.hiddenColumns ?? []).filter((key) => !MONTH_KEYS.includes(key));
  const hiddenColumns =
    shown > 0 ? [...otherHidden, ...MONTH_KEYS.slice(0, Math.max(0, MONTH_KEYS.length - shown))] : view.hiddenColumns;
  const sorts = order
    ? [{ key: `m${LAST}`, direction: /smallest|least|lowest/.test(order[1]) ? ("asc" as const) : ("desc" as const) }]
    : view.sorts;

  const found = ACCOUNTS.filter(
    (account) =>
      (people.length === 0 || people.includes(holderFor(account).label)) &&
      (types.length === 0 || types.includes(shortKind(account))) &&
      (sections.length === 0 || sections.includes(sectionFor(account).label)) &&
      (banks.length === 0 || banks.includes(institutionOf(account).label)),
  ).length;

  return {
    view: {
      ...view,
      filters: filters.length > 0 ? filters : view.filters,
      grouping: grouping ? [grouping] : view.grouping,
      hiddenColumns,
      sorts,
    },
    message: `Showing ${found} of ${ACCOUNTS.length} accounts.`,
  };
}

const CHAT_SUGGESTIONS = [
  { id: "moved", label: "What moved in Nov?" },
  { id: "grew", label: "Which account grew most?" },
  { id: "owed", label: "How much do we owe?" },
];

/* The replies quote the table's own figures, so they cannot drift from it. */
const novemberChange = (...ids: string[]) =>
  money(changeAt(ACCOUNTS.filter((a) => ids.includes(a.id)), LAST).replace("-", ""));
const wealthclear = ACCOUNTS.filter((a) => a.institution === "wealthclear").map((a) => a.id);
const CHAT_REPLIES: Record<string, string> = {
  moved: `Net worth changed by ${signedMoney(changeAt(ACCOUNTS, LAST))} from Oct 31 to Nov 30. The house estimate added ${novemberChange("house")}, Wealthclear ${novemberChange(...wealthclear)}, and the mortgage payment cut what you owe by ${novemberChange("mortgage")}. The furnace went the other way: ${novemberChange("daniel-visa")} more on Daniel's Visa.`,
  grew: `Daniel's RRSP grew most in November, by ${novemberChange("daniel-rrsp")}. Of the cash, the joint savings added ${novemberChange("joint-savings")}.`,
  owed: `You owe ${money(sumAt(OWED, LAST).replace("-", ""))} on Nov 30, across the mortgage, the home equity line, the car loan and two Visa cards. Since Oct 31 it has ${compareDecimal(changeAt(OWED, LAST), "0") < 0 ? "risen" : "fallen"} by ${novemberChange(...OWED.map((a) => a.id))}, as the furnace on Daniel's Visa outweighed the month's loan payments.`,
};

const CHAT_FALLBACK =
  "This assistant is a mock, so only the suggested questions have real answers. In the live product this reply would come from the balances behind this table.";

/* ---------------------------------------------------------------- page */

export default function AccountsByMonth() {
  const [chatOpen, setChatOpen] = React.useState(false);
  const [view, setView] = React.useState<View>("balance");
  /* The templates carousel's Mobile mode: previewed as a phone app. */
  const appFrame = useAppFrame();
  const rows = React.useMemo(() => rowsFor(view), [view]);
  const columns = React.useMemo(() => columnsFor(view), [view]);
  const totals = React.useMemo(() => totalsFor(view), [view]);

  return (
    <TemplateShell
      sidebar={{
        sections: NAV_SECTIONS,
        profile: { name: "Maya Marlowe", email: "maya@fernhouse.example", avatarUrl: PORTRAITS.woman },
        activeKey: "accounts",
        logo: <ProductMark />,
        logoText: "Fernhouse",
      }}
      chatOpen={chatOpen}
      frame={{ title: "Balances by month", subtitle: "Jun 30 to Nov 30" }}
      contentClassName={styles.content}
      tabBar={
        <AppFrameTabBar
          sections={NAV_SECTIONS}
          activeKey="accounts"
          productName="Fernhouse"
          onAsk={() => setChatOpen(true)}
        />
      }
      assistant={
        <TemplateAssistant
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          title="Fernhouse AI"
          askLine="Ask about a month, an account or a bank"
          suggestions={CHAT_SUGGESTIONS}
          replies={CHAT_REPLIES}
          fallback={CHAT_FALLBACK}
          disclaimer="A mock assistant with canned answers over these balances."
        />
      }
    >
      {!appFrame && <TemplateToolbar onChat={() => setChatOpen(true)} />}

      <div className={styles.page}>
        {!appFrame && (
          <PageHeader
            title="Balances by month"
            description="Every account the Marlowes hold, at each month end, against the month before."
            actions={<Button variant="secondary" label="Export" iconLeft="download" />}
          />
        )}

        <div className={styles.charts}>
          <section className={styles.card} aria-label="Net worth at each month end, by whose accounts">
            <Stat
              value={money(sumAt(ACCOUNTS, LAST))}
              label="Net worth by whose accounts, Dec 31 to Nov 30"
              delta={`${signedMoney(YEAR_CHANGE)} in the year`}
              trend={trendOf(YEAR_CHANGE)}
            />
            <AreaChart
              data={NET_BY_HOLDER}
              xKey="month"
              series={HOLDERS.map((holder, index) => ({
                dataKey: holder.key,
                label: holder.label,
                color: `var(--color-chart-series-${index + 1})`,
              }))}
              stacked
              showLegend
              yAxisFormatter={compactMoney}
              height={220}
              locale={LOCALE}
              bare
            />
          </section>
          <section className={styles.card} aria-label="Change from the month before">
            <Stat value={AVERAGE_MONTH} label="Change in an average month" />
            <BarChart
              data={CHANGE_BY_MONTH}
              xKey="month"
              yKey="change"
              dataLabel="Change from the month before"
              yAxisFormatter={compactMoney}
              height={220}
              locale={LOCALE}
              bare
            />
          </section>
        </div>

        <section className={styles.stage} aria-label="Balances at each month end">
          <DataTable
            caption="Every account at each month end, Jun 30 to Nov 30 2026"
            columns={columns}
            rows={rows}
            locale={LOCALE}
            defaultGrouping={["owner"]}
            cellText="nowrap"
            totalsRow
            totals={totals}
            stickyHeader
            maxHeight="min(720px, 80vh)"
            toolbar={
              <TableToolbar
                command={{ onSubmit: describeAccounts }}
                labels={{ commandPlaceholder: DESCRIBE_PLACEHOLDER }}
                actions={
                  <SegmentedControl
                    segments={VIEWS}
                    value={view}
                    onValueChange={(next) => setView(next as View)}
                    ariaLabel="Show in each month"
                  />
                }
              />
            }
          />
        </section>
      </div>
    </TemplateShell>
  );
}
