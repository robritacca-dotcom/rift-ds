"use client";

/**
 * The merchant sales template: the sales view of Larkspur, a fictional commerce
 * back office, built from the design system alone. The shell is the template
 * family's (TemplateShell's switchable rail and surface, slim top bar) and the
 * assistant is live, not the family's mock (MerchantChat.tsx, seated in
 * TemplateAssistant), and the rail carries the family's store switcher. The page is a
 * breadcrumbed head, the month's numbers as a KPI band, the year as two charts (net
 * revenue with its margin rate, and orders by channel group), then the wired DataTable, which sits directly on the page because it brings its
 * own bordered chrome (design.md's Composition rule 2). Its control bar is the
 * library's TableToolbar, with the AI command live: Describe sends the sentence to
 * the same model route as the labs bench, over the same seeded orders.
 * On a phone the rows stack as cards. What the reader ticks or highlights on the
 * page becomes the assistant's focus (usePageFocus below, chatFocus.tsx).
 *
 * The KPI band and the charts are pinned figures (website/src/data/merchant-sales.ts),
 * read off the seeded ledger (the band for Oct 1 to 30, 2026 against September, the
 * charts for the twelve months to it), leaving out cancelled orders from the money, so
 * the statically built HTML draws them with no rows to hand.
 * All of it is fictional, so the route is excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { CHAT_SOURCE_ATTRIBUTE, describeSelection, useChatAgentState, useChatWidget, useSelectionFocus } from "rift-ds/chat";
import { Breadcrumb } from "rift-ds/components/Breadcrumb/Breadcrumb";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { Input } from "rift-ds/components/Input/Input";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { LegendTile } from "rift-ds/components/LegendTile/LegendTile";
import { AreaChart, ComboChart } from "rift-ds/charts";
import { Stat } from "rift-ds/components/Stat/Stat";
import styles from "./MerchantSales.module.css";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import { MerchantChatProvider, MerchantChatWidget, useToastsClearOfPanel, type TableBridge } from "./MerchantChat";
import { highlightRanges, useChatFocus, type ChatFocus } from "./chatFocus";
import { OrderEditsProvider, useOrderEdits } from "./orderEdits";
import { ORDER_ACTIONS, skippedText, withEdit, type ActionPlan, type OrderActionId } from "@/lib/order-actions";
import { AlertDialog } from "rift-ds/components/AlertDialog/AlertDialog";
import { useToast } from "rift-ds/components/Toast/Toast";
import type { TableToolbarSelection } from "rift-ds/components/TableToolbar/TableToolbar";
import { MOTION_ACTION_DISMISS_MS } from "rift-ds/tokens/motion";
import { AppFrameTabBar, useAppFrame } from "../AppFrame/AppFrame";
import TemplateShell from "../TemplateShell/TemplateShell";
import StickyTopBar from "../TemplateShell/StickyTopBar";
import { ProductMark } from "../ProductMark/ProductMark";
import { useSampleEntities } from "../sampleEntities";
import {
  MERCHANT_CHANNELS,
  MERCHANT_CHART_LABELS,
  MERCHANT_CHARTS,
  MERCHANT_KPIS,
  MERCHANT_KPI_PERIOD,
  MERCHANT_OPENING_FILTER,
  MERCHANT_OPENING_SORT,
  MERCHANT_SHOWN_COLUMNS,
  computeCharts,
  computeKpis,
} from "@/data/merchant-sales";
import { nextView } from "@/lib/order-ledger-view";
import { COLUMN_KEYS, ledgerRows } from "@/data/order-ledger";
import OrdersTable from "./OrdersTable";

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    items: [
      { key: "sales", icon: "monitoring", label: "Sales" },
      {
        key: "products",
        icon: "inventory_2",
        label: "Products",
        children: [
          { key: "products-catalogue", label: "Catalogue" },
          { key: "products-inventory", label: "Inventory" },
          { key: "products-pricing", label: "Pricing" },
        ],
      },
      { key: "customers", icon: "group", label: "Customers" },
      { key: "fulfilment", icon: "local_shipping", label: "Fulfilment" },
      { key: "returns", icon: "assignment_return", label: "Returns" },
      { key: "promotions", icon: "sell", label: "Promotions" },
    ],
  },
  {
    items: [
      { key: "support", icon: "headset_mic", label: "Support" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

/* The assistant's welcome chips: a few drawn at random from here on each new chat. */
const CHAT_STARTERS = [
  { id: "best", label: "What sold best in Oct?" },
  { id: "late", label: "Which carrier runs latest?" },
  { id: "overdue", label: "How much is overdue?" },
  { id: "largest", label: "Who placed the largest order?" },
  { id: "customer", label: "Who orders the most?" },
  { id: "margin", label: "What is the margin this month?" },
  { id: "cancelled", label: "How many were cancelled?" },
  { id: "region", label: "Which region earns the most?" },
  { id: "channel", label: "Which channel sells the most?" },
  { id: "rep", label: "Which rep leads on revenue?" },
  { id: "product-margin", label: "Which product has top margin?" },
  { id: "september", label: "How does Oct compare to Sep?" },
  { id: "year", label: "Which channel grew the most?" },
  { id: "sort", label: "Sort by revenue, largest first" },
  { id: "show-overdue", label: "Show only overdue orders" },
  { id: "group", label: "Group the table by carrier" },
  { id: "large", label: "Show orders over $50,000" },
  { id: "show-late", label: "Show late orders, worst first" },
  { id: "delayed", label: "Show the delayed orders" },
  { id: "meridian", label: "Show Meridian's late orders" },
  { id: "hide", label: "Hide the margin column" },
];

/* The charts' plot height: short enough that the band, both charts and the table's head share the first screen. */
const CHART_HEIGHT = 160;

/** The chart palette token for a 1-based series slot. */
const seriesSwatch = (series: number) => `var(--color-chart-series-${series})`;

/* ---------------------------------------------------------------- focus */

/* Highlighted text past this is a passage, not a phrase; the note and the request carry its start. */
const MAX_HIGHLIGHT = 300;

/**
 * Hands the chat whatever the reader last put in front of it on the page: ticked
 * rows, or a highlighted passage. A highlight is read for where it came from, the
 * smallest thing that holds all of it: a KPI card (data-chat-source), a cell (the table's
 * data-row and data-col), a row, or else the section around it. The server looks
 * that source up, so "$32.8M" arrives as the Net revenue figure and its
 * definition, not as a bare number; anything else travels with what it sits
 * in (the package's describeSelection). A selection anywhere else, the chat's own
 * panel included, is not the page, so it leaves the focus alone; a click that
 * collapses a highlight on the page lets it go.
 */
function usePageFocus(bridge: React.RefObject<TableBridge | null>) {
  const { getFocus, setFocus } = useChatFocus();

  /* The page, never the chat's panel: TemplateShell draws it, so it is found once mounted. */
  const page = useRef<Element | null>(null);
  useEffect(() => {
    page.current = document.querySelector(`.${CSS.escape(styles.content)}`);
  }, []);

  useSelectionFocus(page, (selected) => {
    if (!selected) {
      if (getFocus()?.kind === "text") setFocus(null);
      return;
    }
    const { holder } = selected;
    const row = holder.closest<HTMLElement>("tbody tr[data-row]");
    const column = holder.closest<HTMLElement>("[data-col]")?.dataset.col;
    const focus: ChatFocus = {
      kind: "text",
      text: selected.text.slice(0, MAX_HIGHLIGHT),
      kpi: holder.closest(`[${CHAT_SOURCE_ATTRIBUTE}]`)?.getAttribute(CHAT_SOURCE_ATTRIBUTE) ?? null,
      orderId: row?.dataset.row ?? null,
      column: row && column && COLUMN_KEYS.includes(column) ? column : null,
      section: holder.closest("[aria-label]")?.getAttribute("aria-label") ?? null,
      /* What it sits in, for a highlight the ledger cannot name: a heading's section, a card's other lines, a chart's labels. */
      selection: page.current ? describeSelection(selected, page.current) : undefined,
    };
    /* Kept so the chat can repaint the highlight once typing takes the selection away. */
    highlightRanges.set(focus, selected.range);
    setFocus(focus);
  });

  return useCallback(
    (ids: string[]) => {
      if (ids.length) {
        const matching = bridge.current?.matchingIds ?? [];
        setFocus({ kind: "orders", ids, all: matching.length > 1 && ids.length === matching.length });
      } else if (getFocus()?.kind === "orders") {
        setFocus(null);
      }
    },
    [bridge, getFocus, setFocus],
  );
}

/* The table's bridge, read at the moment of an event: a ref, so never during render. */
const tableOf = (bridge: React.RefObject<TableBridge | null>) => bridge.current;

/* ---------------------------------------------------------------- page */

export default function MerchantSales() {
  const bridge = useRef<TableBridge | null>(null);
  return (
    <OrderEditsProvider>
      <MerchantChatProvider bridge={bridge}>
        <MerchantSalesScreen bridge={bridge} />
      </MerchantChatProvider>
    </OrderEditsProvider>
  );
}

function MerchantSalesScreen({ bridge }: { bridge: React.RefObject<TableBridge | null> }) {
  const { open, setOpen, toggleOpen, view, panelPhase, returnFocusRef } = useChatWidget();
  const agentState = useChatAgentState();
  useToastsClearOfPanel();
  const onRowSelection = usePageFocus(bridge);
  const { setPageView, setFocus } = useChatFocus();
  /* Opening is all the ask takes: the focus is already the chat's. */
  const ask = useCallback(() => setOpen(true), [setOpen]);

  /* The bar's order actions: a click is the reader's own instruction, so fulfilling applies at once with the toast's Undo as the way back; a change that takes something away (a cancellation, a refund) confirms first. */
  const { edits, plan, run, reset } = useOrderEdits();
  /* The band and the charts as the reader has made them: worked out from the edited ledger once anything is changed, the pinned figures before (computeKpis and computeCharts give them exactly). */
  const { kpis, charts } = useMemo(() => {
    if (!Object.keys(edits).length) return { kpis: MERCHANT_KPIS, charts: MERCHANT_CHARTS };
    const rows = ledgerRows().map((row) => (edits[row.id] ? { ...row, values: withEdit(row.values, edits[row.id]) } : row));
    return { kpis: computeKpis(rows), charts: computeCharts(rows) };
  }, [edits]);
  const revenueByMonth = useMemo(
    () => MERCHANT_CHART_LABELS.map((month, at) => ({ month, revenue: charts.revenue.months[at], margin: charts.revenue.margins[at] })),
    [charts],
  );
  const ordersByMonth = useMemo(
    /* Keyed by series slot, not label: the chart names each series' gradient after its key, and a space in a key breaks that reference. */
    () => MERCHANT_CHART_LABELS.map((month, at) => ({ month, ...Object.fromEntries(MERCHANT_CHANNELS.map((channel, slot) => [`series${slot + 1}`, charts.orders.channels[channel][at]])) })),
    [charts],
  );
  const { toast, dismiss } = useToast();
  const [pending, setPending] = useState<ActionPlan | null>(null);
  const apply = useCallback(
    (next: ActionPlan) => {
      const action = ORDER_ACTIONS[next.action];
      const skipped = skippedText(next.skipped);
      const undo = run(next, "bar");
      const count = next.ids.length.toLocaleString("en-US");
      const toastId = toast({
        variant: "positive",
        description: `${count} ${next.ids.length === 1 ? "order" : "orders"} ${action.done}${skipped ? `; ${skipped} left alone` : ""}.`,
        duration: MOTION_ACTION_DISMISS_MS,
        action: (
          <Button
            variant="secondary"
            tone="neutral"
            size="compact"
            iconLeft="undo"
            label="Undo"
            onClick={() => {
              undo();
              dismiss(toastId);
            }}
          />
        ),
      });
    },
    [run, toast, dismiss],
  );
  const onAction = useCallback(
    (id: OrderActionId, selection: TableToolbarSelection) => {
      const except = new Set(selection.except);
      const ids = selection.allMatching ? (tableOf(bridge)?.matchingIds ?? []).filter((orderId) => !except.has(orderId)) : selection.ids;
      const action = ORDER_ACTIONS[id];
      const next = plan(id, ids);
      if (!next.ids.length) {
        toast({ variant: "info", description: `None of these can be ${action.done}: ${skippedText(next.skipped)}.`, duration: MOTION_ACTION_DISMISS_MS });
        return;
      }
      if (action.destructive) setPending(next);
      else apply(next);
    },
    [bridge, plan, apply, toast],
  );
  /* Reset starts the demo over: the edits, and the table, selection and focus they left behind (a filter to the changed orders, say). */
  const resetDemo = useCallback(() => {
    reset();
    setFocus(null);
    const table = tableOf(bridge);
    if (!table) return;
    table.setSelectedIds([]);
    table.applyView(
      nextView(table.view, {
        search: "",
        filters: [MERCHANT_OPENING_FILTER],
        sorts: [MERCHANT_OPENING_SORT],
        visibleColumns: MERCHANT_SHOWN_COLUMNS,
        pinnedColumns: ["orderId"],
        grouping: [],
        density: "default",
      }),
    );
  }, [reset, setFocus, bridge]);
  /* The dialog asks the question the reader would, in the action's own words (its verb and effect, beside its label): "Cancel 3 orders?", with what it does and what it leaves alone. */
  const pendingAction = pending ? ORDER_ACTIONS[pending.action] : null;
  const pendingVerb = pendingAction ? (pendingAction.verb ?? pendingAction.label) : "";
  const pendingNoun = pending?.ids.length === 1 ? "order" : "orders";
  const pendingSkipped = pending ? skippedText(pending.skipped) : "";
  /* Closing hands focus back to whatever opened it, as the launcher does. */
  useEffect(() => {
    if (!open) returnFocusRef.current?.focus();
  }, [open, returnFocusRef]);

  /* The templates carousel's Mobile mode: previewed as a phone app. */
  const appFrame = useAppFrame();
  /* The store switcher under the brand row, its tree picked with ?entities=. */
  const stores = useSampleEntities("merchant");

  return (
    <TemplateShell
      sidebar={{
        sections: NAV_SECTIONS,
        profile: { name: "Priya Raman", email: "priya@larkspur.example" },
        activeKey: "sales",
        logo: <ProductMark />,
        logoText: "Larkspur",
      }}
      entitySwitcher={stores && { ...stores, switcherLabel: "Switch store" }}
      chatOpen={open && view !== "full"}
      frame={{ title: "Sales", subtitle: "Larkspur · Merchant" }}
      contentClassName={styles.content}
      tabBar={
        <AppFrameTabBar
          sections={NAV_SECTIONS}
          activeKey="sales"
          productName="Larkspur"
          onAsk={toggleOpen}
        />
      }
      assistant={
        <TemplateAssistant
          open={open}
          onClose={() => setOpen(false)}
          title="Larkspur AI"
          chat={<MerchantChatWidget starters={CHAT_STARTERS} />}
          view={view}
          closing={panelPhase === "closing"}
        />
      }
    >
          {!appFrame && (
          <StickyTopBar>
            <div className={styles.topBar}>
              <div className={styles.search}>
                <Input
                  placeholder="Search Larkspur"
                  iconLeft="search"
                  aria-label="Search Larkspur"
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
                  tone="neutral"
                  ariaLabel="Search Larkspur"
                  className={styles.searchIconMobile}
                />
                <AiButton
                  label="Ask AI"
                  state={agentState}
                  aria-expanded={open}
                  onClick={(event) => {
                    returnFocusRef.current = event.currentTarget;
                    toggleOpen();
                  }}
                />
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

          {/* --------------------------------------------- page head */}
          <header className={styles.pageHead}>
            {!appFrame && (
            <div>
              <Breadcrumb
                items={[
                  { label: "Larkspur", href: "#" },
                  { label: "Sales" },
                ]}
              />
              <h1 className={styles.title}>Sales</h1>
            </div>
            )}
            <div className={styles.headActions}>
              {/* The demo's edits live for the visit; this starts it over without a reload. */}
              {Object.keys(edits).length > 0 && (
                <Button variant="tertiary" size="compact" label="Reset demo data" iconLeft="restart_alt" onClick={resetDemo} />
              )}
              <Button
                variant="secondary"
                size="compact"
                label="Export"
                iconLeft="download"
              />
              <Button
                variant="primary"
                size="compact"
                label="New order"
                iconLeft="add"
              />
            </div>
          </header>

          {/* -------------------------------------------- the month */}
          <section className={styles.kpiGrid} aria-label="October against September">
            {kpis.map((kpi) => (
              /* data-chat-source (CHAT_SOURCE_ATTRIBUTE) names the figure a highlight inside the card is about. */
              <div key={kpi.label} className={styles.kpi} data-chat-source={kpi.label}>
                {/* The period rides the card's top row, opposite the icon, so the label stays one short line at every width. */}
                <div className={styles.kpiHead}>
                  <span className={styles.kpiIcon} aria-hidden="true">
                    <span className="material-symbols-rounded">{kpi.icon}</span>
                  </span>
                  <span className={styles.kpiPeriod}>{MERCHANT_KPI_PERIOD}</span>
                </div>
                <Stat
                  value={kpi.value}
                  label={kpi.label}
                  delta={kpi.delta}
                  trend={kpi.trend}
                  deltaPlacement="auto"
                />
              </div>
            ))}
          </section>

          {/* ------------------------------------------- the year */}
          {/* The twelve months to October, against the twelve before: the same ledger as the band and the table. */}
          <div className={styles.chartsGrid}>
            <section className={styles.panel} aria-label="Net revenue by month">
              <Stat value={charts.revenue.total} label="Net revenue, last 12 months" delta={charts.revenue.delta} trend={charts.revenue.trend} deltaPlacement="inline" />
              <ComboChart data={revenueByMonth} xKey="month" barKey="revenue" barLabel="Net revenue ($M)" lineKey="margin" lineLabel="Margin (%)" height={CHART_HEIGHT} bare />
              <div className={styles.legendRow}>
                {/* The series' own measures, never the header's total again: an average month and the margin's spread. */}
                <LegendTile swatch={seriesSwatch(1)} label="Monthly average" value={charts.revenue.average} />
                <LegendTile swatch={seriesSwatch(2)} label="Margin range" value={charts.revenue.marginRange} />
              </div>
            </section>

            <section className={styles.panel} aria-label="Orders by channel">
              <Stat value={charts.orders.total} label="Orders, last 12 months" delta={charts.orders.delta} trend={charts.orders.trend} deltaPlacement="inline" />
              <AreaChart
                data={ordersByMonth}
                xKey="month"
                stacked
                series={MERCHANT_CHANNELS.map((channel, slot) => ({ dataKey: `series${slot + 1}`, label: channel }))}
                height={CHART_HEIGHT}
                showLegend={false}
                bare
              />
              <div className={styles.legendRow}>
                {MERCHANT_CHANNELS.map((group, at) => (
                  <LegendTile
                    key={group}
                    swatch={seriesSwatch(at + 1)}
                    label={group}
                    value={charts.orders.channels[group].reduce((total, count) => total + count, 0).toLocaleString("en-US")}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* ----------------------------------------- table section */}
          {/* The table sits directly on the page: the DataTable brings its own
              bordered chrome, so a panel around it would double-box it. */}
          <section className={styles.tableSection} aria-label="Orders">
            <OrdersTable bridge={bridge} onSelectionChange={onRowSelection} onPageView={setPageView} onAsk={ask} edits={edits} onAction={onAction} />
          </section>

          {/* A cancellation or a refund from the bar confirms first, naming what changes and what it leaves alone. */}
          <AlertDialog
            open={pending !== null}
            onOpenChange={(open) => !open && setPending(null)}
            title={pending ? `${pendingVerb} ${pending.ids.length.toLocaleString("en-US")} ${pendingNoun}?` : ""}
            description={[pending && pendingAction?.effect?.(pending.ids.length), pendingSkipped ? `Left as they are: ${pendingSkipped}.` : "", "You can undo this from the notice that follows."].filter(Boolean).join(" ")}
            confirmLabel={pending ? `${pendingVerb} ${pendingNoun}` : undefined}
            cancelLabel="Keep them"
            tone="destructive"
            onConfirm={() => {
              if (pending) apply(pending);
              setPending(null);
            }}
          />
    </TemplateShell>
  );
}
