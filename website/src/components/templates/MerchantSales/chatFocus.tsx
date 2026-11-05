"use client";

/**
 * What the merchant sales assistant is looking at. The reader puts something in
 * front of it by ticking rows or highlighting text, which is read for its source:
 * the KPI card, the cell or the section it came from. With neither, it looks at
 * the page, which is "Sales" until the table is
 * filtered or searched and then the orders that match. The last thing the reader
 * did wins, and the composer note's clear button goes back to the page.
 *
 * This module owns the focus's shape, what it is called (the note, the chip on a
 * sent message, the welcome chips), what the request carries, and the page
 * effects that answer it: a flash on the rows an answer names, and the way a
 * sent message's chip brings its focus back. The server rebuilds every part of
 * it from the ledger (app/api/merchant-chat/route.ts).
 */

import React from "react";
import { useGeneratedStarters, useHeldHighlight, type Starter } from "rift-ds/chat";
import { DocumentChip } from "rift-ds/components/DocumentChip/DocumentChip";
import { LEDGER_COLUMNS } from "@/data/order-ledger";
import { MERCHANT_KPIS } from "@/data/merchant-sales";
import type { TableContextValue } from "../../../../../src/components/DataTable/tableContext";
import styles from "./MerchantSales.module.css";

export type ChatFocus =
  | { kind: "orders"; ids: string[]; all: boolean }
  /** A highlight and its source: the KPI card it sits in, or the order and column, and the section around it. */
  | { kind: "text"; text: string; kpi: string | null; orderId: string | null; column: string | null; section: string | null };

/** The page when nothing is focused: whether the table is narrowed from its opening setup, and to how many orders. */
export type PageView = { filtered: boolean; count: number };

/* As many ids as the request carries; past it the server is told the count and the table's filters instead. */
const MAX_FOCUS_IDS = 500;
const MAX_FOCUS_TEXT = 300;

const HEADERS = new Map((LEDGER_COLUMNS as readonly { key: string; header: string }[]).map((col) => [col.key, col.header]));
const headerOf = (key: string) => HEADERS.get(key) ?? key;

/* --------------------------------------------------------- highlight */

/**
 * The page range each highlight focus was read from. Typing moves the browser's
 * selection into the composer and the page's highlight goes with it, so the chat
 * repaints the range itself (the library's useHeldHighlight), for as long as it is
 * the focus: the reader keeps seeing what they asked about, in the context note's
 * own fill. Keyed by the focus, so a sent chip that
 * brings a highlight back repaints it too, while the page still holds that text.
 */
export const highlightRanges = new WeakMap<ChatFocus, Range>();

/* ------------------------------------------------------------- state */

type FocusValue = {
  focus: ChatFocus | null;
  getFocus: () => ChatFocus | null;
  setFocus: (focus: ChatFocus | null) => void;
  pageView: PageView;
  setPageView: (view: PageView) => void;
  /** Brings a sent message's focus back: ticks its rows again and points at where it was. */
  restore: (focus: ChatFocus) => void;
};

const FocusContext = React.createContext<FocusValue | null>(null);

/** The chat's focus, for the screen that watches the page and the widget that names it. */
export function useChatFocus() {
  const value = React.useContext(FocusContext);
  if (!value) throw new Error("useChatFocus needs ChatFocusProvider");
  return value;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Holds the focus. The transport reads it at send time, so it rides a ref beside
 * the state the note draws from; restoring ticks rows through the table's bridge.
 */
export function ChatFocusProvider({
  bridge,
  children,
}: {
  bridge: React.RefObject<Pick<TableContextValue, "setSelectedIds"> | null>;
  children: React.ReactNode;
}) {
  const focusRef = React.useRef<ChatFocus | null>(null);
  const [focus, setFocusState] = React.useState<ChatFocus | null>(null);
  const [pageView, setPageViewState] = React.useState<PageView>({ filtered: false, count: 0 });
  const setFocus = React.useCallback(
    (next: ChatFocus | null) => {
      if (same(focusRef.current, next)) return;
      focusRef.current = next;
      setFocusState(next);
    },
    [focusRef],
  );
  const getFocus = React.useCallback(() => focusRef.current, [focusRef]);
  const setPageView = React.useCallback((next: PageView) => setPageViewState((current) => (same(current, next) ? current : next)), []);
  const restore = React.useCallback(
    (next: ChatFocus) => {
      if (next.kind === "orders" && !next.all) bridge.current?.setSelectedIds(next.ids);
      setFocus(next);
      if (next.kind === "orders") flashRows(next.ids, { scroll: true });
      if (next.kind === "text" && next.orderId) flashRows([next.orderId], { scroll: true });
    },
    [bridge, setFocus],
  );
  useHeldHighlight(focus ? (highlightRanges.get(focus) ?? null) : null);
  const value = React.useMemo(
    () => ({ focus, getFocus, setFocus, pageView, setPageView, restore }),
    [focus, getFocus, setFocus, pageView, setPageView, restore],
  );
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

/* ------------------------------------------------------- page effects */

/**
 * A pulse on the rows an answer names, or a restored chip points at, among those
 * the table is drawing. The animation removes its own mark, so nothing times it.
 */
export function flashRows(ids: string[], { scroll = false } = {}) {
  const rows = [...new Set(ids)].flatMap((id) => [...document.querySelectorAll<HTMLElement>(`tbody tr[data-row="${CSS.escape(id)}"]`)]);
  for (const row of rows) {
    row.removeAttribute("data-chat-mentioned");
    void row.offsetWidth; /* restart the animation on a row already pulsing */
    row.setAttribute("data-chat-mentioned", "");
    row.addEventListener("animationend", () => row.removeAttribute("data-chat-mentioned"), { once: true });
  }
  if (scroll) rows[0]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

/** The order ids a reply names, in the order it names them. */
export const namedOrders = (text: string) => [...new Set(text.match(/ORD-\d{7}/g) ?? [])];

/* -------------------------------------------------------------- words */

/** Where a highlight came from, in the reader's words: the figure, or the order and column. */
function sourceOf(focus: Extract<ChatFocus, { kind: "text" }>): string | null {
  if (focus.kpi) return focus.kpi;
  if (focus.orderId) {
    /* The highlight is the id itself: name its column alone, or the note repeats it. */
    if (focus.text === focus.orderId) return focus.column ? headerOf(focus.column) : null;
    return focus.column ? `${focus.orderId} · ${headerOf(focus.column)}` : focus.orderId;
  }
  return null;
}

/**
 * What the focus is called, and its mark: `label` names it on a sent message's
 * chip, `note` is the composer's line. A highlight names its source after it, so
 * the reader can see what the chat took it to be.
 */
export function focusLabel(focus: ChatFocus | null, pageView: PageView): { label: string; note: string; icon: string } {
  if (!focus) {
    if (!pageView.filtered) return { label: "Sales", note: "Looking at “Sales”", icon: "description" };
    const label = `${pageView.count.toLocaleString("en-US")} ${pageView.count === 1 ? "order" : "orders"}`;
    return { label, note: `Looking at ${label}`, icon: "filter_list" };
  }
  if (focus.kind === "text") {
    const source = sourceOf(focus);
    return {
      label: source ? `${focus.text} · ${source}` : focus.text,
      note: source ? `Looking at “${focus.text}” · ${source}` : `Looking at “${focus.text}”`,
      icon: focus.kpi ? (MERCHANT_KPIS.find((kpi) => kpi.label === focus.kpi)?.icon ?? "format_quote") : "format_quote",
    };
  }
  const count = focus.ids.length.toLocaleString("en-US");
  if (focus.all) return { label: `All ${count} orders`, note: `Looking at all ${count} orders`, icon: "table_rows" };
  const label = focus.ids.length === 1 ? focus.ids[0] : `${count} orders`;
  return { label, note: `Looking at ${label}`, icon: "table_rows" };
}

/**
 * The written welcome chips for a focus, in the abstract wording of the starter
 * route's intents: shown while the model writes its own, and kept when it
 * writes none (switched off, over budget, or nothing fit a chip).
 */
export function focusStarters(focus: ChatFocus): Starter[] {
  if (focus.kind === "text") {
    if (focus.kpi) {
      return [
        { id: "focus-kpi-drove", label: "What drove this?" },
        { id: "focus-kpi-change", label: "How has this changed?" },
        { id: "focus-kpi-show", label: "Show the orders behind this" },
      ];
    }
    if (focus.orderId) {
      return [
        { id: "focus-text-explain", label: "What does this mean?" },
        { id: "focus-text-order", label: "Tell me about this order" },
        { id: "focus-text-like", label: "Show orders like this one" },
      ];
    }
    return [
      { id: "focus-text-explain", label: "What does this mean?" },
      { id: "focus-text-why", label: "Why is this the figure?" },
      { id: "focus-text-show", label: "Show the orders behind this" },
    ];
  }
  return focus.ids.length === 1
    ? [
        { id: "focus-one-summary", label: "Summarise this order" },
        { id: "focus-one-late", label: "Is this order on time?" },
        { id: "focus-one-customer", label: "Show this customer's orders" },
      ]
    : [
        { id: "focus-many-total", label: "What do these add up to?" },
        { id: "focus-many-overdue", label: "Which of these are overdue?" },
        { id: "focus-many-show", label: "Show only these orders" },
      ];
}

/** The focus as the request carries it: the ids capped, the text cut to length. The server rebuilds the rest. */
export function focusForRequest(focus: ChatFocus | null) {
  if (!focus) return undefined;
  if (focus.kind === "text") return { ...focus, text: focus.text.slice(0, MAX_FOCUS_TEXT) };
  return { kind: "orders", count: focus.ids.length, all: focus.all, ids: focus.all ? [] : focus.ids.slice(0, MAX_FOCUS_IDS) };
}

/* ----------------------------------------------- generated starters */

/**
 * The welcome chips for the focus, written by /api/merchant-chat/starters
 * through the library's useGeneratedStarters: asked while the welcome screen
 * shows, once the selection settles, with the written chips standing in.
 */
export function useFocusStarters(focus: ChatFocus | null, active: boolean) {
  const request = focus ? JSON.stringify({ focus: focusForRequest(focus) }) : null;
  const fallback = React.useMemo(() => (focus ? focusStarters(focus) : []), [focus]);
  return useGeneratedStarters(request, { endpoint: "/api/merchant-chat/starters", active, fallback });
}

/* ---------------------------------------------------------- the chip */

/** A sent message's focus, over its bubble. A click brings that focus back. */
export function SentFocusChip({ focus }: { focus: ChatFocus }) {
  const { restore } = useChatFocus();
  const { label, icon } = focusLabel(focus, { filtered: false, count: 0 });
  return (
    <div className={styles.sentFocus}>
      <DocumentChip size="compact" name={label} icon={icon} onClick={() => restore(focus)} />
    </div>
  );
}
