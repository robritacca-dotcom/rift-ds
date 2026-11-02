/**
 * What a table change over the order ledger is, and how it lands: the shape the
 * models answer in and the pure step that lays one over the table's setup. No
 * rows and no model here, so the browser can import it too: the table command's
 * route runs it on the server, and the merchant sales chat runs it in the page.
 */

import { COLUMN_KEYS } from "@/data/order-ledger";
import { VALUELESS, type Filter } from "../../../src/components/DataTable/filterModel";
import type { TableView } from "../../../src/components/DataTable/views";

/** A change to the table. For each field, null leaves it as it is and a value replaces it whole. */
export type LedgerViewChange = {
  search: string | null;
  filters: Omit<Filter, "id">[] | null;
  sorts: { key: string; direction: "asc" | "desc" }[] | null;
  visibleColumns: string[] | null;
  pinnedColumns: string[] | null;
  grouping: string[] | null;
  density: "default" | "compact" | null;
};

/** The current view with the change laid over it. */
export function nextView(current: TableView, view: LedgerViewChange): TableView {
  const next: TableView = { ...current, version: 1 };
  if (view.search !== null) next.search = view.search;
  if (view.filters) next.filters = view.filters.map((filter, index) => ({ ...filter, id: `${filter.column}-${index + 1}`, value: VALUELESS.has(filter.operator) ? undefined : filter.value }));
  if (view.sorts) next.sorts = view.sorts;
  if (view.visibleColumns) {
    next.hiddenColumns = COLUMN_KEYS.filter((key) => !view.visibleColumns!.includes(key));
    next.columnOrder = [...view.visibleColumns, ...next.hiddenColumns];
  }
  if (view.pinnedColumns) next.columnPinning = { start: view.pinnedColumns, end: current.columnPinning?.end ?? [] };
  if (view.grouping) next.grouping = view.grouping;
  if (view.density) next.size = view.density;
  return next;
}
