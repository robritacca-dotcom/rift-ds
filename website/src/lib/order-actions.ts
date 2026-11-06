/**
 * The changes a reader can make to the merchant sales orders, defined once for
 * the selection bar and the assistant alike, so "mark these fulfilled" in the
 * chat and the bar's button do the same thing to the same orders. Each action
 * says which orders it applies to, why it skips the rest, and what it writes.
 *
 * Nothing here stores anything. The ledger is seeded and shared, so a change is
 * an edit layered over it for the page visit (`OrderEdits`, keyed by order id),
 * which the page draws and every chat request carries; the server checks the
 * edits it is sent (`sanitiseEdits`) the way it checks the focus, and reads the
 * ledger through them. A reload starts the demo over.
 */

import { defineAction, planAction as planChatAction, skippedText, type ActionPlan as ChatActionPlan, type ChatAction } from "rift-ds/chat/actions";
import { LEDGER_TODAY } from "@/data/order-ledger";

/** The fields an action may write, and only these. */
export type OrderEdit = { status?: string; payment?: string; shippedOn?: string; refund?: number };
export type OrderEdits = Record<string, OrderEdit>;

type Values = Record<string, unknown>;

export type OrderActionId = "fulfil" | "cancel" | "refund";

/** An order action: the library's action (rift-ds/chat/actions), over an order's values, writing an OrderEdit. */
export type OrderAction = ChatAction<Values, OrderEdit> & { id: OrderActionId };

const NOT_YET_SHIPPED = new Set(["Placed", "Picking"]);

export const ORDER_ACTIONS: Record<OrderActionId, OrderAction> = {
  fulfil: defineAction<Values, OrderEdit>({
    id: "fulfil",
    label: "Mark fulfilled",
    done: "marked fulfilled",
    confirm: (these) => `Yes, mark ${these} fulfilled`,
    verb: "Mark fulfilled",
    effect: (count) => (count === 1 ? "It moves to Shipped today." : "They move to Shipped today."),
    icon: "local_shipping",
    destructive: false,
    skip: (values) =>
      values.status === "Cancelled" ? "cancelled" : NOT_YET_SHIPPED.has(String(values.status)) ? null : "already shipped",
    apply: () => ({ status: "Shipped", shippedOn: LEDGER_TODAY }),
  }) as OrderAction,
  cancel: defineAction<Values, OrderEdit>({
    id: "cancel",
    label: "Cancel orders",
    done: "cancelled",
    confirm: (these) => `Yes, cancel ${these}`,
    verb: "Cancel",
    effect: (count) => (count === 1 ? "If it was paid, it is refunded." : "Any that were paid are refunded."),
    icon: "cancel",
    destructive: true,
    skip: (values) =>
      values.status === "Cancelled" ? "already cancelled" : NOT_YET_SHIPPED.has(String(values.status)) ? null : "already shipped",
    apply: (values) => ({ status: "Cancelled", ...(values.payment === "Paid" ? { payment: "Refunded", refund: Number(values.netRevenue) || 0 } : {}) }),
  }) as OrderAction,
  refund: defineAction<Values, OrderEdit>({
    id: "refund",
    label: "Refund",
    done: "refunded",
    confirm: (these) => `Yes, refund ${these}`,
    verb: "Refund",
    effect: (count) => (count === 1 ? "Its payment is marked refunded, for the order's full amount." : "Each payment is marked refunded, for the order's full amount."),
    icon: "undo",
    destructive: true,
    skip: (values) => (values.payment === "Refunded" ? "already refunded" : values.payment === "Paid" ? null : "not paid"),
    apply: (values) => ({ payment: "Refunded", refund: Number(values.netRevenue) || 0 }),
  }) as OrderAction,
};

export const ORDER_ACTION_IDS = Object.keys(ORDER_ACTIONS) as OrderActionId[];

/** An order's values with its edit laid over them. */
export const withEdit = <V extends Values>(values: V, edit: OrderEdit | undefined): V => (edit ? ({ ...values, ...edit } as V) : values);

/** The library's dry run (rift-ds/chat/actions), keyed by an order action's id. */
export type ActionPlan = Omit<ChatActionPlan, "action"> & { action: OrderActionId };

/** What an action would do to some orders: the ones it changes, and how many it skips for each reason. Changes nothing. */
export const planAction = (action: OrderActionId, orders: { id: string; values: Values }[]): ActionPlan =>
  planChatAction(ORDER_ACTIONS[action], orders) as ActionPlan;

/** The edits a plan makes, over the edits already made. */
export function editsFor(plan: ActionPlan, valuesOf: (id: string) => Values | undefined, current: OrderEdits): OrderEdits {
  const next: OrderEdits = {};
  for (const id of plan.ids) {
    const values = valuesOf(id);
    if (values) next[id] = { ...current[id], ...ORDER_ACTIONS[plan.action].apply(values) };
  }
  return next;
}

/** "this order" or "these 23 orders", for a confirmation in the reader's words. */
export const theseOrders = (count: number) => (count === 1 ? "this order" : `these ${count.toLocaleString("en-US")} orders`);

/* The skipped orders in words: the library's, so the bar, the card and the route all say it one way. */
export { skippedText };

const STATUSES = new Set(["Placed", "Picking", "Shipped", "Delivered", "Delayed", "Returned", "Cancelled"]);
const PAYMENTS = new Set(["Paid", "Pending", "Overdue", "Refunded", "Failed"]);
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_EDITS = 20_000;

/** The edits as the browser sent them, kept only where the order is real and each field holds a value an action could write. */
export function sanitiseEdits(value: unknown, isOrder: (id: string) => boolean): OrderEdits {
  if (typeof value !== "object" || value === null) return {};
  const clean: OrderEdits = {};
  for (const [id, edit] of Object.entries(value as Record<string, unknown>).slice(0, MAX_EDITS)) {
    if (!isOrder(id) || typeof edit !== "object" || edit === null) continue;
    const { status, payment, shippedOn, refund } = edit as Record<string, unknown>;
    const kept: OrderEdit = {
      ...(typeof status === "string" && STATUSES.has(status) ? { status } : {}),
      ...(typeof payment === "string" && PAYMENTS.has(payment) ? { payment } : {}),
      ...(typeof shippedOn === "string" && DATE.test(shippedOn) ? { shippedOn } : {}),
      ...(typeof refund === "number" && Number.isFinite(refund) && refund >= 0 ? { refund } : {}),
    };
    if (Object.keys(kept).length) clean[id] = kept;
  }
  return clean;
}

/** What a change will do or did, read from the orders as they are before it: a proposal's facts (`will`) and its confirmed record's (`did`). */
export interface ActionReadout {
  title: string;
  facts: [label: string, value: string][];
}

const money = (amount: number) => amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/* "Placed 40 · Picking 29": the most common values first. */
function tally(values: Values[], key: string, limit = 3) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(String(value[key]), (counts.get(String(value[key])) ?? 0) + 1);
  const sorted = [...counts].sort((a, b) => b[1] - a[1]);
  const shown = sorted.slice(0, limit).map(([name, count]) => `${name} ${count.toLocaleString("en-US")}`);
  return sorted.length > limit ? `${shown.join(" · ")} · ${sorted.length - limit} more` : shown.join(" · ");
}

/** `will` words the facts for a proposal not yet confirmed, `did` for the record of one that was. */
export function readoutFor(plan: ActionPlan, before: Values[], tense: "will" | "did" = "did"): ActionReadout {
  const action = ORDER_ACTIONS[plan.action];
  const after = before.map((values) => withEdit(values, action.apply(values)));
  const count = plan.ids.length;
  const refunded = after.reduce((total, values, index) => total + (Number(values.refund) || 0) - (Number(before[index].refund) || 0), 0);
  const refundedOrders = after.filter((values, index) => values.payment === "Refunded" && before[index].payment !== "Refunded").length;
  const statusChanged = after.some((values, index) => values.status !== before[index].status);
  const skipped = skippedText(plan.skipped);
  return {
    title: `${count.toLocaleString("en-US")} ${count === 1 ? "order" : "orders"} ${action.done}`,
    facts: [
      ...(statusChanged ? ([["Status", `${tally(before, "status")} → ${tally(after, "status")}`]] as [string, string][]) : []),
      ...(refundedOrders ? ([[tense === "did" ? "Refunded" : "Refund", `${money(refunded)} across ${refundedOrders.toLocaleString("en-US")} ${refundedOrders === 1 ? "order" : "orders"}`]] as [string, string][]) : []),
      ["Order value", money(before.reduce((total, values) => total + (Number(values.netRevenue) || 0), 0))],
      ["Categories", tally(before, "category")],
      ["Customers", new Set(before.map((values) => values.customer)).size.toLocaleString("en-US")],
      ...(skipped ? ([["Left alone", skipped]] as [string, string][]) : []),
    ],
  };
}

/** One entry in the visit's change log, which every chat request carries so the assistant knows what has already been done. */
export interface ChangeLogEntry {
  action: OrderActionId;
  count: number;
  /** Where it was made: the selection bar, or a card the chat proposed. */
  source: "bar" | "chat";
  undone?: boolean;
}
