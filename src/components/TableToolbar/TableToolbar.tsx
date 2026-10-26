'use client';

import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { Dropdown } from '../Dropdown/Dropdown';
import { CircularButton } from '../CircularButton/CircularButton';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu';
import { Input } from '../Input/Input';
import { Drawer } from '../Drawer/Drawer';
import { Popover } from '../Popover/Popover';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { Tabs } from '../Tabs/Tabs';
import { ToggleSwitch } from '../ToggleSwitch/ToggleSwitch';
import { FilterEditor } from '../DataTable/FilterEditor';
import { startDrag } from '../DataTable/dragGesture';
import { absoluteDate, parseDate } from '../DataTable/columnTypes';
import '../../behaviors/visually-hidden.css';
import {
  DEFAULT_FILTER_LABELS,
  OPERATORS,
  VALUELESS,
  isComplete,
  newFilterId,
  valueText,
  type FilterKind,
} from '../DataTable/filterModel';
import type {
  DataTableFilter as Filter,
  DataTableFilterLabels as FilterLabels,
  DataTableSort as Sort,
  DataTableView,
} from '../DataTable/DataTable';
import { useTableContext, type ToolbarColumn } from '../DataTable/tableContext';
import { BREAKPOINT_PHONE_PX, mediaBelow } from '../../tokens/breakpoints';
import './TableToolbar.css';

/** One column as a TableToolbar over some other table is told about it. */
export interface TableToolbarColumn {
  /** The column's key. */
  key: string;
  /** Its header text. */
  label: string;
  /** Its filter kind: `text`, `number`, `date`, `enum` (choices) or `tags`. Defaults to `text`, or `enum` when it has options. */
  kind?: FilterKind;
  /** The choices an `enum` or `tags` filter offers. */
  options?: { value: string; label: string }[];
  /** Whether the More panel may hide it. Defaults to true. */
  hideable?: boolean;
  /** Whether the More panel may move it. Defaults to true. */
  movable?: boolean;
  /** Whether it can be filtered. Defaults to true. */
  filterable?: boolean;
  /** Whether it can be sorted. Defaults to true. */
  sortable?: boolean;
  /** Whether the rows can be grouped by it. Defaults to false. */
  groupable?: boolean;
}

/** One saved view of the table: its name and its setup. */
export interface TableToolbarView {
  /** Stable id for the view. */
  id: string;
  /** The view's name, its tab's label. */
  name: string;
  /** The table's setup the view holds. */
  view: DataTableView;
}

/** One of the bar's own actions: its primary action, or a secondary one beside it. */
export interface TableToolbarAction {
  /** Stable id for the action. */
  id: string;
  /** What the action does, as its label (and its name and tooltip when the bar folds it to an icon). */
  label: string;
  /** Material Symbol name (string) or custom element; the folded bar's primary icon. Defaults to `add` there. */
  icon?: React.ReactNode;
  /** Runs the action. */
  onSelect: () => void;
  /** Whether the action is unavailable. */
  disabled?: boolean;
}

/** One action the bulk bar offers for the selected rows. */
export interface TableToolbarBulkAction {
  /** Stable id for the action. */
  id: string;
  /** What the action does, as its menu label. */
  label: string;
  /** Material Symbol name (string) or custom element. */
  icon?: React.ReactNode;
  /** Runs the action on the selection. */
  onSelect: (selection: TableToolbarSelection) => void;
  /** Marks a dangerous or irreversible action: drawn in the destructive colour and set apart at the bar's end. */
  destructive?: boolean;
  /** Whether the action is unavailable. */
  disabled?: boolean;
}

/**
 * What a bulk action runs on. `ids` lists every selected row. `allMatching`
 * says the selection is every row that matches the search and filters,
 * which a server can act on as a query rather than a list, leaving out
 * `except`. A table that holds every row resolves `ids` in full either way.
 */
export interface TableToolbarSelection {
  /** The selected row ids. */
  ids: string[];
  /** Whether every matching row is selected. */
  allMatching: boolean;
  /** Matching rows left out of an `allMatching` selection. */
  except: string[];
}

/** Every word the control bar shows or announces, beyond the filters', each defaulting to English. */
export interface TableToolbarLabels {
  /** The bar's accessible name. */
  toolbar: string;
  /** The search field's placeholder and name. */
  search: string;
  /** The Columns caption in the More panel, and the column list's name. */
  columns: string;
  /** The More panel's Show all button. */
  showAll: string;
  /** The density switch's name. */
  density: string;
  /** The density switch's default segment. */
  densityDefault: string;
  /** The density switch's compact segment. */
  densityCompact: string;
  /** The result count, given the rows that match and the rows in all. */
  count: (shown: number, total: number) => string;
  /** The Filter icon's name, given how many filters are on. */
  filters: (count: number) => string;
  /** The title of the filter panel when a phone opens it as a sheet. */
  filterSheet: string;
  /** The folded bar's filter panel button that adds a filter. */
  addFilter: string;
  /** The chip the filters that do not fit fold into, given how many. */
  moreFilters: (count: number) => string;
  /** The More button, whose panel holds the density switch and the columns. */
  more: string;
  /** The More panel's heading over the secondary actions it holds when the bar is folded. */
  actionsSection: string;
  /** The Sort button, given how many sorts are set. */
  sort: (count: number) => string;
  /** The view tabs' name. */
  views: string;
  /** The active view's menu button, given its name and whether the table has moved on from it (the tab's dot, said aloud). */
  viewMenu: (name: string, unsaved: boolean) => string;
  /** The view menu's items. */
  saveView: string;
  saveAsNewView: string;
  resetView: string;
  renameView: string;
  deleteView: string;
  /** The button that saves the table's setup as a new view, and a new view's name, given its number. */
  newView: string;
  newViewName: (count: number) => string;
  /** The rename field's name, and its buttons. */
  viewName: string;
  saveName: string;
  cancelRename: string;
  /** The Group button, given whether the rows are grouped. */
  group: (grouped: boolean) => string;
  /** The Group panel's column field. */
  groupBy: string;
  /** The Group panel's choice for no grouping. */
  noGrouping: string;
  /** The Group panel's buttons that close and open every group. */
  collapseAll: string;
  expandAll: string;
  /** The sort panel's button that adds a sort. */
  addSort: string;
  /** The sort panel's button that clears every sort. */
  clearSorts: string;
  /** A sort row's column field. */
  sortColumn: string;
  /** A sort row's direction switch, and its two choices. */
  sortDirection: string;
  ascending: string;
  descending: string;
  /** Removes one sort, given its column's header. */
  removeSort: (column: string) => string;
  /** Name of a sort row's move grip, given its column's header. */
  moveSort: (column: string) => string;
  /** Announced when a sort row moves, given its column, its new rank and how many sorts there are. */
  movedSort: (column: string, rank: number, count: number) => string;
  /** The bulk bar's count and its name, given how many rows are selected. */
  selected: (count: number) => string;
  /** The bulk bar's count once every matching row is selected, given how many. */
  allSelected: (count: number) => string;
  /** The bulk bar's menu of the actions that do not fit. */
  moreBulkActions: string;
  /** The bulk bar's button that selects every matching row, given how many match. */
  selectAll: (count: number) => string;
  /** The bulk bar's button that clears the selection. */
  clearSelection: string;
  /** Name of a column's move grip in the More panel, given its header. */
  moveColumn: (label: string) => string;
  /** Announced after the panel moves a column, given its header, its new position and the column count. */
  movedColumn: (label: string, position: number, count: number) => string;
}

const DEFAULT_LABELS: TableToolbarLabels = {
  toolbar: 'Table controls',
  search: 'Search',
  columns: 'Columns',
  showAll: 'Show all',
  density: 'Density',
  densityDefault: 'Default',
  densityCompact: 'Compact',
  count: (shown, total) => (shown === total ? `${total} result${total === 1 ? '' : 's'}` : `${shown} of ${total}`),
  filters: (count) => (count > 0 ? `Filters, ${count} on` : 'Filter'),
  filterSheet: 'Filters',
  addFilter: 'Add filter',
  moreFilters: (count) => `+${count}`,
  more: 'More',
  actionsSection: 'Actions',
  sort: (count) => (count > 0 ? `Sort, ${count} on` : 'Sort'),
  addSort: 'Add sort',
  views: 'Views',
  viewMenu: (name, unsaved) => `${name} options${unsaved ? ', unsaved changes' : ''}`,
  saveView: 'Save view',
  saveAsNewView: 'Save as new view',
  resetView: 'Reset to saved',
  renameView: 'Rename',
  deleteView: 'Delete view',
  newView: 'New view',
  newViewName: (count) => `View ${count}`,
  viewName: 'View name',
  saveName: 'Save',
  cancelRename: 'Cancel',
  group: (grouped) => (grouped ? 'Group, on' : 'Group'),
  groupBy: 'Group by',
  noGrouping: 'None',
  collapseAll: 'Collapse all',
  expandAll: 'Expand all',
  clearSorts: 'Clear sorts',
  sortColumn: 'Sort by',
  sortDirection: 'Direction',
  ascending: 'Ascending',
  descending: 'Descending',
  removeSort: (column) => `Remove sort by ${column}`,
  moveSort: (column) => `Move sort by ${column}`,
  movedSort: (column, rank, count) => `${column}, sort ${rank} of ${count}`,
  selected: (count) => `${count} selected`,
  allSelected: (count) => `All ${count} selected`,
  moreBulkActions: 'More actions',
  selectAll: (count) => `Select all ${count}`,
  clearSelection: 'Clear selection',
  moveColumn: (label) => `Move ${label}`,
  movedColumn: (label, position, count) => `${label} moved to position ${position} of ${count}`,
};

/** Props owned by TableToolbar itself — everything else falls through to the root element. */
type TableToolbarOwnProps = {
  /** The columns the bar filters and shows, for a bar over some other table. Inside a DataTable's `toolbar` the table's own columns are used. */
  columns?: TableToolbarColumn[];
  /** The filters, for controlled use. Inside a DataTable the table's filters are used unless this is set. */
  filters?: Filter[];
  /** Starting filters, for uncontrolled use outside a DataTable. */
  defaultFilters?: Filter[];
  /** Fires with every filter after one is added, changed or removed. */
  onFiltersChange?: (filters: Filter[]) => void;
  /** The search text, for controlled use. Inside a DataTable the table's search is used unless this is set. */
  search?: string;
  /** Starting search text, for uncontrolled use outside a DataTable. */
  defaultSearch?: string;
  /** Fires with the search text as it changes. */
  onSearchChange?: (search: string) => void;
  /** Hidden column keys, for controlled use. Inside a DataTable the table's are used unless this is set. */
  hiddenColumns?: string[];
  /** Starting hidden keys, for uncontrolled use outside a DataTable. */
  defaultHiddenColumns?: string[];
  /** Fires with every hidden key after the More panel changes one. */
  onHiddenColumnsChange?: (hidden: string[]) => void;
  /** The density the bar's controls take and its switch sets, for controlled use. Inside a DataTable the table's density is used unless this is set. */
  size?: 'default' | 'compact';
  /** Starting density, for uncontrolled use outside a DataTable. */
  defaultSize?: 'default' | 'compact';
  /** Fires when the density switch changes. */
  onSizeChange?: (size: 'default' | 'compact') => void;
  /** The result count's numbers, outside a DataTable: rows that match and rows in all. */
  count?: { shown: number; total: number };
  /** Shows the search field. Defaults to true. */
  searchable?: boolean;
  /** Shows the Filter button and the filter chips. Defaults to true. */
  filterable?: boolean;
  /** Shows the columns in the More panel. Defaults to true. */
  columnsPanel?: boolean;
  /** Shows the density switch. Defaults to true. */
  densitySwitch?: boolean;
  /** Shows the result count in the bar. Defaults to true over some other table and false inside a DataTable, whose footer carries the count; set it to move the count into the bar, and the footer leaves it out. */
  showCount?: boolean;
  /** Every column key in display order, for controlled use. Inside a DataTable the table's order is used unless this is set. */
  columnOrder?: string[];
  /** Starting column order, for uncontrolled use outside a DataTable. */
  defaultColumnOrder?: string[];
  /** Fires with the full column order after the More panel moves one. */
  onColumnOrderChange?: (order: string[]) => void;
  /** The actions for the selected rows. Inside a DataTable with `selectable`, selecting a row turns the bar, at the same height, into the bulk bar: Clear, the count, Select all N, then these, the first non-destructive one and the first destructive one labelled and the rest in a More menu. */
  bulkActions?: TableToolbarBulkAction[];
  /** Every sort, first sort first, for controlled use. Inside a DataTable the table's sorts are used unless this is set. */
  sorts?: Sort[];
  /** Initial sorts for uncontrolled use. */
  defaultSorts?: Sort[];
  /** Fires with every sort after the sort panel changes one. */
  onSortsChange?: (sorts: Sort[]) => void;
  /**
   * Saved views, shown as tabs over the bar inside a DataTable: picking one
   * applies its setup to the table, its tab shows a dot while the table no
   * longer matches it, and its menu saves, saves as new, resets, renames
   * and deletes. For controlled use; store them however you like (each
   * `view` is plain data). Pair with `onViewsChange`.
   */
  views?: TableToolbarView[];
  /** The saved views to start with, for uncontrolled use. */
  defaultViews?: TableToolbarView[];
  /** Fires with every view after one is saved, added, renamed or deleted. */
  onViewsChange?: (views: TableToolbarView[]) => void;
  /** The active view's id, for controlled use. Pair with `onActiveViewChange`. */
  activeView?: string;
  /** The view active to begin with, for uncontrolled use. Defaults to the first. */
  defaultActiveView?: string;
  /** Fires with the id of the view picked or added. */
  onActiveViewChange?: (id: string) => void;
  /** The column keys the rows are grouped by, for controlled use. Inside a DataTable the table's grouping is used unless this is set. */
  grouping?: string[];
  /** The grouping to start with, for uncontrolled use. */
  defaultGrouping?: string[];
  /** Fires with the new grouping when the Group panel changes it. */
  onGroupingChange?: (grouping: string[]) => void;
  /** Shows the Group button, whose panel picks the column the rows group by. Defaults to true; it shows when a column is `groupable`. */
  groupable?: boolean;
  /** Shows the Sort button, whose panel orders, flips and removes the sorts. Defaults to true; inside a DataTable it shows when a column sorts, and holds one sort unless the table has `multiSort`. */
  sortable?: boolean;
  /** The page's main action (New project, Invite), drawn as the primary button at the bar's end. */
  primaryAction?: TableToolbarAction;
  /** Actions beside the primary one (Export, Import), drawn as icon buttons before it, each named and tooltipped by its label; folded, they move into the More panel. */
  secondaryActions?: TableToolbarAction[];
  /** Any other controls at the bar's end, after the actions. */
  actions?: React.ReactNode;
  /** The bar's words, merged over their English defaults. */
  labels?: Partial<TableToolbarLabels>;
  /** The filters' words, merged over their English defaults (inside a DataTable, over the table's). */
  filterLabels?: Partial<FilterLabels>;
  /** Additional CSS classes */
  className?: string;
};

export interface TableToolbarProps
  extends TableToolbarOwnProps, Omit<React.ComponentPropsWithoutRef<'div'>, keyof TableToolbarOwnProps> {}

/* Whether the viewport is a phone's: the floating bulk bar answers to the
   screen, not the bar's width, since it is fixed to the screen. */
const PHONE_QUERY = mediaBelow(BREAKPOINT_PHONE_PX);
const subscribePhone = (onChange: () => void) => {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const isPhone = () => window.matchMedia(PHONE_QUERY).matches;

/**
 * A control's panel: a Popover anchored to its trigger, or on a phone
 * screen a bottom sheet (Drawer) titled with the control's name, the way
 * the playground's controls open there, since a popover holding fields
 * and their own lists is too cramped at a phone's width.
 */
function ToolbarPanel({
  sheet,
  title,
  size,
  ariaLabel,
  position,
  content,
  footer,
  onOpenChange,
  children,
}: {
  sheet: boolean;
  title: string;
  size: 'default' | 'compact';
  ariaLabel: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  content: React.ReactNode;
  /** What the sheet pins at its foot, out of the scrolling body. */
  footer?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactElement<{ onClick?: () => void; 'aria-haspopup'?: string; 'aria-expanded'?: boolean }>;
}) {
  const [open, setOpen] = useState(false);
  if (!sheet)
    return (
      <Popover size={size} ariaLabel={ariaLabel} position={position} onOpenChange={onOpenChange} content={content}>
        {children}
      </Popover>
    );
  const change = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };
  return (
    <>
      {React.cloneElement(children, { onClick: () => change(true), 'aria-haspopup': 'dialog', 'aria-expanded': open })}
      <Drawer
        open={open}
        onOpenChange={change}
        title={title}
        side="bottom"
        size="lg"
        footer={footer}
        className="ds-table-toolbar__sheet"
      >
        {content}
      </Drawer>
    </>
  );
}

/** One piece of bar state: the prop when given, else the surrounding table's, else the bar's own. */
function useBound<T>(
  value: T | undefined,
  defaultValue: T,
  onChange: ((next: T) => void) | undefined,
  table: { value: T; set: (next: T) => void } | undefined,
) {
  const [own, setOwn] = useState<T>(defaultValue);
  const current = value !== undefined ? value : table ? table.value : own;
  const set = (next: T) => {
    if (value === undefined) {
      if (table) table.set(next);
      else setOwn(next);
    }
    onChange?.(next);
  };
  return [current, set] as const;
}

/**
 * The control bar for a table: search, filters as chips, a More panel (density and columns),
 * the density switch, the result count and an actions slot, in one row that
 * wraps. Inside a DataTable (`toolbar={<TableToolbar />}`) it reads and sets
 * the table's own state with no props; over any other table its props carry
 * the same state. Its filters and a DataTable's header filters are one list,
 * so a filter set from either shows in both. Every control takes the
 * table's density.
 */
export const TableToolbar = React.forwardRef<HTMLDivElement, TableToolbarProps>(
  (
    {
      columns: columnsProp,
      filters: filtersProp,
      defaultFilters,
      onFiltersChange,
      search: searchProp,
      defaultSearch,
      onSearchChange,
      hiddenColumns: hiddenProp,
      defaultHiddenColumns,
      onHiddenColumnsChange,
      size: sizeProp,
      defaultSize,
      onSizeChange,
      count,
      searchable = true,
      filterable = true,
      sortable = true,
      groupable = true,
      views: viewsProp,
      defaultViews,
      onViewsChange,
      activeView: activeViewProp,
      defaultActiveView,
      onActiveViewChange,
      grouping: groupingProp,
      defaultGrouping,
      onGroupingChange,
      sorts: sortsProp,
      defaultSorts,
      onSortsChange,
      columnsPanel = true,
      densitySwitch = true,
      showCount: showCountProp,
      columnOrder: orderProp,
      defaultColumnOrder,
      onColumnOrderChange,
      bulkActions = [],
      primaryAction,
      secondaryActions = [],
      actions,
      labels: labelsProp,
      filterLabels: filterLabelsProp,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const table = useTableContext();
    const labels: TableToolbarLabels = { ...DEFAULT_LABELS, ...labelsProp };
    const baseFilterLabels = table?.filterLabels ?? DEFAULT_FILTER_LABELS;
    const filterLabels: FilterLabels = {
      ...baseFilterLabels,
      ...filterLabelsProp,
      operators: {
        ...baseFilterLabels.operators,
        ...filterLabelsProp?.operators,
      },
    };

    const [filters, setFilters] = useBound<Filter[]>(
      filtersProp,
      defaultFilters ?? [],
      onFiltersChange,
      table ? { value: table.filters, set: table.setFilters } : undefined,
    );
    const [search, setSearch] = useBound<string>(
      searchProp,
      defaultSearch ?? '',
      onSearchChange,
      table ? { value: table.search, set: table.setSearch } : undefined,
    );
    const [hidden, setHidden] = useBound<string[]>(
      hiddenProp,
      defaultHiddenColumns ?? [],
      onHiddenColumnsChange,
      table ? { value: table.hiddenColumns, set: table.setHiddenColumns } : undefined,
    );
    const [size, setSize] = useBound<'default' | 'compact'>(
      sizeProp,
      defaultSize ?? 'default',
      onSizeChange,
      table ? { value: table.size, set: table.setSize } : undefined,
    );

    const columns: ToolbarColumn[] =
      columnsProp?.map((col) => ({
        key: col.key,
        label: col.label,
        kind: col.kind ?? (col.options ? 'enum' : 'text'),
        options: col.options ?? [],
        hideable: col.hideable ?? true,
        movable: col.movable ?? true,
        filterable: col.filterable ?? true,
        sortable: col.sortable ?? true,
        groupable: col.groupable ?? false,
      })) ??
      table?.columns ??
      [];
    const columnOf = (key: string) => columns.find((col) => col.key === key);
    const [sorts, setSorts] = useBound<Sort[]>(
      sortsProp,
      defaultSorts ?? [],
      onSortsChange,
      table ? { value: table.sorts, set: table.setSorts } : undefined,
    );
    const sortableColumns = columns.filter((col) => col.sortable);
    const [grouping, setGrouping] = useBound<string[]>(
      groupingProp,
      defaultGrouping ?? [],
      onGroupingChange,
      table ? { value: table.grouping, set: table.setGrouping } : undefined,
    );
    const groupableColumns = columns.filter((col) => col.groupable);
    const groupedBy = grouping.find((key) => groupableColumns.some((col) => col.key === key));
    /* Over another table the bar sorts by as many columns as it is given;
       inside a DataTable, by one unless the table has multiSort. */
    const manySorts = table ? table.multiSort : true;
    const [order, setOrder] = useBound<string[]>(
      orderProp,
      defaultColumnOrder ?? [],
      onColumnOrderChange,
      table ? { value: table.columnOrder, set: table.setColumnOrder } : undefined,
    );
    /* The columns in display order: the order given, then any it leaves out. */
    const ordered = [
      ...order.map(columnOf).filter((col): col is ToolbarColumn => Boolean(col)),
      ...columns.filter((col) => !order.includes(col.key)),
    ];
    const [announcement, setAnnouncement] = useState('');
    const moveTo = (key: string, to: number) => {
      const keys = ordered.map((col) => col.key);
      const from = keys.indexOf(key);
      const target = Math.max(0, Math.min(keys.length - 1, to));
      if (from === -1 || from === target) return;
      keys.splice(from, 1);
      keys.splice(target, 0, key);
      setOrder(keys);
      setAnnouncement(labels.movedColumn(columnOf(key)?.label ?? key, target + 1, keys.length));
    };
    /* A grip drag moves the row on screen per frame and commits the order
       once, on release (the gesture rule). The drop slot is how many of the
       other rows' midpoints the dragged row's centre has passed. */
    const startListDrag = (event: React.PointerEvent<HTMLElement>, rowClass: string, drop: (slot: number) => void) => {
      const row = event.currentTarget.closest<HTMLElement>(`.${rowClass}`);
      const list = row?.parentElement;
      if (!row || !list) return;
      const rows = [...list.querySelectorAll<HTMLElement>(`:scope > .${rowClass}`)];
      const from = rows.indexOf(row);
      const boxes = rows.map((r) => r.getBoundingClientRect());
      const slot = (dy: number) => {
        const centre = boxes[from].top + boxes[from].height / 2 + dy;
        return rows.reduce((at, _r, i) => {
          if (i === from) return at;
          const mid = boxes[i].top + boxes[i].height / 2;
          return i < from ? (centre < mid ? at - 1 : at) : centre > mid ? at + 1 : at;
        }, from);
      };
      /* The drop line marks the slot the row lands in: above the row it
         takes the place of when moving up, below it when moving down. */
      const line = list.querySelector<HTMLElement>(':scope > .ds-table-toolbar__drop');
      const listTop = list.getBoundingClientRect().top;
      const showLine = (at: number) => {
        if (!line) return;
        const box = boxes[at];
        const y = at <= from ? box.top : box.bottom;
        line.style.transform = `translateY(${y - listTop}px)`;
        line.hidden = at === from;
      };
      const reset = () => {
        row.style.transform = '';
        row.removeAttribute('data-dragging');
        if (line) line.hidden = true;
      };
      startDrag(event, {
        onStart: () => row.setAttribute('data-dragging', ''),
        onFrame: (_dx, dy) => {
          row.style.transform = `translateY(${dy}px)`;
          showLine(slot(dy));
        },
        onEnd: (_dx, dy) => {
          reset();
          drop(slot(dy));
        },
        onCancel: reset,
      });
    };
    const startColumnDrag = (event: React.PointerEvent<HTMLElement>, key: string) =>
      startListDrag(event, 'ds-table-toolbar__column', (slot) => moveTo(key, slot));
    const moveSortTo = (key: string, to: number) => {
      const from = sorts.findIndex((entry) => entry.key === key);
      const target = Math.max(0, Math.min(sorts.length - 1, to));
      if (from === -1 || from === target) return;
      const next = [...sorts];
      const [moved] = next.splice(from, 1);
      next.splice(target, 0, moved);
      setSorts(next);
      setAnnouncement(labels.movedSort(columnOf(key)?.label ?? key, target + 1, next.length));
    };
    const showCount = showCountProp ?? !table;
    const claimCount = table?.claimCount;
    useEffect(() => {
      if (!claimCount || !showCount) return;
      claimCount(true);
      return () => claimCount(false);
    }, [claimCount, showCount]);
    const shown = count?.shown ?? table?.shown;
    const total = count?.total ?? table?.total;

    /* The chip whose editor is open. A filter left without a value when its
       editor closes is dropped, so an abandoned filter never lingers. */
    const [openFilter, setOpenFilter] = useState<string | null>(null);
    const closeFilter = () => {
      const open = filters.find((filter) => filter.id === openFilter);
      if (open && !isComplete(open)) setFilters(filters.filter((filter) => filter.id !== open.id));
      setOpenFilter(null);
    };
    const addFilter = (column: ToolbarColumn) => {
      const filter: Filter = {
        id: newFilterId(column.key, filters),
        column: column.key,
        operator: OPERATORS[column.kind][0],
      };
      setFilters([...filters, filter]);
      setOpenFilter(filter.id);
    };

    const chipText = (filter: Filter) => {
      const column = columnOf(filter.column);
      const choice = (value: string) => {
        // A date reads as people read it ("Jun 17, 2026"), not as it is stored.
        const date = column?.kind === 'date' ? parseDate(value) : null;
        if (date) return absoluteDate(date, undefined);
        return column?.options.find((option) => option.value === value)?.label ?? value;
      };
      // The kind's default condition goes unsaid ("Status · Active +1"); any other is named.
      // A condition with no value is the whole meaning, so it is always named ("Done · is checked").
      const isDefault =
        column && !VALUELESS.has(filter.operator) ? OPERATORS[column.kind][0] === filter.operator : false;
      return [
        column?.label ?? filter.column,
        isDefault ? '' : filterLabels.operators[filter.operator],
        valueText(filter, filterLabels, choice),
      ]
        .filter(Boolean)
        .join(' · ');
    };

    const filterableColumns = columns.filter((col) => col.filterable);
    const visibleCount = columns.filter((col) => !hidden.includes(col.key)).length;
    const activeFilters = filters.filter(isComplete).length;

    /* Narrower than a phone, the bar folds to icons: search and
       the filters each become one icon, the filters' chips moving into the
       Filter icon's panel. The bar's own width decides, not the viewport's,
       so a bar in a narrow panel folds too. */
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [narrow, setNarrow] = useState(false);
    useEffect(() => {
      const node = rootRef.current;
      if (!node) return;
      const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < BREAKPOINT_PHONE_PX));
      observer.observe(node);
      return () => observer.disconnect();
    }, []);
    /* Wide, the bar is one line: the chips that fit after search stay
       inline and the rest fold into a +N chip, which opens the same panel
       the folded bar uses. Chips past the fit are kept in the layout's flow
       out of sight (absolutely placed, inert), so every chip can be
       measured; search is counted at its floor, since it yields first. */
    const startRef = useRef<HTMLDivElement | null>(null);
    const [fit, setFit] = useState(Number.MAX_SAFE_INTEGER);
    const filterIds = filters.map((filter) => filter.id + filter.operator + JSON.stringify(filter.value)).join('|');
    useLayoutEffect(() => {
      const start = startRef.current;
      if (!start || narrow) return;
      const measure = () => {
        const style = getComputedStyle(start);
        const gap = parseFloat(style.columnGap) || 0;
        const chipEls = [...start.querySelectorAll<HTMLElement>(':scope > [data-chip]')];
        const more = start.querySelector<HTMLElement>(':scope > [data-more]');
        let used = 0;
        for (const el of [...start.children] as HTMLElement[]) {
          if (el.hasAttribute('data-chip') || el.hasAttribute('data-more')) continue;
          const width = el.classList.contains('ds-table-toolbar__search')
            ? parseFloat(getComputedStyle(el).minWidth) || el.getBoundingClientRect().width
            : el.getBoundingClientRect().width;
          used += width + gap;
        }
        const moreWidth = (more?.getBoundingClientRect().width ?? 0) + gap;
        let n = 0;
        for (let i = 0; i < chipEls.length; i += 1) {
          const width = chipEls[i].getBoundingClientRect().width + gap;
          const reserve = i < chipEls.length - 1 ? moreWidth : 0;
          if (used + width + reserve > start.clientWidth) break;
          used += width;
          n += 1;
        }
        setFit((previous) => (previous === n ? previous : n));
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(start);
      return () => observer.disconnect();
      // Measures again when the filters change what their chips say.
    }, [narrow, filterIds, size]);
    /* How many bulk actions fit beside the bulk bar's count: each measured
       at full width, the More button's room kept while any is left out. */
    const bulkRef = useRef<HTMLDivElement | null>(null);
    const [actionFit, setActionFit] = useState(Number.MAX_SAFE_INTEGER);
    const bulkOn = Boolean(table?.selectable && table.selectedIds.length > 0);
    const actionIds = bulkActions.map((action) => action.id + action.label).join('|');
    useLayoutEffect(() => {
      const bar = bulkRef.current;
      if (!bar || narrow || !bulkOn) return;
      const measure = () => {
        const gap = parseFloat(getComputedStyle(bar).columnGap) || 0;
        const start = bar.querySelector<HTMLElement>('.ds-table-toolbar__bulk-start');
        const end = bar.querySelector<HTMLElement>('.ds-table-toolbar__bulk-end');
        if (!start || !end) return;
        const endGap = parseFloat(getComputedStyle(end).columnGap) || 0;
        const room = bar.clientWidth - start.getBoundingClientRect().width - gap;
        const buttons = [...end.querySelectorAll<HTMLElement>(':scope > [data-action]')];
        // The More button is a square at the control height.
        const moreWidth = bar.getBoundingClientRect().height + endGap;
        let used = 0;
        let n = 0;
        for (let i = 0; i < buttons.length; i += 1) {
          const width = buttons[i].getBoundingClientRect().width + (i > 0 ? endGap : 0);
          const reserve = i < buttons.length - 1 ? moreWidth : 0;
          if (used + width + reserve > room) break;
          used += width;
          n += 1;
        }
        setActionFit((previous) => (previous === n ? previous : n));
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(bar);
      return () => observer.disconnect();
    }, [narrow, bulkOn, actionIds, size]);
    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    /* The bulk bar: the bar's own row, at the same height, while rows are
       selected. Every action is a full button while there is room, the
       destructive ones last; what does not fit folds into a More menu at
       the end, measured as the chips are. Folded, every action is in it. */
    const selectedCount = table?.selectable ? table.selectedIds.length : 0;
    const bulkMode = selectedCount > 0;
    /* On a phone the bulk bar floats at the bottom of the screen, above the
       safe area, where a thumb reaches it, and the bar's own row stays. */
    const phoneScreen = useSyncExternalStore(subscribePhone, isPhone, () => false);
    const floating = phoneScreen && bulkMode;
    const matching = table?.matchingIds ?? [];
    const allMatching = matching.length > 0 && matching.every((id) => table!.selectedIds.includes(id));
    const selection: TableToolbarSelection = { ids: table?.selectedIds ?? [], allMatching, except: [] };
    const orderedActions = [
      ...bulkActions.filter((action) => !action.destructive),
      ...bulkActions.filter((action) => action.destructive),
    ];
    const shownActions = narrow ? 0 : Math.min(actionFit, orderedActions.length);
    const folded = orderedActions.slice(shownActions);
    const bulkButton = (action: TableToolbarBulkAction, index: number) => {
      const out = index >= shownActions;
      return (
        <Button
          key={action.id}
          data-action=""
          className={out ? 'ds-table-toolbar__chip--overflow' : undefined}
          aria-hidden={out || undefined}
          inert={out || undefined}
          variant="secondary"
          tone={action.destructive ? 'destructive' : 'neutral'}
          size={size}
          iconLeft={action.icon}
          label={action.label}
          disabled={action.disabled}
          onClick={() => action.onSelect(selection)}
        />
      );
    };
    /* Clearing unmounts the button that had focus, so focus moves to the
       bar's search, or the bar itself. */
    const clearSelection = () => {
      table?.setSelectedIds([]);
      requestAnimationFrame(() => {
        const root = rootRef.current;
        const field = root?.querySelector<HTMLElement>('.ds-table-toolbar__search input');
        (field ?? root)?.focus();
      });
    };
    const bulkBar = bulkMode && (
      <div
        className={floating ? 'ds-table-toolbar__bulk ds-table-toolbar__bulk--floating' : 'ds-table-toolbar__bulk'}
        role="group"
        aria-label={labels.selected(selectedCount)}
        ref={bulkRef}
      >
        <div className="ds-table-toolbar__bulk-start">
          <CircularButton
            icon="close"
            variant="tertiary"
            size={size}
            ariaLabel={labels.clearSelection}
            tooltip={labels.clearSelection}
            onClick={clearSelection}
          />
          <span className="ds-table-toolbar__bulk-count" aria-live="polite">
            {allMatching && matching.length > 1 ? labels.allSelected(selectedCount) : labels.selected(selectedCount)}
          </span>
          {!allMatching && matching.length > selectedCount && (
            <Button
              variant="tertiary"
              size={size}
              label={labels.selectAll(matching.length)}
              onClick={() => table!.setSelectedIds(matching)}
            />
          )}
        </div>
        <div className="ds-table-toolbar__bulk-end">
          {!narrow && orderedActions.map(bulkButton)}
          {folded.length > 0 && (
            <DropdownMenu
              size={size}
              align="end"
              items={folded.map((action) => ({
                label: action.label,
                icon: action.icon,
                destructive: action.destructive,
                disabled: action.disabled,
                onClick: () => action.onSelect(selection),
              }))}
              trigger={
                <CircularButton
                  icon="more_horiz"
                  variant="tertiary"
                  size={size}
                  ariaLabel={labels.moreBulkActions}
                  tooltip={labels.moreBulkActions}
                />
              }
            />
          )}
        </div>
      </div>
    );

    /* Inside a DataTable, the bar's own count of the selection stands in for the footer's. */
    const claimSelection = table?.claimSelection;
    useEffect(() => {
      if (!claimSelection || !table?.selectable) return;
      claimSelection(true);
      return () => claimSelection(false);
    }, [claimSelection, table?.selectable]);

    const searchField = (
      <Input
        className="ds-table-toolbar__search"
        size={size}
        iconLeft="search"
        placeholder={labels.search}
        aria-label={labels.search}
        value={search}
        onValueChange={setSearch}
        autoFocus={narrow}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && search) {
            event.preventDefault();
            setSearch('');
          }
        }}
      />
    );

    const addFilterMenu = (trigger: React.ReactElement) => (
      <DropdownMenu
        size={size}
        items={[
          ...filterableColumns.map((col) => ({ label: col.label, onClick: () => addFilter(col) })),
          ...(filters.length > 0
            ? [
                { type: 'separator' as const },
                { label: filterLabels.clearAll, icon: 'filter_list_off', onClick: () => setFilters([]) },
              ]
            : []),
        ]}
        trigger={trigger}
      />
    );
    const filterIcon = (
      <CircularButton
        icon="filter_list"
        variant="tertiary"
        size={size}
        ariaLabel={labels.filters(activeFilters)}
        tooltip={labels.filters(activeFilters)}
      />
    );
    const updateFilter = (next: Filter) => setFilters(filters.map((f) => (f.id === next.id ? next : f)));
    const removeFilter = (id: string) => setFilters(filters.filter((f) => f.id !== id));

    /* Add filter and Clear filters: the panel's last row, or on a phone the sheet's pinned foot. */
    const filterActions = (
      <div className="ds-table-toolbar__filter-actions">
        {addFilterMenu(<Button variant="tertiary" size={size} iconLeft="add" label={labels.addFilter} />)}
        {filters.length > 0 && (
          <Button variant="tertiary" size={size} label={filterLabels.clearAll} onClick={() => setFilters([])} />
        )}
      </div>
    );
    const panelContent = (
      <div className="ds-table-toolbar__filter-panel">
        {filters.map((filter) => {
          const column = columnOf(filter.column);
          if (!column) return null;
          return (
            <div key={filter.id} className="ds-table-toolbar__filter-item">
              <div className="ds-table-toolbar__filter-head">
                <span>{column.label}</span>
                <CircularButton
                  icon="close"
                  variant="tertiary"
                  size="compact"
                  tooltip={false}
                  ariaLabel={filterLabels.remove(chipText(filter))}
                  onClick={() => removeFilter(filter.id)}
                />
              </div>
              <FilterEditor column={column} filter={filter} labels={filterLabels} size={size} onChange={updateFilter} />
            </div>
          );
        })}
        {!phoneScreen && filterActions}
      </div>
    );
    const dropIncomplete = (open: boolean) => {
      if (!open && filters.some((f) => !isComplete(f))) setFilters(filters.filter(isComplete));
    };

    /* The folded bar's filter panel: every filter edited in place under its
       column's name, then Add filter. Closing it drops a filter left without
       a value. */
    const filterPanel = (
      <span className="ds-table-toolbar__badge-host">
        <ToolbarPanel
          sheet={phoneScreen}
          title={labels.filterSheet}
          size={size}
          ariaLabel={labels.filters(activeFilters)}
          onOpenChange={dropIncomplete}
          content={panelContent}
          footer={filterActions}
        >
          {filterIcon}
        </ToolbarPanel>
        {activeFilters > 0 && (
          <span className="ds-table-toolbar__badge" aria-hidden="true">
            <Badge label={String(activeFilters)} variant="info" />
          </span>
        )}
      </span>
    );

    const chips = filters.map((filter, index) => {
      const column = columnOf(filter.column);
      if (!column) return null;
      const text = chipText(filter);
      return (
        <span
          key={filter.id}
          data-chip=""
          className={index < fit ? 'ds-table-toolbar__chip' : 'ds-table-toolbar__chip ds-table-toolbar__chip--overflow'}
          aria-hidden={index < fit ? undefined : true}
          inert={index < fit ? undefined : true}
        >
          <Popover
            size={size}
            open={openFilter === filter.id}
            onOpenChange={(open) => (open ? setOpenFilter(filter.id) : closeFilter())}
            content={
              <FilterEditor column={column} filter={filter} labels={filterLabels} size={size} onChange={updateFilter} />
            }
          >
            <Chip size={size === 'compact' ? 'default' : 'large'} label={text} onClick={() => {}} />
          </Popover>
          <CircularButton
            icon="close"
            variant="tertiary"
            size={size}
            tooltip={false}
            ariaLabel={filterLabels.remove(text)}
            onClick={() => removeFilter(filter.id)}
          />
        </span>
      );
    });

    const columnsList = columnsPanel && columns.length > 0 && (
      <div className="ds-table-toolbar__columns" role="group" aria-label={labels.columns}>
        <div className="ds-table-toolbar__drop" hidden aria-hidden="true" />
        {ordered.map((col, index) => {
          const visible = !hidden.includes(col.key);
          return (
            <div key={col.key} className="ds-table-toolbar__column">
              <button
                type="button"
                className="ds-table-toolbar__grip material-symbols-rounded"
                aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
                aria-label={labels.moveColumn(col.label)}
                aria-disabled={!col.movable || undefined}
                onPointerDown={col.movable ? (event) => startColumnDrag(event, col.key) : undefined}
                onKeyDown={(event) => {
                  if (!col.movable || !event.altKey) return;
                  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                  event.preventDefault();
                  moveTo(col.key, index + (event.key === 'ArrowDown' ? 1 : -1));
                }}
              >
                drag_indicator
              </button>
              <ToggleSwitch
                size={size}
                label={col.label}
                checked={visible}
                disabled={!col.hideable || (visible && visibleCount <= 1)}
                onCheckedChange={(checked) =>
                  setHidden(checked ? hidden.filter((key) => key !== col.key) : [...hidden, col.key])
                }
              />
            </div>
          );
        })}
        <Button
          variant="tertiary"
          size={size}
          label={labels.showAll}
          disabled={hidden.length === 0}
          onClick={() => setHidden([])}
        />
      </div>
    );

    const density = densitySwitch && (
      <SegmentedControl
        size={size}
        aria-label={labels.density}
        segments={[
          { value: 'default', label: labels.densityDefault, icon: 'density_medium' },
          { value: 'compact', label: labels.densityCompact, icon: 'density_small' },
        ]}
        value={size}
        onValueChange={(value) => setSize(value as 'default' | 'compact')}
      />
    );

    /* The sort panel: a row per sort, first sort first, each a move grip,
       its column, its direction and a remove button; then Add sort (the
       sortable columns not yet sorted) and Clear sorts. */
    const unsorted = sortableColumns.filter((col) => !sorts.some((entry) => entry.key === col.key));
    const addSortMenu = unsorted.length > 0 && (manySorts || sorts.length === 0) && (
      <DropdownMenu
        size={size}
        items={unsorted.map((col) => ({
          label: col.label,
          onClick: () => setSorts([...sorts, { key: col.key, direction: 'asc' }]),
        }))}
        trigger={<Button variant="tertiary" size={size} iconLeft="add" label={labels.addSort} />}
      />
    );
    const sortControl = sortable && sortableColumns.length > 0 && (
      <span className="ds-table-toolbar__badge-host">
        <ToolbarPanel
          sheet={phoneScreen}
          title={labels.sort(0)}
          size={size}
          ariaLabel={labels.sort(sorts.length)}
          position="bottom"
          content={
            <div className="ds-table-toolbar__sorts">
              {sorts.length > 0 && (
                <div className="ds-table-toolbar__sort-list">
                  <div className="ds-table-toolbar__drop" hidden aria-hidden="true" />
                  {sorts.map((entry, index) => {
                    const col = columnOf(entry.key);
                    const label = col?.label ?? entry.key;
                    const choices = [col, ...unsorted].filter((c): c is ToolbarColumn => Boolean(c));
                    return (
                      <div key={entry.key} className="ds-table-toolbar__sort-row">
                        {sorts.length > 1 && (
                          <button
                            type="button"
                            className="ds-table-toolbar__grip material-symbols-rounded"
                            aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
                            aria-label={labels.moveSort(label)}
                            onPointerDown={(event) =>
                              startListDrag(event, 'ds-table-toolbar__sort-row', (slot) => moveSortTo(entry.key, slot))
                            }
                            onKeyDown={(event) => {
                              if (!event.altKey) return;
                              if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                              event.preventDefault();
                              moveSortTo(entry.key, index + (event.key === 'ArrowDown' ? 1 : -1));
                            }}
                          >
                            drag_indicator
                          </button>
                        )}
                        <Dropdown
                          className="ds-table-toolbar__sort-column"
                          size={size}
                          aria-label={labels.sortColumn}
                          options={choices.map((c) => ({ value: c.key, label: c.label }))}
                          value={entry.key}
                          onValueChange={(next) =>
                            setSorts(
                              sorts.map((s) =>
                                s.key === entry.key ? { key: String(next), direction: s.direction } : s,
                              ),
                            )
                          }
                        />
                        <SegmentedControl
                          size={size}
                          aria-label={labels.sortDirection}
                          showLabels={false}
                          segments={[
                            { value: 'asc', label: labels.ascending, icon: 'arrow_upward' },
                            { value: 'desc', label: labels.descending, icon: 'arrow_downward' },
                          ]}
                          value={entry.direction}
                          onValueChange={(next) =>
                            setSorts(
                              sorts.map((s) =>
                                s.key === entry.key ? { key: s.key, direction: next as Sort['direction'] } : s,
                              ),
                            )
                          }
                        />
                        <CircularButton
                          icon="close"
                          variant="tertiary"
                          size={size}
                          tooltip={false}
                          ariaLabel={labels.removeSort(label)}
                          onClick={() => setSorts(sorts.filter((s) => s.key !== entry.key))}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              {(addSortMenu || sorts.length > 0) && (
                <div className="ds-table-toolbar__filter-actions">
                  {addSortMenu}
                  {sorts.length > 0 && (
                    <Button variant="tertiary" size={size} label={labels.clearSorts} onClick={() => setSorts([])} />
                  )}
                </div>
              )}
            </div>
          }
        >
          <CircularButton
            icon="swap_vert"
            variant="tertiary"
            size={size}
            ariaLabel={labels.sort(sorts.length)}
            tooltip={labels.sort(sorts.length)}
          />
        </ToolbarPanel>
        {/* Folded, the headers' sort marks may be out of view, so the icon carries the count. */}
        {narrow && sorts.length > 0 && (
          <span className="ds-table-toolbar__badge" aria-hidden="true">
            <Badge label={String(sorts.length)} variant="info" />
          </span>
        )}
      </span>
    );

    /* Saved views: tabs over the bar, inside a table. Picking one applies its
       setup; the active one shows a dot while the table has moved on from
       it, and its menu saves, saves as new, resets, renames and deletes. */
    const [views, setViews] = useBound<TableToolbarView[]>(viewsProp, defaultViews ?? [], onViewsChange, undefined);
    const [activeViewId, setActiveViewId] = useBound<string>(
      activeViewProp,
      defaultActiveView ?? views[0]?.id ?? '',
      onActiveViewChange,
      undefined,
    );
    const active = views.find((v) => v.id === activeViewId) ?? views[0];
    const dirty = Boolean(table && active && !table.viewMatches(active.view));
    const [renaming, setRenaming] = useState<string | null>(null);
    const commitRename = () => {
      const name = renaming?.trim();
      if (name && active) setViews(views.map((v) => (v.id === active.id ? { ...v, name } : v)));
      setRenaming(null);
    };
    const pickView = (id: string) => {
      const picked = views.find((v) => v.id === id);
      if (!picked) return;
      setActiveViewId(id);
      table?.applyView(picked.view);
    };
    const snapshot = (): DataTableView => JSON.parse(JSON.stringify(table!.view)) as DataTableView;
    const addView = () => {
      let n = views.length + 1;
      while (views.some((v) => v.name === labels.newViewName(n))) n += 1;
      let id = `view-${n}`;
      while (views.some((v) => v.id === id)) id = `${id}-x`;
      setViews([...views, { id, name: labels.newViewName(n), view: snapshot() }]);
      setActiveViewId(id);
    };
    const saveActive = () =>
      active && setViews(views.map((v) => (v.id === active.id ? { ...v, view: snapshot() } : v)));
    const deleteActive = () => {
      if (!active || views.length < 2) return;
      const rest = views.filter((v) => v.id !== active.id);
      setViews(rest);
      setActiveViewId(rest[0].id);
      table?.applyView(rest[0].view);
    };
    const viewMenu = active && (
      <DropdownMenu
        size={size}
        align="end"
        items={[
          { label: labels.saveView, icon: 'save', disabled: !dirty, onClick: saveActive },
          { label: labels.saveAsNewView, icon: 'add', onClick: addView },
          {
            label: labels.resetView,
            icon: 'restart_alt',
            disabled: !dirty,
            onClick: () => table?.applyView(active.view),
          },
          { type: 'separator' as const },
          { label: labels.renameView, icon: 'edit', onClick: () => setRenaming(active.name) },
          {
            label: labels.deleteView,
            icon: 'delete',
            destructive: true,
            disabled: views.length < 2,
            onClick: deleteActive,
          },
        ]}
        trigger={
          <CircularButton
            icon="more_horiz"
            variant="tertiary"
            size="compact"
            ariaLabel={labels.viewMenu(active.name, dirty)}
            tooltip={labels.viewMenu(active.name, dirty)}
          />
        }
      />
    );
    /* A view tab's label carries the dot while the table has moved on. */
    const viewRow = table && views.length > 0 && (
      <div className="ds-table-toolbar__views">
        {renaming !== null && active ? (
          <div className="ds-table-toolbar__rename">
            <Input
              size="compact"
              aria-label={labels.viewName}
              value={renaming}
              onValueChange={setRenaming}
              autoFocus
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitRename();
                }
                if (event.key === 'Escape') {
                  event.preventDefault();
                  setRenaming(null);
                }
              }}
            />
            <Button variant="secondary" tone="neutral" size="compact" label={labels.saveName} onClick={commitRename} />
            <Button variant="tertiary" size="compact" label={labels.cancelRename} onClick={() => setRenaming(null)} />
          </div>
        ) : narrow ? (
          <Dropdown
            className="ds-table-toolbar__view-picker"
            size="compact"
            aria-label={labels.views}
            options={views.map((v) => ({
              value: v.id,
              label: v.id === active?.id && dirty ? `${v.name} •` : v.name,
            }))}
            value={active?.id ?? ''}
            onValueChange={(id) => pickView(String(id))}
          />
        ) : (
          <Tabs
            className="ds-table-toolbar__view-tabs"
            size="compact"
            aria-label={labels.views}
            tabs={views.map((v) => ({
              value: v.id,
              label: v.name,
              icon: v.id === active?.id && dirty ? <span className="ds-table-toolbar__view-dot" /> : undefined,
            }))}
            value={active?.id}
            onValueChange={pickView}
          />
        )}
        {renaming === null && viewMenu}
        {renaming === null && (
          <CircularButton
            icon="add"
            variant="tertiary"
            size="compact"
            ariaLabel={labels.newView}
            tooltip={labels.newView}
            onClick={addView}
          />
        )}
      </div>
    );

    /* The Group panel: the column the rows group by (or none), then, inside
       a table, Collapse all and Expand all. */
    const groupControl = groupable && groupableColumns.length > 0 && (
      <span className="ds-table-toolbar__badge-host">
        <ToolbarPanel
          sheet={phoneScreen}
          title={labels.group(false)}
          size={size}
          ariaLabel={labels.group(Boolean(groupedBy))}
          position="bottom"
          content={
            <div className="ds-table-toolbar__view">
              <div className="ds-table-toolbar__view-section">
                <span className="ds-table-toolbar__view-heading" aria-hidden="true">
                  {labels.groupBy}
                </span>
                <Dropdown
                  size={size}
                  aria-label={labels.groupBy}
                  options={[
                    { value: '', label: labels.noGrouping },
                    ...groupableColumns.map((col) => ({ value: col.key, label: col.label })),
                  ]}
                  value={groupedBy ?? ''}
                  onValueChange={(next) => setGrouping(next ? [String(next)] : [])}
                />
              </div>
              {table && groupedBy && (
                <div className="ds-table-toolbar__filter-actions">
                  <Button
                    variant="tertiary"
                    size={size}
                    label={labels.collapseAll}
                    onClick={() => table.setAllGroupsOpen(false)}
                  />
                  <Button
                    variant="tertiary"
                    size={size}
                    label={labels.expandAll}
                    onClick={() => table.setAllGroupsOpen(true)}
                  />
                </div>
              )}
            </div>
          }
        >
          <CircularButton
            icon="view_agenda"
            variant="tertiary"
            size={size}
            ariaLabel={labels.group(Boolean(groupedBy))}
            tooltip={labels.group(Boolean(groupedBy))}
          />
        </ToolbarPanel>
        {narrow && groupedBy && (
          <span className="ds-table-toolbar__badge" aria-hidden="true">
            <Badge label="1" variant="info" />
          </span>
        )}
      </span>
    );

    /* The view controls (density, then the columns) share one More panel,
       so the bar keeps its room for search and the chips. */
    /* Folded, the secondary actions move into the More panel, first: a
       phone's width holds the bar's icon controls and its primary action,
       not every action as an icon besides. */
    const foldedActions = narrow ? secondaryActions : [];
    const moreControl = (density || columnsList || foldedActions.length > 0) && (
      <ToolbarPanel
        sheet={phoneScreen}
        title={labels.more}
        size={size}
        ariaLabel={labels.more}
        position="bottom"
        content={
          <div className="ds-table-toolbar__view">
            {foldedActions.length > 0 && (
              <div className="ds-table-toolbar__view-section ds-table-toolbar__view-actions">
                <span className="ds-table-toolbar__view-heading" aria-hidden="true">
                  {labels.actionsSection}
                </span>
                {foldedActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="tertiary"
                    size={size}
                    iconLeft={action.icon}
                    label={action.label}
                    disabled={action.disabled}
                    onClick={action.onSelect}
                  />
                ))}
              </div>
            )}
            {density && (
              <div className="ds-table-toolbar__view-section">
                <span className="ds-table-toolbar__view-heading" aria-hidden="true">
                  {labels.density}
                </span>
                {density}
              </div>
            )}
            {columnsList && (
              <div className="ds-table-toolbar__view-section">
                <span className="ds-table-toolbar__view-heading" aria-hidden="true">
                  {labels.columns}
                </span>
                {columnsList}
              </div>
            )}
          </div>
        }
      >
        <CircularButton
          icon="more_horiz"
          variant="tertiary"
          size={size}
          ariaLabel={labels.more}
          tooltip={labels.more}
        />
      </ToolbarPanel>
    );

    const showFilters = filterable && filterableColumns.length > 0;

    return (
      <div
        role="group"
        aria-label={labels.toolbar}
        // Focus lands here when clearing the selection takes the focused button away and there is no search.
        tabIndex={-1}
        {...rest}
        ref={setRootRef}
        className={`ds-table-toolbar ds-table-toolbar--${size}${narrow ? ' ds-table-toolbar--narrow' : ''} ${className}`.trim()}
      >
        <span className="ds-visually-hidden" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
        {/* Floating, the bar is portalled to the page body: fixed to the
            screen, not to whatever ancestor a filter or transform makes the
            containing block. phoneScreen is false on the server, so this
            only ever runs in the browser. */}
        {viewRow}
        <div className="ds-table-toolbar__row">
          {floating && bulkBar ? createPortal(bulkBar, document.body) : bulkBar}
          <div
            className="ds-table-toolbar__main"
            inert={(bulkMode && !floating) || undefined}
            data-covered={(bulkMode && !floating) || undefined}
          >
            <div className="ds-table-toolbar__start" ref={startRef}>
              {searchable && !narrow && searchField}
              {showFilters && !narrow && chips}
              {showFilters && !narrow && (
                <span
                  data-more=""
                  className={
                    filters.length > fit
                      ? 'ds-table-toolbar__more'
                      : 'ds-table-toolbar__more ds-table-toolbar__chip--overflow'
                  }
                  aria-hidden={filters.length > fit ? undefined : true}
                  inert={filters.length > fit ? undefined : true}
                >
                  <Popover
                    size={size}
                    ariaLabel={labels.filters(activeFilters)}
                    onOpenChange={dropIncomplete}
                    content={panelContent}
                  >
                    <Chip
                      size={size === 'compact' ? 'default' : 'large'}
                      label={labels.moreFilters(Math.max(1, filters.length - fit))}
                      onClick={() => {}}
                    />
                  </Popover>
                </span>
              )}
            </div>
            <div className="ds-table-toolbar__end">
              {showCount && shown !== undefined && total !== undefined && (
                <span className="ds-table-toolbar__count">{labels.count(shown, total)}</span>
              )}
              {searchable && narrow && (
                <ToolbarPanel
                  sheet={phoneScreen}
                  title={labels.search}
                  size={size}
                  ariaLabel={labels.search}
                  content={<div className="ds-table-toolbar__search-panel">{searchField}</div>}
                >
                  <CircularButton
                    icon="search"
                    variant="tertiary"
                    size={size}
                    ariaLabel={labels.search}
                    tooltip={labels.search}
                  />
                </ToolbarPanel>
              )}
              {/* The icon controls sit together: Filter, Columns, then density. */}
              {showFilters && (narrow ? filterPanel : addFilterMenu(filterIcon))}
              {sortControl}
              {groupControl}
              {moreControl}
              {(primaryAction || (!narrow && secondaryActions.length > 0)) && (
                <span className="ds-table-toolbar__actions">
                  {!narrow &&
                    secondaryActions.map((action) =>
                      typeof action.icon === 'string' ? (
                        <CircularButton
                          key={action.id}
                          icon={action.icon}
                          variant="tertiary"
                          size={size}
                          ariaLabel={action.label}
                          tooltip={action.label}
                          disabled={action.disabled}
                          onClick={action.onSelect}
                        />
                      ) : (
                        <Button
                          key={action.id}
                          variant="secondary"
                          tone="neutral"
                          size={size}
                          iconLeft={action.icon}
                          label={action.label}
                          disabled={action.disabled}
                          onClick={action.onSelect}
                        />
                      ),
                    )}
                  {primaryAction &&
                    (narrow ? (
                      <CircularButton
                        icon={typeof primaryAction.icon === 'string' ? primaryAction.icon : 'add'}
                        variant="primary"
                        size={size}
                        ariaLabel={primaryAction.label}
                        tooltip={primaryAction.label}
                        disabled={primaryAction.disabled}
                        onClick={primaryAction.onSelect}
                      />
                    ) : (
                      <Button
                        variant="primary"
                        size={size}
                        iconLeft={primaryAction.icon}
                        label={primaryAction.label}
                        disabled={primaryAction.disabled}
                        onClick={primaryAction.onSelect}
                      />
                    ))}
                </span>
              )}
              {actions}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

TableToolbar.displayName = 'TableToolbar';
