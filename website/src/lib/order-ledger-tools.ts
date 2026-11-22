/**
 * The model's tools over the order ledger, as the server runs them: shared by
 * the table command's route and the merchant sales chat so the two can never
 * disagree about the data. What each tool is called, says and takes, and the
 * step that answers it, live in lib/merchant-tools.ts, which the page reads
 * too; this file supplies the rows a request sees (the seeded ledger, read
 * through the edits the page sent) and the tools in the model's own shape.
 * Nothing here writes anything.
 */

import { AsyncLocalStorage } from "node:async_hooks";
import type Anthropic from "@anthropic-ai/sdk";
import type { DataTableRow } from "rift-ds/components/DataTable/DataTable";
import { ledgerRows } from "@/data/order-ledger";
import {
  MERCHANT_TOOLS,
  columnValues as columnValuesOver,
  findOrders as findOrdersOver,
  matchingRows as matchingRowsOver,
  merchantTool,
  queryData as queryDataOver,
  type ColumnValuesInput,
  type Filters,
  type FindOrdersInput,
  type MerchantTool,
  type MerchantToolName,
  type QueryInput,
} from "./merchant-tools";
import { withEdit, type OrderEdits } from "./order-actions";

export { LEDGER_COLUMNS_TEXT, VIEW_SCHEMA, describeQuery, filterProblems, viewProblems } from "./merchant-tools";
export type { ColumnValuesInput, FindOrdersInput, QueryInput } from "./merchant-tools";

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

/** A shared tool as the model reads it. */
const asModelTool = (tool: MerchantTool): Anthropic.Tool => ({
  name: tool.name,
  description: tool.description,
  ...(tool.strict ? { strict: true } : {}),
  input_schema: tool.inputSchema as Anthropic.Tool["input_schema"],
});

/** One of the page's tools, by name, as the model reads it. */
export const modelTool = (name: MerchantToolName) => asModelTool(merchantTool(name));

/** The two lookups, as the model reads them. */
export const LEDGER_TOOLS: Anthropic.Tool[] = MERCHANT_TOOLS.filter((tool) => tool.name === "query_data" || tool.name === "column_values").map(asModelTool);

/** The rows a set of filters and a search leave. */
export const matchingRows = (filters: Filters, search?: string | null) => matchingRowsOver(currentRows(), filters, search);

export const queryData = (input: QueryInput) => queryDataOver(currentRows(), input);

export const columnValues = (input: ColumnValuesInput) => columnValuesOver(currentRows(), input);

export const findOrders = (input: FindOrdersInput) => findOrdersOver(currentRows(), input);
