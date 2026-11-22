"use client";

/**
 * The merchant sales page's tools, offered to an agent in the reader's browser
 * (lib/webmcp.ts). They are the page's own assistant's tools, read from the one
 * list both share (lib/merchant-tools.ts), so an outside agent can ask, arrange
 * the table and propose a change to orders exactly as the assistant can. Here
 * each gets the step that runs it in the page: over the ledger as the page
 * holds it, edits included, with no request to the site's server at all.
 *
 * Nothing here can change an order. propose_order_action works out a plan and
 * hands it to `confirm`, the page's own dialog, and waits: only the reader's
 * press makes the change, which is then logged as the agent's so the page's
 * assistant knows of it too.
 */

import { useMemo, useRef, type RefObject } from "react";
import { ledgerRows } from "@/data/order-ledger";
import {
  MERCHANT_TOOLS,
  RESET_REPLY,
  RESET_VIEW,
  columnValues,
  findOrders,
  matchingRows,
  planTableChange,
  proposeOrderAction,
  queryData,
  type ColumnValuesInput,
  type Filters,
  type FindOrdersInput,
  type MerchantToolName,
  type ProposeInput,
  type QueryInput,
  type TableScope,
} from "@/lib/merchant-tools";
import { ORDER_ACTIONS, skippedText, withEdit, type ActionPlan } from "@/lib/order-actions";
import { nextView, type LedgerViewChange } from "@/lib/order-ledger-view";
import { usePageTools, type PageTool } from "@/lib/webmcp";
import { applyToTable, type TableBridge } from "./MerchantChat";
import { useChatFocus } from "./chatFocus";
import { useOrderEdits } from "./orderEdits";

/** Puts a plan in front of the reader and settles with whether they confirmed it. */
export type ConfirmPlan = (plan: ActionPlan, signal?: AbortSignal) => Promise<boolean>;

const NO_TABLE = "The orders table is not on the page yet. Try again in a moment.";

export function useMerchantPageTools(bridge: RefObject<TableBridge | null>, confirm: ConfirmPlan) {
  const { getEdits, valuesOf } = useOrderEdits();
  const { getFocus } = useChatFocus();

  const landing = useRef<{ over: string; scope: TableScope } | null>(null);

  const tools = useMemo<PageTool[]>(() => {
    /* The ledger as the page holds it now: read at each call, so every answer counts the reader's changes. */
    const rows = () => {
      const edits = getEdits();
      return Object.keys(edits).length ? ledgerRows().map((row) => (edits[row.id] ? { ...row, values: withEdit(row.values, edits[row.id]) } : row)) : ledgerRows();
    };
    const shown = (): TableScope => {
      const view = bridge.current?.view;
      return { filters: (view?.filters ?? []).map(({ column, operator, value }) => ({ column, operator, value })) as Filters, search: view?.search ?? "" };
    };
    /* The table as the last tool call left it. A change takes a render or two to land, so while the
       table still shows what the change was laid over, the scope is the one that change asked for:
       "every order the table shows", called straight after a filter, means the filtered orders. */
    const scope = (): TableScope => {
      const now = shown();
      const held = landing.current;
      if (held && held.over === JSON.stringify(now)) return held.scope;
      landing.current = null;
      return now;
    };
    const land = (table: TableBridge, change: LedgerViewChange, next: TableScope) => {
      landing.current = { over: JSON.stringify(shown()), scope: next };
      applyToTable(table, nextView(table.view, change));
    };
    const tableIds = () => {
      const { filters, search } = scope();
      return matchingRows(rows(), filters, search).map((row) => row.id);
    };

    const run: Record<MerchantToolName, PageTool["execute"]> = {
      query_data: (input) => queryData(rows(), input as unknown as QueryInput),
      column_values: (input) => columnValues(rows(), input as unknown as ColumnValuesInput),
      find_orders: (input) => findOrders(rows(), input as unknown as FindOrdersInput),
      set_table: (input) => {
        const table = bridge.current;
        if (!table) return NO_TABLE;
        const change = planTableChange(input as unknown as LedgerViewChange, scope(), rows());
        if ("problem" in change) return change.problem;
        land(table, change.view, change.scope);
        return change.reply;
      },
      reset_table: () => {
        const table = bridge.current;
        if (!table) return NO_TABLE;
        land(table, RESET_VIEW, { filters: [], search: "" });
        return RESET_REPLY;
      },
      propose_order_action: async (input, { signal }) => {
        const { reply, plan } = proposeOrderAction(input as unknown as ProposeInput, {
          focusIds: () => {
            const focus = getFocus();
            if (focus?.kind === "orders") return focus.all ? tableIds() : focus.ids;
            return focus?.kind === "text" && focus.orderId ? [focus.orderId] : [];
          },
          tableIds,
          valuesOf,
        });
        if (!plan) return reply;
        const confirmed = await confirm(plan, signal);
        const count = plan.ids.length;
        const noun = count === 1 ? "order" : "orders";
        return confirmed
          ? { confirmed: true, changed: count, action: ORDER_ACTIONS[plan.action].label, skipped: skippedText(plan.skipped) || "none", next: `The reader confirmed it on the page: ${count} ${noun} ${ORDER_ACTIONS[plan.action].done}. They can undo it from the notice on the page.` }
          : { confirmed: false, changed: 0, next: "The reader did not confirm it on the page, so nothing has changed. Do not propose it again unless they ask." };
      },
    };

    /* An answer is text, as the page's assistant gets it. */
    const asText = async (answer: unknown) => {
      const settled = await answer;
      return typeof settled === "string" ? settled : JSON.stringify(settled);
    };
    return MERCHANT_TOOLS.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      kind: tool.kind,
      execute: (input, options) => asText(run[tool.name](input, options)),
    }));
  }, [bridge, confirm, getEdits, getFocus, valuesOf]);

  usePageTools(tools);
}
