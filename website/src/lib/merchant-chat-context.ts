/**
 * What the merchant sales assistant is told about the page, rebuilt from what
 * the browser sends: the orders table's setup and the reader's focus (the
 * orders they ticked, or the text they highlighted and its source). Nothing the
 * browser says is taken as given: columns must be real, orders are looked up in
 * the seeded ledger, a KPI by its label, and text is cut to length. A highlight
 * the ledger cannot name (a heading, a chart's labels) keeps what it sits in,
 * checked as the package's selection shape (`sanitiseSelection`) and written
 * for the model as quoted data (`selectionLines`). Shared by
 * the chat (app/api/merchant-chat) and its starters (app/api/merchant-chat/starters),
 * so the two always read the focus the same way.
 */

import { sanitiseSelection, selectionLines, type ChatSelection } from "rift-ds/chat/server";
import { COLUMN_KEYS, ROW_COUNT, ledgerRows } from "@/data/order-ledger";
import { MERCHANT_KPIS, computeKpis } from "@/data/merchant-sales";
import { ORDER_ACTIONS, ORDER_ACTION_IDS, planAction, skippedText, withEdit, type OrderActionId } from "./order-actions";
import { currentLedgerEdits, currentRows } from "./order-ledger-tools";

/* Sized for the page's edits, which ride the same string: every other field is cut to length on its own below. */
const MAX_CONTEXT_CHARS = 2_000_000;
/* The focused orders written out in full, and as ids alone past it. */
const MAX_FOCUS_ROWS = 10;
const MAX_FOCUS_IDS = 500;
const MAX_FOCUS_TEXT = 300;

const isKey = (value: unknown): value is string => typeof value === "string" && COLUMN_KEYS.includes(value);
const keys = (value: unknown) => (Array.isArray(value) ? value.filter(isKey) : undefined);
const shortText = (value: unknown) => (typeof value === "string" ? value.slice(0, 200) : undefined);

const ORDER_ID = /^ORD-\d{7}$/;
let byId: Map<string, ReturnType<typeof ledgerRows>[number]> | null = null;
const baseById = (id: string) => (byId ??= new Map(ledgerRows().map((row) => [row.id, row]))).get(id);
/* An order as the request sees it: the seeded row with the page's edit laid over it. */
const orderById = (id: string) => {
  const row = baseById(id);
  const edit = row && currentLedgerEdits()[id];
  return row && edit ? { ...row, values: withEdit(row.values, edit) } : row;
};

/** An order as the current request sees it, edits included. */
export const currentOrder = (id: string) => orderById(id);

/** Whether an id names a real order, for checking what the browser sends. */
export const isRealOrder = (id: string) => ORDER_ID.test(id) && Boolean(baseById(id));
const isOrderId = (value: unknown): value is string => typeof value === "string" && isRealOrder(value);

/* Ticked orders' totals, worked out here so "summarise these" needs no tool call. Cancelled orders stay in the counts and out of the money, as the page's figures do. */
function summarise(rows: Record<string, unknown>[]) {
  const counted = rows.filter((row) => row.status !== "Cancelled");
  const sum = (key: string) => counted.reduce((total, row) => total + (typeof row[key] === "number" ? (row[key] as number) : 0), 0);
  const tally = (key: string) =>
    Object.fromEntries(
      Object.entries(rows.reduce<Record<string, number>>((counts, row) => ({ ...counts, [String(row[key])]: (counts[String(row[key])] ?? 0) + 1 }), {})).sort((a, b) => b[1] - a[1]),
    );
  const netRevenue = sum("netRevenue");
  return {
    orders: rows.length,
    cancelled: rows.length - counted.length,
    netRevenue: Math.round(netRevenue),
    marginRate: netRevenue ? Math.round((sum("margin") / netRevenue) * 1000) / 10 : null,
    units: sum("units"),
    byStatus: tally("status"),
    byCategory: tally("category"),
    byCustomerCount: new Set(rows.map((row) => row.customer)).size,
  };
}

/** The reader's focus as the browser sent it, rebuilt from the ledger and known fields. */
export function sanitiseFocus(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  const focus = value as Record<string, unknown>;
  if (focus.kind === "orders") {
    const count = typeof focus.count === "number" ? Math.max(0, Math.min(Math.floor(focus.count), ROW_COUNT)) : 0;
    if (focus.all === true && count > 0) return { kind: "orders", allMatching: true, count };
    const ids = Array.isArray(focus.ids) ? [...new Set(focus.ids.slice(0, MAX_FOCUS_IDS).filter(isOrderId))] : [];
    if (!ids.length) return null;
    const rows = ids.map((id) => orderById(id)!.values);
    return {
      kind: "orders",
      count: Math.max(count, ids.length),
      ids,
      summary: summarise(rows),
      ...(ids.length <= MAX_FOCUS_ROWS ? { rows } : {}),
    };
  }
  if (focus.kind === "text" && typeof focus.text === "string" && focus.text.trim()) {
    /* The source is looked up here, never taken from the browser's words: a KPI by its label, a cell by its order and column. */
    /* The figure as the band now shows it, edits included. */
    const band = Object.keys(currentLedgerEdits()).length ? computeKpis(currentRows()) : MERCHANT_KPIS;
    const kpi = band.find((item) => item.label === focus.kpi);
    const orderId = !kpi && isOrderId(focus.orderId) ? focus.orderId : null;
    const row = orderId ? orderById(orderId)!.values : null;
    const column = row && isKey(focus.column) ? focus.column : null;
    return {
      kind: "text",
      text: focus.text.slice(0, MAX_FOCUS_TEXT),
      ...(kpi ? { kpi: { label: kpi.label, value: kpi.value, delta: kpi.delta } } : {}),
      ...(orderId ? { orderId, row } : {}),
      ...(column ? { column, value: row![column] } : {}),
      ...(!kpi && !orderId && typeof focus.section === "string" ? { section: focus.section.slice(0, 60) } : {}),
      /* What a highlight the ledger cannot name sits in: checked as the package's selection shape, never as a fact. */
      ...(!kpi && !orderId ? withSelection(focus.selection) : {}),
    };
  }
  return null;
}

/* A selection the page read, kept only with what says more than the words alone: a heading, or what it sits in. */
function withSelection(value: unknown): { selection?: ChatSelection } {
  const selection = sanitiseSelection(value);
  return selection && (selection.kind === "heading" || selection.around || selection.heading) ? { selection } : {};
}

/** The focus in a sentence the model reads before anything else in the request, with its data after it. */
export function focusLine(focus: Record<string, unknown> | null): string {
  if (!focus) return "None: the reader is looking at the page as a whole.";
  if (focus.kind === "orders") {
    if (focus.allMatching) return `The reader ticked every order matching the table's current filters and search (${focus.count}). "These" means those orders.`;
    const ids = focus.ids as string[];
    const named = ids.length === 1 ? `order ${ids[0]}` : `${focus.count} orders`;
    return `The reader ticked ${named} in the table. "This", "these" and "it" mean ${ids.length === 1 ? "that order" : "those orders"}.\n${JSON.stringify(focus)}`;
  }
  if (focus.kpi) {
    const kpi = focus.kpi as { label: string };
    return `The reader highlighted part of the ${kpi.label} figure in the KPI band. "This" and "it" mean the ${kpi.label} figure, as the page facts define it.\n${JSON.stringify(focus)}`;
  }
  if (focus.column) return `The reader highlighted the ${focus.column} cell of order ${focus.orderId}. "This" and "this value" mean that cell; "this order" means its order.\n${JSON.stringify(focus)}`;
  if (focus.orderId) return `The reader highlighted text in the row of order ${focus.orderId}. "This" means what it says; "this order" means that order.\n${JSON.stringify(focus)}`;
  const { selection, ...rest } = focus as { selection?: ChatSelection };
  if (selection) return [...selectionLines(selection, { where: "the merchant sales page" }), JSON.stringify(rest)].join("\n");
  return `The reader highlighted this text on the page. "This" and "it" mean what it says, where it sits.\n${JSON.stringify(focus)}`;
}

/* The visit's change log, latest last: only real actions, counts the ledger could hold. */
function sanitiseChanges(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(-10).flatMap((entry) => {
    const { action, count, source, undone } = (entry ?? {}) as Record<string, unknown>;
    if (!ORDER_ACTION_IDS.includes(action as OrderActionId) || typeof count !== "number" || count < 0 || count > ROW_COUNT) return [];
    return [{ action, count: Math.floor(count), source: source === "chat" ? "chat" : "bar", undone: undone === true }];
  });
}

/* Set only on the message a card's Confirm sends; a typed "yes" has none. */
function sanitiseConfirmation(value: unknown) {
  const { action, count, ids } = (value ?? {}) as Record<string, unknown>;
  if (!ORDER_ACTION_IDS.includes(action as OrderActionId) || typeof count !== "number" || count < 1 || count > ROW_COUNT) return null;
  return { action, count: Math.floor(count), ids: Array.isArray(ids) ? [...new Set(ids.slice(0, MAX_FOCUS_IDS).filter(isOrderId))] : [] };
}

/**
 * What each action would do to these orders now, edits included: the dry run
 * for every one, so the model offers a next change only when it would change
 * something, never a refund of orders a cancellation already refunded.
 */
export function nextStepsLine(ids: string[]): string | null {
  const orders = ids.flatMap((id) => {
    const order = orderById(id);
    return order ? [{ id, values: order.values }] : [];
  });
  if (!orders.length) return null;
  return ORDER_ACTION_IDS.map((action) => {
    const plan = planAction(action, orders);
    const skipped = skippedText(plan.skipped);
    return `${ORDER_ACTIONS[action].label}: would change ${plan.ids.length}${skipped ? `, leaving alone ${skipped}` : ""}`;
  }).join("; ");
}

/** The table's setup and the reader's focus as the browser sent them, rebuilt from known fields: they land in the prompt. */
export function sanitiseTableContext(value: unknown): string | null {
  if (typeof value !== "string" || value.length > MAX_CONTEXT_CHARS) return null;
  let view: Record<string, unknown>;
  try {
    view = JSON.parse(value);
  } catch {
    return null;
  }
  if (typeof view !== "object" || view === null) return null;
  const filters = Array.isArray(view.filters)
    ? (view.filters as Record<string, unknown>[]).slice(0, 20).flatMap((filter) => {
        if (!isKey(filter?.column) || typeof filter.operator !== "string") return [];
        const raw = filter.value;
        const clean = typeof raw === "number" ? raw : Array.isArray(raw) ? raw.slice(0, 50).map(String).map((item) => item.slice(0, 200)) : shortText(raw);
        return [{ column: filter.column, operator: filter.operator.slice(0, 30), value: clean ?? null }];
      })
    : [];
  const sorts = Array.isArray(view.sorts)
    ? (view.sorts as Record<string, unknown>[]).slice(0, 10).flatMap((sort) => (isKey(sort?.key) ? [{ key: sort.key, direction: sort.direction === "asc" ? "asc" : "desc" }] : []))
    : [];
  const hidden = new Set(keys(view.hiddenColumns) ?? []);
  return JSON.stringify({
    search: shortText(view.search) ?? "",
    filters,
    sorts,
    visibleColumns: (keys(view.columnOrder) ?? COLUMN_KEYS).filter((key) => !hidden.has(key)),
    grouping: keys(view.grouping) ?? [],
    density: view.size === "compact" ? "compact" : "default",
    focus: sanitiseFocus(view.focus),
    editedOrders: Object.keys(currentLedgerEdits()).length,
    /* The band as it now reads on the page, once the reader has changed anything: the same function draws it there. */
    kpis: Object.keys(currentLedgerEdits()).length ? computeKpis(currentRows()).map(({ label, value, delta }) => ({ label, value, delta })) : null,
    changes: sanitiseChanges(view.changes),
    confirmation: sanitiseConfirmation(view.confirmation),
  });
}

