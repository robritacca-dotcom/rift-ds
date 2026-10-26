/**
 * DataTable's saved views: the one serialisable object a host stores
 * however it likes, and the repair that keeps a stored view working on a
 * table whose columns have changed since. Internal: the public names are
 * DataTableView and reconcileDataTableView, re-exported from DataTable.
 *
 * A view is how the table is set up, never what the reader is in the middle
 * of: the selection, the current page and the open details stay out.
 */

import type { Filter } from './filterModel';
import { OPERATORS, VALUELESS, type FilterKind } from './filterModel';

/** One saved setup of a table. Every field is optional: a view leaves out what it does not set. */
export interface TableView {
  /** The view format's version, so a stored view can be read by a later one. */
  version: 1;
  /** The sorts, first sort first. */
  sorts?: { key: string; direction: 'asc' | 'desc' }[];
  /** The filters. */
  filters?: Filter[];
  /** The search text. */
  search?: string;
  /** The hidden columns' keys. */
  hiddenColumns?: string[];
  /** Every column key in display order. */
  columnOrder?: string[];
  /** The columns pinned to either edge. */
  columnPinning?: { start?: string[]; end?: string[] };
  /** The column widths in pixels, by key. */
  columnWidths?: Record<string, number>;
  /** The column keys the rows are grouped by. */
  grouping?: string[];
  /** The density. */
  size?: 'default' | 'compact';
  /** Rows per page. */
  pageSize?: number;
}

/** What reconciling needs to know about a column. */
export interface ViewColumn {
  key: string;
  /** Its filter kind, when the table knows it, so a filter whose condition no longer fits is dropped. */
  filterKind?: FilterKind;
  minWidth?: number;
  maxWidth?: number;
  groupable?: boolean;
  sortable?: boolean;
}

/**
 * A stored view made safe for the table's columns as they are now: columns
 * that no longer exist drop out of every part of it, a filter whose
 * condition no longer fits its column's kind is dropped, new columns join
 * the end of the column order, and widths clamp to each column's limits.
 * Run it on a view read from storage before handing it to the table.
 */
export function reconcileView(view: TableView, columns: ViewColumn[]): TableView {
  const byKey = new Map(columns.map((col) => [col.key, col]));
  const known = (key: string) => byKey.has(key);
  const next: TableView = { version: 1 };
  if (view.sorts) next.sorts = view.sorts.filter((sort) => known(sort.key) && byKey.get(sort.key)!.sortable !== false);
  if (view.filters)
    next.filters = view.filters.filter((filter) => {
      const col = byKey.get(filter.column);
      if (!col) return false;
      if (!col.filterKind) return true;
      return OPERATORS[col.filterKind].includes(filter.operator) || VALUELESS.has(filter.operator);
    });
  if (view.search !== undefined) next.search = view.search;
  if (view.hiddenColumns) next.hiddenColumns = view.hiddenColumns.filter(known);
  if (view.columnOrder) {
    const kept = view.columnOrder.filter(known);
    next.columnOrder = [...kept, ...columns.map((col) => col.key).filter((key) => !kept.includes(key))];
  }
  if (view.columnPinning)
    next.columnPinning = {
      start: (view.columnPinning.start ?? []).filter(known),
      end: (view.columnPinning.end ?? []).filter(known),
    };
  if (view.columnWidths)
    next.columnWidths = Object.fromEntries(
      Object.entries(view.columnWidths)
        .filter(([key, width]) => known(key) && Number.isFinite(width))
        .map(([key, width]) => {
          const col = byKey.get(key)!;
          return [key, Math.min(col.maxWidth ?? Infinity, Math.max(col.minWidth ?? 0, width))];
        }),
    );
  if (view.grouping) next.grouping = view.grouping.filter((key) => known(key) && byKey.get(key)!.groupable);
  if (view.size === 'default' || view.size === 'compact') next.size = view.size;
  if (typeof view.pageSize === 'number' && view.pageSize > 0) next.pageSize = view.pageSize;
  return next;
}
