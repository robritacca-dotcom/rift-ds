"use client";

/**
 * The household accounts template: the accounts screen of Fernhouse, a
 * fictional household money app that reads every account a family holds at
 * every bank and keeps nothing itself. It shows an invented family, the
 * Marlowes, across three invented banks (their marks from InstitutionMarks)
 * and their house. The shell is the family's (TemplateShell's switchable
 * rail and surface, slim top bar, docked mock assistant).
 *
 * The screen is deliberately plain: a page header, a band of three KPI cards
 * in merchant sales' stat card (the total across the accounts, then the
 * part in registered plans and the part outside them, each with its
 * variance since the last month end; net worth belongs a level up), and one frameless DataTable of every account as it stands today, a
 * full TableToolbar over it (search, filters, sorts, grouping by
 * registration, type or owner, the Columns panel and density),
 * each column sortable from its header, each row movable by hand from a grip in
 * the table's margin, and each row ending on its actions. Each row is the
 * bank's invented mark with the account's name and bank, then whether it is registered, its type, its
 * number, its owners (Avatar portraits from the demo sample set, with the
 * holding written out: Joint, or a child's account with the parent beside
 * them) and its balance. The rows run cash first, then what is invested; the
 * debts and the house live on pages of their own, so they stay out of the
 * list. The list is the stage, so there is no
 * chart (design.md's Template screens rule 3).
 *
 * Every balance is a decimal string, added with rift-ds/format and written
 * with formatMoney in a pinned locale, so the figures tie out to the rows
 * and the prerendered HTML and the hydrating client never disagree.
 *
 * All of it is fictional, so the route is excluded from the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs). The assistant is the shared
 * TemplateAssistant mock, answering over these balances.
 */

import React from "react";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { AvatarGroup } from "rift-ds/components/AvatarGroup/AvatarGroup";
import { Icon } from "rift-ds/components/Icon/Icon";
import { PageHeader } from "rift-ds/components/PageHeader/PageHeader";
import { Stat } from "rift-ds/components/Stat/Stat";
import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
  type DataTableRowAction,
} from "rift-ds/components/DataTable/DataTable";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import { BREAKPOINT_MOBILE_PX, mediaBelow } from "rift-ds/tokens/breakpoints";
import { compareDecimal, formatMoney, subtractDecimal, sumDecimal, type DecimalString } from "rift-ds/format";
import { PORTRAITS } from "@/lib/attachment-demo";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import { AppFrameTabBar, useAppFrame } from "../AppFrame/AppFrame";
import TemplateShell from "../TemplateShell/TemplateShell";
import TemplateToolbar from "../TemplateShell/TemplateToolbar";
import { ProductMark } from "../ProductMark/ProductMark";
import {
  INSTITUTION_MARKS,
  InstitutionMark,
  type InstitutionMarkId,
} from "../InstitutionMarks/InstitutionMarks";
import styles from "./HouseholdAccounts.module.css";

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
      { key: "family", icon: "group", label: "Family" },
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
const INSTITUTION_NAME: Record<InstitutionId, string> = {
  regal: INSTITUTION_MARKS.regal.name,
  albion: INSTITUTION_MARKS.albion.name,
  wealthclear: INSTITUTION_MARKS.wealthclear.name,
  property: "Your estimate",
};

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
  name: string;
  /** The last four digits, empty for the house. */
  number: string;
  kind: Kind;
  owners: PersonId[];
  /** Who holds it, written out: "Joint", or a child's account with the parent beside them. */
  holding: string;
  /** Today's balance. A debt is negative. */
  balance: DecimalString;
  /** The balance at the last month end, Oct 31, for the variance on the cards. */
  lastMonth: DecimalString;
};

const ACCOUNTS: Account[] = [
  { id: "joint-chequing", institution: "regal", name: "Joint chequing", number: "4410", kind: "Chequing", owners: ["maya", "daniel"], holding: "Joint", balance: "8412.37" , lastMonth: "7800.27" },
  { id: "maya-chequing", institution: "regal", name: "Maya's chequing", number: "2281", kind: "Chequing", owners: ["maya"], holding: "Maya", balance: "2906.14" , lastMonth: "3046.36" },
  { id: "leo-youth", institution: "regal", name: "Leo's youth account", number: "9034", kind: "Chequing", owners: ["leo"], holding: "Leo, with Maya", balance: "412.80" , lastMonth: "214.64" },
  { id: "ivy-resp", institution: "regal", name: "RESP for Ivy", number: "5160", kind: "RESP", owners: ["maya", "daniel"], holding: "Joint, for Ivy", balance: "21340.55" , lastMonth: "20938.25" },
  { id: "maya-visa", institution: "regal", name: "Maya's Visa", number: "7712", kind: "Credit card", owners: ["maya"], holding: "Maya", balance: "-1842.60" , lastMonth: "-1532.16" },
  { id: "mortgage", institution: "regal", name: "Mortgage", number: "0098", kind: "Mortgage", owners: ["maya", "daniel"], holding: "Joint", balance: "-486220.00" , lastMonth: "-487833.88" },
  { id: "heloc", institution: "regal", name: "Home equity line", number: "0412", kind: "Line of credit", owners: ["maya", "daniel"], holding: "Joint", balance: "-12400.00" , lastMonth: "-12650.00" },
  { id: "daniel-chequing", institution: "albion", name: "Daniel's chequing", number: "5520", kind: "Chequing", owners: ["daniel"], holding: "Daniel", balance: "3118.92" , lastMonth: "3521.79" },
  { id: "joint-savings", institution: "albion", name: "Joint savings", number: "6671", kind: "Savings", owners: ["maya", "daniel"], holding: "Joint", balance: "24500.00" , lastMonth: "23440.18" },
  { id: "ivy-savings", institution: "albion", name: "Ivy's savings", number: "1187", kind: "Savings", owners: ["ivy"], holding: "Ivy, with Daniel", balance: "186.25" , lastMonth: "164.25" },
  { id: "daniel-visa", institution: "albion", name: "Daniel's Visa", number: "3309", kind: "Credit card", owners: ["daniel"], holding: "Daniel", balance: "-4915.08" , lastMonth: "-1983.68" },
  { id: "car-loan", institution: "albion", name: "Car loan", number: "4402", kind: "Car loan", owners: ["daniel"], holding: "Daniel", balance: "-18960.00" , lastMonth: "-19572.40" },
  { id: "maya-tfsa", institution: "wealthclear", name: "Maya's TFSA", number: "3321", kind: "TFSA", owners: ["maya"], holding: "Maya", balance: "48210.33" , lastMonth: "47006.23" },
  { id: "daniel-rrsp", institution: "wealthclear", name: "Daniel's RRSP", number: "8870", kind: "RRSP", owners: ["daniel"], holding: "Daniel", balance: "96775.10" , lastMonth: "94386.65" },
  { id: "joint-investing", institution: "wealthclear", name: "Joint investing", number: "4105", kind: "Investing", owners: ["maya", "daniel"], holding: "Joint", balance: "15402.66" , lastMonth: "15101.54" },
  { id: "house", institution: "property", name: "The house · 14 Larchmount Ave", number: "", kind: "Home estimate", owners: ["maya", "daniel"], holding: "Joint", balance: "812000.00" , lastMonth: "808000.00" },
];

/* What each kind of account is, for the figures and the row order: cash
   first, then what is invested, then what is owed, then the house. */
const GROUPS: { id: string; label: string; kinds: Kind[] }[] = [
  { id: "cash", label: "Cash", kinds: ["Chequing", "Savings"] },
  { id: "invested", label: "Investments", kinds: ["RESP", "TFSA", "RRSP", "Investing"] },
  { id: "owed", label: "Owed", kinds: ["Credit card", "Line of credit", "Car loan", "Mortgage"] },
  { id: "property", label: "Property", kinds: ["Home estimate"] },
];

/* The type as a person would say it. */
const TYPE_LABEL: Partial<Record<Kind, string>> = {
  Investing: "Investment",
  "Line of credit": "Home equity line",
  "Home estimate": "Property",
};

/* ------------------------------------------------------------- helpers */

const money = (value: DecimalString) => formatMoney(value, { currency: CURRENCY, locale: LOCALE });
const totalOf = (accounts: Account[]) => sumDecimal(accounts.map((account) => account.balance));
/* A group's accounts, in the order of its kinds, so like sits with like. */
const ofGroup = (id: string) => {
  const group = GROUPS.find((g) => g.id === id)!;
  return group.kinds.flatMap((kind) => ACCOUNTS.filter((account) => account.kind === kind));
};

/* What the family holds in its accounts, the ones this page lists. The
   debts and the house live on pages of their own, and net worth, which
   takes them into account, belongs a level up. */
const HELD = [...ofGroup("cash"), ...ofGroup("invested")];

/* Whether the account is a registered plan (RESP, TFSA, RRSP, sheltered
   from tax) or an ordinary one. */
const REGISTERED: Kind[] = ["RESP", "TFSA", "RRSP"];
const isRegistered = (account: Account) => REGISTERED.includes(account.kind);
const registrationOf = (account: Account) => (isRegistered(account) ? "Registered" : "Non-registered");

/* The variance against the last month end, written with its sign. */
const signedMoney = (value: DecimalString) =>
  formatMoney(value, { currency: CURRENCY, locale: LOCALE, signDisplay: "exceptZero" });
const varianceOf = (accounts: Account[]) =>
  subtractDecimal(totalOf(accounts), sumDecimal(accounts.map((account) => account.lastMonth)));
const trendOf = (value: DecimalString): "up" | "down" | "neutral" => {
  const order = compareDecimal(value, "0");
  return order > 0 ? "up" : order < 0 ? "down" : "neutral";
};

/* The household in four figures, in merchant sales' KPI cards, each with
   its variance since the last month end. A debt is negative, so owing more
   reads as a fall and paying it down as a rise, the same way as the rest. */
const FIGURES = [
  { id: "total", icon: "account_balance_wallet", label: "Total account balance", accounts: HELD },
  { id: "registered", icon: "shield", label: "Registered", accounts: HELD.filter(isRegistered) },
  { id: "non-registered", icon: "account_balance", label: "Non-registered", accounts: HELD.filter((a) => !isRegistered(a)) },
].map((figure) => {
  const variance = varianceOf(figure.accounts);
  return {
    ...figure,
    value: money(totalOf(figure.accounts)),
    delta: `${signedMoney(variance)} vs last month`,
    trend: trendOf(variance),
  };
});

/* ---------------------------------------------------------- the table */

function AccountName({ account }: { account: Account }) {
  return (
    <span className={styles.account}>
      {account.institution === "property" ? (
        <Icon name="home" tile className={styles.mark} />
      ) : (
        <InstitutionMark id={account.institution} decorative className={styles.mark} />
      )}
      <span className={styles.accountText}>
        <span>{account.name}</span>
        <span className={styles.secondary}>{INSTITUTION_NAME[account.institution]}</span>
      </span>
    </span>
  );
}

function Owners({ account }: { account: Account }) {
  return (
    <span className={styles.owners}>
      <AvatarGroup size="sm">
        {account.owners.map((person) => (
          <Avatar key={person} name={PEOPLE[person]} src={PORTRAIT[person]} alt="" size="sm" />
        ))}
      </AvatarGroup>
      <span>{account.holding}</span>
    </span>
  );
}

const ACCOUNT_BY_ID = new Map(ACCOUNTS.map((account) => [account.id, account]));
const accountOf = (row: DataTableRow) => ACCOUNT_BY_ID.get(row.id)!;
const typeOf = (account: Account) => TYPE_LABEL[account.kind] ?? account.kind;

/* A filter's choices, from the values the rows hold. */
const optionsOf = (labels: string[]) => [...new Set(labels)].map((label) => ({ value: label, label }));

/* Every column sorts from its header. A row's raw values are what it sorts
   by: the name, the type, the number, who holds it, the balance as a number. */
const COLUMNS: DataTableColumn[] = [
  /* Wide enough for the mark and the longest name over its bank, so a
     narrow screen scrolls the table sideways rather than cutting them. */
  { key: "account", header: "Account", rowHeader: true, sortable: true, width: "240px", render: (row) => <AccountName account={accountOf(row)} /> },
  { key: "registration", header: "Registered", sortable: true, groupable: true, options: optionsOf(["Registered", "Non-registered"]) },
  { key: "type", header: "Type", sortable: true, groupable: true, options: optionsOf(HELD.map(typeOf)) },
  { key: "number", header: "Account number", sortable: true, filterable: false },
  {
    key: "owners",
    header: "Owners",
    sortable: true,
    groupable: true,
    options: optionsOf(HELD.map((account) => account.holding)),
    render: (row) => <Owners account={accountOf(row)} />,
  },
  {
    key: "balance",
    header: "Balance",
    type: "currency",
    format: { currency: CURRENCY, locale: LOCALE },
    sortable: true,
  },
];

/* Each row's actions, at its end: Open account as a button, the rest in its
   More menu. This is a demo, so they do nothing yet. */
const rowActions = (row: DataTableRow): DataTableRowAction[] => {
  const name = accountOf(row).name;
  const nothing = () => {};
  return [
    { id: "open", label: `Open ${name}`, icon: "chevron_right", inline: true, onSelect: nothing },
    { id: "transfer", label: "Transfer from this account", icon: "swap_horiz", onSelect: nothing },
    { id: "statement", label: "Download statement", icon: "download", onSelect: nothing },
    { id: "rename", label: "Rename", icon: "edit", onSelect: nothing },
  ];
};

/* The list holds the family's accounts: cash first, then what is
   invested. The debts and the house live on pages of their own, so their
   groups stay out of the rows. A sort reorders the rows, and clearing it
   returns here. */
const ROWS: DataTableRow[] = GROUPS.filter((group) => group.id === "cash" || group.id === "invested").flatMap((group) =>
  ofGroup(group.id).map((account) => ({
    id: account.id,
    values: {
      account: account.name,
      registration: registrationOf(account),
      type: typeOf(account),
      number: account.number ? `••${account.number}` : "",
      owners: account.holding,
      balance: Number(account.balance),
    },
  })),
);

/* --------------------------------------------------------- the assistant */

const CHAT_SUGGESTIONS = [
  { id: "total", label: "What do we hold in all?" },
  { id: "grew", label: "What grew most this month?" },
  { id: "kids", label: "What do the kids hold?" },
];

/* The account that rose most since the last month end, debts aside. */
const BIGGEST_GAIN = HELD.reduce((best, account) =>
  compareDecimal(subtractDecimal(account.balance, account.lastMonth), subtractDecimal(best.balance, best.lastMonth)) > 0
    ? account
    : best,
);
const kidsAccounts = ACCOUNTS.filter((a) => a.owners.every((o) => o === "leo" || o === "ivy"));
const CHAT_REPLIES: Record<string, string> = {
  total: `Across these accounts you hold ${money(totalOf(HELD))}: ${money(totalOf(ofGroup("cash")))} in cash and ${money(totalOf(ofGroup("invested")))} invested. Of it, ${money(totalOf(HELD.filter(isRegistered)))} is in registered plans. That is ${signedMoney(varianceOf(HELD))} since the last month end.`,
  grew: `${BIGGEST_GAIN.name} grew most since the last month end, by ${signedMoney(subtractDecimal(BIGGEST_GAIN.balance, BIGGEST_GAIN.lastMonth))}, to ${money(BIGGEST_GAIN.balance)}.`,
  kids: `Leo and Ivy hold ${money(totalOf(kidsAccounts))} between them, each in an account of their own with a parent beside them. Ivy's RESP is joint, held by you both for her.`,
};

const CHAT_FALLBACK =
  "This assistant is a mock, so only the suggested questions have real answers. In the live product this reply would come from the balances behind this list.";

/* ---------------------------------------------------------------- page */

/* The mobile layout's query: at and below the width where the rail becomes
   a drawer, the page has only the phone gutter at its sides, too little for
   the frameless table's reach and its outer control, so the table takes its
   mobile form there (bordered, the grip an ordinary first column) and, on a
   phone, stacks each account as a card. */
const MOBILE_QUERY = mediaBelow(BREAKPOINT_MOBILE_PX);
const subscribeMobile = (onChange: () => void) => {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const readMobile = () => window.matchMedia(MOBILE_QUERY).matches;
const useMobile = () => React.useSyncExternalStore(subscribeMobile, readMobile, () => false);

export default function HouseholdAccounts() {
  const [chatOpen, setChatOpen] = React.useState(false);
  /* The templates carousel's Mobile mode: previewed as a phone app. */
  const appFrame = useAppFrame();
  /* The phone preview is the mobile layout too, whatever the window's width. */
  const mobile = useMobile() || appFrame;

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
      frame={{ title: "Accounts", subtitle: "The Marlowes" }}
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
          askLine="Ask about an account, a person or what you owe"
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
          <PageHeader title="Accounts" />
        )}

        <section className={styles.figures} aria-label="The household today">
          {FIGURES.map((figure) => (
            <div key={figure.id} className={styles.card}>
              <Stat
                icon={figure.icon}
                caption="Today"
                value={figure.value}
                label={figure.label}
                delta={figure.delta}
                trend={figure.trend}
                deltaPlacement="auto"
              />
            </div>
          ))}
        </section>

        <DataTable
          caption="Every account the Marlowes hold, today"
          frameless={!mobile}
          locale={LOCALE}
          columns={COLUMNS}
          rows={ROWS}
          /* A grip in the frameless table's margin moves a row by hand
             (or Alt+Up and Alt+Down); a sort owns the order while it is on. */
          reorderableRows
          outerControl={!mobile}
          /* On a phone each account is a card, its name and bank the title. */
          phoneLayout="stack"
          rowActions={rowActions}
          /* The library's full table toolbar: search, filters, sorts,
             grouping, the Columns panel and the density switch, with the
             page's actions at its end (Add account the primary one). */
          toolbar={
            <TableToolbar
              labels={{ search: "Search accounts" }}
              primaryAction={{ id: "add", label: "Add account", icon: "add", onSelect: () => {} }}
              secondaryActions={[
                { id: "transfer", label: "Transfer funds", icon: "swap_horiz", onSelect: () => {} },
              ]}
            />
          }
          rowActionsVisibility="always"
        />
      </div>
    </TemplateShell>
  );
}
