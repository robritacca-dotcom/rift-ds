/**
 * What a DataTable hands the control bar inside it: the columns as the bar
 * needs them, and every piece of state the bar reads and sets, with the
 * table's own setters, so `toolbar={<TableToolbar />}` needs no props.
 * Internal: TableToolbar is the public surface, and its own props carry the
 * same state for a bar over some other table.
 */

import { createContext, useContext } from 'react';
import type { Filter, FilterKind, FilterLabels } from './filterModel';
import type { TableView } from './views';

/** One column as the control bar sees it. */
export interface ToolbarColumn {
  /** The column's key. */
  key: string;
  /** Its header text. */
  label: string;
  /** Whether the columns panel may hide it. */
  hideable: boolean;
  /** Whether the columns panel may move it. */
  movable: boolean;
  /** Whether it can be filtered. */
  filterable: boolean;
  /** Whether it can be sorted. */
  sortable: boolean;
  /** Whether the rows can be grouped by it. */
  groupable: boolean;
  /** Its filter kind. */
  kind: FilterKind;
  /** The values a choice filter offers: the column's options, else the values it holds. */
  options: { value: string; label: string }[];
}

export interface TableContextValue {
  columns: ToolbarColumn[];
  filters: Filter[];
  setFilters: (filters: Filter[]) => void;
  search: string;
  setSearch: (search: string) => void;
  hiddenColumns: string[];
  setHiddenColumns: (hidden: string[]) => void;
  /** Every column key in display order. */
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  /** Whether the table has row checkboxes, the selected ids, and the ids of every row that matches. */
  selectable: boolean;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  matchingIds: string[];
  size: 'default' | 'compact';
  setSize: (size: 'default' | 'compact') => void;
  /** Rows matching the search and filters, and rows in all. */
  shown: number;
  total: number;
  /** Every row that matches, the server's count in manual mode. */
  matchingCount: number;
  /** In manual mode, whether every match is selected as a query, the rows left out of it, and its setter. */
  allMatching?: boolean;
  exceptIds: string[];
  setAllMatching?: (on: boolean) => void;
  filterLabels: FilterLabels;
  /** A toolbar showing the result count says so, and the table's footer leaves it out. */
  claimCount: (claimed: boolean) => void;
  /** Every sort, first sort first. */
  sorts: { key: string; direction: 'asc' | 'desc' }[];
  setSorts: (sorts: { key: string; direction: 'asc' | 'desc' }[]) => void;
  /** Whether the table sorts by more than one column. */
  multiSort: boolean;
  /** A toolbar showing the selection count says so, and the table's footer shows the result count instead. */
  claimSelection: (claimed: boolean) => void;
  /** The column keys the rows are grouped by, and their setter. */
  grouping: string[];
  setGrouping: (grouping: string[]) => void;
  /** Opens or closes every group at once. */
  setAllGroupsOpen: (open: boolean) => void;
  /** The table's setup as a view, the setter that applies one, and whether a view matches the setup now. */
  view: TableView;
  applyView: (view: TableView) => void;
  viewMatches: (view: TableView) => boolean;
}

export const TableContext = createContext<TableContextValue | null>(null);

/** The surrounding DataTable's state, or null outside one. */
export const useTableContext = () => useContext(TableContext);
