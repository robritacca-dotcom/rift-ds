/**
 * The model's tools over the order ledger, shared by the table command's route
 * and the merchant sales chat so the two can never disagree about the data. They
 * run on the server over the same seeded rows the browser shows, take only real
 * columns and return only what the rows hold. Nothing here writes anything.
 */

import { AsyncLocalStorage } from "node:async_hooks";
import type Anthropic from "@anthropic-ai/sdk";
import type { DataTableRow } from "rift-ds/components/DataTable/DataTable";
import { COLUMN_KEYS, LEDGER_COLUMNS, ledgerRows } from "@/data/order-ledger";
import type { LedgerViewChange } from "./order-ledger-view";
import { withEdit, type OrderEdits } from "./order-actions";
import { TYPE_DEFAULTS, type ColumnType } from "../../../src/components/DataTable/columnTypes";
import { OPERATORS, VALUELESS, matches, type Filter, type FilterKind, type FilterOperator } from "../../../src/components/DataTable/filterModel";

type LooseColumn = { key: string; header: string; type?: ColumnType; options?: { value: string }[]; groupable?: boolean };
const COLUMNS = LEDGER_COLUMNS as readonly LooseColumn[];
const BY_KEY = new Map(COLUMNS.map((col) => [col.key, col]));

/* A request's page edits (lib/order-actions.ts): the merchant chat runs its tools inside
   withLedgerEdits, so its answers count what the reader changed; everything else reads
   the seeded ledger. */
const ledgerEdits = new AsyncLocalStorage<OrderEdits>();

/** Runs `fn` with the ledger read through these edits. */
export const withLedgerEdits = <T,>(edits: OrderEdits, fn: () => T): T => ledgerEdits.run(edits, fn);

/** The edits the current request reads the ledger through. */
export const currentLedgerEdits = (): OrderEdits => ledgerEdits.getStore() ?? {};

/** The ledger as the current request sees it. */
export function currentRows(): DataTableRow[] {
  const edits = currentLedgerEdits();
  return Object.keys(edits).length ? ledgerRows().map((row) => (edits[row.id] ? { ...row, values: withEdit(row.values, edits[row.id]) } : row)) : ledgerRows();
}

const kindOf = (col: LooseColumn): FilterKind => (col.type ? TYPE_DEFAULTS[col.type].filter : col.options ? "enum" : "text");
/* Free-text columns also take a list: it is how a top-N becomes a filter, and how
   the orders a reader ticked (orderId isAnyOf their ids) become one. */
const operatorsFor = (col: LooseColumn): FilterOperator[] =>
  kindOf(col) === "text" && !col.options ? [...OPERATORS.text, "isAnyOf", "isNoneOf"] : OPERATORS[kindOf(col)];

const ALL_OPERATORS = [...new Set(Object.values(OPERATORS).flat()), "isAnyOf", "isNoneOf"] as FilterOperator[];

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

/** The two lookups, as the model reads them. */
export const LEDGER_TOOLS: Anthropic.Tool[] = [
  {
    name: "query_data",
    description: "Runs a count or calculation over the ledger, optionally filtered, searched and grouped, and returns the top results. Filters use the same columns and operators as the table. margin_rate is the margin as a percentage of net revenue, taking no metric_column: use it for any margin figure over more than one order, never an average of marginPct.",
    strict: true,
    input_schema: {
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
    } as unknown as Anthropic.Tool["input_schema"],
  },
  {
    name: "column_values",
    description: "Lists a column's distinct values with how many orders hold each, most common first, optionally only those containing some text. Use it to find exact names.",
    strict: true,
    input_schema: {
      type: "object",
      additionalProperties: false,
      required: ["column", "contains", "limit"],
      properties: {
        column: { type: "string", enum: COLUMN_KEYS },
        contains: nullable({ type: "string" }),
        limit: { type: "integer" },
      },
    } as unknown as Anthropic.Tool["input_schema"],
  },
];

/* The table's own search: any raw value on the row, displayed or not, case insensitive. */
const searchRows = (rows: DataTableRow[], search?: string | null) => {
  const needle = search?.trim().toLowerCase();
  return needle
    ? rows.filter((row) => Object.values(row.values).some((cell) => cell != null && String(cell).toLowerCase().includes(needle)))
    : rows;
};

const filterRows = (rows: DataTableRow[], filters: Omit<Filter, "id">[]) =>
  filters.length === 0
    ? rows
    : rows.filter((row) =>
        filters.every((filter) => matches({ ...filter, id: "" } as Filter, row.values[filter.column] as Parameters<typeof matches>[1])),
      );

/** The rows a set of filters and a search leave. */
export const matchingRows = (filters: Omit<Filter, "id">[], search?: string | null) => searchRows(filterRows(currentRows(), filters), search);

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

export type QueryInput = { filters: Omit<Filter, "id">[]; search?: string | null; group_by: string | null; metric: string; metric_column: string | null; order: "asc" | "desc"; limit: number };

export function queryData(input: QueryInput) {
  const problems = filterProblems(input.filters);
  if (problems.length) return { error: problems.join(" ") };
  if (input.metric !== "count" && input.metric !== "margin_rate" && !input.metric_column) return { error: `${input.metric} needs a metric_column.` };
  const rows = matchingRows(input.filters, input.search);
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

export function columnValues(input: ColumnValuesInput) {
  const counts = new Map<string, number>();
  const needle = input.contains?.toLowerCase();
  for (const row of currentRows()) {
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

/** What is wrong with a set of filters: a condition the column doesn't take, or a value of the wrong shape. */
export function filterProblems(filters: Omit<Filter, "id">[]) {
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
