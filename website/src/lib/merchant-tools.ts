/**
 * The merchant sales page's tools, defined once: what each is called, what it
 * says it does, the input it takes, and the pure step that answers it over a
 * set of rows. Two surfaces read this file and nothing else for those facts:
 * the page's own assistant (the route at /api/merchant-chat, through
 * lib/order-ledger-tools.ts, which supplies the rows a request sees) and an
 * outside agent in the browser (WebMCP, through useMerchantPageTools, which
 * supplies the rows the page holds). So the two cannot drift: a tool renamed,
 * reworded or reshaped here changes on both at once.
 *
 * No rows of its own, no model and nothing from Node, so the browser can
 * import it. Nothing here writes: propose_order_action only works out a plan,
 * and each surface puts that plan in front of the reader to confirm.
 */

import type { DataTableRow } from "rift-ds/components/DataTable/DataTable";
import { COLUMN_KEYS, LEDGER_COLUMNS, ROW_COUNT } from "@/data/order-ledger";
import { MERCHANT_OPENING_SORT, MERCHANT_SHOWN_COLUMNS } from "@/data/merchant-sales";
import type { LedgerViewChange } from "./order-ledger-view";
import { ORDER_ACTIONS, ORDER_ACTION_IDS, planAction, skippedText, type ActionPlan, type OrderActionId } from "./order-actions";
import { TYPE_DEFAULTS, type ColumnType } from "../../../src/components/DataTable/columnTypes";
import { OPERATORS, VALUELESS, matches, type Filter, type FilterKind, type FilterOperator } from "../../../src/components/DataTable/filterModel";

type LooseColumn = { key: string; header: string; type?: ColumnType; options?: { value: string }[]; groupable?: boolean; pin?: string };
const COLUMNS = LEDGER_COLUMNS as readonly LooseColumn[];
const BY_KEY = new Map(COLUMNS.map((col) => [col.key, col]));

const kindOf = (col: LooseColumn): FilterKind => (col.type ? TYPE_DEFAULTS[col.type].filter : col.options ? "enum" : "text");
/* Free-text columns also take a list: it is how a top-N becomes a filter, and how
   the orders a reader ticked (orderId isAnyOf their ids) become one. */
const operatorsFor = (col: LooseColumn): FilterOperator[] =>
  kindOf(col) === "text" && !col.options ? [...OPERATORS.text, "isAnyOf", "isNoneOf"] : OPERATORS[kindOf(col)];

const ALL_OPERATORS = [...new Set(Object.values(OPERATORS).flat()), "isAnyOf", "isNoneOf"] as FilterOperator[];

/* ------------------------------------------------------------- schemas */

const FILTER_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["column", "operator", "value"],
  properties: {
    column: { type: "string", enum: COLUMN_KEYS },
    operator: { type: "string", enum: [...new Set(ALL_OPERATORS)] },
    value: {
      description: "A string or number; a list of strings for set operators; a [low, high] list of strings for between; null for operators that take no value.",
      anyOf: [{ type: "string" }, { type: "number" }, { type: "array", items: { type: "string" } }, { type: "null" }],
    },
  },
} as const;

const nullable = (schema: object) => ({ anyOf: [schema, { type: "null" }] });

/** A table change as JSON schema: it can only name real columns. */
export const VIEW_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["search", "filters", "sorts", "visibleColumns", "pinnedColumns", "grouping", "density"],
  properties: {
    search: nullable({ type: "string" }),
    filters: nullable({ type: "array", items: FILTER_SCHEMA }),
    sorts: nullable({
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "direction"],
        properties: { key: { type: "string", enum: COLUMN_KEYS }, direction: { type: "string", enum: ["asc", "desc"] } },
      },
    }),
    visibleColumns: nullable({ type: "array", items: { type: "string", enum: COLUMN_KEYS } }),
    pinnedColumns: nullable({ type: "array", items: { type: "string", enum: COLUMN_KEYS } }),
    grouping: nullable({ type: "array", items: { type: "string", enum: COLUMN_KEYS } }),
    density: nullable({ type: "string", enum: ["default", "compact"] }),
  },
};

/** The ledger's columns as the system prompts list them. */
export const LEDGER_COLUMNS_TEXT = `Columns (key | header | type | filter operators | choices):
${COLUMNS.map((col) =>
  [col.key, col.header, col.type ?? "text", operatorsFor(col).join(","), col.options?.map((option) => option.value).join(", ") ?? ""].join(" | ") +
  (col.groupable ? " | groupable" : ""),
).join("\n")}`;

/* As many rows as find_orders hands back. */
const MAX_ROWS = 25;

/* --------------------------------------------------------- definitions */

export type MerchantToolName = "query_data" | "column_values" | "find_orders" | "set_table" | "reset_table" | "propose_order_action";

/** One tool, as every surface reads it. */
export interface MerchantTool {
  name: MerchantToolName;
  description: string;
  /** JSON Schema for the input. */
  inputSchema: object;
  /** read answers from the rows; page changes the table at once; propose plans a change to orders that only the reader's Confirm makes. */
  kind: "read" | "page" | "propose";
  /** Whether the page's own assistant holds the model to the schema exactly. */
  strict: boolean;
}

/** The page's tools, in the order its assistant is handed them. */
export const MERCHANT_TOOLS: readonly MerchantTool[] = [
  {
    name: "query_data",
    description: "Runs a count or calculation over the ledger, optionally filtered, searched and grouped, and returns the top results. Filters use the same columns and operators as the table. margin_rate is the margin as a percentage of net revenue, taking no metric_column: use it for any margin figure over more than one order, never an average of marginPct.",
    kind: "read",
    strict: true,
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["filters", "search", "group_by", "metric", "metric_column", "order", "limit"],
      properties: {
        filters: { type: "array", items: FILTER_SCHEMA },
        search: nullable({ type: "string" }),
        group_by: nullable({ type: "string", enum: COLUMN_KEYS }),
        metric: { type: "string", enum: ["count", "sum", "avg", "min", "max", "p50", "p90", "p95", "p99", "margin_rate"] },
        metric_column: nullable({ type: "string", enum: COLUMN_KEYS }),
        order: { type: "string", enum: ["asc", "desc"] },
        limit: { type: "integer" },
      },
    },
  },
  {
    name: "column_values",
    description: "Lists a column's distinct values with how many orders hold each, most common first, optionally only those containing some text. Use it to find exact names.",
    kind: "read",
    strict: true,
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["column", "contains", "limit"],
      properties: {
        column: { type: "string", enum: COLUMN_KEYS },
        contains: nullable({ type: "string" }),
        limit: { type: "integer" },
      },
    },
  },
  {
    name: "find_orders",
    description: `Returns actual orders: the matching rows, sorted, at most ${MAX_ROWS}. Each carries the table's opening columns plus any you name. Use it for questions about particular orders, such as who placed the largest.`,
    kind: "read",
    strict: true,
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["filters", "search", "sort_by", "direction", "limit", "columns"],
      properties: {
        filters: { type: "array", items: FILTER_SCHEMA },
        search: nullable({ type: "string" }),
        sort_by: { type: "string", enum: COLUMN_KEYS },
        direction: { type: "string", enum: ["asc", "desc"] },
        limit: { type: "integer" },
        columns: { type: "array", items: { type: "string", enum: COLUMN_KEYS } },
      },
    },
  },
  {
    name: "set_table",
    description: "Changes the orders table on the page: its search, filters, sorts, columns, pinning, grouping and density. Returns how many orders match, when you set filters or a search.",
    kind: "page",
    strict: true,
    inputSchema: VIEW_SCHEMA,
  },
  {
    name: "reset_table",
    description: "Resets the orders table: clears every filter and the search, and restores the opening columns, sort, grouping and density. Use it whenever asked to reset, clear or start the table over.",
    kind: "page",
    strict: true,
    inputSchema: { type: "object", additionalProperties: false, properties: {}, required: [] },
  },
  {
    name: "propose_order_action",
    description:
      "Proposes marking orders fulfilled, cancelling them or refunding them. It changes nothing: it works out which orders the action applies to and which it leaves alone and why, and shows the reader a card to confirm or cancel.",
    kind: "propose",
    /* Not strict: one more strict schema tips the route's combined grammar over the API's size limit, and every field is checked anyway. */
    strict: false,
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["action", "target", "order_ids"],
      properties: {
        action: { type: "string", enum: ORDER_ACTION_IDS },
        target: { type: "string", enum: ["focus", "table", "orders"], description: "focus: the orders the reader ticked. table: every order matching the table's current filters and search. orders: the ids in order_ids." },
        order_ids: { type: "array", items: { type: "string" }, description: "The ids, for target orders; an empty list otherwise." },
      },
    },
  },
];

/** A tool by its name. */
export const merchantTool = (name: MerchantToolName) => MERCHANT_TOOLS.find((tool) => tool.name === name)!;

/* --------------------------------------------------------------- reads */

export type Filters = Omit<Filter, "id">[];

/* The table's own search: any raw value on the row, displayed or not, case insensitive. */
const searchRows = (rows: DataTableRow[], search?: string | null) => {
  const needle = search?.trim().toLowerCase();
  return needle
    ? rows.filter((row) => Object.values(row.values).some((cell) => cell != null && String(cell).toLowerCase().includes(needle)))
    : rows;
};

const filterRows = (rows: DataTableRow[], filters: Filters) =>
  filters.length === 0
    ? rows
    : rows.filter((row) =>
        filters.every((filter) => matches({ ...filter, id: "" } as Filter, row.values[filter.column] as Parameters<typeof matches>[1])),
      );

/** The rows a set of filters and a search leave. */
export const matchingRows = (rows: DataTableRow[], filters: Filters, search?: string | null) => searchRows(filterRows(rows, filters), search);

const calculate = (metric: string, values: number[]) => {
  if (metric === "count") return values.length;
  if (values.length === 0) return null;
  if (metric === "sum") return values.reduce((a, b) => a + b, 0);
  if (metric === "avg") return values.reduce((a, b) => a + b, 0) / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  if (metric === "min") return sorted[0];
  if (metric === "max") return sorted[sorted.length - 1];
  return sorted[Math.min(sorted.length - 1, Math.floor((Number(metric.slice(1)) / 100) * sorted.length))];
};

const round = (value: number | null) => (value === null ? null : Math.round(value * 100) / 100);

/* What the page's Margin figure is: money over money, so a large order counts for more than a small one. */
const marginRate = (rows: DataTableRow[]) => {
  const total = (key: string) => rows.reduce((sum, row) => sum + (Number(row.values[key]) || 0), 0);
  const revenue = total("netRevenue");
  return revenue > 0 ? (total("margin") / revenue) * 100 : null;
};

export type QueryInput = { filters: Filters; search?: string | null; group_by: string | null; metric: string; metric_column: string | null; order: "asc" | "desc"; limit: number };

export function queryData(all: DataTableRow[], input: QueryInput) {
  const problems = filterProblems(input.filters);
  if (problems.length) return { error: problems.join(" ") };
  if (input.metric !== "count" && input.metric !== "margin_rate" && !input.metric_column) return { error: `${input.metric} needs a metric_column.` };
  const rows = matchingRows(all, input.filters, input.search);
  const valueOf = (list: DataTableRow[]) => {
    if (input.metric === "margin_rate") return marginRate(list);
    const values = input.metric === "count" ? new Array<number>(list.length).fill(0) : list.map((row) => row.values[input.metric_column!]).filter((value): value is number => typeof value === "number");
    return calculate(input.metric, values);
  };
  if (!input.group_by) return { matching_orders: rows.length, value: round(valueOf(rows)) };
  const groups = new Map<string, DataTableRow[]>();
  for (const row of rows) {
    const raw = row.values[input.group_by];
    const key = raw == null || raw === "" ? "(empty)" : String(raw);
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  }
  const results = [...groups].map(([group, list]) => ({ group, orders: list.length, value: round(valueOf(list)) }));
  results.sort((a, b) => ((a.value ?? 0) - (b.value ?? 0)) * (input.order === "asc" ? 1 : -1));
  return { matching_orders: rows.length, group_count: results.length, results: results.slice(0, Math.min(input.limit, 100)) };
}

export type ColumnValuesInput = { column: string; contains: string | null; limit: number };

export function columnValues(all: DataTableRow[], input: ColumnValuesInput) {
  const counts = new Map<string, number>();
  const needle = input.contains?.toLowerCase();
  for (const row of all) {
    const raw = row.values[input.column];
    for (const value of Array.isArray(raw) ? raw : [raw]) {
      if (value == null || value === "") continue;
      const text = String(value);
      if (needle && !text.toLowerCase().includes(needle)) continue;
      counts.set(text, (counts.get(text) ?? 0) + 1);
    }
  }
  return { distinct: counts.size, values: [...counts].sort((a, b) => b[1] - a[1]).slice(0, Math.min(input.limit, 100)).map(([value, orders]) => ({ value, orders })) };
}

export type FindOrdersInput = { filters: Filters; search: string | null; sort_by: string; direction: "asc" | "desc"; limit: number; columns: string[] };

export function findOrders(all: DataTableRow[], input: FindOrdersInput) {
  const problems = filterProblems(input.filters);
  if (problems.length) return { error: problems.join(" ") };
  const sign = input.direction === "asc" ? 1 : -1;
  const value = (row: DataTableRow) => row.values[input.sort_by];
  const rows = [...matchingRows(all, input.filters, input.search)].sort((a, b) => {
    const [x, y] = [value(a), value(b)];
    return (typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""))) * sign;
  });
  const keys = [...new Set([...MERCHANT_SHOWN_COLUMNS, ...(input.columns ?? [])])];
  return {
    matching_orders: rows.length,
    rows: rows.slice(0, Math.min(input.limit, MAX_ROWS)).map((row) => Object.fromEntries(keys.map((key) => [key, row.values[key]]))),
  };
}

/** What is wrong with a set of filters: a condition the column doesn't take, or a value of the wrong shape. */
export function filterProblems(filters: Filters) {
  const problems: string[] = [];
  for (const filter of filters) {
    const col = BY_KEY.get(filter.column);
    if (!col) problems.push(`Unknown column ${filter.column}.`);
    else if (!operatorsFor(col).includes(filter.operator)) problems.push(`${filter.column} does not take ${filter.operator}; it takes ${operatorsFor(col).join(", ")}.`);
    else if (filter.operator === "between" && !(Array.isArray(filter.value) && filter.value.length === 2)) problems.push(`${filter.column} between needs a [low, high] list.`);
    else if (["isAnyOf", "isNoneOf", "hasAnyOf", "hasAllOf", "hasNoneOf"].includes(filter.operator) && !Array.isArray(filter.value)) problems.push(`${filter.column} ${filter.operator} needs a list.`);
    else if (!VALUELESS.has(filter.operator) && (filter.value == null || filter.value === "")) problems.push(`${filter.column} ${filter.operator} needs a value.`);
  }
  return problems;
}

/** What stops a table change being applied. */
export function viewProblems(view: LedgerViewChange) {
  const problems = filterProblems(view.filters ?? []);
  for (const key of view.grouping ?? []) if (!BY_KEY.get(key)?.groupable) problems.push(`${key} cannot be grouped.`);
  return problems;
}

export const describeQuery = (input: { filters: unknown[]; group_by: string | null; metric: string; metric_column: string | null }) =>
  `${input.metric}${input.metric_column ? ` of ${input.metric_column}` : ""}${input.group_by ? ` by ${input.group_by}` : ""}${input.filters.length ? ` (${input.filters.length} filters)` : ""}`;

/* --------------------------------------------------------------- table */

/** The part of the table's setup that decides which orders it shows. */
export type TableScope = { filters: Filters; search: string };

/**
 * A table change, checked: the change to apply, the scope it leaves the table
 * with, and the reply the tool gives. A problem comes back as words to retry on.
 */
export function planTableChange(
  asked: LedgerViewChange,
  current: TableScope,
  rows: DataTableRow[],
): { problem: string } | { view: LedgerViewChange; scope: TableScope; reply: { applied: true; matching_orders?: number; next: string } } {
  /* A cleared search can arrive as a pair of quotes, which would search for them and match nothing. */
  const view: LedgerViewChange = { ...asked, search: asked.search == null ? null : asked.search.trim().replace(/^["']+|["']+$/g, "") };
  const problems = viewProblems(view);
  if (problems.length) return { problem: `That can't be applied: ${problems.join(" ")} Try again.` };
  const scope: TableScope = { filters: view.filters ?? current.filters, search: view.search ?? current.search };
  const matching = view.filters || view.search !== null ? { matching_orders: matchingRows(rows, scope.filters, scope.search).length } : {};
  return { view, scope, reply: { applied: true as const, ...matching, next: "Say in a sentence what the table now shows." } };
}

/** Every part of the setup, named outright, so nothing the visitor changed can survive a reset. */
export const RESET_VIEW: LedgerViewChange = {
  search: "",
  filters: [],
  sorts: [MERCHANT_OPENING_SORT],
  visibleColumns: MERCHANT_SHOWN_COLUMNS,
  pinnedColumns: COLUMNS.filter((col) => col.pin === "start").map((col) => col.key),
  grouping: [],
  density: "default",
};

/** What reset_table answers. */
export const RESET_REPLY = { applied: true, matching_orders: ROW_COUNT, next: "Say in a sentence that the table is reset with no filters, showing every order." };

/* ------------------------------------------------------------ proposals */

export type ProposeInput = { action: OrderActionId; target: "focus" | "table" | "orders"; order_ids: string[] };

/** Where a surface finds the orders a proposal names. */
export interface ProposalSources {
  /** The orders the reader ticked or highlighted. */
  focusIds: () => string[];
  /** Every order the table shows. */
  tableIds: () => string[];
  /** An order's values as the surface sees them, edits included; undefined when the id is no order. */
  valuesOf: (id: string) => Record<string, unknown> | undefined;
}

/**
 * Works out a proposal and changes nothing: which orders the action would
 * change and which it leaves alone. With no plan, the reply says why nothing
 * can be proposed; with one, the surface shows it to the reader to confirm.
 */
export function proposeOrderAction(input: ProposeInput, sources: ProposalSources): { reply: string | object; plan?: ActionPlan } {
  const { action, target, order_ids } = input;
  if (!ORDER_ACTION_IDS.includes(action)) return { reply: "That action does not exist. Use fulfil, cancel or refund." };
  const ids =
    target === "focus" ? sources.focusIds()
    : target === "table" ? sources.tableIds()
    : (Array.isArray(order_ids) ? order_ids : []).filter((id) => typeof id === "string" && sources.valuesOf(id));
  if (!ids.length) return { reply: { proposed: 0, next: target === "focus" ? "No orders are ticked. Ask which orders the reader means." : "No orders matched. Say so in a sentence." } };
  const plan = planAction(action, ids.flatMap((id) => {
    const values = sources.valuesOf(id);
    return values ? [{ id, values }] : [];
  }));
  const skipped = skippedText(plan.skipped);
  if (!plan.ids.length) return { reply: { proposed: 0, skipped, next: `None of these can be ${ORDER_ACTIONS[action].done}. Say why in a sentence.` } };
  return {
    reply: { proposed: plan.ids.length, action: ORDER_ACTIONS[action].label, skipped: skipped || "none", next: "Nothing has changed yet. Say in a sentence what will change and that it waits for the reader to confirm on the card." },
    plan,
  };
}
