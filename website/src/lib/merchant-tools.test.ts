/**
 * The merchant sales page's tools are one list read by two surfaces: the page's
 * own assistant (the route) and an outside agent in the browser (WebMCP). These
 * hold the two together: the route hands its model exactly the shared
 * definitions, and the shared steps give the same answer whichever surface
 * supplies the rows.
 */
import { describe, expect, it, vi } from "vitest";

import { ledgerRows } from "@/data/order-ledger";
import { MERCHANT_TOOLS, columnValues, findOrders, planTableChange, proposeOrderAction, queryData } from "./merchant-tools";
import * as server from "./order-ledger-tools";

type Definition = { name: string; description: string; input_schema: unknown; strict?: boolean };
const captured: { tools?: { definition: Definition }[] } = {};
vi.mock("rift-ds/chat/server", async (original) => ({
  ...(await original<typeof import("rift-ds/chat/server")>()),
  createChatHandler: (config: { tools: { definition: Definition }[] }) => {
    captured.tools = config.tools;
    return () => new Response();
  },
}));

const QUERY = { filters: [{ column: "status", operator: "isAnyOf" as const, value: ["Placed"] }], search: null, group_by: "channel", metric: "sum", metric_column: "netRevenue", order: "desc" as const, limit: 5 };

describe("one list, two surfaces", () => {
  it("the route hands its model the shared definitions, in order, word for word", async () => {
    await import("../app/api/merchant-chat/route");
    expect(captured.tools?.map((tool) => tool.definition)).toEqual(
      MERCHANT_TOOLS.map((tool) => ({ name: tool.name, description: tool.description, ...(tool.strict ? { strict: true } : {}), input_schema: tool.inputSchema })),
    );
  });

  it("every tool says what kind it is, so a surface knows which may change something", () => {
    expect(MERCHANT_TOOLS.filter((tool) => tool.kind === "propose").map((tool) => tool.name)).toEqual(["propose_order_action"]);
    expect(MERCHANT_TOOLS.filter((tool) => tool.kind === "page").map((tool) => tool.name)).toEqual(["set_table", "reset_table"]);
  });

  it("the reads answer the same from the page's rows as from a request's", () => {
    const rows = ledgerRows();
    expect(queryData(rows, QUERY)).toEqual(server.queryData(QUERY));
    const values = { column: "carrier", contains: null, limit: 5 };
    expect(columnValues(rows, values)).toEqual(server.columnValues(values));
    const find = { filters: QUERY.filters, search: null, sort_by: "netRevenue", direction: "desc" as const, limit: 3, columns: ["margin"] };
    expect(findOrders(rows, find)).toEqual(server.findOrders(find));
  });

  it("the reads count a surface's edits", () => {
    const [first] = ledgerRows().filter((row) => row.values.status === "Placed");
    const edited = ledgerRows().map((row) => (row.id === first.id ? { ...row, values: { ...row.values, status: "Cancelled" } } : row));
    const count = { ...QUERY, group_by: null, metric: "count", metric_column: null };
    const before = queryData(ledgerRows(), count) as { matching_orders: number };
    expect(queryData(edited, count)).toMatchObject({ matching_orders: before.matching_orders - 1 });
    expect(server.withLedgerEdits({ [first.id]: { status: "Cancelled" } }, () => server.queryData(count))).toEqual(queryData(edited, count));
  });
});

describe("planTableChange", () => {
  const none = { search: null, filters: null, sorts: null, visibleColumns: null, pinnedColumns: null, grouping: null, density: null };

  it("refuses a filter the column does not take, in words to retry on", () => {
    const change = planTableChange({ ...none, filters: [{ column: "status", operator: "greaterThan" as never, value: "1" }] }, { filters: [], search: "" }, ledgerRows());
    expect(change).toMatchObject({ problem: expect.stringContaining("status does not take") });
  });

  it("keeps the scope it was not asked to change, and counts what the table then shows", () => {
    const current = { filters: QUERY.filters, search: "" };
    const change = planTableChange({ ...none, search: '""' }, current, ledgerRows());
    if ("problem" in change) throw new Error(change.problem);
    expect(change.view.search).toBe("");
    expect(change.scope).toEqual(current);
    expect(change.reply.matching_orders).toBe((queryData(ledgerRows(), { ...QUERY, group_by: null, metric: "count", metric_column: null }) as { matching_orders: number }).matching_orders);
  });
});

describe("proposeOrderAction", () => {
  const rows = ledgerRows();
  const byId = new Map(rows.map((row) => [row.id, row.values]));
  const sources = { focusIds: () => [] as string[], tableIds: () => rows.slice(0, 50).map((row) => row.id), valuesOf: (id: string) => byId.get(id) };

  it("plans and changes nothing: the orders it would change, and the ones it leaves alone", () => {
    const { plan, reply } = proposeOrderAction({ action: "cancel", target: "table", order_ids: [] }, sources);
    const cancellable = rows.slice(0, 50).filter((row) => ["Placed", "Picking"].includes(String(row.values.status)));
    if (cancellable.length) {
      expect(plan?.ids).toEqual(cancellable.map((row) => row.id));
      expect(reply).toMatchObject({ proposed: cancellable.length });
    } else {
      expect(plan).toBeUndefined();
      expect(reply).toMatchObject({ proposed: 0 });
    }
    expect(rows.slice(0, 50).map((row) => row.values.status)).toEqual(ledgerRows().slice(0, 50).map((row) => row.values.status));
  });

  it("drops ids that are not orders, and proposes nothing when none are left", () => {
    expect(proposeOrderAction({ action: "refund", target: "orders", order_ids: ["nope", "ORD-0000000"] }, sources)).toEqual({ reply: { proposed: 0, next: "No orders matched. Say so in a sentence." } });
  });

  it("asks which orders are meant when the focus is empty", () => {
    expect(proposeOrderAction({ action: "fulfil", target: "focus", order_ids: [] }, sources).reply).toMatchObject({ proposed: 0, next: expect.stringContaining("No orders are ticked") });
  });

  it("refuses an action that does not exist", () => {
    expect(proposeOrderAction({ action: "delete" as never, target: "table", order_ids: [] }, sources)).toEqual({ reply: "That action does not exist. Use fulfil, cancel or refund." });
  });
});
