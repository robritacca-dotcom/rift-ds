'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Table, type TableColumn, type TableRow } from '../Table/Table';
import { Pagination, type PaginationProps } from '../Pagination/Pagination';
import { Checkbox } from '../Checkbox/Checkbox';
import { Input } from '../Input/Input';
import { EmptyState, type EmptyStateProps } from '../EmptyState/EmptyState';
import { MOTION_ANNOUNCE_DEBOUNCE_MS } from '../../tokens/motion';
import '../../behaviors/visually-hidden.css';
import './DataTable.css';
import '../../fonts/material-symbols.css';

export interface DataTableColumn {
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
  render?: (row: DataTableRow) => React.ReactNode;
  /** Whether this column names each row: its cells render as row headers, and its value names the row's checkbox ("Select Ada Lovelace"). One column per table. */
  rowHeader?: boolean;
}

export interface DataTableRow {
  /** Unique row identifier. */
  id: string;
  /** Raw values keyed by column key — used for sorting, searching, and default rendering. */
  values: Record<string, string | number | null | undefined>;
}

export interface DataTableSort {
  /** The column being sorted. */
  key: string;
  /** Sort direction. */
  direction: 'asc' | 'desc';
}

/** Compare two raw values: numbers numerically, everything else as text. */
const compareValues = (
  a: string | number | null | undefined,
  b: string | number | null | undefined,
): number => {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
};

/** Props owned by DataTable itself — everything else falls through to the root element. */
type DataTableOwnProps = {
  /** Column definitions. */
  columns: DataTableColumn[];
  /** Row data, as raw values the table can sort and search. */
  rows: DataTableRow[];
  /** Rows per page. Setting this turns on the built-in pagination. */
  pageSize?: number;
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
  /** Shows the built-in search field, matching against every column's raw value. */
  searchable?: boolean;
  /** Placeholder for the search field. */
  searchPlaceholder?: string;
  /** Slot beside the search field for consumer-owned filter controls. */
  toolbar?: React.ReactNode;
  /** Visual size, passed through to the underlying Table. */
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
  selectRowLabel?: (row: DataTableRow) => string;
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
  /** Announced when the page changes, given the page, the page count, the first and last row shown and the total. Defaults to "Page 2 of 7, rows 21 to 40 of 140". */
  pageAnnouncement?: (page: number, pageCount: number, first: number, last: number, total: number) => string;
  /** Footer count of the rows that match, given the count. Defaults to "1 result" or "N results". */
  resultsLabel?: (count: number) => string;
  /** Footer count shown instead of the results while rows are selected, given the count. Defaults to "N selected". */
  selectedLabel?: (count: number) => string;
  /**
   * The built-in pager's words, merged over its English defaults: the arrows'
   * names ("Previous page", "Next page"), the readout ("Page 2 of 4") and the
   * landmark's name ("Pagination"). The pager is always the compact size, so
   * its numbered-page names never render and are not offered here.
   */
  paginationLabels?: Pick<PaginationProps, 'previousLabel' | 'nextLabel' | 'readoutLabel' | 'aria-label'>;
  /**
   * The built-in empty state's words, merged over its English defaults
   * ("No matching rows", "Adjust the search or filters and try again.").
   * Ignored when `emptyState` replaces the whole node.
   */
  emptyStateLabels?: Partial<Pick<EmptyStateProps, 'title' | 'description'>>;
  /** Additional CSS classes */
  className?: string;
};

export interface DataTableProps
  extends DataTableOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof DataTableOwnProps> {}

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
 */
export const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  (
    {
      columns,
      rows,
      pageSize,
      selectable = false,
      selectedIds,
      defaultSelectedIds,
      onSelectionChange,
      sort,
      defaultSort,
      onSortChange,
      searchable = false,
      searchPlaceholder = 'Search',
      toolbar,
      size = 'default',
      striped = false,
      caption,
      emptyState,
      selectAllLabel = 'Select all rows on this page',
      selectRowLabel = (row: DataTableRow) => {
        const nameKey = (columns.find((col) => col.rowHeader) ?? columns[0])?.key;
        const name = nameKey === undefined ? undefined : row.values[nameKey];
        return name == null || name === '' ? `Select row ${row.id}` : `Select ${name}`;
      },
      sortLabel = (header: string) => header,
      sortAnnouncement = (header: string, direction: DataTableSort['direction'] | null) =>
        direction === null
          ? 'Sort cleared'
          : `Sorted by ${header}, ${direction === 'asc' ? 'ascending' : 'descending'}`,
      pageAnnouncement = (page: number, pageCount: number, first: number, last: number, total: number) =>
        `Page ${page} of ${pageCount}, rows ${first} to ${last} of ${total}`,
      resultsLabel = (count: number) => `${count} result${count === 1 ? '' : 's'}`,
      selectedLabel = (count: number) => `${count} selected`,
      paginationLabels,
      emptyStateLabels,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-data-table';

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    /* One polite channel for what changes without moving focus: a sort, the
       result count while searching (debounced, so typing speaks once), a
       page change, select-all. It is mounted empty and stays mounted, since
       a region that arrives already holding text is often not read. */
    const [announcement, setAnnouncement] = useState('');
    const announceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const announce = (message: string, debounced = false) => {
      clearTimeout(announceTimer.current);
      if (debounced) {
        announceTimer.current = setTimeout(() => setAnnouncement(message), MOTION_ANNOUNCE_DEBOUNCE_MS);
      } else {
        setAnnouncement(message);
      }
    };
    useEffect(() => () => clearTimeout(announceTimer.current), []);

    const isSortControlled = sort !== undefined;
    const [uncontrolledSort, setUncontrolledSort] = useState<DataTableSort | null>(
      defaultSort ?? null,
    );
    const currentSort = isSortControlled ? sort : uncontrolledSort;

    const isSelectionControlled = selectedIds !== undefined;
    const [uncontrolledSelection, setUncontrolledSelection] = useState<string[]>(
      defaultSelectedIds ?? [],
    );
    const currentSelection = isSelectionControlled ? selectedIds : uncontrolledSelection;

    const setSelection = (ids: string[]) => {
      if (!isSelectionControlled) setUncontrolledSelection(ids);
      onSelectionChange?.(ids);
    };

    const cycleSort = (key: string) => {
      let next: DataTableSort | null;
      if (currentSort?.key !== key) next = { key, direction: 'asc' };
      else if (currentSort.direction === 'asc') next = { key, direction: 'desc' };
      else next = null;
      if (!isSortControlled) setUncontrolledSort(next);
      onSortChange?.(next);
      const column = columns.find((col) => col.key === key);
      announce(
        sortAnnouncement(
          typeof column?.header === 'string' ? column.header : key,
          next?.direction ?? null,
        ),
      );
    };

    const filteredRows = useMemo(() => {
      if (!search.trim()) return rows;
      const needle = search.trim().toLowerCase();
      return rows.filter((row) =>
        Object.values(row.values).some(
          (value) => value != null && String(value).toLowerCase().includes(needle),
        ),
      );
    }, [rows, search]);

    const sortedRows = useMemo(() => {
      if (!currentSort) return filteredRows;
      const { key, direction } = currentSort;
      const factor = direction === 'asc' ? 1 : -1;
      return [...filteredRows].sort(
        (a, b) => compareValues(a.values[key], b.values[key]) * factor,
      );
    }, [filteredRows, currentSort]);

    const pageCount = pageSize ? Math.max(1, Math.ceil(sortedRows.length / pageSize)) : 1;
    const clampedPage = Math.min(page, pageCount);
    const visibleRows = pageSize
      ? sortedRows.slice((clampedPage - 1) * pageSize, clampedPage * pageSize)
      : sortedRows;

    /* The result count after a search settles. Skipped on the first render,
       which has nothing to report. */
    const searched = useRef(false);
    useEffect(() => {
      if (!searched.current) {
        searched.current = true;
        return;
      }
      announce(resultsLabel(sortedRows.length), true);
      // Announce on a new search term only; the count is read at that moment.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const goToPage = (next: number) => {
      setPage(next);
      if (!pageSize) return;
      const first = (next - 1) * pageSize + 1;
      const last = Math.min(next * pageSize, sortedRows.length);
      announce(pageAnnouncement(next, pageCount, first, last, sortedRows.length));
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
      if (currentSort?.key !== key) return 'swap_vert';
      return currentSort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
    };

    const sortDirection = (key: string): DataTableSort['direction'] | null =>
      currentSort?.key === key ? currentSort.direction : null;

    const tableColumns: TableColumn[] = [
      ...(selectable
        ? [
            {
              key: 'ds-data-table-select',
              header: (
                <Checkbox
                  size="compact"
                  checked={allVisibleSelected}
                  indeterminate={someVisibleSelected}
                  onCheckedChange={toggleAllVisible}
                  aria-label={selectAllLabel}
                />
              ),
              width: '40px',
            } satisfies TableColumn,
          ]
        : []),
      ...columns.map(
        (col) =>
          ({
            key: col.key,
            width: col.width,
            align: col.align,
            rowHeader: col.rowHeader,
            sort:
              currentSort?.key === col.key
                ? currentSort.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined,
            header: col.sortable ? (
              <button
                type="button"
                className={`${baseClass}__sort`}
                aria-label={sortLabel(typeof col.header === 'string' ? col.header : col.key, sortDirection(col.key))}
                onClick={() => cycleSort(col.key)}
              >
                <span>{col.header}</span>
                <span
                  className={[
                    `${baseClass}__sort-icon`,
                    currentSort?.key === col.key ? `${baseClass}__sort-icon--active` : '',
                    'material-symbols-rounded',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                >
                  {sortIcon(col.key)}
                </span>
              </button>
            ) : (
              col.header
            ),
          }) satisfies TableColumn,
      ),
    ];

    const tableRows: TableRow[] = visibleRows.map((row) => ({
      id: row.id,
      selected: selectable && currentSelection.includes(row.id),
      cells: {
        ...(selectable
          ? {
              'ds-data-table-select': (
                <Checkbox
                  size="compact"
                  checked={currentSelection.includes(row.id)}
                  onCheckedChange={(checked) => toggleRow(row.id, checked)}
                  aria-label={selectRowLabel(row)}
                />
              ),
            }
          : {}),
        ...Object.fromEntries(
          columns.map((col) => [col.key, col.render ? col.render(row) : row.values[col.key]]),
        ),
      },
    }));

    const hasChrome = searchable || Boolean(toolbar);
    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        <span className="ds-visually-hidden" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
        {hasChrome && (
          <div className={`${baseClass}__toolbar`}>
            {toolbar && <div className={`${baseClass}__filters`}>{toolbar}</div>}
            {searchable && (
              <Input
                className={`${baseClass}__search`}
                size="compact"
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

        {visibleRows.length > 0 ? (
          <Table
            columns={tableColumns}
            rows={tableRows}
            size={size}
            striped={striped}
            bordered
            caption={caption}
            captionHidden
          />
        ) : (
          emptyState ?? (
            <EmptyState
              icon="search_off"
              title={emptyStateLabels?.title ?? 'No matching rows'}
              description={emptyStateLabels?.description ?? 'Adjust the search or filters and try again.'}
              variant="bordered"
              size="compact"
            />
          )
        )}

        {(pageSize !== undefined || selectable) && (
          <div className={`${baseClass}__footer`}>
            <span className={`${baseClass}__count`}>
              {selectable && currentSelection.length > 0
                ? selectedLabel(currentSelection.length)
                : resultsLabel(sortedRows.length)}
            </span>
            {pageSize !== undefined && pageCount > 1 && (
              <Pagination
                {...paginationLabels}
                page={clampedPage}
                pageCount={pageCount}
                onPageChange={goToPage}
                size="compact"
              />
            )}
          </div>
        )}
      </div>
    );
  },
);

DataTable.displayName = 'DataTable';
