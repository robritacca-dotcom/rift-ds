'use client';

import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { DropdownMenu, type DropdownMenuEntry } from '../DropdownMenu/DropdownMenu';
import { Dropdown } from '../Dropdown/Dropdown';
import { CircularButton } from '../CircularButton/CircularButton';
import { Button } from '../Button/Button';
import { Spinner } from '../Spinner/Spinner';
import { VirtualRows } from './VirtualRows';
import { ScrollRegion } from '../../behaviors/ScrollRegion';
import { startDrag } from './dragGesture';
import '../Table/Table.css';
import { Pagination, type PaginationProps } from '../Pagination/Pagination';
import { Checkbox } from '../Checkbox/Checkbox';
import { Input } from '../Input/Input';
import { ToggleSwitch } from '../ToggleSwitch/ToggleSwitch';
import { CellEditor, EditorHost } from './CellEditor';
import { FilterEditor } from './FilterEditor';
import {
  DEFAULT_FILTER_LABELS,
  OPERATORS,
  kindOf as filterKindOf,
  isComplete,
  matches,
  newFilterId,
  type Filter,
  type FilterLabels,
  type FilterOperator,
} from './filterModel';
import { TableContext, type TableContextValue, type ToolbarColumn } from './tableContext';
import { Popover } from '../Popover/Popover';
import {
  TYPE_DEFAULTS,
  formatNumber,
  typedComparator,
  typedText,
  type ColumnFormat,
  type ColumnType,
  type StatusRole,
} from './columnTypes';
import { TypedCell } from './TypedCell';
import { reconcileView, type TableView } from './views';
import { NUMERIC_TOTALS, TOTALS, calculate, type Aggregate, type Result, type Total } from './aggregates';
import { useLinkComponent, type LinkComponent } from '../../behaviors/LinkProvider';
import { EDITOR_MIN_WIDTH, LIVE_KINDS, TYPED_KINDS, type CellEditorKind, type CellValue } from './editorKinds';
import { EmptyState, type EmptyStateProps } from '../EmptyState/EmptyState';
import { Banner } from '../Banner/Banner';
import { Skeleton } from '../Skeleton/Skeleton';
import { MOTION_ANNOUNCE_DEBOUNCE_MS } from '../../tokens/motion';
import { BREAKPOINT_PHONE_PX } from '../../tokens/breakpoints';
import '../../behaviors/visually-hidden.css';
import './DataTable.css';
import '../../fonts/material-symbols.css';
import { useLocale } from '../../behaviors/LocaleProvider';

export interface DataTableColumn<R extends DataTableRow = DataTableRow> {
  /** Unique column identifier, used as the key into each row's values. */
  key: string;
  /** Header label displayed in the column header. */
  header: React.ReactNode;
  /** Whether clicking this header sorts by the column. */
  sortable?: boolean;
  /** Optional column width (CSS value like '200px', '30%', 'auto'). */
  width?: string;
  /** Text alignment for cells in this column. */
  align?: 'left' | 'center' | 'right';
  /** Render the cell for a row; defaults to the row's raw value for this key. */
  render?: (row: R) => React.ReactNode;
  /** Whether this column names each row: its cells render as row headers, and its value names the row's checkbox ("Select Ada Lovelace"). One column per table. */
  rowHeader?: boolean;
  /** Narrowest width a resize can reach, in pixels. Defaults to what the header needs (its padding, two letters of label, and its sort glyph and menu button) or, for an editable column, its editor, whichever is wider. */
  minWidth?: number;
  /** Widest width a resize can reach, in pixels. */
  maxWidth?: number;
  /** Starts the column pinned to the start or end edge (logical, so right-to-left correct), where it stays while the rest scroll sideways. */
  pin?: 'start' | 'end';
  /** Whether this column can be resized. Defaults to the table's `resizableColumns`. */
  resizable?: boolean;
  /** Whether this column can be moved. Defaults to the table's `reorderableColumns`. */
  reorderable?: boolean;
  /** Whether this column can be hidden from its header menu. Defaults to true. */
  hideable?: boolean;
  /** Starts the column hidden, seeding `defaultHiddenColumns`. */
  defaultHidden?: boolean;
  /** Holds the column where it is: it cannot be resized, moved, hidden or unpinned, whatever the table allows. The row header is the usual one. */
  locked?: boolean;
  /** How this column's cell text fits. Defaults to the table's `cellText`. */
  cellText?: DataTableCellText;
  /**
   * Makes the column's cells editable, with one of the library's fields
   * (`text`, `textarea`, `number`, `select`, `multiselect`, `combobox`,
   * `tags`, `date`, `time`, `checkbox`, `switch`) or a function that renders
   * your own editor. A cell reads as text until it is edited; `checkbox` and
   * `switch` are live controls in the cell, saved as they toggle.
   */
  editor?: DataTableEditorKind | ((context: DataTableEditorContext<R>) => React.ReactNode);
  /** The choices of a `select`, `multiselect` or `combobox` editor. A cell shows the chosen option's label. */
  options?: DataTableOption[];
  /** Checks a new value before it is saved: return the message to show, or nothing when it passes. An error keeps the editor open. */
  validate?: (value: DataTableValue, row: R) => string | null | undefined;
  /** Whether a row's cell in this column can be edited, given the row. Defaults to true when the column has an `editor`. */
  editable?: boolean | ((row: R) => boolean);
  /** Whether the column can be filtered, from its header menu or a TableToolbar. Defaults to true. */
  filterable?: boolean;
  /**
   * What the column holds, which sets everything the column does not set
   * itself: how a cell is drawn (`render` still wins), its alignment, its
   * sort, its filter's conditions, and the editor it opens when `editable`
   * is set. `text`, `number`, `currency`, `date` (a `YYYY-MM-DD` value),
   * `status` (a Badge in the option's `status` role, sorted in the options'
   * order), `person` (an Avatar and the name, or a stack for a list),
   * `tags` (a list, the first two shown), `progress` (0 to 100),
   * `checkbox` (a check, or a live checkbox when editable) and `link` (a
   * URL, shown without its scheme). An untyped column reads as text and
   * filters by what its values look like.
   */
  type?: DataTableColumnType;
  /** How a typed column formats its values: the locale, the currency, the digits after the point, the date style. */
  format?: DataTableColumnFormat;
  /** Whether the table can be grouped by this column, from its header menu or a TableToolbar. Defaults to false. */
  groupable?: boolean;
  /**
   * The calculation a group row shows in this column, and the totals
   * footer's starting pick: `sum`, `avg`, `min`, `max`, `count`,
   * `countDistinct` or `range`, formatted through the column's type, or a
   * function of the column's values returning what to show.
   */
  aggregate?: DataTableAggregate | ((values: DataTableValue[], rows: R[]) => React.ReactNode);
}

/** The calculations a column's `aggregate` can name. */
export type DataTableAggregate = Aggregate;

/** One saved setup of a table: its sorts, filters, search, columns, pinning, widths, grouping, density and page size. Selection, the page and open details are the session, never part of a view. */
export type DataTableView = TableView;

/** Every calculation the totals footer offers, `none` included. */
export type DataTableTotal = Total;

/** The types a column can be; see `DataTableColumn.type`. */
export type DataTableColumnType = ColumnType;

/** How a typed column formats its values. */
export type DataTableColumnFormat = ColumnFormat;

/** One filter condition on one column, as the table and TableToolbar share it. */
export type DataTableFilter = Filter;

/** The operators a filter can use, across the filter kinds. */
export type DataTableFilterOperator = FilterOperator;

/** Every word a filter shows or announces, each defaulting to English. */
export type DataTableFilterLabels = FilterLabels;

/** The editor kinds a column's `editor` can name, each composed from the library's own field. */
export type DataTableEditorKind = CellEditorKind;

/** Any value a cell can hold. */
export type DataTableValue = CellValue;

/** One choice of a `select`, `multiselect` or `combobox` editor. */
export interface DataTableOption {
  /** The value stored in the row. */
  value: string;
  /** What the cell and the list show. */
  label: string;
  /** For a `status` column, the status role its Badge takes. Defaults to `neutral`. */
  status?: StatusRole;
}

/** What a custom editor is handed. */
export interface DataTableEditorContext<R extends DataTableRow = DataTableRow> {
  /** The draft value. */
  value: DataTableValue;
  /** Changes the draft. */
  setValue: (value: DataTableValue) => void;
  /** Saves the draft, or the value given. */
  commit: (value?: DataTableValue) => void;
  /** Ends the edit without saving. */
  cancel: () => void;
  /** The row being edited. */
  row: R;
  /** The size to draw the editor at: always `compact`, the size every built-in editor takes, whatever the table's density. */
  size: 'default' | 'compact';
  /** The editor's accessible name. */
  label: string;
  /** The validation message, when the draft does not pass. */
  error?: string;
}

/** One saved cell, as `onCellEdit` hears it. */
export interface DataTableCellEdit<R extends DataTableRow = DataTableRow> {
  /** The row, as it was before the edit. */
  row: R;
  /** The column's key. */
  key: string;
  /** The new value. */
  value: DataTableValue;
  /** The value before the edit. */
  previous: DataTableValue;
}

/** One saved row, as `onRowEdit` hears it. */
export interface DataTableRowEdit<R extends DataTableRow = DataTableRow> {
  /** The row, as it was before the edit. */
  row: R;
  /** The changed values, by column key. */
  values: Record<string, DataTableValue>;
  /** The changed columns' values before the edit. */
  previous: Record<string, DataTableValue>;
}

/**
 * How a cell's text fits its width: `wrap` breaks onto as many lines as it
 * needs; `nowrap` stays on one line and runs on; `truncate` stays on one
 * line and ends in an ellipsis, with the full text as the cell's tooltip;
 * `lines-2` wraps onto two lines at most, then ends in an ellipsis.
 */
export type DataTableCellText = 'wrap' | 'nowrap' | 'truncate' | 'lines-2';

export interface DataTableRow {
  /** Unique row identifier. */
  id: string;
  /** Raw values keyed by column key — used for sorting, searching, and default rendering. */
  values: Record<string, DataTableValue>;
}

export interface DataTableSort {
  /** The column being sorted. */
  key: string;
  /** Sort direction. */
  direction: 'asc' | 'desc';
}

/** One action a row offers in its actions column. */
export interface DataTableRowAction {
  /** Stable id for the action. */
  id: string;
  /** What the action does, as its accessible name and its tooltip or menu label. */
  label: string;
  /** Material Symbol name (string) or custom element. */
  icon?: React.ReactNode;
  /** Runs the action. */
  onSelect: () => void;
  /** Shows the action as its own button rather than in the More menu. Defaults to false. */
  inline?: boolean;
  /** Marks a dangerous or irreversible action, drawn in the destructive colour in the menu. */
  destructive?: boolean;
  /** Whether the action is unavailable for this row. */
  disabled?: boolean;
}

/** Columns pinned to either edge, by column key, in order from that edge. */
export interface DataTableColumnPinning {
  /** Keys pinned to the start edge, outermost first. */
  start?: string[];
  /** Keys pinned to the end edge, outermost first. */
  end?: string[];
}

/** Every word the column and row controls show or announce, each defaulting to English. */
/** Every word the table shows while rows load or fail to, each defaulting to English. */
export interface DataTableLoadLabels {
  /** The skeleton rows' name, and the refetch line's. */
  loading: string;
  /** The loading row that ends the rows while `hasMore` fetches the next batch. */
  loadingMore: string;
  /** The title of a failed load, in the error state and the Banner. */
  errorTitle: string;
  /** The button that calls `onRetry`. */
  retry: string;
}

export interface DataTableColumnLabels {
  /** Accessible name of a column's menu button, given the header text. */
  menu: (header: string) => string;
  /** Menu item: sort the column ascending. */
  sortAscending: string;
  /** Menu item: sort the column descending. */
  sortDescending: string;
  /** Menu item: clear the sort. */
  clearSort: string;
  /** Menu item, with `multiSort`: add the column after the current sorts. */
  addToSort: string;
  /** Menu item, with several sorts: take the column out of the sort and keep the others. */
  removeFromSort: string;
  /** Menu item: pin the column to the start edge. */
  pinStart: string;
  /** Menu item: pin the column to the end edge. */
  pinEnd: string;
  /** Menu item: unpin the column. */
  unpin: string;
  /** Menu item: move the column one place towards the start. */
  moveLeft: string;
  /** Menu item: move the column one place towards the end. */
  moveRight: string;
  /** Menu item: hide the column. */
  hide: string;
  /** Menu item: fit the column to its widest visible content. */
  fit: string;
  /** Menu item: put the column back to its starting width. */
  resetWidth: string;
  /** Accessible name of a row's move grip, given the row's name. */
  rowGrip: (rowName: string) => string;
  /** Accessible name of the move-grip column header. */
  rowGripColumn: string;
  /** The hidden header of the details column. */
  detailsColumn: string;
  /** A row's details toggle, given the row's name and whether its details are showing. */
  toggleDetails: (rowName: string, expanded: boolean) => string;
  /** Accessible name of the actions column header. */
  actionsColumn: string;
  /** Accessible name of a row's More menu button, given the row's name. */
  moreActions: (rowName: string) => string;
  /** Announced after a column moves, given its header, its new position and the column count. */
  movedColumn: (header: string, position: number, count: number) => string;
  /** Announced after a row moves, given its name, its new position and the row count. */
  movedRow: (rowName: string, position: number, count: number) => string;
  /** Announced after a column is pinned, given its header and the edge. */
  pinnedColumn: (header: string, edge: 'start' | 'end') => string;
  /** Announced after a column is unpinned, given its header. */
  unpinnedColumn: (header: string) => string;
  /** Announced after a column is hidden, given its header. */
  hiddenColumn: (header: string) => string;
  /** Announced after a column is resized, given its header and the new width in pixels. */
  resizedColumn: (header: string, width: number) => string;
  /** Accessible name of a cell's editor, given the column's header and the row's name. */
  editField: (header: string, rowName: string) => string;
  /** Accessible name of a cell's hover edit button, in cell mode, given the column's header and the row's name. */
  editCell: (header: string, rowName: string) => string;
  /** How a `checkbox` column's checked cell is read. */
  checkedValue: string;
  /** How a `checkbox` column's unchecked cell is read. */
  uncheckedValue: string;
  /** The count a `tags` cell shows for the tags it folds away, given how many. */
  moreValues: (count: number) => string;
  /** Menu item: group the table by the column. */
  groupBy: string;
  /** Menu item: stop grouping, on the grouped column. */
  ungroup: string;
  /** A group row's toggle, given the group's value, its row count and whether it is open. */
  groupToggle: (value: string, count: number, expanded: boolean) => string;
  /** A group row's row count, given how many. */
  groupCount: (count: number) => string;
  /** The group of rows with no value in the grouped column. */
  emptyGroup: string;
  /** Selects every row in a group, given the group's value. */
  selectGroup: (value: string) => string;
  /** The totals footer's prompt on a column with no calculation picked. */
  calculate: string;
  /** The totals footer's menu button, given the column's header. */
  totalsMenu: (header: string) => string;
  /** A picked footer cell's name, given the column's header, the calculation and its result, so it says which column it totals. */
  totalsValue: (header: string, calculation: string, value: string) => string;
  /** Each calculation's name, as the footer's menu and its caption read it. */
  totals: Record<DataTableTotal, string>;
  /** Accessible name of a row's Edit button, with `editMode="row"`, given the row's name. */
  editRow: (rowName: string) => string;
  /** Accessible name of a row's Save button while it edits, given the row's name. */
  saveRow: (rowName: string) => string;
  /** Accessible name of a row's Cancel button while it edits, given the row's name. */
  cancelRow: (rowName: string) => string;
  /** Announced, assertively, when a save fails and the value rolls back, given the column's header and the row's name. */
  saveFailed: (header: string, rowName: string) => string;
}

const DEFAULT_COLUMN_LABELS: DataTableColumnLabels = {
  menu: (header) => `${header} column options`,
  sortAscending: 'Sort ascending',
  sortDescending: 'Sort descending',
  clearSort: 'Clear sort',
  addToSort: 'Add to sort',
  removeFromSort: 'Remove from sort',
  pinStart: 'Pin to start',
  pinEnd: 'Pin to end',
  unpin: 'Unpin',
  moveLeft: 'Move left',
  moveRight: 'Move right',
  hide: 'Hide column',
  fit: 'Fit to content',
  resetWidth: 'Reset width',
  rowGrip: (rowName) => `Move ${rowName}`,
  rowGripColumn: 'Reorder',
  detailsColumn: 'Details',
  toggleDetails: (rowName, expanded) => `${expanded ? 'Hide' : 'Show'} details for ${rowName}`,
  actionsColumn: 'Actions',
  moreActions: (rowName) => `More actions for ${rowName}`,
  movedColumn: (header, position, count) => `${header} moved to column ${position} of ${count}`,
  movedRow: (rowName, position, count) => `${rowName} moved to row ${position} of ${count}`,
  pinnedColumn: (header, edge) => `${header} pinned to the ${edge}`,
  unpinnedColumn: (header) => `${header} unpinned`,
  hiddenColumn: (header) => `${header} hidden`,
  resizedColumn: (header, width) => `${header}, ${width} pixels`,
  editField: (header, rowName) => `${header}, ${rowName}`,
  editCell: (header, rowName) => `Edit ${header}, ${rowName}`,
  checkedValue: 'Yes',
  uncheckedValue: 'No',
  moreValues: (count) => `+${count}`,
  groupBy: 'Group by this column',
  ungroup: 'Ungroup',
  groupToggle: (value, count, expanded) =>
    `${value}, ${count} row${count === 1 ? '' : 's'}, ${expanded ? 'expanded' : 'collapsed'}`,
  groupCount: (count) => String(count),
  emptyGroup: 'No value',
  selectGroup: (value) => `Select every row in ${value}`,
  calculate: 'Calculate',
  totalsMenu: (header) => `Calculate ${header}`,
  totalsValue: (header, calculation, value) => `${header}, ${calculation} ${value}`,
  totals: {
    none: 'None',
    count: 'Count',
    countDistinct: 'Unique',
    empty: 'Empty',
    filled: 'Filled',
    percentEmpty: 'Percent empty',
    sum: 'Sum',
    avg: 'Average',
    min: 'Min',
    max: 'Max',
    range: 'Range',
  },
  editRow: (rowName) => `Edit ${rowName}`,
  saveRow: (rowName) => `Save ${rowName}`,
  cancelRow: (rowName) => `Cancel editing ${rowName}`,
  saveFailed: (header, rowName) => `${header} for ${rowName} was not saved. The value is back to what it was.`,
};

/** The width of the selection and row-grip columns: the control height of a compact row plus its padding. */
const UTILITY_COLUMN_WIDTH = 40;
/** How far one keyboard resize step moves a column edge. */
const RESIZE_STEP = 16;
/** The fewest pixels of label a column keeps when it sets no `minWidth`: two letters and an ellipsis. */
const LABEL_MIN_WIDTH = 40;
/** The header controls' widths, in the base theme: the sort glyph and the compact menu button, each with its gap. */
const SORT_GLYPH_WIDTH = 24;
/** Past this many rows, an unpaged table draws only the rows in view. */
const VIRTUAL_THRESHOLD = 200;
/** A virtualised table's frame height when `maxHeight` does not set one, and the height its first screen is drawn for on the server. */
const VIRTUAL_HEIGHT = 640;
/** A row's height before it is measured: a single line of body text at each density, with the cell padding. */
const ESTIMATED_ROW_HEIGHT = { default: 52, compact: 40 } as const;
/** Rows drawn past each edge of the view, so a quick scroll never shows a gap. */
const VIRTUAL_OVERSCAN = 8;

/** The bordered frame's line, either side of a details panel that spans the visible table. */
const UTILITY_BORDER = 1;
/** The rank a header shows beside its sort glyph while several columns sort. */
const SORT_RANK_WIDTH = 12;
const MENU_BUTTON_WIDTH = 36;
/** A filtered header's mark, the filter glyph with its gap. */
const FILTER_MARK_WIDTH = 24;
/** An editor's inset inside its cell (`--padding-100`). */
const EDITOR_INSET = 4;
/** A cell's inline padding at each density (`--padding-400`, `--padding-300`). */
const CELL_PADDING = { default: 16, compact: 12 } as const;
/** The widest a truncating column with no declared width starts: measured
    naturally it would be as wide as its longest text, which is what
    truncating exists to stop. */
const TRUNCATE_START_WIDTH = 320;

/** A column's declared width in pixels, when it states one (`200px` or a number). */
const declaredPixels = (width: string | number | undefined): number | undefined => {
  if (typeof width === 'number') return width;
  const match = width?.trim().match(/^(\d+(?:\.\d+)?)px$/);
  return match ? Number(match[1]) : undefined;
};

/* One collator per locale for every text comparison: `localeCompare` with
   options builds a new one per call, which a sort of thousands of rows feels.
   The table's locale decides the order (ä sorts with a in German, after z in
   Swedish), so the server and the browser sort alike. */
const textCollator = (locale: string) =>
  new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });

/** Compare two raw values: numbers numerically, everything else as text in the collator's order. */
const valueComparator =
  (collator: Intl.Collator) =>
  (a: DataTableValue, b: DataTableValue): number => {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
    return collator.compare(String(a), String(b));
  };

/*
 * The engine. TanStack Table runs the row model: the search, the sort and
 * the selection state, while rift draws every pixel through Table. Nothing
 * of TanStack's reaches the public API (every type here is rift's own), so
 * its major version is an implementation detail. The features object is
 * built once at module scope, as TanStack requires, and holds only what
 * this table uses. Paging slices the sorted rows here rather than through
 * the engine's paginated model: the page is clamped to the filtered count
 * within the same render (a filter that leaves fewer pages shows the last
 * one at once), which the engine's model cannot do from its state alone.
 */
const ENGINE_FEATURES = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowSelectionFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnVisibilityFeature,
});

/**
 * One piece of state a consumer can own: the controlled value when given,
 * else internal state seeded from the default; the setter updates the
 * internal copy when uncontrolled and always reports the next value.
 */
function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [internal, setInternal] = useState<T>(defaultValue);
  const current = value !== undefined ? value : internal;
  const set = (next: T) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };
  return [current, set] as const;
}

/** The text a column is announced and named by: its header when that is a string, else its key. */
const headerText = (col: { key: string; header: React.ReactNode }) =>
  typeof col.header === 'string' ? col.header : col.key;

/** Props owned by DataTable itself — everything else falls through to the root element. */
type DataTableOwnProps<R extends DataTableRow = DataTableRow> = {
  /** Column definitions. */
  columns: DataTableColumn<R>[];
  /** Row data, as raw values the table can sort and search. */
  rows: R[];
  /** Rows per page, for controlled use (or as a fixed setting). Setting this or `defaultPageSize` turns on the built-in pagination. */
  pageSize?: number;
  /** Rows per page to start with, for uncontrolled use; `pageSizeOptions` then lets the reader change it. */
  defaultPageSize?: number;
  /** Fires with the new page size when the reader picks one from `pageSizeOptions`. */
  onPageSizeChange?: (pageSize: number) => void;
  /** The page sizes the footer offers in a Rows per page picker. Leave unset for no picker. */
  pageSizeOptions?: number[];
  /** The current page, counting from 1, for controlled use. Pair with `onPageChange`. A page past the last shows the last. */
  page?: number;
  /** The page to start on, counting from 1, for uncontrolled use. */
  defaultPage?: number;
  /** Fires with the new page, counting from 1: from the pager, and back to 1 when a search, filter, sort or page size change starts over. */
  onPageChange?: (page: number) => void;
  /** The page size picker's label. Defaults to "Rows per page". */
  pageSizeLabel?: string;
  /**
   * How the table reads when it is narrower than a phone (its own width,
   * under `BREAKPOINT_PHONE_PX`, so a table in a narrow panel counts):
   * `scroll` keeps the rows and scrolls sideways with the row header
   * pinned; `stack` draws each row as a card, its row header as the title
   * and every other column as a label and value pair. Defaults to `scroll`.
   */
  phoneLayout?: 'scroll' | 'stack';
  /** Adds a checkbox column with a select-all header. */
  selectable?: boolean;
  /** Selected row ids for controlled use. Pair with `onSelectionChange`. */
  selectedIds?: string[];
  /** Initially selected row ids for uncontrolled use. */
  defaultSelectedIds?: string[];
  /** Fires with the full list of selected row ids after every change. */
  onSelectionChange?: (ids: string[]) => void;
  /** Sort state for controlled use. Pair with `onSortChange`; `null` means unsorted. */
  sort?: DataTableSort | null;
  /** Initial sort state for uncontrolled use. */
  defaultSort?: DataTableSort;
  /** Fires with the new sort state — `null` when a third click clears the sort. */
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Every sort, first sort first, for controlled use: the several-column form of `sort`, and wins over it when both are given. Pair with `onSortsChange`. */
  sorts?: DataTableSort[];
  /** Initial sorts for uncontrolled use. */
  defaultSorts?: DataTableSort[];
  /** Fires with every sort after one changes, first sort first. `onSortChange` fires too, with the first or `null`. */
  onSortsChange?: (sorts: DataTableSort[]) => void;
  /** The link component a `link` column's cells render through, so the app's router handles them. Defaults to the nearest `LinkProvider`'s, else a plain anchor. */
  linkComponent?: LinkComponent;
  /**
   * Draws only the rows in view, so a table of thousands scrolls as
   * smoothly as one of ten. `auto` (the default) does it for an unpaged,
   * ungrouped table of more than 200 rows; `true` always; `false` never.
   * A virtualised table scrolls inside its frame (`maxHeight`, 640px when
   * unset), keeps its header in view, and still sends its first screen of
   * rows in the server's HTML.
   */
  virtualize?: boolean | 'auto';
  /** Called when the reader scrolls near the end of the rows while `hasMore` is set, to fetch the next batch. Called once per batch: append the rows and it can fire again. */
  onLoadMore?: () => void;
  /** Whether more rows can be fetched: shows a loading row at the end and calls `onLoadMore` as it comes into view. */
  hasMore?: boolean;
  /**
   * Hands sorting, filtering, search and paging to the host, for a table
   * whose rows live on a server. The table stops doing them itself and
   * reports every change through its pairs (`onSortsChange`,
   * `onFiltersChange`, `onSearchChange`, `onPageChange`,
   * `onPageSizeChange`); pass back `rows` already sorted, filtered and
   * paged. Totals, grouping and Select all work over the rows given, and
   * Select all N from a TableToolbar selects every match as a query.
   */
  manual?: boolean;
  /** Every row that matches on the server, in `manual` mode: drives the pager, the result count and Select all N. Defaults to the rows given. */
  rowCount?: number;
  /** Whether rows are being fetched. With no rows yet the body shows skeleton rows; with rows on screen they stay, dimmed and inert, under a thin progress line, so the table never blanks. */
  loading?: boolean;
  /** A failed load's message. With no rows it replaces the body with an error state; over rows already on screen it shows as a Banner above them. Pair with `onRetry`. */
  error?: string;
  /** Called by the error state's Try again button. Without it the error shows with no button. */
  onRetry?: () => void;
  /** The words of loading and failed loads, merged over their English defaults: the skeleton rows' name, the loading row, a failed load's title and its retry button. */
  loadLabels?: Partial<DataTableLoadLabels>;
  /** Renders a row's details: adds a chevron column, and an opened row shows this beneath it, across the table's width. Rendered only once opened. */
  renderDetail?: (row: R) => React.ReactNode;
  /** The ids of the rows whose details are open, for controlled use. Pair with `onExpandedIdsChange`. */
  expandedIds?: string[];
  /** The rows open to begin with, for uncontrolled use. */
  defaultExpandedIds?: string[];
  /** Fires with the open rows' ids after one opens or closes. */
  onExpandedIdsChange?: (ids: string[]) => void;
  /** Whether several rows' details can be open at once (`multiple`, the default) or opening one closes the rest (`single`). */
  expandMode?: 'multiple' | 'single';
  /** Fires with the table's setup as a view whenever any part of it changes, so a host can keep the reader's last view. */
  onViewChange?: (view: DataTableView) => void;
  /** The column keys the rows are grouped by, for controlled use; this milestone draws the first. Pair with `onGroupingChange`. */
  grouping?: string[];
  /** The grouping to start with, for uncontrolled use. */
  defaultGrouping?: string[];
  /** Fires with the new grouping, from a header menu or a TableToolbar. */
  onGroupingChange?: (grouping: string[]) => void;
  /** Adds a totals row to the table's foot, sticky at its bottom edge: each cell a menu picking its calculation over every matching row. */
  totalsRow?: boolean;
  /** Each column's footer calculation, by key, for controlled use. A column left out shows its `aggregate`, or nothing. Pair with `onTotalsChange`. */
  totals?: Record<string, DataTableTotal>;
  /** The footer calculations to start with, for uncontrolled use. */
  defaultTotals?: Record<string, DataTableTotal>;
  /** Fires with every footer calculation after one is picked. */
  onTotalsChange?: (totals: Record<string, DataTableTotal>) => void;
  /** Lets the table sort by several columns: Shift-click a header, or pick Add to sort from its menu, to add the column after the current sorts. Each sorted header shows its rank while more than one sorts. */
  multiSort?: boolean;
  /** Shows the built-in search field, matching against every column's raw value. */
  searchable?: boolean;
  /** Placeholder for the search field. */
  searchPlaceholder?: string;
  /** Slot beside the search field for consumer-owned filter controls. */
  toolbar?: React.ReactNode;
  /**
   * The table's density, and the controls' with it: `default` rows with the
   * search field and pager at the default row-control height, `compact` rows
   * with both at the compact one. Controls inside the rows (checkboxes, grips,
   * menu and action buttons) stay compact at either density, so a row's
   * height is its text's. Defaults to `default`. Unlike a static size, it is
   * state the reader can change from a TableToolbar's density switch: passing
   * it controls that state, paired with `defaultSize` and `onSizeChange`.
   */
  size?: 'default' | 'compact';
  /** Alternating row backgrounds, passed through to the underlying Table. */
  striped?: boolean;
  /** Accessible caption for the underlying table (visually hidden). */
  caption?: string;
  /** What to render when no rows match — defaults to a built-in empty state. */
  emptyState?: React.ReactNode;
  /** Accessible name of the select-all checkbox in the header, shown with `selectable`. */
  selectAllLabel?: string;
  /**
   * Accessible name of a row's checkbox, given the row. Defaults to "Select"
   * followed by the value of the `rowHeader` column (else the first column),
   * and to "Select row" with the id only when that value is empty.
   */
  selectRowLabel?: (row: R) => string;
  /**
   * Accessible name of a sortable header's button, given the column's header
   * text (its `key` when the header is not a string) and its current sort
   * direction, `null` when unsorted. Defaults to the header text alone: the
   * sort state is the header's `aria-sort`, so naming it here too would read
   * it twice.
   */
  sortLabel?: (header: string, direction: DataTableSort['direction'] | null) => string;
  /** Announced when the sort changes, given the header text and the new direction, `null` when cleared. Defaults to "Sorted by Name, ascending" or "Sort cleared". */
  sortAnnouncement?: (header: string, direction: DataTableSort['direction'] | null) => string;
  /** With several sorts, names a header's sort button after the first: given the `sortLabel` name, its rank and its direction. Defaults to "Owner, sort 2, ascending". The first sort's header carries `aria-sort` instead. */
  sortRankLabel?: (name: string, rank: number, direction: DataTableSort['direction']) => string;
  /** Announced when the page changes, given the page, the page count, the first and last row shown and the total. Defaults to "Page 2 of 7, rows 21 to 40 of 140". */
  pageAnnouncement?: (page: number, pageCount: number, first: number, last: number, total: number) => string;
  /** Footer count of the rows that match, given the count. Defaults to "1 result" or "N results". */
  resultsLabel?: (count: number) => string;
  /** Footer count shown instead of the results while rows are selected, given the count. Defaults to "N selected". */
  selectedLabel?: (count: number) => string;
  /**
   * The built-in pager's words, merged over its English defaults: the arrows'
   * names ("Previous page", "Next page"), the readout ("Page 2 of 4") and the
   * landmark's name ("Pagination"). The pager follows the table's `size`:
   * numbered pages at the default size (named by `pageLabel`), a "Page X of Y"
   * readout when compact (`readoutLabel`).
   */
  paginationLabels?: Pick<PaginationProps, 'previousLabel' | 'nextLabel' | 'pageLabel' | 'readoutLabel' | 'aria-label'>;
  /**
   * The built-in empty state's words, merged over its English defaults
   * ("No matching rows", "Adjust the search or filters and try again.").
   * Ignored when `emptyState` replaces the whole node.
   */
  emptyStateLabels?: Partial<Pick<EmptyStateProps, 'title' | 'description'>>;
  /** Lets every column be resized by dragging its header's edge, double-clicking it to fit, or Alt+Left and Alt+Right on a focused header. A column's own `resizable` wins. */
  resizableColumns?: boolean;
  /** Lets every column be moved by dragging its header, from its menu, or Ctrl+Shift+Left and Ctrl+Shift+Right on a focused header. A column's own `reorderable` wins. */
  reorderableColumns?: boolean;
  /** Adds a menu to every header: sort, pin, move, hide, fit and reset, as each column allows. Opened from the header's options button, Alt+Down, Shift+F10 or a right-click. */
  columnMenu?: boolean;
  /** Adds a grip at each row's start to drag it up or down, or move it with Alt+Up and Alt+Down. Off while a sort is active, since the sort owns the order. */
  reorderableRows?: boolean;
  /** Keeps the header in view while the body scrolls. Takes effect with `maxHeight`, inside the table's own scroll frame. */
  stickyHeader?: boolean;
  /** The table's tallest height before its body scrolls inside its frame (any CSS length, or pixels). */
  maxHeight?: number | string;
  /**
   * How the keyboard moves through the table. `table` keeps every control in
   * the Tab order, as a reading table does; `grid` makes the table one Tab
   * stop with arrow-key focus across its cells. Defaults to `grid` when any
   * column or row control is on, else `table`.
   */
  navigation?: 'table' | 'grid';
  /** Column widths in pixels, by key, for controlled use. Fires `onColumnWidthsChange` once per resize, on release. */
  columnWidths?: Record<string, number>;
  /** Starting column widths in pixels, by key, for uncontrolled use. Columns not listed take their natural width. */
  defaultColumnWidths?: Record<string, number>;
  /** Fires with every column's width after a resize, a fit or a reset. */
  onColumnWidthsChange?: (widths: Record<string, number>) => void;
  /** Column keys in display order, for controlled use. Keys left out keep their declared order after the listed ones. */
  columnOrder?: string[];
  /** Starting column order, for uncontrolled use. */
  defaultColumnOrder?: string[];
  /** Fires with the full column order after a move. */
  onColumnOrderChange?: (order: string[]) => void;
  /** Columns pinned to each edge, for controlled use. */
  columnPinning?: DataTableColumnPinning;
  /** Starting pins, for uncontrolled use; merged with each column's own `pin`. */
  defaultColumnPinning?: DataTableColumnPinning;
  /** Fires with the pins after a column is pinned or unpinned. */
  onColumnPinningChange?: (pinning: DataTableColumnPinning) => void;
  /** Hidden column keys, for controlled use. */
  hiddenColumns?: string[];
  /** Starting hidden keys, for uncontrolled use; merged with each column's `defaultHidden`. */
  defaultHiddenColumns?: string[];
  /** Fires with every hidden key after a column is hidden or shown. */
  onHiddenColumnsChange?: (hidden: string[]) => void;
  /** Row ids in display order, for controlled use, applied while no sort is active. Rows left out keep their given order after the listed ones. */
  rowOrder?: string[];
  /** Starting row order, for uncontrolled use. */
  defaultRowOrder?: string[];
  /** Fires with the full row order after a row moves. */
  onRowOrderChange?: (order: string[]) => void;
  /** The column and row controls' words, merged over their English defaults. */
  columnLabels?: Partial<DataTableColumnLabels>;
  /** Draws a vertical line between columns, as well as the lines between rows. */
  columnDividers?: boolean;
  /** How every cell's text fits unless its column says otherwise: `wrap` (the default), `nowrap`, `truncate` or `lines-2`. */
  cellText?: DataTableCellText;
  /** The actions a row offers, in an actions column that sticks to the end edge: inline ones as icon buttons, the rest in a More menu. */
  rowActions?: (row: R) => DataTableRowAction[];
  /**
   * How editable cells edit: `cell` (the default) edits one cell at a time,
   * started with Enter, F2, a typed character or a double click; `row` adds an
   * Edit button to each row that opens every editable cell of the row at
   * once, with Save and Cancel.
   */
  editMode?: 'cell' | 'row';
  /**
   * Saves one edited cell. Rows stay the record: update them from here. Return
   * a promise to have the cell show the new value as pending until it
   * settles; a rejection rolls the cell back and announces the failure.
   */
  onCellEdit?: (edit: DataTableCellEdit<R>) => void | Promise<unknown>;
  /** Saves one edited row with `editMode="row"`, its changed values together. Without it, each changed cell goes to `onCellEdit`. */
  onRowEdit?: (edit: DataTableRowEdit<R>) => void | Promise<unknown>;
  /** The filters, for controlled use: conditions on columns, joined with AND. Set from the header menus (with `columnMenu`) or a TableToolbar. */
  filters?: DataTableFilter[];
  /** Starting filters, for uncontrolled use. */
  defaultFilters?: DataTableFilter[];
  /** Fires with every filter after one is added, changed or removed. */
  onFiltersChange?: (filters: DataTableFilter[]) => void;
  /** The search text, for controlled use; the built-in search field and a TableToolbar's both set it. */
  search?: string;
  /** Starting search text, for uncontrolled use. */
  defaultSearch?: string;
  /** Fires with the search text as it changes. */
  onSearchChange?: (search: string) => void;
  /** Starting density, for uncontrolled use when a TableToolbar's density switch sets it; `size` controls it. */
  defaultSize?: 'default' | 'compact';
  /** Fires when a TableToolbar's density switch changes the density. */
  onSizeChange?: (size: 'default' | 'compact') => void;
  /** The filters' words, merged over their English defaults. */
  filterLabels?: Partial<DataTableFilterLabels>;
  /** When the inline actions show: on row hover and focus (the default, and always on a touch screen), or always. The More button shows at rest either way, so the column never reads as empty. */
  rowActionsVisibility?: 'hover' | 'always';
  /**
   * The BCP 47 locale the table formats and sorts in, such as `de-DE`: every
   * typed column without a `format.locale` of its own, and the order text
   * sorts in. Defaults to the nearest LocaleProvider's, else `en-US`.
   */
  locale?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface DataTableProps<R extends DataTableRow = DataTableRow>
  extends DataTableOwnProps<R>, Omit<React.ComponentPropsWithRef<'div'>, keyof DataTableOwnProps<R>> {}

/**
 * DataTable is the wired version of Table: sorting on header click, a search
 * field, row selection with a select-all header, client-side pagination, and
 * an empty state — assembled from Table, Pagination, Checkbox, Input and
 * EmptyState so a working data view is one component, not an afternoon of
 * plumbing.
 *
 * Rows carry raw values rather than rendered nodes; a column's `render`
 * turns them into cells when text isn't enough. For server-driven data,
 * control `sort` and slot your own filters into `toolbar`.
 *
 * Generic over the row type, so a row may carry more than its `values` and
 * `render` reads it typed; the default is today's `DataTableRow`. The ref and
 * any unrecognised props reach the root element.
 */
/** A column with what its type sets filled in: its alignment, the editor it opens when editable, and the table's locale. */
function withType<R extends DataTableRow>(col: DataTableColumn<R>, locale: string): DataTableColumn<R> {
  if (!col.type) return col;
  const defaults = TYPE_DEFAULTS[col.type];
  const editable = col.editable !== undefined && col.editable !== false;
  return {
    ...col,
    align: col.align ?? defaults.align,
    editor: col.editor ?? (editable ? defaults.editor : undefined),
    format: { ...col.format, locale: col.format?.locale ?? locale },
  };
}

export function DataTable<R extends DataTableRow = DataTableRow>({
  columns: columnsProp,
  rows,
  pageSize: pageSizeProp,
  defaultPageSize,
  onPageSizeChange,
  pageSizeOptions,
  page: pageProp,
  defaultPage,
  onPageChange,
  pageSizeLabel = 'Rows per page',
  phoneLayout = 'scroll',
  selectable = false,
  selectedIds,
  defaultSelectedIds,
  onSelectionChange,
  sort,
  defaultSort,
  onSortChange,
  sorts: sortsProp,
  defaultSorts,
  onSortsChange,
  multiSort = false,
  onViewChange,
  virtualize = 'auto',
  onLoadMore,
  hasMore = false,
  renderDetail,
  expandedIds: expandedProp,
  defaultExpandedIds,
  onExpandedIdsChange,
  expandMode = 'multiple',
  grouping: groupingProp,
  defaultGrouping,
  onGroupingChange,
  totalsRow = false,
  totals: totalsProp,
  defaultTotals,
  onTotalsChange,
  linkComponent,
  searchable = false,
  searchPlaceholder = 'Search',
  toolbar,
  size: sizeProp,
  defaultSize,
  onSizeChange,
  filters: filtersProp,
  defaultFilters,
  onFiltersChange,
  search: searchProp,
  defaultSearch,
  onSearchChange,
  filterLabels: filterLabelsProp,
  striped = false,
  caption,
  emptyState,
  selectAllLabel = 'Select all rows on this page',
  selectRowLabel = (row: R) => {
    const nameKey = (columnsProp.find((col) => col.rowHeader) ?? columnsProp[0])?.key;
    const name = nameKey === undefined ? undefined : row.values[nameKey];
    return name == null || name === '' ? `Select row ${row.id}` : `Select ${name}`;
  },
  sortLabel = (header: string) => header,
  sortRankLabel = (name: string, rank: number, direction: DataTableSort['direction']) =>
    `${name}, sort ${rank}, ${direction === 'asc' ? 'ascending' : 'descending'}`,
  sortAnnouncement = (header: string, direction: DataTableSort['direction'] | null) =>
    direction === null ? 'Sort cleared' : `Sorted by ${header}, ${direction === 'asc' ? 'ascending' : 'descending'}`,
  pageAnnouncement = (page: number, pageCount: number, first: number, last: number, total: number) =>
    `Page ${page} of ${pageCount}, rows ${first} to ${last} of ${total}`,
  resultsLabel = (count: number) => `${count} result${count === 1 ? '' : 's'}`,
  selectedLabel = (count: number) => `${count} selected`,
  paginationLabels,
  emptyStateLabels,
  resizableColumns = false,
  reorderableColumns = false,
  columnMenu = false,
  reorderableRows = false,
  stickyHeader = false,
  maxHeight,
  navigation,
  columnWidths,
  defaultColumnWidths,
  onColumnWidthsChange,
  columnOrder,
  defaultColumnOrder,
  onColumnOrderChange,
  columnPinning,
  defaultColumnPinning,
  onColumnPinningChange,
  hiddenColumns,
  defaultHiddenColumns,
  onHiddenColumnsChange,
  rowOrder,
  defaultRowOrder,
  onRowOrderChange,
  columnLabels,
  columnDividers = false,
  cellText = 'wrap',
  rowActions,
  rowActionsVisibility = 'hover',
  editMode = 'cell',
  onCellEdit,
  onRowEdit,
  manual = false,
  rowCount: rowCountProp,
  loading = false,
  error,
  onRetry,
  loadLabels,
  locale: localeProp,
  className = '',
  ref,
  ...rest
}: DataTableProps<R>) {
  const baseClass = 'ds-data-table';
  const locale = useLocale(localeProp);
  const collator = useMemo(() => textCollator(locale), [locale]);
  const compareValues = useMemo(() => valueComparator(collator), [collator]);

  const [size, setSize] = useControllable<'default' | 'compact'>(sizeProp, defaultSize ?? 'default', onSizeChange);
  const [search, setSearchState] = useControllable<string>(searchProp, defaultSearch ?? '', onSearchChange);
  const [filters, setFiltersState] = useControllable<DataTableFilter[]>(
    filtersProp,
    defaultFilters ?? [],
    onFiltersChange,
  );
  const filterLabels: FilterLabels = {
    ...DEFAULT_FILTER_LABELS,
    ...filterLabelsProp,
    operators: { ...DEFAULT_FILTER_LABELS.operators, ...filterLabelsProp?.operators },
  };
  const [pageSize, setPageSize] = useControllable<number | undefined>(
    pageSizeProp,
    defaultPageSize,
    onPageSizeChange as ((next: number | undefined) => void) | undefined,
  );
  const [page, setPageState] = useControllable<number>(pageProp, defaultPage ?? 1, onPageChange);
  /* Starting over reports only a real change, so typing in the search does not fire onPageChange per key. */
  const setPage = (next: number) => {
    if (next !== page) setPageState(next);
  };
  /* A new search or filter starts from the first page. */
  const setSearch = (next: string) => {
    setSearchState(next);
    setPage(1);
    endAllMatching();
  };
  const setFilters = (next: DataTableFilter[]) => {
    setFiltersState(next);
    setPage(1);
    endAllMatching();
  };

  /* A new search or filter changes what "every match" means. Declared as
     a function so the setters above can call it before the state below. */
  function endAllMatching() {
    setAllMatchingState(false);
    setExceptIds([]);
  }

  /* One polite channel for what changes without moving focus: a sort, the
       result count while searching (debounced, so typing speaks once), a
       page change, select-all. It is mounted empty and stays mounted, since
       a region that arrives already holding text is often not read. */
  const [announcement, setAnnouncement] = useState('');
  /* An announcement is requested as state and spoken by the effect, which
       owns the debounce timer: so an action can announce from anywhere,
       a menu item included, without reaching a ref. */
  const [announceRequest, setAnnounceRequest] = useState<{ message: string; debounced: boolean; id: number } | null>(
    null,
  );
  const announce = (message: string, debounced = false) =>
    setAnnounceRequest((previous) => ({ message, debounced, id: (previous?.id ?? 0) + 1 }));
  useEffect(() => {
    if (!announceRequest) return;
    const timer = setTimeout(
      () => setAnnouncement(announceRequest.message),
      announceRequest.debounced ? MOTION_ANNOUNCE_DEBOUNCE_MS : 0,
    );
    return () => clearTimeout(timer);
  }, [announceRequest]);

  /* One list of sorts, first sort first; `sort` is its one-column form. */
  const isSortControlled = sortsProp !== undefined || sort !== undefined;
  const [uncontrolledSorts, setUncontrolledSorts] = useState<DataTableSort[]>(
    defaultSorts ?? (defaultSort ? [defaultSort] : []),
  );
  const currentSorts: DataTableSort[] = sortsProp ?? (sort !== undefined ? (sort ? [sort] : []) : uncontrolledSorts);
  const sortOf = (key: string) => currentSorts.find((entry) => entry.key === key);
  const [groupingState, setGroupingState] = useControllable<string[]>(
    groupingProp,
    defaultGrouping ?? [],
    onGroupingChange,
  );
  const [expandedState, setExpanded] = useControllable<string[]>(
    expandedProp,
    defaultExpandedIds ?? [],
    onExpandedIdsChange,
  );
  const toggleDetail = (id: string) => {
    const open = expandedState.includes(id);
    setExpanded(
      open ? expandedState.filter((other) => other !== id) : expandMode === 'single' ? [id] : [...expandedState, id],
    );
  };
  const [totalsState, setTotals] = useControllable<Record<string, DataTableTotal>>(
    totalsProp,
    defaultTotals ?? {},
    onTotalsChange,
  );
  const setSorts = (next: DataTableSort[]) => {
    if (!isSortControlled) setUncontrolledSorts(next);
    setPage(1);
    onSortsChange?.(next);
    onSortChange?.(next[0] ?? null);
  };

  const isSelectionControlled = selectedIds !== undefined;
  const [uncontrolledSelection, setUncontrolledSelection] = useState<string[]>(defaultSelectedIds ?? []);
  /* In manual mode the table never holds every matching row, so Select
     all N selects every match as a query: every row on screen shows
     selected, a page fetched later included, and a row unticked since
     joins the exceptions. Clearing the selection, or a new search or
     filter, ends it. */
  const [allMatching, setAllMatchingState] = useState(false);
  const [exceptIds, setExceptIds] = useState<string[]>([]);
  const currentSelection = allMatching
    ? rows.map((row) => row.id).filter((id) => !exceptIds.includes(id))
    : isSelectionControlled
      ? selectedIds
      : uncontrolledSelection;
  const setSelectionIds = (ids: string[]) => {
    if (!isSelectionControlled) setUncontrolledSelection(ids);
    onSelectionChange?.(ids);
  };
  const setSelection = (ids: string[]) => {
    if (allMatching) {
      if (ids.length === 0) {
        setAllMatchingState(false);
        setExceptIds([]);
      } else {
        const loaded = rows.map((row) => row.id);
        setExceptIds([
          ...exceptIds.filter((id) => !loaded.includes(id)),
          ...loaded.filter((id) => !ids.includes(id)),
        ]);
      }
    }
    setSelectionIds(ids);
  };
  const setAllMatching = (on: boolean) => {
    setAllMatchingState(on);
    setExceptIds([]);
    setSelectionIds(on ? rows.map((row) => row.id) : []);
  };

  const labels: DataTableColumnLabels = { ...DEFAULT_COLUMN_LABELS, ...columnLabels };
  const columns = useMemo(() => columnsProp.map((col) => withType(col, locale)), [columnsProp, locale]);
  const byKey = useMemo(() => new Map(columns.map((col) => [col.key, col])), [columns]);
  const indexOfKey = new Map(columns.map((col, index) => [col.key, index]));
  const canResize = (col: DataTableColumn<R>) => !col.locked && (col.resizable ?? resizableColumns);
  const canMove = (col: DataTableColumn<R>) => !col.locked && (col.reorderable ?? reorderableColumns);
  const canHide = (col: DataTableColumn<R>) => !col.locked && (col.hideable ?? true);

  /* The column and row state pairs. Each is normalised against the
       columns and rows actually given, so a stale or partial value (a
       saved view from before a column was added) never hides a column or
       drops a row. */
  const [widthsState, setWidths] = useControllable<Record<string, number>>(
    columnWidths,
    defaultColumnWidths ?? {},
    onColumnWidthsChange,
  );
  const [orderState, setOrder] = useControllable<string[]>(columnOrder, defaultColumnOrder ?? [], onColumnOrderChange);
  const seededPins: DataTableColumnPinning = {
    start: [...(defaultColumnPinning?.start ?? []), ...columns.filter((c) => c.pin === 'start').map((c) => c.key)],
    end: [...(defaultColumnPinning?.end ?? []), ...columns.filter((c) => c.pin === 'end').map((c) => c.key)],
  };
  const [pinState, setPins] = useControllable<DataTableColumnPinning>(columnPinning, seededPins, onColumnPinningChange);
  const [hiddenState, setHidden] = useControllable<string[]>(
    hiddenColumns,
    [...(defaultHiddenColumns ?? []), ...columns.filter((c) => c.defaultHidden).map((c) => c.key)],
    onHiddenColumnsChange,
  );
  const [rowOrderState, setRowOrder] = useControllable<string[]>(rowOrder, defaultRowOrder ?? [], onRowOrderChange);

  const knownOrder = [
    ...orderState.filter((key) => byKey.has(key)),
    ...columns.map((col) => col.key).filter((key) => !orderState.includes(key)),
  ].filter((key, index, all) => all.indexOf(key) === index);
  /* Narrower than a phone, measured on the table itself. */
  const rootRef = useRef<HTMLDivElement | null>(null);
  /* The table's width while it is narrower than a phone, to the nearest
     eight pixels (so a resize renders every few pixels, not every one),
     else 0. The pinned row header is capped against it. */
  const tableId = useId();
  const [narrowWidth, setNarrowWidth] = useState(0);
  /* The table's width, to the nearest eight pixels, kept only when rows
     open details: a details panel is as wide as the visible table, not the
     whole scrolling grid. */
  const [tableWidth, setTableWidth] = useState(0);
  const hasDetails = Boolean(renderDetail);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el || !hasDetails) return;
    const observer = new ResizeObserver(([entry]) => setTableWidth(Math.round(entry.contentRect.width / 8) * 8));
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasDetails]);
  const narrow = narrowWidth > 0;
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setNarrowWidth(width > 0 && width < BREAKPOINT_PHONE_PX ? Math.round(width / 8) * 8 : 0);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const stacked = narrow && phoneLayout === 'stack';
  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };
  const pinnedStart = [...new Set((pinState.start ?? []).filter((key) => byKey.has(key)))];
  const pinnedEnd = [...new Set((pinState.end ?? []).filter((key) => byKey.has(key) && !pinnedStart.includes(key)))];
  /* Scrolling sideways on a phone, the row header stays in view: it is
     pinned to the start for as long as the table is that narrow, without
     touching the pinning the reader set. Stacked, nothing pins. */
  const rowHeaderKey = columns.find((col) => col.rowHeader)?.key;
  const enginePinnedStart = stacked
    ? []
    : narrow && rowHeaderKey && !pinnedStart.includes(rowHeaderKey) && !pinnedEnd.includes(rowHeaderKey)
      ? [rowHeaderKey, ...pinnedStart]
      : pinnedStart;
  const hidden = new Set(hiddenState.filter((key) => byKey.has(key)));

  /* Rows in the order the grips set, while no sort owns the order. */
  const orderedRows = useMemo(() => {
    if (!reorderableRows || rowOrderState.length === 0) return rows;
    const position = new Map(rowOrderState.map((id, index) => [id, index]));
    return [...rows].sort(
      (a, b) => (position.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (position.get(b.id) ?? Number.MAX_SAFE_INTEGER),
    );
  }, [rows, rowOrderState, reorderableRows]);

  /* A click cycles the column through ascending, descending and off, as
       the only sort; with `multiSort`, a Shift-click cycles it in place
       among the others, or adds it last. */
  const cycleSort = (key: string, additive = false) => {
    const existing = sortOf(key);
    const direction: DataTableSort['direction'] | null = !existing
      ? 'asc'
      : existing.direction === 'asc'
        ? 'desc'
        : null;
    let next: DataTableSort[];
    if (additive && multiSort) {
      if (!existing) next = [...currentSorts, { key, direction: 'asc' }];
      else if (direction) next = currentSorts.map((entry) => (entry.key === key ? { key, direction } : entry));
      else next = currentSorts.filter((entry) => entry.key !== key);
    } else {
      next = direction ? [{ key, direction }] : [];
    }
    setSorts(next);
    const column = columns.find((col) => col.key === key);
    announce(sortAnnouncement(typeof column?.header === 'string' ? column.header : key, direction));
  };

  /* The engine's columns: one per rift column, reading the raw value, with
       rift's own comparator (numbers numerically, text naturally, empty
       values first ascending) so the order is exactly what it was. Built from
       the column keys alone, so an inline `columns` array does not rebuild the
       row model on every render. */
  /* Each column's key, type and (for a status column, whose sort is its
     options' order) option values, as one string: the engine's columns
     rebuild when that changes and not on every inline `columns` array. */
  const columnKeys = columns
    .map((col) =>
      [
        col.key,
        col.type ?? '',
        col.type === 'status' ? (col.options ?? []).map((o) => o.value).join('\u0002') : '',
      ].join('\u0001'),
    )
    .join('\u0000');
  const engineColumns = useMemo(
    () =>
      columnKeys.split('\u0000').map((spec) => {
        const [key, type, optionValues] = spec.split('\u0001');
        const compare = typedComparator(
          (type || undefined) as ColumnType | undefined,
          optionValues ? optionValues.split('\u0002').map((value) => ({ value })) : undefined,
          compareValues,
        );
        return {
          id: key,
          accessorFn: (row: R) => row.values[key],
          sortFn: (a: { original: R }, b: { original: R }) => compare(a.original.values[key], b.original.values[key]),
          // A column's filters, every one of which a row must pass.
          filterFn: (row: { original: R }, _id: string, value: unknown) =>
            (value as Filter[]).every((filter) => matches(filter, row.original.values[key])),
          sortUndefined: false as const,
        };
      }),
    [columnKeys, compareValues],
  );

  const needle = search.trim().toLowerCase();
  /* The engine memoises its row models on its state's identity, so each
     piece is rebuilt only when what it says changes: rebuilt every render,
     a table of thousands would re-sort and re-filter on every hover. Each
     memo reads only its own key, which says everything the piece holds. */
  const sortingKey = JSON.stringify(
    currentSorts
      .filter((entry) => byKey.has(entry.key))
      .map((entry) => ({ id: entry.key, desc: entry.direction === 'desc' })),
  );
  const engineSorting = useMemo(() => JSON.parse(sortingKey) as { id: string; desc: boolean }[], [sortingKey]);
  const engineFiltersKey = JSON.stringify(
    Object.entries(
      filters.reduce<Record<string, Filter[]>>((byColumn, filter) => {
        if (byKey.has(filter.column)) (byColumn[filter.column] ??= []).push(filter);
        return byColumn;
      }, {}),
    ).map(([id, value]) => ({ id, value })),
  );
  const engineFilters = useMemo(
    () => JSON.parse(engineFiltersKey) as { id: string; value: Filter[] }[],
    [engineFiltersKey],
  );
  const selectionKey = currentSelection.join('\u0000');
  const engineSelection = useMemo(
    () =>
      Object.fromEntries((selectionKey ? selectionKey.split('\u0000') : []).map((id) => [id, true as const])) as Record<
        string,
        true
      >,
    [selectionKey],
  );
  const table = useTable({
    features: ENGINE_FEATURES,
    columns: engineColumns,
    data: orderedRows,
    getRowId: (row: R) => row.id,
    state: {
      columnOrder: knownOrder,
      columnPinning: { start: enginePinnedStart, end: pinnedEnd },
      columnVisibility: Object.fromEntries([...hidden].map((key) => [key, false])),
      sorting: engineSorting,
      globalFilter: needle || undefined,
      columnFilters: engineFilters,
      rowSelection: engineSelection,
    },
    /* The search matches any raw value on the row, displayed or not, case
         insensitively, as it always has: so every column is eligible and the
         test reads the whole row rather than the one column. */
    getColumnCanGlobalFilter: () => true,
    globalFilterFn: (row: { original: R }, _columnId: string, value: unknown) => {
      const term = String(value ?? '');
      return Object.values(row.original.values).some(
        (cell) => cell != null && String(cell).toLowerCase().includes(term),
      );
    },
  });

  /* In manual mode the rows arrive sorted, filtered and paged. */
  const engineRows = table.getSortedRowModel().rows;
  const sortedRows = manual ? orderedRows : engineRows.map((row) => row.original);
  /* Every row that matches: the server's count in manual mode. */
  const matchCount = manual ? Math.max(rowCountProp ?? rows.length, rows.length) : sortedRows.length;

  /* Grouping: the matching rows gathered by the grouped column's value, the
     groups in that column's own order (its sort direction when it sorts, a
     status by its options), the rows keeping the sort within each group.
     Paging then runs over the gathered rows, so a page shows whole runs of
     its groups, each led by its group row. */
  const groupKey = groupingState.find((key) => byKey.get(key)?.groupable);
  const groupCol = groupKey ? byKey.get(groupKey) : undefined;
  const groupOf = (row: R) => {
    const value = groupKey ? row.values[groupKey] : null;
    return value == null || value === '' || (Array.isArray(value) && value.length === 0)
      ? ''
      : Array.isArray(value)
        ? value.join(', ')
        : String(value);
  };
  const groups = useMemo(() => {
    if (!groupKey || !groupCol) return null;
    const byValue = new Map<string, R[]>();
    for (const row of sortedRows) {
      const key = groupOf(row);
      const list = byValue.get(key);
      if (list) list.push(row);
      else byValue.set(key, [row]);
    }
    const compare = typedComparator(groupCol.type, groupCol.options, compareValues);
    const desc = sortOf(groupKey)?.direction === 'desc';
    const first = (key: string) => byValue.get(key)![0].values[groupKey];
    const keys = [...byValue.keys()].sort((a, b) => {
      // The rows with no value come last, whichever way the column sorts.
      if (a === '' || b === '') return a === '' ? (b === '' ? 0 : 1) : -1;
      const order = compare(first(a), first(b));
      return desc ? -order : order;
    });
    return keys.map((key) => ({ key, rows: byValue.get(key)! }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recomputed from the sorted rows and the grouping, which is all it reads
  }, [sortedRows, groupKey, groupCol, currentSorts, compareValues]);
  const rowsInOrder = groups ? groups.flatMap((group) => group.rows) : sortedRows;
  const groupByRow = useMemo(() => {
    const map = new Map<string, { key: string; rows: R[] }>();
    groups?.forEach((group) => group.rows.forEach((row) => map.set(row.id, group)));
    return map;
  }, [groups]);

  /* A collapsed group keeps its group row and hides its rows; groups start
     open. The reader's choice for the session, not a prop. */
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const toggleGroup = (key: string) =>
    setCollapsedGroups((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));

  const pageCount = pageSize ? Math.max(1, Math.ceil((manual ? matchCount : rowsInOrder.length) / pageSize)) : 1;
  const clampedPage = Math.min(page, pageCount);
  const pageRows =
    pageSize && !manual ? rowsInOrder.slice((clampedPage - 1) * pageSize, clampedPage * pageSize) : rowsInOrder;
  const visibleRows = groups
    ? pageRows.filter((row) => !collapsedGroups.includes(groupByRow.get(row.id)?.key ?? ''))
    : pageRows;

  /* The result count after a search settles. Skipped on the first render,
       which has nothing to report. */
  const searched = useRef(false);
  useEffect(() => {
    if (!searched.current) {
      searched.current = true;
      return;
    }
    announce(resultsLabel(matchCount), true);
    // Announce on a new search term only; the count is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* The match count after the filters change. Skipped on the first render. */
  const filtered = useRef(false);
  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    if (!filtered.current) {
      filtered.current = true;
      return;
    }
    announce(filterLabels.filteredAnnouncement(matchCount), true);
    // Announce on a change of filters only; the count is read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const goToPage = (next: number) => {
    setPage(next);
    if (!pageSize) return;
    const first = (next - 1) * pageSize + 1;
    const last = Math.min(next * pageSize, matchCount);
    announce(pageAnnouncement(next, pageCount, first, last, matchCount));
  };

  const visibleIds = visibleRows.map((row) => row.id);
  const selectedVisible = visibleIds.filter((id) => currentSelection.includes(id));
  const allVisibleSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
  const someVisibleSelected = selectedVisible.length > 0 && !allVisibleSelected;

  const toggleAllVisible = (checked: boolean) => {
    const next = checked
      ? [...new Set([...currentSelection, ...visibleIds])]
      : currentSelection.filter((id) => !visibleIds.includes(id));
    setSelection(next);
    // A single row's checkbox speaks its own state; select-all changes many.
    announce(selectedLabel(next.length));
  };

  const toggleRow = (id: string, checked: boolean) => {
    if (checked) setSelection([...currentSelection, id]);
    else setSelection(currentSelection.filter((selected) => selected !== id));
  };

  const sortIcon = (key: string): string => {
    const entry = sortOf(key);
    if (!entry) return 'swap_vert';
    return entry.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
  };

  const sortDirection = (key: string): DataTableSort['direction'] | null => sortOf(key)?.direction ?? null;

  /* The header menu's sort items. A direction on a column already in the
       sort changes it in place; on any other column it becomes the only
       sort, unless `add` puts it last. `null` takes the column out. */
  const setSortTo = (key: string, direction: DataTableSort['direction'] | null, add = false) => {
    let next: DataTableSort[];
    if (direction === null) next = currentSorts.filter((entry) => entry.key !== key);
    else if (sortOf(key)) next = currentSorts.map((entry) => (entry.key === key ? { key, direction } : entry));
    else next = add ? [...currentSorts, { key, direction }] : [{ key, direction }];
    setSorts(next);
    const column = byKey.get(key);
    announce(sortAnnouncement(column ? headerText(column) : key, direction));
  };

  /* ---- The visible columns, in the engine's order ------------------- */
  const startKeys = table.getStartVisibleLeafColumns().map((c) => c.id);
  const centerKeys = table.getCenterVisibleLeafColumns().map((c) => c.id);
  const endKeys = table.getEndVisibleLeafColumns().map((c) => c.id);
  const visibleKeys = [...startKeys, ...centerKeys, ...endKeys];
  const regionOf = (key: string): 'start' | 'center' | 'end' =>
    startKeys.includes(key) ? 'start' : endKeys.includes(key) ? 'end' : 'center';

  const rowGrips = reorderableRows;
  // A sort or a grouping owns the order, so the row grips step aside.
  const sortOwnsOrder = currentSorts.length > 0 || Boolean(groupKey);
  const utilityKeys = [
    ...(rowGrips ? ['ds-data-table-grip'] : []),
    ...(selectable ? ['ds-data-table-select'] : []),
    ...(renderDetail ? ['ds-data-table-expand'] : []),
  ];
  const anyPinned = startKeys.length > 0 || endKeys.length > 0;
  /* The actions column is as wide as the most actions any row on the page
       shows: its inline buttons plus the More button, at the compact row
       control height, with the gap between them and the cell's padding. */
  const actionsFor = (row: R) => rowActions?.(row) ?? [];
  /* Row edit mode needs the column for its Edit button, and for Save and
       Cancel while a row edits. */
  const showActions = Boolean(rowActions) || editMode === 'row';
  const consumerActions = rowActions
    ? Math.max(
        1,
        ...visibleRows.map((row) => {
          const list = actionsFor(row);
          const inline = list.filter((a) => a.inline).length;
          return inline + (list.some((a) => !a.inline) ? 1 : 0);
        }),
      )
    : 0;
  const actionsCount = editMode === 'row' ? Math.max(consumerActions + 1, 2) : consumerActions;
  /* The width itself is CSS (`--ds-dt-w-actions` in DataTable.css), from
       the live control height, gap and cell padding, so a theme's density
       moves it with everything else; JS only says how many buttons. */
  const actionsWidth = 'var(--ds-dt-w-actions)';
  /* With no column pinned to the end, the actions column is the end edge,
       and carries its hairline and its scrolling-edge shadow. */
  const actionsEdge = endKeys.length === 0 ? ` ${baseClass}__cell--pinned-edge` : '';
  const anyResizable = columns.some(canResize);
  const anyColumnFeature =
    columnMenu ||
    anyResizable ||
    columns.some(canMove) ||
    anyPinned ||
    reorderableRows ||
    columns.some((col) => col.editor);
  const gridMode = (navigation ?? (anyColumnFeature ? 'grid' : 'table')) === 'grid';

  /* ---- Widths ---------------------------------------------------------
       Resizing and pinning need every column in pixels: pinning to compute
       the sticky offsets, resizing so a column grows by exactly the drag.
       A column that declares a pixel width starts at it and is never
       measured, so a table whose columns all declare one is fixed from its
       first frame. The rest are laid out naturally on the first render,
       their header cells measured once, and the table switches to fixed
       widths at those sizes. */
  const fixedLayout = anyResizable || anyPinned;
  /* The table element, held as state through a callback ref, so actions a
       menu item runs can measure it without reaching a ref. */
  const [tableEl, setTableEl] = useState<HTMLTableElement | null>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<Record<string, number>>({});
  const declaredOf = (key: string) => declaredPixels(byKey.get(key)?.width);
  const needsMeasure =
    fixedLayout &&
    visibleKeys.some(
      (key) => widthsState[key] === undefined && declaredOf(key) === undefined && measured[key] === undefined,
    );
  useLayoutEffect(() => {
    if (!needsMeasure || !tableEl) return;
    const next: Record<string, number> = { ...measured };
    tableEl.querySelectorAll<HTMLElement>('thead th[data-col]').forEach((th) => {
      const key = th.dataset.col!;
      if (next[key] !== undefined || declaredPixels(byKey.get(key)?.width) !== undefined) return;
      const natural = Math.round(th.getBoundingClientRect().width);
      const truncates = (byKey.get(key)?.cellText ?? cellText) === 'truncate';
      next[key] = truncates ? Math.min(natural, TRUNCATE_START_WIDTH) : natural;
    });
    // Measuring the laid-out header cells is this effect's whole job, and
    // runs once per new column; the widths it reads exist only after layout.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeasured(next);
  }, [needsMeasure, measured, tableEl, byKey, cellText]);
  const layoutReady = fixedLayout && !needsMeasure;

  /* A column never gets narrower than its header needs: its padding, a
       little of its label, and the controls it carries, so a resize can
       never push a header's controls into its neighbour. */
  const minWidthOf = (col: DataTableColumn<R>) => {
    if (col.minWidth !== undefined) return col.minWidth;
    const header =
      2 * CELL_PADDING[size] +
      LABEL_MIN_WIDTH +
      (col.sortable ? SORT_GLYPH_WIDTH + (multiSort ? SORT_RANK_WIDTH : 0) : 0) +
      (columnMenu ? MENU_BUTTON_WIDTH : 0) +
      // A filterable column keeps room for its filter mark, so a filter never squeezes the label.
      (columnMenu && (col.filterable ?? true) ? FILTER_MARK_WIDTH : 0);
    // An editable column also fits its editor: the field's floor and the editor's inset either side.
    const kind = typeof col.editor === 'string' && !LIVE_KINDS.has(col.editor) ? col.editor : undefined;
    return kind ? Math.max(header, EDITOR_MIN_WIDTH[kind as keyof typeof EDITOR_MIN_WIDTH] + 2 * EDITOR_INSET) : header;
  };
  const clampWidth = (col: DataTableColumn<R>, width: number) =>
    Math.round(Math.min(col.maxWidth ?? Number.MAX_SAFE_INTEGER, Math.max(minWidthOf(col), width)));
  /* On a phone the pinned row header takes at most this share of the table,
     so the columns scrolling past it keep room to be read. */
  const PHONE_PINNED_SHARE = 0.4;
  const widthOf = (key: string, widths: Record<string, number> = widthsState) => {
    const col = byKey.get(key)!;
    const width = clampWidth(col, widths[key] ?? declaredOf(key) ?? measured[key] ?? minWidthOf(col));
    if (narrow && !stacked && key === rowHeaderKey && regionOf(key) === 'start')
      return Math.min(width, Math.max(minWidthOf(col), Math.round(narrowWidth * PHONE_PINNED_SHARE)));
    return width;
  };

  /** Every width and pinned offset as custom properties on the table, from one width map. */
  const layoutVars = (widths: Record<string, number>): Record<string, string> => {
    const vars: Record<string, string> = {};
    let total = utilityKeys.length * UTILITY_COLUMN_WIDTH;
    visibleKeys.forEach((key) => {
      const w = widthOf(key, widths);
      vars[`--ds-dt-w-${indexOfKey.get(key)}`] = `${w}px`;
      total += w;
    });
    let offset = utilityKeys.length * UTILITY_COLUMN_WIDTH;
    startKeys.forEach((key) => {
      vars[`--ds-dt-off-${indexOfKey.get(key)}`] = `${offset}px`;
      offset += widthOf(key, widths);
    });
    const plusActions = (px: number) => (showActions ? `calc(${px}px + var(--ds-dt-w-actions))` : `${px}px`);
    let fromEnd = 0;
    [...endKeys].reverse().forEach((key) => {
      vars[`--ds-dt-off-${indexOfKey.get(key)}`] = plusActions(fromEnd);
      fromEnd += widthOf(key, widths);
    });
    vars['--ds-dt-total'] = plusActions(total);
    return vars;
  };
  const writeVars = (vars: Record<string, string>) => {
    const node = tableEl;
    if (!node) return;
    for (const [name, value] of Object.entries(vars)) node.style.setProperty(name, value);
  };

  /* The pinned edges' shadows show only while content has scrolled under
       them: the wrapper's scroll position is written as data attributes,
       never as state. */
  useEffect(() => {
    const wrapper = tableEl?.parentElement;
    if (!wrapper || (!anyPinned && !showActions)) return;
    const update = () => {
      const max = wrapper.scrollWidth - wrapper.clientWidth;
      const left = Math.abs(wrapper.scrollLeft);
      wrapper.toggleAttribute('data-scrolled-start', left > 0);
      wrapper.toggleAttribute('data-scrolled-end', left < max - 1);
    };
    update();
    wrapper.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    return () => {
      wrapper.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [anyPinned, showActions, layoutReady, tableEl]);

  /* A cell to focus once the change that moved it has rendered (a column
       moved, pinned or hidden, a row moved). */
  type Cell = { row: string; col: string };
  const [pendingFocus, setFocusRequest] = useState<(Cell & { id: number }) | null>(null);
  const setPendingFocus = (cell: Cell) => setFocusRequest((previous) => ({ ...cell, id: (previous?.id ?? 0) + 1 }));

  /* ---- Column actions ------------------------------------------------ */
  const commitWidths = (next: Record<string, number>, key: string) => {
    setWidths(next);
    const col = byKey.get(key);
    if (col) announce(labels.resizedColumn(headerText(col), widthOf(key, next)));
  };
  const resizeBy = (key: string, delta: number) => {
    const col = byKey.get(key);
    if (!col || !canResize(col)) return;
    commitWidths({ ...widthsState, [key]: clampWidth(col, widthOf(key) + delta) }, key);
  };
  const fitColumn = (key: string) => {
    const col = byKey.get(key);
    const node = tableEl;
    if (!col || !node || !canResize(col)) return;
    let widest = 0;
    node.querySelectorAll<HTMLElement>(`[data-col="${CSS.escape(key)}"]`).forEach((cell) => {
      const content = cell.firstElementChild as HTMLElement | null;
      if (!content) return;
      const style = getComputedStyle(cell);
      const previous = content.style.width;
      content.style.width = 'max-content';
      const natural = content.getBoundingClientRect().width;
      content.style.width = previous;
      widest = Math.max(widest, natural + parseFloat(style.paddingLeft) + parseFloat(style.paddingRight));
    });
    commitWidths({ ...widthsState, [key]: clampWidth(col, Math.ceil(widest)) }, key);
  };
  const resetWidth = (key: string) => {
    const next = { ...widthsState };
    delete next[key];
    if (defaultColumnWidths?.[key] !== undefined) next[key] = defaultColumnWidths[key];
    commitWidths(next, key);
  };

  const moveColumn = (key: string, toIndexInRegion: number) => {
    const region = regionOf(key);
    const regionKeys = region === 'start' ? startKeys : region === 'end' ? endKeys : centerKeys;
    const from = regionKeys.indexOf(key);
    const to = Math.max(0, Math.min(regionKeys.length - 1, toIndexInRegion));
    if (from === -1 || from === to) return;
    const nextRegion = [...regionKeys];
    nextRegion.splice(from, 1);
    nextRegion.splice(to, 0, key);
    if (region === 'center') {
      // The engine orders the centre by columnOrder; pins carry their own order.
      const rest = knownOrder.filter((k) => !nextRegion.includes(k));
      setOrder([...nextRegion, ...rest]);
    } else {
      setPins(region === 'start' ? { start: nextRegion, end: pinnedEnd } : { start: pinnedStart, end: nextRegion });
    }
    const position = visibleKeys.filter((k) => !nextRegion.includes(k) || k === key).length;
    const finalOrder =
      region === 'start'
        ? [...nextRegion, ...centerKeys, ...endKeys]
        : region === 'end'
          ? [...startKeys, ...centerKeys, ...nextRegion]
          : [...startKeys, ...nextRegion, ...endKeys];
    void position;
    announce(labels.movedColumn(headerText(byKey.get(key)!), finalOrder.indexOf(key) + 1, finalOrder.length));
    setPendingFocus({ row: 'header', col: key });
  };
  const pinColumn = (key: string, edge: 'start' | 'end' | null) => {
    const start = pinnedStart.filter((k) => k !== key);
    const end = pinnedEnd.filter((k) => k !== key);
    if (edge === 'start') start.push(key);
    if (edge === 'end') end.unshift(key);
    setPins({ start, end });
    const col = byKey.get(key)!;
    announce(edge ? labels.pinnedColumn(headerText(col), edge) : labels.unpinnedColumn(headerText(col)));
    setPendingFocus({ row: 'header', col: key });
  };
  const hideColumn = (key: string) => {
    const index = visibleKeys.indexOf(key);
    setHidden([...hidden, key]);
    announce(labels.hiddenColumn(headerText(byKey.get(key)!)));
    const neighbour = visibleKeys[index + 1] ?? visibleKeys[index - 1];
    if (neighbour) setPendingFocus({ row: 'header', col: neighbour });
  };

  const rowName = (row: R) => {
    const nameKey = (columns.find((col) => col.rowHeader) ?? columns[0])?.key;
    const name = nameKey === undefined ? undefined : row.values[nameKey];
    return name == null || name === '' ? row.id : String(name);
  };
  const moveRow = (id: string, toIndexOnPage: number) => {
    const pageIds = visibleRows.map((row) => row.id);
    const from = pageIds.indexOf(id);
    const to = Math.max(0, Math.min(pageIds.length - 1, toIndexOnPage));
    if (from === -1 || from === to) return;
    const fullIds = sortedRows.map((row) => row.id);
    const targetId = pageIds[to];
    const without = fullIds.filter((rowId) => rowId !== id);
    const targetAt = without.indexOf(targetId);
    without.splice(to > from ? targetAt + 1 : targetAt, 0, id);
    setRowOrder(without);
    const row = visibleRows[from];
    announce(labels.movedRow(rowName(row), without.indexOf(id) + 1, without.length));
    setPendingFocus({ row: id, col: 'ds-data-table-grip' });
  };

  /* ---- Gestures ------------------------------------------------------ */
  const startResize = (event: React.PointerEvent<HTMLElement>, key: string) => {
    const col = byKey.get(key);
    if (!col || !canResize(col)) return;
    event.stopPropagation();
    const startWidth = widthOf(key);
    const wrapper = tableEl?.parentElement;
    const th = event.currentTarget.closest('th');
    const rtl = tableEl ? getComputedStyle(tableEl).direction === 'rtl' : false;
    let latest = startWidth;
    startDrag(event, {
      threshold: 1,
      onStart: () => {
        tableEl?.setAttribute('data-resizing', '');
        if (guideRef.current) guideRef.current.hidden = false;
      },
      onFrame: (dx) => {
        latest = clampWidth(col, startWidth + (rtl ? -dx : dx));
        writeVars(layoutVars({ ...widthsState, [key]: latest }));
        if (guideRef.current && wrapper && th) {
          const edge =
            th.getBoundingClientRect()[rtl ? 'left' : 'right'] -
            wrapper.getBoundingClientRect().left +
            wrapper.scrollLeft;
          guideRef.current.style.transform = `translateX(${edge}px)`;
        }
      },
      onEnd: () => {
        tableEl?.removeAttribute('data-resizing');
        if (guideRef.current) guideRef.current.hidden = true;
        commitWidths({ ...widthsState, [key]: latest }, key);
      },
      onCancel: () => {
        tableEl?.removeAttribute('data-resizing');
        if (guideRef.current) guideRef.current.hidden = true;
        writeVars(layoutVars(widthsState));
      },
    });
  };

  /**
   * Where a drag along one axis drops, from the pointer and the items'
   * boxes as they stood when the drag began: the dragged item follows the
   * pointer, so its live box would always contain it.
   */
  const dropIndex = (boxes: DOMRect[], from: number, pointer: number, axis: 'x' | 'y') =>
    boxes.filter((box, i) => {
      if (i === from) return false;
      const mid = axis === 'x' ? box.left + box.width / 2 : box.top + box.height / 2;
      return mid < pointer;
    }).length;

  const startColumnDrag = (event: React.PointerEvent<HTMLTableCellElement>, key: string) => {
    const col = byKey.get(key);
    const target = event.target as HTMLElement;
    if (!col || !canMove(col) || target.closest('[data-no-drag]')) return;
    const th = event.currentTarget;
    const region = regionOf(key);
    const regionKeys = region === 'start' ? startKeys : region === 'end' ? endKeys : centerKeys;
    const headers = () =>
      regionKeys
        .map((k) => tableEl?.querySelector<HTMLElement>(`thead th[data-col="${CSS.escape(k)}"]`))
        .filter((el): el is HTMLElement => Boolean(el));
    let to = regionKeys.indexOf(key);
    let boxes: DOMRect[] = [];
    let scroll0 = 0;
    startDrag(event, {
      onStart: () => {
        th.setAttribute('data-dragging', '');
        boxes = headers().map((el) => el.getBoundingClientRect());
        scroll0 = tableEl?.parentElement?.scrollLeft ?? 0;
      },
      onFrame: (dx, _dy, move) => {
        th.style.transform = `translateX(${dx}px)`;
        const wrapper = tableEl?.parentElement;
        const shift = (wrapper?.scrollLeft ?? 0) - scroll0;
        to = dropIndex(boxes, regionKeys.indexOf(key), move.clientX + shift, 'x');
        const anchor = boxes[to];
        if (anchor && dropRef.current && wrapper) {
          const box = anchor;
          const from = regionKeys.indexOf(key);
          const x = (to > from ? box.right : box.left) - wrapper.getBoundingClientRect().left + scroll0;
          dropRef.current.hidden = false;
          dropRef.current.dataset.axis = 'x';
          dropRef.current.style.transform = `translateX(${x}px)`;
        }
      },
      onEnd: () => {
        th.removeAttribute('data-dragging');
        th.style.transform = '';
        if (dropRef.current) dropRef.current.hidden = true;
        moveColumn(key, to);
      },
      onCancel: () => {
        th.removeAttribute('data-dragging');
        th.style.transform = '';
        if (dropRef.current) dropRef.current.hidden = true;
      },
    });
  };

  const startRowDrag = (event: React.PointerEvent<HTMLElement>, id: string) => {
    if (sortOwnsOrder) return;
    const tr = event.currentTarget.closest('tr');
    if (!tr) return;
    const bodyRows = () => [...(tableEl?.querySelectorAll<HTMLElement>('tbody tr[data-row]') ?? [])];
    let to = visibleRows.findIndex((row) => row.id === id);
    let boxes: DOMRect[] = [];
    let scroll0 = 0;
    startDrag(event, {
      onStart: () => {
        tr.setAttribute('data-dragging', '');
        boxes = bodyRows().map((el) => el.getBoundingClientRect());
        scroll0 = tableEl?.parentElement?.scrollTop ?? 0;
      },
      onFrame: (_dx, dy, move) => {
        tr.style.transform = `translateY(${dy}px)`;
        const wrapper = tableEl?.parentElement;
        const shift = (wrapper?.scrollTop ?? 0) - scroll0;
        to = dropIndex(
          boxes,
          visibleRows.findIndex((row) => row.id === id),
          move.clientY + shift,
          'y',
        );
        const anchor = boxes[to];
        if (anchor && dropRef.current && wrapper) {
          const box = anchor;
          const from = visibleRows.findIndex((row) => row.id === id);
          const y = (to > from ? box.bottom : box.top) - wrapper.getBoundingClientRect().top + scroll0;
          dropRef.current.hidden = false;
          dropRef.current.dataset.axis = 'y';
          dropRef.current.style.transform = `translateY(${y}px)`;
        }
      },
      onEnd: () => {
        tr.removeAttribute('data-dragging');
        tr.style.transform = '';
        if (dropRef.current) dropRef.current.hidden = true;
        moveRow(id, to);
      },
      onCancel: () => {
        tr.removeAttribute('data-dragging');
        tr.style.transform = '';
        if (dropRef.current) dropRef.current.hidden = true;
      },
    });
  };

  /* ---- The header menu ----------------------------------------------- */
  /* ---- Filters --------------------------------------------------------
       The columns as a control bar sees them, and the header filters. A
       header's Filter… opens its filter in place (adding one when the column
       has none); a filter left without a value when its editor closes is
       dropped, so an abandoned filter never lingers as a chip. */
  const toolbarColumns: ToolbarColumn[] = columns.map((col) => {
    const values = rows.map((row) => row.values[col.key]);
    const kind = col.type ? TYPE_DEFAULTS[col.type].filter : filterKindOf(values, Boolean(col.options));
    const choices =
      col.options ??
      (kind === 'enum' || kind === 'tags'
        ? [
            ...new Set(
              values
                .flat()
                .filter((value) => value != null && value !== '')
                .map(String),
            ),
          ]
            .sort((a, b) => collator.compare(a, b))
            .map((value) => ({ value, label: value }))
        : []);
    return {
      key: col.key,
      label: headerText(col),
      hideable: canHide(col),
      // The panel moves any column that is not locked or held still, whether or not its header drags.
      movable: !col.locked && col.reorderable !== false,
      filterable: col.filterable ?? true,
      sortable: Boolean(col.sortable),
      groupable: Boolean(col.groupable),
      kind,
      options: choices,
    };
  });
  const [headerFilter, setHeaderFilter] = useState<string | null>(null);
  /* A TableToolbar showing the count claims it, so the footer does not
       say it twice; the footer keeps the selection count. */
  const [countClaimed, setCountClaimed] = useState(false);
  const [selectionClaimed, setSelectionClaimed] = useState(false);
  const openHeaderFilter = (key: string) => {
    const existing = filters.find((filter) => filter.column === key);
    if (existing) {
      setHeaderFilter(existing.id);
      return;
    }
    const column = toolbarColumns.find((c) => c.key === key);
    if (!column) return;
    const filter: DataTableFilter = { id: newFilterId(key, filters), column: key, operator: OPERATORS[column.kind][0] };
    setFilters([...filters, filter]);
    setHeaderFilter(filter.id);
  };
  const closeHeaderFilter = () => {
    const open = filters.find((filter) => filter.id === headerFilter);
    if (open && !isComplete(open)) setFilters(filters.filter((filter) => filter.id !== open.id));
    setHeaderFilter(null);
  };
  /* ---- The view -------------------------------------------------------- */
  const currentView: DataTableView = {
    version: 1,
    sorts: currentSorts,
    filters,
    search,
    hiddenColumns: [...hidden],
    columnOrder: knownOrder,
    columnPinning: { start: pinnedStart, end: pinnedEnd },
    columnWidths: widthsState,
    grouping: groupingState,
    size,
    ...(pageSize !== undefined ? { pageSize } : {}),
  };
  /* The setup the table opened with: a view that leaves a part out gets
     this part back, so switching views never carries one view's filters
     into the next. */
  const [baseView] = useState(currentView);
  const viewColumns = columns.map((col) => ({
    key: col.key,
    filterKind: col.type ? TYPE_DEFAULTS[col.type].filter : undefined,
    minWidth: col.minWidth,
    maxWidth: col.maxWidth,
    groupable: col.groupable,
    sortable: col.sortable,
  }));
  /** A view in full, every part present, so two views compare part by part. */
  const fullView = (view: DataTableView): DataTableView => ({ ...baseView, ...reconcileView(view, viewColumns) });
  const viewKey = (view: DataTableView) =>
    JSON.stringify([
      view.sorts ?? [],
      view.filters ?? [],
      view.search ?? '',
      [...(view.hiddenColumns ?? [])].sort(),
      view.columnOrder ?? [],
      view.columnPinning ?? {},
      Object.entries(view.columnWidths ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
      view.grouping ?? [],
      view.size ?? 'default',
      view.pageSize ?? null,
    ]);
  const currentKey = viewKey(currentView);
  const applyView = (view: DataTableView) => {
    const next = fullView(view);
    setSorts(next.sorts ?? []);
    setFilters(next.filters ?? []);
    setSearch(next.search ?? '');
    setHidden(next.hiddenColumns ?? []);
    setOrder(next.columnOrder ?? []);
    setPins(next.columnPinning ?? {});
    setWidths(next.columnWidths ?? {});
    setGroupingState(next.grouping ?? []);
    setSize(next.size ?? 'default');
    if (next.pageSize !== undefined) setPageSize(next.pageSize);
    setPage(1);
  };
  /* A host listening for the view hears it once per change of setup. */
  const viewCallback = useRef(onViewChange);
  useEffect(() => {
    viewCallback.current = onViewChange;
  });
  const reportedKey = useRef(currentKey);
  useEffect(() => {
    if (reportedKey.current === currentKey) return;
    reportedKey.current = currentKey;
    viewCallback.current?.(JSON.parse(JSON.stringify(currentView)) as DataTableView);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the key stands for the view
  }, [currentKey]);

  const tableContext: TableContextValue = {
    columns: toolbarColumns,
    filters,
    setFilters,
    search,
    setSearch,
    hiddenColumns: [...hidden],
    setHiddenColumns: setHidden,
    columnOrder: knownOrder,
    setColumnOrder: setOrder,
    selectable,
    selectedIds: currentSelection,
    setSelectedIds: setSelection,
    matchingIds: sortedRows.map((row) => row.id),
    size,
    setSize,
    shown: matchCount,
    total: manual ? matchCount : rows.length,
    matchingCount: matchCount,
    allMatching: manual ? allMatching : undefined,
    exceptIds,
    setAllMatching: manual ? setAllMatching : undefined,
    filterLabels,
    claimCount: setCountClaimed,
    sorts: currentSorts,
    setSorts,
    multiSort,
    claimSelection: setSelectionClaimed,
    grouping: groupingState,
    setGrouping: setGroupingState,
    setAllGroupsOpen: (open: boolean) => setCollapsedGroups(open ? [] : (groups ?? []).map((group) => group.key)),
    view: currentView,
    applyView,
    viewMatches: (view: DataTableView) => viewKey(fullView(view)) === currentKey,
  };

  const [menuKey, setMenuKey] = useState<string | null>(null);
  const menuItems = (key: string): DropdownMenuEntry[] => {
    const col = byKey.get(key)!;
    const entries: DropdownMenuEntry[] = [];
    const direction = sortDirection(key);
    if (col.sortable) {
      entries.push(
        {
          label: labels.sortAscending,
          icon: 'arrow_upward',
          selected: direction === 'asc',
          onClick: () => setSortTo(key, 'asc'),
        },
        {
          label: labels.sortDescending,
          icon: 'arrow_downward',
          selected: direction === 'desc',
          onClick: () => setSortTo(key, 'desc'),
        },
      );
      if (multiSort && direction === null && currentSorts.length > 0)
        entries.push({ label: labels.addToSort, icon: 'add', onClick: () => setSortTo(key, 'asc', true) });
      if (direction !== null)
        entries.push({
          label: currentSorts.length > 1 ? labels.removeFromSort : labels.clearSort,
          icon: 'close',
          onClick: () => setSortTo(key, null),
        });
    }
    if (col.groupable) {
      if (entries.length) entries.push({ type: 'separator' });
      entries.push(
        groupKey === key
          ? { label: labels.ungroup, icon: 'format_list_bulleted', onClick: () => setGroupingState([]) }
          : { label: labels.groupBy, icon: 'view_agenda', onClick: () => setGroupingState([key]) },
      );
    }
    const region = regionOf(key);
    const block: DropdownMenuEntry[] = [];
    if (!col.locked) {
      if (region !== 'start')
        block.push({ label: labels.pinStart, icon: 'push_pin', onClick: () => pinColumn(key, 'start') });
      if (region !== 'end')
        block.push({ label: labels.pinEnd, icon: 'push_pin', onClick: () => pinColumn(key, 'end') });
      if (region !== 'center')
        block.push({ label: labels.unpin, icon: 'keep_off', onClick: () => pinColumn(key, null) });
    }
    if (canMove(col)) {
      const regionKeys = region === 'start' ? startKeys : region === 'end' ? endKeys : centerKeys;
      const at = regionKeys.indexOf(key);
      block.push(
        { label: labels.moveLeft, icon: 'arrow_back', disabled: at <= 0, onClick: () => moveColumn(key, at - 1) },
        {
          label: labels.moveRight,
          icon: 'arrow_forward',
          disabled: at >= regionKeys.length - 1,
          onClick: () => moveColumn(key, at + 1),
        },
      );
    }
    if (block.length) {
      if (entries.length) entries.push({ type: 'separator' });
      entries.push(...block);
    }
    const sizing: DropdownMenuEntry[] = [];
    if (canResize(col)) {
      sizing.push(
        { label: labels.fit, icon: 'fit_width', onClick: () => fitColumn(key) },
        { label: labels.resetWidth, icon: 'restart_alt', onClick: () => resetWidth(key) },
      );
    }
    if (canHide(col) && visibleKeys.length > 1) {
      sizing.push({ label: labels.hide, icon: 'visibility_off', onClick: () => hideColumn(key) });
    }
    if (sizing.length) {
      if (entries.length) entries.push({ type: 'separator' });
      entries.push(...sizing);
    }
    if (col.filterable ?? true) {
      if (entries.length) entries.push({ type: 'separator' });
      entries.push({ label: filterLabels.filterColumn, icon: 'filter_list', onClick: () => openHeaderFilter(key) });
    }
    return entries;
  };

  /* ---- Grid navigation ------------------------------------------------
       One Tab stop: the active cell, tracked by row id and column key so it
       survives a sort, a filter, a page change or a move. */
  const columnKeysInView = [...utilityKeys, ...visibleKeys, ...(showActions ? ['ds-data-table-actions'] : [])];
  const rowKeysInView = ['header', ...visibleRows.map((row) => row.id)];
  const [active, setActive] = useState<Cell | null>(null);
  const activeCell: Cell = (() => {
    const fallbackRow = visibleRows[0]?.id ?? 'header';
    const fallbackCol = visibleKeys[0] ?? columnKeysInView[0];
    if (!active) return { row: fallbackRow, col: fallbackCol };
    return {
      row: rowKeysInView.includes(active.row) ? active.row : fallbackRow,
      col: columnKeysInView.includes(active.col) ? active.col : fallbackCol,
    };
  })();
  const cellSelector = (cell: Cell) =>
    cell.row === 'header'
      ? `thead [data-col="${CSS.escape(cell.col)}"]`
      : `tbody tr[data-row="${CSS.escape(cell.row)}"] [data-col="${CSS.escape(cell.col)}"]`;
  useEffect(() => {
    if (!pendingFocus) return;
    if (gridMode) tableEl?.querySelector<HTMLElement>(cellSelector(pendingFocus))?.focus();
    // cellSelector is a pure function of the cell; the cell is the dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFocus?.id]);
  const focusCell = (cell: Cell) => {
    setActive(cell);
    const node = tableEl?.querySelector<HTMLElement>(cellSelector(cell));
    if (node) {
      node.focus();
      return;
    }
    // Virtualised, the row may not be drawn yet: bring it in, then focus it once it is.
    scrollRowIntoView(cell.row);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => tableEl?.querySelector<HTMLElement>(cellSelector(cell))?.focus()),
    );
  };

  /* ---- Editing --------------------------------------------------------
       The table never copies the rows: an open edit holds only its draft.
       A save that returns a promise shows its value as pending until it
       settles; a rejection rolls the cell back, marks it, and is announced
       on the assertive channel. */
  type Editing = {
    row: string;
    /** The cell edited, or in row mode the cell the edit began from. */
    key?: string;
    draft: Record<string, DataTableValue>;
    errors: Record<string, string>;
    /** The edit began with a typed character. */
    replaced?: boolean;
  };
  const [editing, setEditing] = useState<Editing | null>(null);
  const [pending, setPending] = useState<Record<string, Record<string, DataTableValue>>>({});
  const [failed, setFailed] = useState<Record<string, string>>({});
  const [alertMessage, setAlertMessage] = useState('');
  const cellId = (rowId: string, key: string) => `${rowId}\u0000${key}`;
  const rowById = (id: string) => rows.find((row) => row.id === id);
  const kindOf = (col?: DataTableColumn<R>): CellEditorKind | undefined =>
    typeof col?.editor === 'string' ? col.editor : undefined;
  const isLive = (col?: DataTableColumn<R>) => {
    const kind = kindOf(col);
    return kind !== undefined && LIVE_KINDS.has(kind);
  };
  const canEdit = (col: DataTableColumn<R> | undefined, row: R) =>
    Boolean(col?.editor) && (typeof col?.editable === 'function' ? col.editable(row) : (col?.editable ?? true));
  const valueOf = (row: R, key: string): DataTableValue =>
    pending[row.id] && key in pending[row.id] ? pending[row.id][key] : row.values[key];
  const rowView = (row: R): R => (pending[row.id] ? { ...row, values: { ...row.values, ...pending[row.id] } } : row);
  const sameValue = (a: DataTableValue, b: DataTableValue) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  const isThenable = (value: unknown): value is Promise<unknown> =>
    typeof (value as Promise<unknown> | undefined)?.then === 'function';

  const save = (row: R, values: Record<string, DataTableValue>) => {
    const keys = Object.keys(values);
    if (keys.length === 0) return;
    const previous = Object.fromEntries(keys.map((key) => [key, row.values[key]]));
    let result: unknown;
    if (editMode === 'row' && onRowEdit) result = onRowEdit({ row, values, previous });
    else {
      const results = keys.map((key) => onCellEdit?.({ row, key, value: values[key], previous: previous[key] }));
      result = results.some(isThenable) ? Promise.all(results) : undefined;
    }
    setFailed((current) => {
      const next = { ...current };
      keys.forEach((key) => delete next[cellId(row.id, key)]);
      return next;
    });
    if (!isThenable(result)) return;
    setPending((current) => ({ ...current, [row.id]: { ...current[row.id], ...values } }));
    const settle = () =>
      setPending((current) => {
        const mine = { ...current[row.id] };
        keys.forEach((key) => delete mine[key]);
        const next = { ...current };
        if (Object.keys(mine).length > 0) next[row.id] = mine;
        else delete next[row.id];
        return next;
      });
    result.then(settle, () => {
      settle();
      const name = rowName(row);
      const message = (key: string) => labels.saveFailed(headerText(byKey.get(key) ?? { key, header: key }), name);
      setFailed((current) => ({
        ...current,
        ...Object.fromEntries(keys.map((key) => [cellId(row.id, key), message(key)])),
      }));
      setAlertMessage(message(keys[0]));
    });
  };

  /** The editable cells of the page in reading order, for Tab. */
  const editableCells = () =>
    visibleRows.flatMap((row) =>
      visibleKeys.filter((key) => canEdit(byKey.get(key), row)).map((key) => ({ row: row.id, col: key })),
    );

  const startEdit = (rowId: string, key?: string, replace?: string) => {
    const row = rowById(rowId);
    if (!row) return;
    if (editMode === 'row') {
      const draft = Object.fromEntries(
        visibleKeys.filter((k) => canEdit(byKey.get(k), row) && !isLive(byKey.get(k))).map((k) => [k, valueOf(row, k)]),
      );
      if (Object.keys(draft).length > 0) setEditing({ row: rowId, key, draft, errors: {} });
      return;
    }
    const col = key === undefined ? undefined : byKey.get(key);
    if (!col || !canEdit(col, row)) return;
    if (isLive(col)) {
      save(row, { [col.key]: !valueOf(row, col.key) });
      return;
    }
    const typed =
      replace === undefined
        ? undefined
        : kindOf(col) === 'number'
          ? Number.isNaN(Number(replace))
            ? null
            : Number(replace)
          : replace;
    setEditing({
      row: rowId,
      key: col.key,
      draft: { [col.key]: replace === undefined ? valueOf(row, col.key) : typed },
      errors: {},
      replaced: replace !== undefined,
    });
  };

  const setDraft = (key: string, value: DataTableValue) =>
    setEditing((current) => {
      if (!current) return current;
      const errors = { ...current.errors };
      delete errors[key];
      return { ...current, draft: { ...current.draft, [key]: value }, errors };
    });

  const cancelEdit = () => {
    if (!editing) return;
    setEditing(null);
    setPendingFocus({ row: editing.row, col: editMode === 'row' ? 'ds-data-table-actions' : editing.key! });
  };

  /** Saves the open edit, unless a value fails its check, then moves focus as the key asked. */
  const commitEdit = (
    move: 'stay' | 'down' | 'next' | 'previous' | 'none',
    override?: { key: string; value: DataTableValue },
  ) => {
    if (!editing) return;
    const row = rowById(editing.row);
    if (!row) {
      setEditing(null);
      return;
    }
    const draft = override ? { ...editing.draft, [override.key]: override.value } : editing.draft;
    const errors: Record<string, string> = {};
    for (const [key, value] of Object.entries(draft)) {
      const message = byKey.get(key)?.validate?.(value, row);
      if (message) errors[key] = message;
    }
    if (Object.keys(errors).length > 0) {
      setEditing({ ...editing, draft, errors });
      return;
    }
    save(row, Object.fromEntries(Object.entries(draft).filter(([key, value]) => !sameValue(value, valueOf(row, key)))));
    setEditing(null);
    if (move === 'none') return;
    const here = { row: editing.row, col: editMode === 'row' ? 'ds-data-table-actions' : editing.key! };
    if (move === 'down') {
      const at = visibleRows.findIndex((r) => r.id === editing.row);
      const below = visibleRows[at + 1];
      setPendingFocus(below ? { row: below.id, col: here.col } : here);
    } else if (move === 'next' || move === 'previous') {
      const cells = editableCells();
      const at = cells.findIndex((cell) => cell.row === here.row && cell.col === here.col);
      setPendingFocus(cells[at + (move === 'next' ? 1 : -1)] ?? here);
    } else setPendingFocus(here);
  };

  const onEditorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, kind?: CellEditorKind) => {
    if (event.defaultPrevented) return;
    // An open list inside the editor takes its own Escape and Enter first.
    if (event.currentTarget.querySelector('[aria-expanded="true"]')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      cancelEdit();
      return;
    }
    if (event.key === 'Enter' && (kind !== 'textarea' || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      commitEdit(editMode === 'row' || event.shiftKey ? 'stay' : 'down');
      return;
    }
    if (event.key === 'Tab' && editMode === 'cell') {
      event.preventDefault();
      commitEdit(event.shiftKey ? 'previous' : 'next');
    }
  };
  /* A press or a focus move outside the cell's editor saves it, as a
       spreadsheet does. Row mode waits for Save. */
  const onEditorBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (editMode === 'row') return;
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    commitEdit('none');
  };

  const linkEl = useLinkComponent(linkComponent);
  const typedWords = { checked: labels.checkedValue, unchecked: labels.uncheckedValue, more: labels.moreValues };
  const optionLabel = (col: DataTableColumn<R>) => (v: string) =>
    col.options?.find((option) => option.value === v)?.label ?? v;

  /* ---- Group rows and totals ----------------------------------------- */
  /** Whether a column's calculations read numbers: its type says so, or every value it holds is one. */
  const numericColumn = (col: DataTableColumn<R>) =>
    col.type === 'number' ||
    col.type === 'currency' ||
    col.type === 'progress' ||
    (!col.type &&
      rows.some((row) => typeof row.values[col.key] === 'number') &&
      rows.every((row) => row.values[col.key] == null || typeof row.values[col.key] === 'number'));
  /** A calculation's result in the column's own terms: an amount through its type, a count plain. */
  const resultText = (col: DataTableColumn<R>, result: Result): string => {
    if (!result) return '';
    const amount = (value: number) =>
      formatNumber(col.type === 'currency' || col.type === 'progress' ? col.type : 'number', value, col.format);
    if (result.kind === 'amount') return amount(result.value);
    if (result.kind === 'pair') return `${amount(result.value[0])}–${amount(result.value[1])}`;
    if (result.kind === 'percent') return `${Math.round(result.value)}%`;
    return String(result.value);
  };
  /** What a group row shows in a column: its `aggregate` over the group's rows. */
  const groupTotal = (col: DataTableColumn<R>, groupRows: R[]): React.ReactNode => {
    if (!col.aggregate) return null;
    const values = groupRows.map((row) => row.values[col.key]);
    if (typeof col.aggregate === 'function') return col.aggregate(values, groupRows);
    return resultText(col, calculate(col.aggregate, values));
  };
  const totalPick = (col: DataTableColumn<R>): DataTableTotal =>
    totalsState[col.key] ?? (typeof col.aggregate === 'string' ? col.aggregate : 'none');

  /** A cell's value as text: an option's label, a list joined. */
  const displayOf = (col: DataTableColumn<R>, value: DataTableValue): React.ReactNode => {
    const label = (v: string) => col.options?.find((option) => option.value === v)?.label ?? v;
    if (Array.isArray(value)) return value.map(label).join(', ');
    if (value == null) return value;
    return col.options ? label(String(value)) : typeof value === 'boolean' ? String(value) : value;
  };

  const onGridKeyDown = (event: React.KeyboardEvent<HTMLTableElement>) => {
    if (!gridMode) return;
    const cellEl = (event.target as HTMLElement).closest<HTMLElement>('[data-col]');
    if (!cellEl || cellEl !== event.target) return;
    const tr = cellEl.closest('tr') as HTMLElement | null;
    const cell: Cell = { row: tr?.dataset.row ?? 'header', col: cellEl.dataset.col! };
    const r = rowKeysInView.indexOf(cell.row);
    const c = columnKeysInView.indexOf(cell.col);
    const isHeader = cell.row === 'header';
    const col = byKey.get(cell.col);
    const go = (row: number, column: number) => {
      event.preventDefault();
      focusCell({
        row: rowKeysInView[Math.max(0, Math.min(rowKeysInView.length - 1, row))],
        col: columnKeysInView[Math.max(0, Math.min(columnKeysInView.length - 1, column))],
      });
    };
    const ctrl = event.ctrlKey || event.metaKey;
    if (isHeader && col && event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      const rtl = getComputedStyle(cellEl).direction === 'rtl';
      resizeBy(cell.col, (event.key === 'ArrowRight') !== rtl ? RESIZE_STEP : -RESIZE_STEP);
      return;
    }
    if (isHeader && col && ctrl && event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      if (!canMove(col)) return;
      const region = regionOf(cell.col);
      const regionKeys = region === 'start' ? startKeys : region === 'end' ? endKeys : centerKeys;
      moveColumn(cell.col, regionKeys.indexOf(cell.col) + (event.key === 'ArrowRight' ? 1 : -1));
      return;
    }
    if (!isHeader && rowGrips && event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      if (sortOwnsOrder) return;
      const at = visibleRows.findIndex((row) => row.id === cell.row);
      moveRow(cell.row, at + (event.key === 'ArrowDown' ? 1 : -1));
      return;
    }
    if (
      isHeader &&
      col &&
      columnMenu &&
      ((event.altKey && event.key === 'ArrowDown') ||
        (event.shiftKey && event.key === 'F10') ||
        event.key === 'ContextMenu')
    ) {
      event.preventDefault();
      setMenuKey(cell.col);
      return;
    }
    /* On a row header, the arrows open and close the row's details, as a
       tree row does: right opens a closed row, left closes an open one, and
       otherwise they move as usual. */
    if (!isHeader && col?.rowHeader && renderDetail && !event.altKey && !ctrl) {
      const open = expandedState.includes(cell.row);
      const forward = (event.key === 'ArrowRight') !== (getComputedStyle(cellEl).direction === 'rtl');
      if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && forward !== open) {
        event.preventDefault();
        toggleDetail(cell.row);
        return;
      }
    }
    const editRow = isHeader ? undefined : rowById(cell.row);
    if (col && editRow && canEdit(col, editRow) && !isLive(col) && !editing) {
      if (event.key === 'Enter' || event.key === 'F2') {
        event.preventDefault();
        startEdit(cell.row, cell.col);
        return;
      }
      const kind = kindOf(col);
      const printable = event.key.length === 1 && event.key !== ' ' && !ctrl && !event.altKey;
      if (editMode === 'cell' && printable && kind && TYPED_KINDS.has(kind)) {
        event.preventDefault();
        startEdit(cell.row, cell.col, event.key);
        return;
      }
    }
    switch (event.key) {
      case 'ArrowRight':
        return go(r, c + 1);
      case 'ArrowLeft':
        return go(r, c - 1);
      case 'ArrowDown':
        return go(r + 1, c);
      case 'ArrowUp':
        return go(r - 1, c);
      case 'Home':
        return ctrl ? go(1, 0) : go(r, 0);
      case 'End':
        return ctrl ? go(rowKeysInView.length - 1, columnKeysInView.length - 1) : go(r, columnKeysInView.length - 1);
      case 'PageDown':
        return go(r + 10, c);
      case 'PageUp':
        return go(Math.max(1, r - 10), c);
      case 'Enter':
      case ' ': {
        // The cell's control: the sort button, the checkbox, a link or button the cell renders.
        const control = cellEl.querySelector<HTMLElement>('[data-cell-control], button, a[href], input');
        if (control) {
          event.preventDefault();
          control.click();
        }
        return;
      }
      default:
    }
  };

  /* ---- Cells --------------------------------------------------------- */
  const pinClass = (key: string) => {
    const region = regionOf(key);
    if (region === 'center') return '';
    const keys = region === 'start' ? startKeys : endKeys;
    const edge = region === 'start' ? keys[keys.length - 1] === key : keys[0] === key;
    return ` ${baseClass}__cell--pinned ${baseClass}__cell--pinned-${region}${edge ? ` ${baseClass}__cell--pinned-edge` : ''}`;
  };
  const utilityPinned = anyPinned && startKeys.length > 0;
  const cellStyle = (key: string, align?: string): React.CSSProperties => {
    const index = indexOfKey.get(key);
    const style: React.CSSProperties = {};
    // A card takes no column widths or pinned offsets.
    if (stacked) return style;
    if (layoutReady) style.width = `var(--ds-dt-w-${index})`;
    else {
      const col = byKey.get(key);
      if (col?.width) style.width = col.width;
    }
    if (regionOf(key) === 'start') style.insetInlineStart = `var(--ds-dt-off-${index})`;
    if (regionOf(key) === 'end') style.insetInlineEnd = `var(--ds-dt-off-${index})`;
    if (align) style.textAlign = align as React.CSSProperties['textAlign'];
    return style;
  };
  const tabProps = (row: string, col: string) =>
    gridMode
      ? {
          tabIndex: activeCell.row === row && activeCell.col === col ? 0 : -1,
          onFocus: () => setActive({ row, col }),
        }
      : {};
  const innerTab = gridMode ? -1 : undefined;
  const justify = (align?: string) => (align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start');

  const utilityHeader = (key: string) => {
    const style: React.CSSProperties = { width: UTILITY_COLUMN_WIDTH };
    if (utilityPinned) style.insetInlineStart = `${utilityKeys.indexOf(key) * UTILITY_COLUMN_WIDTH}px`;
    const pinnedCls = utilityPinned ? ` ${baseClass}__cell--pinned ${baseClass}__cell--pinned-start` : '';
    if (key === 'ds-data-table-grip' || key === 'ds-data-table-expand') {
      return (
        <th
          key={key}
          data-col={key}
          scope="col"
          className={`ds-table__header-cell ${baseClass}__utility${pinnedCls}`}
          style={style}
          {...tabProps('header', key)}
        >
          <span className="ds-visually-hidden">
            {key === 'ds-data-table-grip' ? labels.rowGripColumn : labels.detailsColumn}
          </span>
        </th>
      );
    }
    return (
      <th
        key={key}
        data-col={key}
        scope="col"
        className={`ds-table__header-cell ${baseClass}__utility${pinnedCls}`}
        style={style}
        {...tabProps('header', key)}
      >
        <div className="ds-table__cell-content">
          <Checkbox
            size="compact"
            checked={allVisibleSelected}
            indeterminate={someVisibleSelected}
            onCheckedChange={toggleAllVisible}
            aria-label={selectAllLabel}
            tabIndex={innerTab}
            data-cell-control=""
          />
        </div>
      </th>
    );
  };

  const header = (key: string) => {
    const col = byKey.get(key)!;
    const text = headerText(col);
    /* aria-sort marks one header, the first sort's: the others read their
         rank from the sort button's name. */
    const sortEntry = sortOf(key);
    const sortRank = sortEntry ? currentSorts.indexOf(sortEntry) : -1;
    const sortValue = sortRank === 0 ? (sortEntry!.direction === 'asc' ? 'ascending' : 'descending') : undefined;
    const ranked = sortRank !== -1 && currentSorts.length > 1;
    const movable = canMove(col);
    return (
      <th
        key={key}
        data-col={key}
        scope="col"
        aria-sort={sortValue}
        className={`ds-table__header-cell${pinClass(key)}${movable ? ` ${baseClass}__header--movable` : ''}`}
        style={cellStyle(key, col.align || 'left')}
        onPointerDown={movable ? (event) => startColumnDrag(event, key) : undefined}
        onContextMenu={
          columnMenu
            ? (event) => {
                event.preventDefault();
                setMenuKey(key);
              }
            : undefined
        }
        {...tabProps('header', key)}
      >
        <div
          className={`${baseClass}__header-inner`}
          data-align={col.align === 'right' ? 'end' : col.align === 'center' ? 'center' : undefined}
          style={{
            justifyContent: justify(col.align),
            // In auto layout a declared width is only a hint the browser squeezes when the table runs wide,
            // so a pixel width also holds as the column's floor, set on content the layout cannot shrink.
            minWidth:
              !layoutReady && !stacked && declaredOf(key) ? declaredOf(key)! - 2 * CELL_PADDING[size] : undefined,
          }}
        >
          {col.sortable ? (
            <button
              type="button"
              className={`${baseClass}__sort`}
              aria-label={
                ranked && sortRank > 0
                  ? sortRankLabel(sortLabel(text, sortDirection(key)), sortRank + 1, sortDirection(key)!)
                  : sortLabel(text, sortDirection(key))
              }
              onClick={(event) => cycleSort(key, event.shiftKey)}
              // A Shift-click adds to the sort, so it must not also select the header's text.
              onMouseDown={multiSort ? (event) => event.shiftKey && event.preventDefault() : undefined}
              tabIndex={innerTab}
              data-cell-control=""
            >
              <span className={`${baseClass}__label`}>{col.header}</span>
              <span
                className={[
                  `${baseClass}__sort-icon`,
                  sortEntry ? `${baseClass}__sort-icon--active` : '',
                  'material-symbols-rounded',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              >
                {sortIcon(key)}
              </span>
              {ranked && (
                <span className={`${baseClass}__sort-rank`} aria-hidden="true">
                  {sortRank + 1}
                </span>
              )}
            </button>
          ) : col.header ? (
            <span className={`${baseClass}__label`}>{col.header}</span>
          ) : (
            <span className="ds-visually-hidden">{col.key}</span>
          )}
          {(() => {
            const own = filters.filter((filter) => filter.column === key);
            const editing = own.find((filter) => filter.id === headerFilter);
            const shown = editing ?? own.find(isComplete);
            const column = toolbarColumns.find((c) => c.key === key);
            if (!shown || !column) return null;
            return (
              <span className={`${baseClass}__filter-mark`} data-no-drag="">
                <Popover
                  size="compact"
                  open={headerFilter === shown.id}
                  onOpenChange={(open) => (open ? setHeaderFilter(shown.id) : closeHeaderFilter())}
                  ariaLabel={filterLabels.filtered(text)}
                  // A menu among the header's menus: DropdownMenu's surface, the editor in a menu row.
                  surface="menu"
                  content={
                    <div className={`${baseClass}__menu-row`}>
                      <FilterEditor
                        column={column}
                        filter={shown}
                        labels={filterLabels}
                        onChange={(next) =>
                          setFilters(filters.map((filter) => (filter.id === next.id ? next : filter)))
                        }
                      />
                    </div>
                  }
                >
                  <span className="material-symbols-rounded" aria-hidden="true">
                    filter_alt
                  </span>
                </Popover>
              </span>
            );
          })()}
          {columnMenu && (
            <span className={`${baseClass}__menu`} data-no-drag="">
              <DropdownMenu
                size="compact"
                align="end"
                open={menuKey === key}
                onOpenChange={(open) => setMenuKey(open ? key : null)}
                items={menuItems(key)}
                trigger={
                  <CircularButton
                    icon="more_horiz"
                    variant="tertiary"
                    size="compact"
                    tooltip={false}
                    ariaLabel={labels.menu(text)}
                    tabIndex={innerTab}
                  />
                }
              />
            </span>
          )}
        </div>
        {canResize(col) && (
          <span
            className={`${baseClass}__resize`}
            aria-hidden="true"
            data-no-drag=""
            onPointerDown={(event) => startResize(event, key)}
            onDoubleClick={() => fitColumn(key)}
          />
        )}
      </th>
    );
  };

  /* ---- Virtualisation ----------------------------------------------------
     Past VIRTUAL_THRESHOLD rows (or when asked), only the rows in view and
     a few either side are in the DOM, between two spacer rows that hold
     the scroll height. A row and its open details are separate items, each
     measured as it draws. The rows' order, filtering and selection are the
     engine's as ever; only the drawing is windowed. */
  const virtual =
    !stacked &&
    !groups &&
    (virtualize === true ||
      (virtualize === 'auto' && pageSize === undefined && visibleRows.length > VIRTUAL_THRESHOLD));
  const [frameEl, setFrameEl] = useState<HTMLDivElement | null>(null);
  const virtualItems = virtual
    ? visibleRows.flatMap((row) =>
        renderDetail && expandedState.includes(row.id)
          ? [
              { row, part: 'record' as const },
              { row, part: 'detail' as const },
            ]
          : [{ row, part: 'record' as const }],
      )
    : [];
  const frameHeight = typeof maxHeight === 'number' ? maxHeight : VIRTUAL_HEIGHT;
  /* VirtualRows hands back how to scroll an item into view; a cell the
     keyboard moves to may not be drawn yet. */
  const scrollTo = useRef<((index: number) => void) | null>(null);
  const setScroller = useCallback((fn: (index: number) => void) => {
    scrollTo.current = fn;
  }, []);
  const scrollRowIntoView = (rowId: string) => {
    if (!virtual) return;
    const index = virtualItems.findIndex((item) => item.row.id === rowId && item.part === 'record');
    if (index >= 0) scrollTo.current?.(index);
  };

  /* Infinite scroll: a loading row after the rows asks for the next batch
     as it comes into view, once per batch. */
  const loadingRef = useRef<HTMLTableRowElement | null>(null);
  const requestedAt = useRef(-1);
  const loadMore = useRef(onLoadMore);
  useEffect(() => {
    loadMore.current = onLoadMore;
  });
  const rowCount = visibleRows.length;
  const scrollsInFrame = virtual || maxHeight !== undefined;
  useEffect(() => {
    const node = loadingRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || requestedAt.current === rowCount) return;
        requestedAt.current = rowCount;
        loadMore.current?.();
      },
      // The rows scroll inside the frame whenever it has a height (always, virtualised), else with the page.
      { root: scrollsInFrame ? frameEl : null, rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, rowCount, scrollsInFrame, frameEl]);

  const groupLabel = (key: string) =>
    key === '' ? labels.emptyGroup : (groupCol?.options?.find((option) => option.value === key)?.label ?? key);

  /* A group's lead row: the toggle, the value drawn through its column's
     type and the count in the first column, then each column's group total
     in its own cell. The cells mirror a body row's, so the pinned edges and
     the widths line up. */
  /* The group rows' and the footer's controls sit outside the grid's cell
     navigation (the arrows move through the records), so they keep their
     own Tab stops in every mode: a grid's roving focus would otherwise
     leave them unreachable from the keyboard. */
  const groupRow = (group: { key: string; rows: R[] }) => {
    const expanded = !collapsedGroups.includes(group.key);
    const label = groupLabel(group.key);
    const ids = group.rows.map((row) => row.id);
    const chosen = ids.filter((id) => currentSelection.includes(id)).length;
    const raw = group.rows[0]?.values[groupKey!] ?? null;
    return (
      <tr className={`ds-table__row ${baseClass}__group-row`} data-group-row="">
        {utilityKeys.map((key) => {
          const style: React.CSSProperties = stacked ? {} : { width: UTILITY_COLUMN_WIDTH };
          if (utilityPinned && !stacked)
            style.insetInlineStart = `${utilityKeys.indexOf(key) * UTILITY_COLUMN_WIDTH}px`;
          const pinnedCls = utilityPinned ? ` ${baseClass}__cell--pinned ${baseClass}__cell--pinned-start` : '';
          return (
            <td key={key} className={`ds-table__cell ${baseClass}__utility${pinnedCls}`} style={style}>
              {key === 'ds-data-table-select' && (
                <div className="ds-table__cell-content">
                  <Checkbox
                    size="compact"
                    checked={chosen > 0 && chosen === ids.length}
                    indeterminate={chosen > 0 && chosen < ids.length}
                    onCheckedChange={(checked) =>
                      setSelection(
                        checked
                          ? [...new Set([...currentSelection, ...ids])]
                          : currentSelection.filter((id) => !ids.includes(id)),
                      )
                    }
                    aria-label={labels.selectGroup(label)}
                    tabIndex={0}
                  />
                </div>
              )}
            </td>
          );
        })}
        {visibleKeys.map((key, index) => {
          const col = byKey.get(key)!;
          if (index === 0)
            return (
              <th
                key={key}
                scope="rowgroup"
                className={`ds-table__cell ${baseClass}__group-cell${pinClass(key)}`}
                style={layoutReady || regionOf(key) !== 'center' ? cellStyle(key) : undefined}
              >
                <div className={`ds-table__cell-content ${baseClass}__group-label`}>
                  <button
                    type="button"
                    className={`${baseClass}__group-toggle`}
                    aria-expanded={expanded}
                    aria-label={labels.groupToggle(label, group.rows.length, expanded)}
                    onClick={() => toggleGroup(group.key)}
                    tabIndex={0}
                  >
                    <span className={`${baseClass}__group-chevron material-symbols-rounded`} aria-hidden="true">
                      chevron_right
                    </span>
                  </button>
                  <span className={`${baseClass}__group-value`} aria-hidden="true">
                    {group.key === '' ? (
                      labels.emptyGroup
                    ) : groupCol?.type ? (
                      <TypedCell
                        type={groupCol.type}
                        value={raw}
                        format={groupCol.format}
                        options={groupCol.options}
                        words={typedWords}
                        link={linkEl}
                      />
                    ) : (
                      label
                    )}
                  </span>
                  <span className={`${baseClass}__group-count`} aria-hidden="true">
                    {labels.groupCount(group.rows.length)}
                  </span>
                </div>
              </th>
            );
          const total = groupTotal(col, group.rows);
          return (
            <td
              key={key}
              className={`ds-table__cell${pinClass(key)}`}
              style={layoutReady || regionOf(key) !== 'center' ? cellStyle(key) : undefined}
            >
              {total != null && total !== '' && (
                <div className="ds-table__cell-content" style={{ justifyContent: justify(col.align) }}>
                  <span className={`${baseClass}__group-total`}>{total}</span>
                </div>
              )}
            </td>
          );
        })}
        {layoutReady && <td className={`ds-table__cell ${baseClass}__filler`} role="presentation" aria-hidden="true" />}
        {showActions && (
          <td
            className={`ds-table__cell ${baseClass}__actions ${baseClass}__cell--pinned ${baseClass}__cell--pinned-end${actionsEdge}`}
            style={stacked ? undefined : { width: actionsWidth, insetInlineEnd: 0 }}
          />
        )}
      </tr>
    );
  };

  /* The totals footer: one cell per column, each a menu picking its
     calculation over every matching row, its result in the column's terms
     beside the calculation's name. */
  const totalsFooter = () => (
    <tfoot className={`${baseClass}__totals`}>
      <tr className="ds-table__row">
        {utilityKeys.map((key) => {
          const style: React.CSSProperties = { width: UTILITY_COLUMN_WIDTH };
          if (utilityPinned) style.insetInlineStart = `${utilityKeys.indexOf(key) * UTILITY_COLUMN_WIDTH}px`;
          const pinnedCls = utilityPinned ? ` ${baseClass}__cell--pinned ${baseClass}__cell--pinned-start` : '';
          return <td key={key} className={`ds-table__cell ${baseClass}__utility${pinnedCls}`} style={style} />;
        })}
        {visibleKeys.map((key) => {
          const col = byKey.get(key)!;
          const pick = totalPick(col);
          const values = sortedRows.map((row) => row.values[key]);
          const text =
            pick === 'none'
              ? ''
              : typeof col.aggregate === 'function' && !totalsState[key]
                ? col.aggregate(values, sortedRows)
                : resultText(col, calculate(pick, values));
          const offered = TOTALS.filter((total) => !NUMERIC_TOTALS.has(total) || numericColumn(col));
          return (
            <td
              key={key}
              className={`ds-table__cell${pinClass(key)}`}
              style={layoutReady || regionOf(key) !== 'center' ? cellStyle(key) : undefined}
            >
              <div className="ds-table__cell-content" style={{ justifyContent: justify(col.align) }}>
                <DropdownMenu
                  size="compact"
                  align={col.align === 'right' ? 'end' : 'start'}
                  items={offered.map((total) => ({
                    label: labels.totals[total],
                    selected: total === pick,
                    onClick: () => setTotals({ ...totalsState, [key]: total }),
                  }))}
                  trigger={
                    <button
                      type="button"
                      className={`${baseClass}__total${pick === 'none' ? ` ${baseClass}__total--empty` : ''}`}
                      aria-label={
                        pick === 'none'
                          ? labels.totalsMenu(headerText(col))
                          : labels.totalsValue(headerText(col), labels.totals[pick], String(text ?? ''))
                      }
                      tabIndex={0}
                    >
                      {pick === 'none' ? (
                        <span className={`${baseClass}__total-name`}>{labels.calculate}</span>
                      ) : (
                        <>
                          <span className={`${baseClass}__total-name`}>{labels.totals[pick]}</span>
                          <span className={`${baseClass}__total-value`}>{text}</span>
                        </>
                      )}
                    </button>
                  }
                />
              </div>
            </td>
          );
        })}
        {layoutReady && <td className={`ds-table__cell ${baseClass}__filler`} role="presentation" aria-hidden="true" />}
        {showActions && (
          <td
            className={`ds-table__cell ${baseClass}__actions ${baseClass}__cell--pinned ${baseClass}__cell--pinned-end${actionsEdge}`}
            style={{ width: actionsWidth, insetInlineEnd: 0 }}
          />
        )}
      </tr>
    </tfoot>
  );

  /* Every column a row draws, for a cell that spans them all. */
  const columnCount = utilityKeys.length + visibleKeys.length + (layoutReady ? 1 : 0) + (showActions ? 1 : 0);

  type Slot = { index: number; measure: (node: Element | null) => void };
  const bodyRow = (row: R, slot?: Slot, part: 'both' | 'record' | 'detail' = 'both') => {
    const isSelected = selectable && currentSelection.includes(row.id);
    const name = rowName(row);
    const expandedHere = Boolean(renderDetail) && expandedState.includes(row.id);
    const detailId = `${tableId}-detail-${row.id}`;
    const record = (
      <tr
        key={row.id}
        data-row={row.id}
        ref={slot && part === 'record' ? slot.measure : undefined}
        data-index={slot && part === 'record' ? slot.index : undefined}
        aria-rowindex={slot && part === 'record' ? slot.index + 2 : undefined}
        role={stacked ? 'row' : undefined}
        className={[
          'ds-table__row',
          isSelected ? 'ds-table__row--selected' : '',
          editMode === 'row' && editing?.row === row.id ? `${baseClass}__row--editing` : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-selected={gridMode && selectable ? isSelected : undefined}
      >
        {utilityKeys.map((key) => {
          // A card sizes the checkbox to itself, beside the title.
          const style: React.CSSProperties = stacked ? {} : { width: UTILITY_COLUMN_WIDTH };
          if (utilityPinned) style.insetInlineStart = `${utilityKeys.indexOf(key) * UTILITY_COLUMN_WIDTH}px`;
          const pinnedCls = utilityPinned ? ` ${baseClass}__cell--pinned ${baseClass}__cell--pinned-start` : '';
          return (
            <td
              key={key}
              data-col={key}
              role={stacked && !gridMode ? 'cell' : undefined}
              className={`ds-table__cell ${baseClass}__utility${pinnedCls}`}
              style={style}
              {...tabProps(row.id, key)}
            >
              <div className="ds-table__cell-content">
                {key === 'ds-data-table-grip' ? (
                  <button
                    type="button"
                    className={`${baseClass}__grip material-symbols-rounded`}
                    aria-label={labels.rowGrip(name)}
                    aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
                    aria-disabled={sortOwnsOrder || undefined}
                    tabIndex={innerTab}
                    onPointerDown={(event) => startRowDrag(event, row.id)}
                    onKeyDown={(event) => {
                      if (gridMode || !event.altKey || sortOwnsOrder) return;
                      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                      event.preventDefault();
                      const at = visibleRows.findIndex((r) => r.id === row.id);
                      moveRow(row.id, at + (event.key === 'ArrowDown' ? 1 : -1));
                    }}
                  >
                    drag_indicator
                  </button>
                ) : key === 'ds-data-table-expand' ? (
                  <button
                    type="button"
                    className={`${baseClass}__expand`}
                    aria-expanded={expandedHere}
                    aria-controls={expandedHere ? detailId : undefined}
                    aria-label={labels.toggleDetails(name, expandedHere)}
                    onClick={() => toggleDetail(row.id)}
                    tabIndex={innerTab}
                    data-cell-control=""
                  >
                    <span className={`${baseClass}__expand-chevron material-symbols-rounded`} aria-hidden="true">
                      chevron_right
                    </span>
                  </button>
                ) : (
                  <Checkbox
                    size="compact"
                    checked={isSelected}
                    onCheckedChange={(checked) => toggleRow(row.id, checked)}
                    aria-label={selectRowLabel(row)}
                    tabIndex={innerTab}
                    data-cell-control=""
                  />
                )}
              </div>
            </td>
          );
        })}
        {visibleKeys.map((key) => {
          const col = byKey.get(key)!;
          const Cell = col.rowHeader ? 'th' : 'td';
          const kind = kindOf(col);
          const editable = canEdit(col, row);
          const editingHere =
            editing?.row === row.id && (editMode === 'row' ? key in editing.draft : editing.key === key);
          const failure = failed[cellId(row.id, key)];
          const isPending = Boolean(pending[row.id] && key in pending[row.id]);
          const fieldLabel = labels.editField(headerText(col), name);
          const cellClass = [
            'ds-table__cell',
            col.rowHeader ? 'ds-table__cell--row-header' : '',
            editingHere ? `${baseClass}__cell--editing` : '',
            editMode === 'cell' && editable && !isLive(col) ? `${baseClass}__cell--editable` : '',
            isPending ? `${baseClass}__cell--pending` : '',
            failure ? `${baseClass}__cell--failed` : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <Cell
              key={key}
              data-col={key}
              scope={col.rowHeader ? 'row' : undefined}
              role={stacked && !gridMode ? (col.rowHeader ? 'rowheader' : 'cell') : undefined}
              className={`${cellClass}${pinClass(key)}`}
              style={layoutReady || regionOf(key) !== 'center' ? cellStyle(key) : undefined}
              aria-busy={isPending || undefined}
              title={failure}
              onDoubleClick={editable && !isLive(col) && !editing ? () => startEdit(row.id, key) : undefined}
              {...tabProps(row.id, key)}
            >
              {stacked && !col.rowHeader && (
                <span className={`${baseClass}__stack-label`} aria-hidden="true">
                  {col.header}
                </span>
              )}
              <div
                className="ds-table__cell-content"
                style={{ justifyContent: stacked ? undefined : justify(col.align) }}
              >
                {(() => {
                  const fit = col.cellText ?? cellText;
                  const value = valueOf(row, key);
                  const raw = value;
                  if (kind === 'checkbox')
                    return (
                      <Checkbox
                        size="compact"
                        checked={Boolean(value)}
                        disabled={!editable}
                        onCheckedChange={(checked) => save(row, { [key]: checked })}
                        aria-label={fieldLabel}
                        tabIndex={innerTab}
                        data-cell-control=""
                      />
                    );
                  if (kind === 'switch')
                    return (
                      <ToggleSwitch
                        size="compact"
                        checked={Boolean(value)}
                        disabled={!editable}
                        onCheckedChange={(checked) => save(row, { [key]: checked })}
                        label={fieldLabel}
                        showLabel={false}
                        tabIndex={innerTab}
                        data-cell-control=""
                      />
                    );
                  const content = col.render ? (
                    col.render(rowView(row))
                  ) : col.type ? (
                    <TypedCell
                      type={col.type}
                      value={raw}
                      format={col.format}
                      options={col.options}
                      words={typedWords}
                      link={linkEl}
                    />
                  ) : (
                    displayOf(col, raw)
                  );
                  if (fit === 'wrap') return content;
                  return (
                    <span
                      className={`${baseClass}__text ${baseClass}__text--${fit}`}
                      title={
                        fit === 'truncate' || fit === 'lines-2'
                          ? raw == null
                            ? undefined
                            : col.type
                              ? typedText(col.type, raw, col.format, optionLabel(col), typedWords) || undefined
                              : String(displayOf(col, raw))
                          : undefined
                      }
                    >
                      {content}
                    </span>
                  );
                })()}
              </div>
              {editMode === 'cell' && editable && !isLive(col) && !editingHere && (
                <CircularButton
                  className={`${baseClass}__edit-hint${col.align === 'right' ? ` ${baseClass}__edit-hint--start` : ''}`}
                  icon="edit"
                  variant="tertiary"
                  size="compact"
                  ariaLabel={labels.editCell(headerText(col), name)}
                  tooltip={false}
                  tabIndex={-1}
                  onClick={() => startEdit(row.id, key)}
                />
              )}
              {editingHere && editing && (
                <EditorHost
                  kind={kind ?? 'text'}
                  error={editing.errors[key]}
                  replaced={editing.replaced}
                  autoFocus={
                    editMode === 'cell' ||
                    key === (editing.key && editing.key in editing.draft ? editing.key : Object.keys(editing.draft)[0])
                  }
                  onKeyDown={(event) => onEditorKeyDown(event, kind)}
                  onBlur={onEditorBlur}
                >
                  {typeof col.editor === 'function'
                    ? col.editor({
                        value: editing.draft[key],
                        setValue: (value) => setDraft(key, value),
                        commit: (value) =>
                          editMode === 'row'
                            ? value !== undefined && setDraft(key, value)
                            : commitEdit('stay', value === undefined ? undefined : { key, value }),
                        cancel: cancelEdit,
                        row,
                        size: 'compact',
                        label: fieldLabel,
                        error: editing.errors[key],
                      })
                    : kind &&
                      kind !== 'checkbox' &&
                      kind !== 'switch' && (
                        <CellEditor
                          kind={kind}
                          value={editing.draft[key]}
                          label={fieldLabel}
                          options={col.options}
                          error={Boolean(editing.errors[key])}
                          open={editMode === 'cell'}
                          onValueChange={(value) => setDraft(key, value)}
                          onChoose={(value) =>
                            editMode === 'cell' ? commitEdit('stay', { key, value }) : setDraft(key, value)
                          }
                        />
                      )}
                </EditorHost>
              )}
            </Cell>
          );
        })}
        {layoutReady && <td className={`ds-table__cell ${baseClass}__filler`} role="presentation" aria-hidden="true" />}
        {showActions && (
          <td
            data-col="ds-data-table-actions"
            className={`ds-table__cell ${baseClass}__actions ${baseClass}__cell--pinned ${baseClass}__cell--pinned-end${actionsEdge}`}
            style={stacked ? undefined : { width: actionsWidth, insetInlineEnd: 0 }}
            {...tabProps(row.id, 'ds-data-table-actions')}
          >
            <div className={`ds-table__cell-content ${baseClass}__actions-row`}>
              {editMode === 'row' && editing?.row === row.id ? (
                <>
                  <CircularButton
                    className={`${baseClass}__save`}
                    icon="check"
                    variant="tertiary"
                    size="compact"
                    ariaLabel={labels.saveRow(name)}
                    tooltip={labels.saveRow(name)}
                    tooltipPosition="left"
                    onClick={() => commitEdit('stay')}
                    tabIndex={innerTab}
                  />
                  <CircularButton
                    className={`${baseClass}__cancel`}
                    icon="close"
                    variant="tertiary"
                    size="compact"
                    ariaLabel={labels.cancelRow(name)}
                    tooltip={labels.cancelRow(name)}
                    tooltipPosition="left"
                    onClick={cancelEdit}
                    tabIndex={innerTab}
                  />
                </>
              ) : (
                editMode === 'row' &&
                visibleKeys.some((k) => canEdit(byKey.get(k), row) && !isLive(byKey.get(k))) && (
                  <CircularButton
                    className={`${baseClass}__inline-action`}
                    icon="edit"
                    variant="tertiary"
                    size="compact"
                    ariaLabel={labels.editRow(name)}
                    tooltip={labels.editRow(name)}
                    tooltipPosition="left"
                    disabled={editing !== null}
                    onClick={() => startEdit(row.id)}
                    tabIndex={innerTab}
                  />
                )
              )}
              {!(editMode === 'row' && editing?.row === row.id) &&
                actionsFor(row)
                  .filter((action) => action.inline)
                  .map((action) => (
                    <CircularButton
                      key={action.id}
                      className={`${baseClass}__inline-action`}
                      icon={action.icon ?? 'bolt'}
                      variant="tertiary"
                      size="compact"
                      ariaLabel={action.label}
                      tooltip={action.label}
                      tooltipPosition="left"
                      disabled={action.disabled}
                      onClick={action.onSelect}
                      tabIndex={innerTab}
                    />
                  ))}
              {!(editMode === 'row' && editing?.row === row.id) && actionsFor(row).some((action) => !action.inline) && (
                <DropdownMenu
                  size="compact"
                  align="end"
                  items={actionsFor(row)
                    .filter((action) => !action.inline)
                    .map((action) => ({
                      label: action.label,
                      icon: action.icon,
                      destructive: action.destructive,
                      disabled: action.disabled,
                      onClick: action.onSelect,
                    }))}
                  trigger={
                    <CircularButton
                      icon="more_horiz"
                      variant="tertiary"
                      size="compact"
                      tooltip={false}
                      ariaLabel={labels.moreActions(name)}
                      tabIndex={innerTab}
                    />
                  }
                />
              )}
            </div>
          </td>
        )}
      </tr>
    );
    if (part === 'record' || !expandedHere) return record;
    /* The details: one cell across every column, its panel as wide as the
       visible table and held to its start edge, so it stays in view while
       the columns scroll sideways. Rendered only while open. */
    const details = (
      <tr
        key={`${row.id}:detail`}
        className={`ds-table__row ${baseClass}__detail-row`}
        data-detail-for={row.id}
        ref={slot ? slot.measure : undefined}
        data-index={slot?.index}
        aria-rowindex={slot ? slot.index + 2 : undefined}
      >
        <td id={detailId} colSpan={columnCount} className={`ds-table__cell ${baseClass}__detail-cell`}>
          <div
            className={`${baseClass}__detail`}
            style={tableWidth && !stacked ? { width: tableWidth - 2 * UTILITY_BORDER } : undefined}
          >
            <div className={`${baseClass}__detail-body`}>{renderDetail!(row)}</div>
          </div>
        </td>
      </tr>
    );
    if (part === 'detail') return details;
    return (
      <React.Fragment key={row.id}>
        {record}
        {details}
      </React.Fragment>
    );
  };

  /* The loading row: the next batch on its way, across the table. */
  const loadWords = {
    errorTitle: "Couldn't load the rows",
    retry: 'Try again',
    loading: 'Loading rows',
    loadingMore: 'Loading more',
    ...loadLabels,
  };

  const loadingRow = (
    <tr ref={loadingRef} className={`ds-table__row ${baseClass}__loading-row`}>
      <td colSpan={columnCount} className={`ds-table__cell ${baseClass}__loading-cell`}>
        <div className={`${baseClass}__loading`} role="status">
          <Spinner size="sm" tone="neutral" />
          <span>{loadWords.loadingMore}</span>
        </div>
      </td>
    </tr>
  );

  /* Loading and failed loads. A first load draws skeleton rows under the
     real header; a refetch keeps the rows on screen, dimmed and inert,
     under a thin progress line; a failure with nothing on screen takes the
     body, and one over rows already shown is a Banner above them. */
  const firstLoad = loading && rows.length === 0 && !error;
  const refreshing = loading && rows.length > 0;
  const retryButton = onRetry && (
    <Button variant="secondary" tone="neutral" size="compact" iconLeft="refresh" label={loadWords.retry} onClick={onRetry} />
  );
  const skeletonRows = Array.from({ length: pageSize ?? 5 }, (_, index) => (
    <tr key={index} className={`ds-table__row ${baseClass}__skeleton-row`} aria-hidden="true">
      {utilityKeys.map((key) => (
        <td key={key} className="ds-table__cell" />
      ))}
      {visibleKeys.map((key) => (
        <td key={key} className="ds-table__cell">
          <div className={`${baseClass}__skeleton`}>
            <Skeleton variant="text" />
          </div>
        </td>
      ))}
      {layoutReady && <td className={`ds-table__cell ${baseClass}__filler`} />}
      {showActions && <td className="ds-table__cell" />}
    </tr>
  ));

  const hasChrome = searchable || Boolean(toolbar);
  const classes = [baseClass, refreshing ? `${baseClass}--refreshing` : '', className].filter(Boolean).join(' ');
  const tableClasses = [
    'ds-table',
    `ds-table--${size}`,
    striped ? 'ds-table--striped' : '',
    'ds-table--bordered',
    columnDividers ? 'ds-table--column-dividers' : '',
    layoutReady ? `${baseClass}__grid--fixed` : '',
    stickyHeader || virtual ? `${baseClass}__grid--sticky` : '',
    stacked ? `${baseClass}__grid--stacked` : '',
    showActions && rowActionsVisibility === 'hover' ? `${baseClass}__grid--actions-hover` : '',
  ]
    .filter(Boolean)
    .join(' ');
  // A virtualised table scrolls its rows inside its frame, so it always has a height to scroll in.
  const frameMax = maxHeight ?? (virtual ? VIRTUAL_HEIGHT : undefined);
  const frameStyle: React.CSSProperties | undefined =
    frameMax !== undefined ? { maxHeight: typeof frameMax === 'number' ? `${frameMax}px` : frameMax } : undefined;

  return (
    <TableContext.Provider value={tableContext}>
      <div {...rest} ref={setRootRef} className={classes}>
        <span className="ds-visually-hidden" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
        {/* Failed saves only: a value that rolled back must be heard now. */}
        <span className="ds-visually-hidden" aria-live="assertive" aria-atomic="true">
          {alertMessage}
        </span>
        {hasChrome && (
          <div className={`${baseClass}__toolbar`}>
            {toolbar && <div className={`${baseClass}__filters`}>{toolbar}</div>}
            {searchable && (
              <Input
                className={`${baseClass}__search`}
                size={size}
                iconLeft="search"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                value={search}
                onValueChange={(value: string) => {
                  setSearch(value);
                  setPage(1);
                }}
              />
            )}
          </div>
        )}

        {error && rows.length > 0 && (
          <Banner variant="error" title={loadWords.errorTitle} action={retryButton || undefined} className={`${baseClass}__banner`}>
            {error}
          </Banner>
        )}
        {firstLoad && (
          <span className="ds-visually-hidden" role="status">
            {loadWords.loading}
          </span>
        )}
        {visibleRows.length > 0 || firstLoad ? (
          <ScrollRegion className={`ds-table__wrapper ${baseClass}__frame`} style={frameStyle} onNode={setFrameEl}>
            {refreshing && <div className={`${baseClass}__progress`} role="progressbar" aria-label={loadWords.loading} />}
            <table
              ref={setTableEl}
              aria-busy={loading || undefined}
              className={tableClasses}
              // A card layout changes how the table displays, which strips its semantics in some browsers, so it states them.
              role={gridMode ? 'grid' : stacked ? 'table' : undefined}
              aria-rowcount={virtual ? virtualItems.length + 1 : undefined}
              aria-multiselectable={gridMode && selectable ? true : undefined}
              style={
                {
                  ...(layoutReady ? layoutVars(widthsState) : {}),
                  ...(showActions ? { '--ds-dt-actions': actionsCount } : {}),
                } as React.CSSProperties
              }
              onKeyDown={onGridKeyDown}
            >
              {caption && <caption className="ds-table__caption ds-visually-hidden">{caption}</caption>}
              <thead className={stacked ? 'ds-table__head ds-visually-hidden' : 'ds-table__head'}>
                <tr className="ds-table__row ds-table__row--header">
                  {utilityKeys.map(utilityHeader)}
                  {visibleKeys.map(header)}
                  {layoutReady && (
                    <th
                      className={`ds-table__header-cell ${baseClass}__filler`}
                      role="presentation"
                      aria-hidden="true"
                    />
                  )}
                  {showActions && (
                    <th
                      data-col="ds-data-table-actions"
                      scope="col"
                      className={`ds-table__header-cell ${baseClass}__actions ${baseClass}__cell--pinned ${baseClass}__cell--pinned-end${actionsEdge}`}
                      style={{ width: actionsWidth, insetInlineEnd: 0 }}
                      {...tabProps('header', 'ds-data-table-actions')}
                    >
                      <span className="ds-visually-hidden">{labels.actionsColumn}</span>
                    </th>
                  )}
                </tr>
              </thead>
              {firstLoad ? (
                <tbody className="ds-table__body">{skeletonRows}</tbody>
              ) : groups ? (
                groups
                  .map((group) => ({ group, onPage: group.rows.filter((row) => pageRows.includes(row)) }))
                  .filter(({ onPage }) => onPage.length > 0)
                  .map(({ group, onPage }) => (
                    <tbody
                      key={group.key}
                      className={`ds-table__body ${baseClass}__group`}
                      data-collapsed={collapsedGroups.includes(group.key) || undefined}
                    >
                      {groupRow(group)}
                      {!collapsedGroups.includes(group.key) && onPage.map((row) => bodyRow(row))}
                    </tbody>
                  ))
              ) : virtual ? (
                <tbody className="ds-table__body">
                  <VirtualRows
                    count={virtualItems.length}
                    itemKey={(index) => `${virtualItems[index]?.row.id}:${virtualItems[index]?.part}`}
                    estimate={ESTIMATED_ROW_HEIGHT[size]}
                    overscan={VIRTUAL_OVERSCAN}
                    frame={frameEl}
                    frameHeight={frameHeight}
                    columnCount={columnCount}
                    onScroller={setScroller}
                    renderItem={(index, measure) => {
                      const entry = virtualItems[index];
                      return bodyRow(entry.row, { index, measure }, entry.part);
                    }}
                  />
                  {hasMore && loadingRow}
                </tbody>
              ) : (
                <tbody className="ds-table__body">
                  {visibleRows.map((row) => bodyRow(row))}
                  {hasMore && loadingRow}
                </tbody>
              )}
              {totalsRow && !stacked && totalsFooter()}
            </table>
            <div ref={guideRef} className={`${baseClass}__guide`} hidden aria-hidden="true" />
            <div ref={dropRef} className={`${baseClass}__drop`} hidden aria-hidden="true" />
          </ScrollRegion>
        ) : error ? (
          <EmptyState
            icon="error"
            title={loadWords.errorTitle}
            description={error}
            action={retryButton || undefined}
            variant="bordered"
            size="compact"
            role="alert"
          />
        ) : (
          (emptyState ?? (
            <EmptyState
              icon="search_off"
              title={emptyStateLabels?.title ?? 'No matching rows'}
              description={emptyStateLabels?.description ?? 'Adjust the search or filters and try again.'}
              variant="bordered"
              size="compact"
            />
          ))
        )}

        {(pageSize !== undefined || selectable) && (
          <div className={`${baseClass}__footer`}>
            <span className={`${baseClass}__count`}>
              {firstLoad
                ? null
                : selectable && currentSelection.length > 0 && !selectionClaimed
                ? selectedLabel(allMatching ? matchCount - exceptIds.length : currentSelection.length)
                : countClaimed
                  ? null
                  : resultsLabel(matchCount)}
            </span>
            {pageSize !== undefined && (pageCount > 1 || (pageSizeOptions?.length ?? 0) > 0) && (
              <div className={`${baseClass}__paging`}>
                {pageSizeOptions && pageSizeOptions.length > 0 && (
                  <span className={`${baseClass}__page-size`}>
                    <span className={`${baseClass}__page-size-label`} aria-hidden="true">
                      {pageSizeLabel}
                    </span>
                    <Dropdown
                      size="compact"
                      aria-label={pageSizeLabel}
                      options={[...new Set([...pageSizeOptions, pageSize])]
                        .sort((a, b) => a - b)
                        .map((option) => ({ value: String(option), label: String(option) }))}
                      value={String(pageSize)}
                      onValueChange={(next) => {
                        setPageSize(Number(next));
                        setPage(1);
                      }}
                    />
                  </span>
                )}
                {pageCount > 1 && (
                  <Pagination
                    {...paginationLabels}
                    page={clampedPage}
                    pageCount={pageCount}
                    onPageChange={goToPage}
                    // A phone's width cannot hold the numbered pages, so a narrow table reads "Page X of Y".
                    size={narrow ? 'compact' : size}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </TableContext.Provider>
  );
}

/**
 * A stored view made safe for a table's columns as they are now: columns
 * that no longer exist drop out of every part of it, a filter whose
 * condition no longer fits its column's type is dropped, new columns join
 * the end of the column order, and widths clamp to each column's limits.
 * DataTable runs it on every view it applies; run it yourself on a view
 * read from storage before showing it anywhere else.
 */
// eslint-disable-next-line react-refresh/only-export-components -- a view helper the table's API carries
export function reconcileDataTableView<R extends DataTableRow = DataTableRow>(
  view: DataTableView,
  columns: DataTableColumn<R>[],
): DataTableView {
  return reconcileView(
    view,
    columns.map((col) => ({
      key: col.key,
      filterKind: col.type ? TYPE_DEFAULTS[col.type].filter : undefined,
      minWidth: col.minWidth,
      maxWidth: col.maxWidth,
      groupable: col.groupable,
      sortable: col.sortable,
    })),
  );
}
