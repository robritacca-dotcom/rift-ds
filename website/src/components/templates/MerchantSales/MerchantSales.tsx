"use client";

/**
 * The merchant sales template: the sales view of Larkspur, a fictional commerce
 * back office, built from the design system alone. The shell is the template
 * family's (TemplateShell's switchable rail and surface, slim top bar) and the
 * assistant is live, not the family's mock (MerchantChat.tsx, seated in
 * TemplateAssistant). The page is a breadcrumbed head, the month's numbers as a KPI band,
 * then the wired DataTable, which sits directly on the page because it brings its
 * own bordered chrome (design.md's Composition rule 2). Its control bar is the
 * library's TableToolbar, with the AI command live: Describe sends the sentence to
 * the same model route as the labs bench, over the same seeded orders.
 * On a phone the rows stack as cards. What the reader ticks or highlights on the
 * page becomes the assistant's focus (usePageFocus below, chatFocus.tsx).
 *
 * The KPI band is pinned strings (website/src/data/merchant-sales.ts), read off the
 * seeded ledger for Oct 1 to 30, 2026 against September, leaving out cancelled orders
 * from the money, so the statically built HTML draws them with no rows to hand.
 * All of it is fictional, so the route is excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import React, { useCallback, useEffect, useRef } from "react";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { useChatAgentState, useChatWidget } from "rift-ds/chat";
import { Breadcrumb } from "rift-ds/components/Breadcrumb/Breadcrumb";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { Input } from "rift-ds/components/Input/Input";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { Stat } from "rift-ds/components/Stat/Stat";
import styles from "./MerchantSales.module.css";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import { MerchantChatProvider, MerchantChatWidget, useToastsClearOfPanel, type TableBridge } from "./MerchantChat";
import { highlightRanges, useChatFocus, type ChatFocus } from "./chatFocus";
import { OrderEditsProvider, useOrderEdits } from "./orderEdits";
import { ORDER_ACTIONS, skippedText, type OrderActionId } from "@/lib/order-actions";
import { useToast } from "rift-ds/components/Toast/Toast";
import type { TableToolbarSelection } from "rift-ds/components/TableToolbar/TableToolbar";
import { MOTION_ACTION_DISMISS_MS } from "rift-ds/tokens/motion";
import { AppFrameTabBar, useAppFrame } from "../AppFrame/AppFrame";
import TemplateShell from "../TemplateShell/TemplateShell";
import StickyTopBar from "../TemplateShell/StickyTopBar";
import { ProductMark } from "../ProductMark/ProductMark";
import { MERCHANT_KPIS } from "@/data/merchant-sales";
import { COLUMN_KEYS } from "@/data/order-ledger";
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
  { id: "best", label: "What sold best in October?" },
  { id: "late", label: "Which carrier runs latest?" },
  { id: "overdue", label: "How much is overdue?" },
  { id: "largest", label: "Who placed the largest order?" },
  { id: "customer", label: "Which customer orders the most?" },
  { id: "margin", label: "What is the margin this month?" },
  { id: "cancelled", label: "How many orders were cancelled?" },
  { id: "region", label: "Which region earns the most?" },
  { id: "channel", label: "Which channel sells the most?" },
  { id: "rep", label: "Which sales rep leads on revenue?" },
  { id: "product-margin", label: "Which product has the best margin?" },
  { id: "september", label: "How does October compare to September?" },
  { id: "sort", label: "Sort by net revenue, largest first" },
  { id: "show-overdue", label: "Show only overdue orders" },
  { id: "group", label: "Group the table by carrier" },
  { id: "large", label: "Show orders over $50,000" },
  { id: "show-late", label: "Show late orders, worst first" },
  { id: "delayed", label: "Show the delayed orders" },
  { id: "meridian", label: "Show Meridian's late orders" },
  { id: "hide", label: "Hide the margin column" },
];

/* ---------------------------------------------------------------- focus */

/* Highlighted text past this is a passage, not a phrase; the note and the request carry its start. */
const MAX_HIGHLIGHT = 300;

const elementOf = (node: Node | null) => (node instanceof Element ? node : node?.parentElement ?? null);

/**
 * Hands the chat whatever the reader last put in front of it on the page: ticked
 * rows, or a highlighted passage. A highlight is read for where it came from, the
 * smallest thing that holds all of it: a KPI card (data-kpi), a cell (the table's
 * data-row and data-col), a row, or else the section around it. The server looks
 * that source up, so "$51.7M" arrives as the Net revenue figure and its
 * definition, not as a bare number. A selection anywhere else, the chat's own
 * panel included, is not the page, so it leaves the focus alone; a click that
 * collapses a highlight on the page lets it go.
 */
function usePageFocus(bridge: React.RefObject<TableBridge | null>) {
  const { getFocus, setFocus } = useChatFocus();

  useEffect(() => {
    const pageOf = (node: Node | null) => elementOf(node)?.closest(`.${CSS.escape(styles.content)}`) ?? null;
    const onSelectionChange = () => {
      const selection = document.getSelection();
      const page = selection && pageOf(selection.anchorNode);
      if (!selection || !page) return;
      const range = selection.rangeCount ? selection.getRangeAt(0) : null;
      /* An icon's ligature name ("payments") is text to the selection but never words on the page. */
      const icons = range ? [...page.querySelectorAll(".material-symbols-rounded")].filter((icon) => range.intersectsNode(icon)) : [];
      const words = icons.reduce((rest, icon) => rest.replace(icon.textContent ?? "", " "), selection.toString());
      const text = words.replace(/\s+/g, " ").trim();
      if (!range || selection.isCollapsed || !text) {
        if (getFocus()?.kind === "text") setFocus(null);
        return;
      }
      const holder = elementOf(range.commonAncestorContainer);
      const row = holder?.closest<HTMLElement>("tbody tr[data-row]");
      const column = holder?.closest<HTMLElement>("[data-col]")?.dataset.col;
      const focus: ChatFocus = {
        kind: "text",
        text: text.slice(0, MAX_HIGHLIGHT),
        kpi: holder?.closest<HTMLElement>("[data-kpi]")?.dataset.kpi ?? null,
        orderId: row?.dataset.row ?? null,
        column: row && column && COLUMN_KEYS.includes(column) ? column : null,
        section: holder?.closest("[aria-label]")?.getAttribute("aria-label") ?? null,
      };
      /* Kept so the chat can repaint the highlight once typing takes the selection away. */
      highlightRanges.set(focus, range.cloneRange());
      setFocus(focus);
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [getFocus, setFocus]);

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
  const { setPageView } = useChatFocus();
  /* Opening is all the ask takes: the focus is already the chat's. */
  const ask = useCallback(() => setOpen(true), [setOpen]);

  /* The bar's order actions: a click is the reader's own instruction, so it applies at once, with the toast's Undo as the way back. */
  const { edits, plan, run, reset } = useOrderEdits();
  const { toast, dismiss } = useToast();
  const onAction = useCallback(
    (id: OrderActionId, selection: TableToolbarSelection) => {
      const except = new Set(selection.except);
      const ids = selection.allMatching ? (bridge.current?.matchingIds ?? []).filter((orderId) => !except.has(orderId)) : selection.ids;
      const action = ORDER_ACTIONS[id];
      const next = plan(id, ids);
      const skipped = skippedText(next.skipped);
      if (!next.ids.length) {
        toast({ variant: "info", description: `None of these can be ${action.done}: ${skipped}.`, duration: MOTION_ACTION_DISMISS_MS });
        return;
      }
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
            iconLeft="refresh"
            label="Undo"
            onClick={() => {
              undo();
              dismiss(toastId);
            }}
          />
        ),
      });
    },
    [bridge, plan, run, toast, dismiss],
  );
  /* Closing hands focus back to whatever opened it, as the launcher does. */
  useEffect(() => {
    if (!open) returnFocusRef.current?.focus();
  }, [open, returnFocusRef]);

  /* The templates carousel's Mobile mode: previewed as a phone app. */
  const appFrame = useAppFrame();

  return (
    <TemplateShell
      sidebar={{
        sections: NAV_SECTIONS,
        profile: { name: "Priya Raman", email: "priya@larkspur.example" },
        activeKey: "sales",
        logo: <ProductMark />,
        logoText: "Larkspur",
      }}
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
                <Button variant="tertiary" size="compact" label="Reset demo data" iconLeft="restart_alt" onClick={reset} />
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
            {MERCHANT_KPIS.map((kpi) => (
              /* data-kpi names the figure a highlight inside the card is about. */
              <div key={kpi.label} className={styles.kpi} data-kpi={kpi.label}>
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
          </section>

          {/* ----------------------------------------- table section */}
          {/* The table sits directly on the page: the DataTable brings its own
              bordered chrome, so a panel around it would double-box it. */}
          <section className={styles.tableSection} aria-label="Orders">
            <OrdersTable bridge={bridge} onSelectionChange={onRowSelection} onPageView={setPageView} onAsk={ask} edits={edits} onAction={onAction} />
          </section>
    </TemplateShell>
  );
}
