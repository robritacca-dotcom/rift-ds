'use client';

import React, { useMemo, useState } from 'react';
import { Table, type TableColumn, type TableRow } from '../Table/Table';
import { Pagination } from '../Pagination/Pagination';
import { Checkbox } from '../Checkbox/Checkbox';
import { Input } from '../Input/Input';
import { EmptyState } from '../EmptyState/EmptyState';
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
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-data-table';

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

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

    const visibleIds = visibleRows.map((row) => row.id);
    const selectedVisible = visibleIds.filter((id) => currentSelection.includes(id));
    const allVisibleSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length;
    const someVisibleSelected = selectedVisible.length > 0 && !allVisibleSelected;

    const toggleAllVisible = (checked: boolean) => {
      if (checked) {
        setSelection([...new Set([...currentSelection, ...visibleIds])]);
      } else {
        setSelection(currentSelection.filter((id) => !visibleIds.includes(id)));
      }
    };

    const toggleRow = (id: string, checked: boolean) => {
      if (checked) setSelection([...currentSelection, id]);
      else setSelection(currentSelection.filter((selected) => selected !== id));
    };

    const sortIcon = (key: string): string => {
      if (currentSort?.key !== key) return 'swap_vert';
      return currentSort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
    };

    const sortStateText = (key: string): string => {
      if (currentSort?.key !== key) return 'not sorted';
      return currentSort.direction === 'asc' ? 'sorted ascending' : 'sorted descending';
    };

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
                  aria-label="Select all rows on this page"
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
            header: col.sortable ? (
              <button
                type="button"
                className={`${baseClass}__sort`}
                aria-label={`Sort by ${typeof col.header === 'string' ? col.header : col.key}, ${sortStateText(col.key)}`}
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
      cells: {
        ...(selectable
          ? {
              'ds-data-table-select': (
                <Checkbox
                  size="compact"
                  checked={currentSelection.includes(row.id)}
                  onCheckedChange={(checked) => toggleRow(row.id, checked)}
                  aria-label={`Select row ${row.id}`}
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
              title="No matching rows"
              description="Adjust the search or filters and try again."
              variant="bordered"
              size="compact"
            />
          )
        )}

        {(pageSize !== undefined || selectable) && (
          <div className={`${baseClass}__footer`}>
            <span className={`${baseClass}__count`} aria-live="polite">
              {selectable && currentSelection.length > 0
                ? `${currentSelection.length} selected`
                : `${sortedRows.length} result${sortedRows.length === 1 ? '' : 's'}`}
            </span>
            {pageSize !== undefined && pageCount > 1 && (
              <Pagination
                page={clampedPage}
                pageCount={pageCount}
                onPageChange={setPage}
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
