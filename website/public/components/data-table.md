# Data table

The wired table: typed columns, sorting, filters, editing, grouping with totals, row details, saved views, thousands of rows, and rows from a server.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { DataTable } from 'rift-ds';`
- Deep import: `import { DataTable } from 'rift-ds/components/DataTable/DataTable';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/data-table
- Schema: https://rift-ds.com/schema/components/data-table.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## DataTable props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| columns | `DataTableColumn<R>[]` | yes |  | Column definitions. |
| rows | `R[]` | yes |  | Row data, as raw values the table can sort and search. |
| pageSize | `number` | no |  | Rows per page, for controlled use (or as a fixed setting). Setting this or `defaultPageSize` turns on the built-in pagination. |
| defaultPageSize | `number` | no |  | Rows per page to start with, for uncontrolled use; `pageSizeOptions` then lets the reader change it. |
| onPageSizeChange | `((pageSize: number) => void)` | no |  | Fires with the new page size when the reader picks one from `pageSizeOptions`. |
| pageSizeOptions | `number[]` | no |  | The page sizes the footer offers in a Rows per page picker. Leave unset for no picker. |
| page | `number` | no |  | The current page, counting from 1, for controlled use. Pair with `onPageChange`. A page past the last shows the last. |
| defaultPage | `number` | no |  | The page to start on, counting from 1, for uncontrolled use. |
| onPageChange | `((page: number) => void)` | no |  | Fires with the new page, counting from 1: from the pager, and back to 1 when a search, filter, sort or page size change starts over. |
| pageSizeLabel | `string` | no | `'Rows per page'` | The page size picker's label. Defaults to "Rows per page". |
| phoneLayout | `"scroll" \| "stack"` | no | `'scroll'` | How the table reads when it is narrower than a phone (its own width, under `BREAKPOINT_PHONE_PX`, so a table in a narrow panel counts): `scroll` keeps the rows and scrolls sideways with the row header pinned; `stack` draws each row as a card, its row header as the title and every other column as a label and value pair. Defaults to `scroll`. |
| selectable | `boolean` | no | `false` | Adds a checkbox column with a select-all header. |
| selectedIds | `string[]` | no |  | Selected row ids for controlled use. Pair with `onSelectionChange`. |
| defaultSelectedIds | `string[]` | no |  | Initially selected row ids for uncontrolled use. |
| onSelectionChange | `((ids: string[]) => void)` | no |  | Fires with the full list of selected row ids after every change. |
| sort | `DataTableSort \| null` | no |  | Sort state for controlled use. Pair with `onSortChange`; `null` means unsorted. |
| defaultSort | `DataTableSort` | no |  | Initial sort state for uncontrolled use. |
| onSortChange | `((sort: DataTableSort \| null) => void)` | no |  | Fires with the new sort state — `null` when a third click clears the sort. |
| sorts | `DataTableSort[]` | no |  | Every sort, first sort first, for controlled use: the several-column form of `sort`, and wins over it when both are given. Pair with `onSortsChange`. |
| defaultSorts | `DataTableSort[]` | no |  | Initial sorts for uncontrolled use. |
| onSortsChange | `((sorts: DataTableSort[]) => void)` | no |  | Fires with every sort after one changes, first sort first. `onSortChange` fires too, with the first or `null`. |
| linkComponent | `LinkComponent` | no |  | The link component a `link` column's cells render through, so the app's router handles them. Defaults to the nearest `LinkProvider`'s, else a plain anchor. |
| virtualize | `boolean \| "auto"` | no | `'auto'` | Draws only the rows in view, so a table of thousands scrolls as smoothly as one of ten. `auto` (the default) does it for an unpaged, ungrouped table of more than 200 rows; `true` always; `false` never. A virtualised table scrolls inside its frame (`maxHeight`, 640px when unset), keeps its header in view, and still sends its first screen of rows in the server's HTML. |
| onLoadMore | `(() => void)` | no |  | Called when the reader scrolls near the end of the rows while `hasMore` is set, to fetch the next batch. Called once per batch: append the rows and it can fire again. |
| hasMore | `boolean` | no | `false` | Whether more rows can be fetched: shows a loading row at the end and calls `onLoadMore` as it comes into view. |
| manual | `boolean` | no | `false` | Hands sorting, filtering, search and paging to the host, for a table whose rows live on a server. The table stops doing them itself and reports every change through its pairs (`onSortsChange`, `onFiltersChange`, `onSearchChange`, `onPageChange`, `onPageSizeChange`); pass back `rows` already sorted, filtered and paged. Totals, grouping and Select all work over the rows given, and Select all N from a TableToolbar selects every match as a query. |
| rowCount | `number` | no |  | Every row that matches on the server, in `manual` mode: drives the pager, the result count and Select all N. Defaults to the rows given. |
| loading | `boolean` | no | `false` | Whether rows are being fetched. With no rows yet the body shows skeleton rows; with rows on screen they stay, dimmed and inert, under a thin progress line, so the table never blanks. |
| error | `string` | no |  | A failed load's message. With no rows it replaces the body with an error state; over rows already on screen it shows as a Banner above them. Pair with `onRetry`. |
| onRetry | `(() => void)` | no |  | Called by the error state's Try again button. Without it the error shows with no button. |
| loadLabels | `Partial<DataTableLoadLabels>` | no |  | The words of loading and failed loads, merged over their English defaults: the skeleton rows' name, the loading row, a failed load's title and its retry button. |
| renderDetail | `((row: R) => ReactNode)` | no |  | Renders a row's details: adds a chevron column, and an opened row shows this beneath it, across the table's width. Rendered only once opened. |
| expandedIds | `string[]` | no |  | The ids of the rows whose details are open, for controlled use. Pair with `onExpandedIdsChange`. |
| defaultExpandedIds | `string[]` | no |  | The rows open to begin with, for uncontrolled use. |
| onExpandedIdsChange | `((ids: string[]) => void)` | no |  | Fires with the open rows' ids after one opens or closes. |
| expandMode | `"multiple" \| "single"` | no | `'multiple'` | Whether several rows' details can be open at once (`multiple`, the default) or opening one closes the rest (`single`). |
| onViewChange | `((view: TableView) => void)` | no |  | Fires with the table's setup as a view whenever any part of it changes, so a host can keep the reader's last view. |
| grouping | `string[]` | no |  | The column keys the rows are grouped by, for controlled use; this milestone draws the first. Pair with `onGroupingChange`. |
| defaultGrouping | `string[]` | no |  | The grouping to start with, for uncontrolled use. |
| onGroupingChange | `((grouping: string[]) => void)` | no |  | Fires with the new grouping, from a header menu or a TableToolbar. |
| totalsRow | `boolean` | no | `false` | Adds a totals row to the table's foot, sticky at its bottom edge: each cell a menu picking its calculation over every matching row. |
| totals | `Record<string, Total>` | no |  | Each column's footer calculation, by key, for controlled use. A column left out shows its `aggregate`, or nothing. Pair with `onTotalsChange`. |
| defaultTotals | `Record<string, Total>` | no |  | The footer calculations to start with, for uncontrolled use. |
| onTotalsChange | `((totals: Record<string, Total>) => void)` | no |  | Fires with every footer calculation after one is picked. |
| multiSort | `boolean` | no | `false` | Lets the table sort by several columns: Shift-click a header, or pick Add to sort from its menu, to add the column after the current sorts. Each sorted header shows its rank while more than one sorts. |
| searchable | `boolean` | no | `false` | Shows the built-in search field, matching against every column's raw value. |
| searchPlaceholder | `string` | no | `'Search'` | Placeholder for the search field. |
| toolbar | `ReactNode` | no |  | Slot beside the search field for consumer-owned filter controls. |
| size | `"default" \| "compact"` | no |  | The table's density, and the controls' with it: `default` rows with the search field and pager at the default row-control height, `compact` rows with both at the compact one. Controls inside the rows (checkboxes, grips, menu and action buttons) stay compact at either density, so a row's height is its text's. Defaults to `default`. Unlike a static size, it is state the reader can change from a TableToolbar's density switch: passing it controls that state, paired with `defaultSize` and `onSizeChange`. |
| striped | `boolean` | no | `false` | Alternating row backgrounds, passed through to the underlying Table. |
| caption | `string` | no |  | Accessible caption for the underlying table (visually hidden). |
| emptyState | `ReactNode` | no |  | What to render when no rows match — defaults to a built-in empty state. |
| selectAllLabel | `string` | no | `'Select all rows on this page'` | Accessible name of the select-all checkbox in the header, shown with `selectable`. |
| selectRowLabel | `((row: R) => string)` | no | `` (row: R) => { const nameKey = (columnsProp.find((col) => col.rowHeader) ?? columnsProp[0])?.key; const name = nameKey === undefined ? undefined : row.values[nameKey]; return name == null \|\| name === '' ? `Select row ${row.id}` : `Select ${name}`; } `` | Accessible name of a row's checkbox, given the row. Defaults to "Select" followed by the value of the `rowHeader` column (else the first column), and to "Select row" with the id only when that value is empty. |
| sortLabel | `((header: string, direction: "desc" \| "asc" \| null) => string)` | no | `(header: string) => header` | Accessible name of a sortable header's button, given the column's header text (its `key` when the header is not a string) and its current sort direction, `null` when unsorted. Defaults to the header text alone: the sort state is the header's `aria-sort`, so naming it here too would read it twice. |
| sortAnnouncement | `((header: string, direction: "desc" \| "asc" \| null) => string)` | no | `` (header: string, direction: DataTableSort['direction'] \| null) => direction === null ? 'Sort cleared' : `Sorted by ${header}, ${direction === 'asc' ? 'ascending' : 'descending'}` `` | Announced when the sort changes, given the header text and the new direction, `null` when cleared. Defaults to "Sorted by Name, ascending" or "Sort cleared". |
| sortRankLabel | `((name: string, rank: number, direction: "desc" \| "asc") => string)` | no | `` (name: string, rank: number, direction: DataTableSort['direction']) => `${name}, sort ${rank}, ${direction === 'asc' ? 'ascending' : 'descending'}` `` | With several sorts, names a header's sort button after the first: given the `sortLabel` name, its rank and its direction. Defaults to "Owner, sort 2, ascending". The first sort's header carries `aria-sort` instead. |
| pageAnnouncement | `((page: number, pageCount: number, first: number, last: number, total: number) => string)` | no | `` (page: number, pageCount: number, first: number, last: number, total: number) => `Page ${page} of ${pageCount}, rows ${first} to ${last} of ${total}` `` | Announced when the page changes, given the page, the page count, the first and last row shown and the total. Defaults to "Page 2 of 7, rows 21 to 40 of 140". |
| resultsLabel | `((count: number) => string)` | no | `` (count: number) => `${count} result${count === 1 ? '' : 's'}` `` | Footer count of the rows that match, given the count. Defaults to "1 result" or "N results". |
| selectedLabel | `((count: number) => string)` | no | `` (count: number) => `${count} selected` `` | Footer count shown instead of the results while rows are selected, given the count. Defaults to "N selected". |
| paginationLabels | `Pick<PaginationProps, "aria-label" \| "previousLabel" \| "nextLabel" \| "pageLabel" \| "readoutLabel">` | no |  | The built-in pager's words, merged over its English defaults: the arrows' names ("Previous page", "Next page"), the readout ("Page 2 of 4") and the landmark's name ("Pagination"). The pager follows the table's `size`: numbered pages at the default size (named by `pageLabel`), a "Page X of Y" readout when compact (`readoutLabel`). |
| emptyStateLabels | `Partial<Pick<EmptyStateProps, "title" \| "description">>` | no |  | The built-in empty state's words, merged over its English defaults ("No matching rows", "Adjust the search or filters and try again."). Ignored when `emptyState` replaces the whole node. |
| resizableColumns | `boolean` | no | `false` | Lets every column be resized by dragging its header's edge, double-clicking it to fit, or Alt+Left and Alt+Right on a focused header. A column's own `resizable` wins. |
| reorderableColumns | `boolean` | no | `false` | Lets every column be moved by dragging its header, from its menu, or Ctrl+Shift+Left and Ctrl+Shift+Right on a focused header. A column's own `reorderable` wins. |
| columnMenu | `boolean` | no | `false` | Adds a menu to every header: sort, pin, move, hide, fit and reset, as each column allows. Opened from the header's options button, Alt+Down, Shift+F10 or a right-click. |
| reorderableRows | `boolean` | no | `false` | Adds a grip at each row's start to drag it up or down, or move it with Alt+Up and Alt+Down. Off while a sort is active, since the sort owns the order. |
| stickyHeader | `boolean` | no | `false` | Keeps the header in view while the body scrolls. Takes effect with `maxHeight`, inside the table's own scroll frame. |
| maxHeight | `string \| number` | no |  | The table's tallest height before its body scrolls inside its frame (any CSS length, or pixels). |
| navigation | `"table" \| "grid"` | no |  | How the keyboard moves through the table. `table` keeps every control in the Tab order, as a reading table does; `grid` makes the table one Tab stop with arrow-key focus across its cells. Defaults to `grid` when any column or row control is on, else `table`. |
| columnWidths | `Record<string, number>` | no |  | Column widths in pixels, by key, for controlled use. Fires `onColumnWidthsChange` once per resize, on release. |
| defaultColumnWidths | `Record<string, number>` | no |  | Starting column widths in pixels, by key, for uncontrolled use. Columns not listed take their natural width. |
| onColumnWidthsChange | `((widths: Record<string, number>) => void)` | no |  | Fires with every column's width after a resize, a fit or a reset. |
| columnOrder | `string[]` | no |  | Column keys in display order, for controlled use. Keys left out keep their declared order after the listed ones. |
| defaultColumnOrder | `string[]` | no |  | Starting column order, for uncontrolled use. |
| onColumnOrderChange | `((order: string[]) => void)` | no |  | Fires with the full column order after a move. |
| columnPinning | `DataTableColumnPinning` | no |  | Columns pinned to each edge, for controlled use. |
| defaultColumnPinning | `DataTableColumnPinning` | no |  | Starting pins, for uncontrolled use; merged with each column's own `pin`. |
| onColumnPinningChange | `((pinning: DataTableColumnPinning) => void)` | no |  | Fires with the pins after a column is pinned or unpinned. |
| hiddenColumns | `string[]` | no |  | Hidden column keys, for controlled use. |
| defaultHiddenColumns | `string[]` | no |  | Starting hidden keys, for uncontrolled use; merged with each column's `defaultHidden`. |
| onHiddenColumnsChange | `((hidden: string[]) => void)` | no |  | Fires with every hidden key after a column is hidden or shown. |
| rowOrder | `string[]` | no |  | Row ids in display order, for controlled use, applied while no sort is active. Rows left out keep their given order after the listed ones. |
| defaultRowOrder | `string[]` | no |  | Starting row order, for uncontrolled use. |
| onRowOrderChange | `((order: string[]) => void)` | no |  | Fires with the full row order after a row moves. |
| columnLabels | `Partial<DataTableColumnLabels>` | no |  | The column and row controls' words, merged over their English defaults. |
| columnDividers | `boolean` | no | `false` | Draws a vertical line between columns, as well as the lines between rows. |
| cellText | `DataTableCellText` | no | `'wrap'` | How every cell's text fits unless its column says otherwise: `wrap` (the default), `nowrap`, `truncate` or `lines-2`. |
| rowActions | `((row: R) => DataTableRowAction[])` | no |  | The actions a row offers, in an actions column that sticks to the end edge: inline ones as icon buttons, the rest in a More menu. |
| editMode | `"cell" \| "row"` | no | `'cell'` | How editable cells edit: `cell` (the default) edits one cell at a time, started with Enter, F2, a typed character or a double click; `row` adds an Edit button to each row that opens every editable cell of the row at once, with Save and Cancel. |
| onCellEdit | `((edit: DataTableCellEdit<R>) => void \| Promise<unknown>)` | no |  | Saves one edited cell. Rows stay the record: update them from here. Return a promise to have the cell show the new value as pending until it settles; a rejection rolls the cell back and announces the failure. |
| onRowEdit | `((edit: DataTableRowEdit<R>) => void \| Promise<unknown>)` | no |  | Saves one edited row with `editMode="row"`, its changed values together. Without it, each changed cell goes to `onCellEdit`. |
| filters | `Filter[]` | no |  | The filters, for controlled use: conditions on columns, joined with AND. Set from the header menus (with `columnMenu`) or a TableToolbar. |
| defaultFilters | `Filter[]` | no |  | Starting filters, for uncontrolled use. |
| onFiltersChange | `((filters: Filter[]) => void)` | no |  | Fires with every filter after one is added, changed or removed. |
| search | `string` | no |  | The search text, for controlled use; the built-in search field and a TableToolbar's both set it. |
| defaultSearch | `string` | no |  | Starting search text, for uncontrolled use. |
| onSearchChange | `((search: string) => void)` | no |  | Fires with the search text as it changes. |
| defaultSize | `"default" \| "compact"` | no |  | Starting density, for uncontrolled use when a TableToolbar's density switch sets it; `size` controls it. |
| onSizeChange | `((size: "default" \| "compact") => void)` | no |  | Fires when a TableToolbar's density switch changes the density. |
| filterLabels | `Partial<FilterLabels>` | no |  | The filters' words, merged over their English defaults. |
| rowActionsVisibility | `"hover" \| "always"` | no | `'hover'` | When the inline actions show: on row hover and focus (the default, and always on a touch screen), or always. The More button shows at rest either way, so the column never reads as empty. |
| locale | `string` | no |  | The BCP 47 locale the table formats and sorts in, such as `de-DE`: every typed column without a `format.locale` of its own, and the order text sorts in. Defaults to the nearest LocaleProvider's, else `en-US`. |
| className | `string` | no | `''` | Additional CSS classes |

## Types

### Aggregate

The calculations a column's `aggregate` can name.

```ts
type Aggregate = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'countDistinct' | 'range';
```

### CellEditorKind

The editor kinds a column can name, each one of the library's fields.

```ts
type CellEditorKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'combobox'
  | 'tags'
  | 'date'
  | 'time'
  | 'checkbox'
  | 'switch';
```

### CellValue

Any value a cell can hold.

```ts
type CellValue = string | number | boolean | string[] | null | undefined;
```

### ColumnFormat

How a typed column formats its values.

```ts
interface ColumnFormat {
  /** BCP 47 locale for numbers, money and dates. Defaults to the table's `locale` (else the nearest LocaleProvider's, else `en-US`), never the browser's, so the server and the browser agree. */
  locale?: string;
  /** ISO 4217 code for a `currency` column. Defaults to `USD`. */
  currency?: string;
  /** Digits after the point for `number`, `currency` and `progress`. Defaults to none for money and progress, and up to two for a number. */
  fractionDigits?: number;
  /** How a `date` column reads: `short` (11/04/26), `medium` (Nov 4, 2026), `long` (November 4, 2026) or `relative` (in 3 days). Defaults to `medium`; the full date shows on hover either way. */
  date?: 'short' | 'medium' | 'long' | 'relative';
}
```

### ColumnType

The types a column can be.

```ts
type ColumnType =
  'text' | 'number' | 'currency' | 'date' | 'status' | 'person' | 'tags' | 'progress' | 'checkbox' | 'link';
```

### DataTableAggregate

The calculations a column's `aggregate` can name.

```ts
type DataTableAggregate = Aggregate;
```

### DataTableCellEdit

One saved cell, as `onCellEdit` hears it.

```ts
interface DataTableCellEdit<R extends DataTableRow = DataTableRow> {
  /** The row, as it was before the edit. */
  row: R;
  /** The column's key. */
  key: string;
  /** The new value. */
  value: DataTableValue;
  /** The value before the edit. */
  previous: DataTableValue;
}
```

### DataTableCellText

How a cell's text fits its width: `wrap` breaks onto as many lines as it
needs; `nowrap` stays on one line and runs on; `truncate` stays on one
line and ends in an ellipsis, with the full text as the cell's tooltip;
`lines-2` wraps onto two lines at most, then ends in an ellipsis.

```ts
type DataTableCellText = 'wrap' | 'nowrap' | 'truncate' | 'lines-2';
```

### DataTableColumn

```ts
interface DataTableColumn<R extends DataTableRow = DataTableRow> {
  /** Unique column identifier, used as the key into each row's values. */
  key: string;
  /** Header label displayed in the column header. */
  header: React.ReactNode;
  /** Whether clicking this header sorts by the column. */
  sortable?: boolean;
  /** Optional column width (CSS value like '200px', '30%', 'auto'). */
  width?: string;
  /** Text alignment for cells in this column. `start` and `end` follow the reading direction (a typed column defaults to its type's: `end` for numbers, money and progress, `start` for text); `left` and `right` are screen sides. */
  align?: 'start' | 'center' | 'end' | 'left' | 'right';
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
```

### DataTableColumnFormat

How a typed column formats its values.

```ts
type DataTableColumnFormat = ColumnFormat;
```

### DataTableColumnLabels

```ts
interface DataTableColumnLabels {
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
```

### DataTableColumnPinning

Columns pinned to either edge, by column key, in order from that edge.

```ts
interface DataTableColumnPinning {
  /** Keys pinned to the start edge, outermost first. */
  start?: string[];
  /** Keys pinned to the end edge, outermost first. */
  end?: string[];
}
```

### DataTableColumnType

The types a column can be; see `DataTableColumn.type`.

```ts
type DataTableColumnType = ColumnType;
```

### DataTableEditorContext

What a custom editor is handed.

```ts
interface DataTableEditorContext<R extends DataTableRow = DataTableRow> {
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
```

### DataTableEditorKind

The editor kinds a column's `editor` can name, each composed from the library's own field.

```ts
type DataTableEditorKind = CellEditorKind;
```

### DataTableFilter

One filter condition on one column, as the table and TableToolbar share it.

```ts
type DataTableFilter = Filter;
```

### DataTableFilterLabels

Every word a filter shows or announces, each defaulting to English.

```ts
type DataTableFilterLabels = FilterLabels;
```

### DataTableLoadLabels

Every word the table shows while rows load or fail to, each defaulting to English.

```ts
interface DataTableLoadLabels {
  /** The skeleton rows' name, and the refetch line's. */
  loading: string;
  /** The loading row that ends the rows while `hasMore` fetches the next batch. */
  loadingMore: string;
  /** The title of a failed load, in the error state and the Banner. */
  errorTitle: string;
  /** The button that calls `onRetry`. */
  retry: string;
}
```

### DataTableOption

One choice of a `select`, `multiselect` or `combobox` editor.

```ts
interface DataTableOption {
  /** The value stored in the row. */
  value: string;
  /** What the cell and the list show. */
  label: string;
  /** For a `status` column, the status role its Badge takes. Defaults to `neutral`. */
  status?: StatusRole;
}
```

### DataTableRow

```ts
interface DataTableRow {
  /** Unique row identifier. */
  id: string;
  /** Raw values keyed by column key — used for sorting, searching, and default rendering. */
  values: Record<string, DataTableValue>;
}
```

### DataTableRowAction

One action a row offers in its actions column.

```ts
interface DataTableRowAction {
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
```

### DataTableRowEdit

One saved row, as `onRowEdit` hears it.

```ts
interface DataTableRowEdit<R extends DataTableRow = DataTableRow> {
  /** The row, as it was before the edit. */
  row: R;
  /** The changed values, by column key. */
  values: Record<string, DataTableValue>;
  /** The changed columns' values before the edit. */
  previous: Record<string, DataTableValue>;
}
```

### DataTableSort

```ts
interface DataTableSort {
  /** The column being sorted. */
  key: string;
  /** Sort direction. */
  direction: 'asc' | 'desc';
}
```

### DataTableTotal

Every calculation the totals footer offers, `none` included.

```ts
type DataTableTotal = Total;
```

### DataTableValue

Any value a cell can hold.

```ts
type DataTableValue = CellValue;
```

### DataTableView

One saved setup of a table: its sorts, filters, search, columns, pinning, widths, grouping, density and page size. Selection, the page and open details are the session, never part of a view.

```ts
type DataTableView = TableView;
```

### EmptyStateProps

The props of EmptyState: `get_component("EmptyState")`.

### Filter

One condition on one column.

```ts
interface Filter {
  /** Stable id, so a chip and its editor keep their place while the value changes. */
  id: string;
  /** The column's key. */
  column: string;
  /** How the value is compared. */
  operator: FilterOperator;
  /** What it is compared with; missing until it is picked. */
  value?: FilterValue;
}
```

### FilterLabels

Every word a filter shows or announces, each defaulting to English.

```ts
interface FilterLabels {
  /** An operator as a chip and the operator menu read it. */
  operators: Record<FilterOperator, string>;
  /** The toolbar's button that adds a filter. */
  addFilter: string;
  /** The editor's name, given the column's header. */
  editor: (header: string) => string;
  /** The operator field's name. */
  operatorField: string;
  /** The value field's name, given the column's header. */
  valueField: (header: string) => string;
  /** The first value of a `between`. */
  from: string;
  /** The second value of a `between`. */
  to: string;
  /** Placeholder and name of the search field over a list filter's choices. */
  searchChoices: string;
  /** Shown when the search matches none of a list filter's choices. */
  noChoices: string;
  /** Removes one filter, given its chip's text. */
  remove: (chip: string) => string;
  /** Removes every filter. */
  clearAll: string;
  /** A chip's placeholder for a value not picked yet. */
  noValue: string;
  /** Joins the two ends of a `between` on a chip. */
  and: string;
  /** Joins two or more chosen values on a chip, given how many past the first. */
  more: (count: number) => string;
  /** The header menu item that opens a column's filter. */
  filterColumn: string;
  /** Name of a filtered header's mark, given the header. */
  filtered: (header: string) => string;
  /** Announced when the filters change, given the rows that match. */
  filteredAnnouncement: (count: number) => string;
}
```

### FilterOperator

Every operator, across the kinds.

```ts
type FilterOperator =
  | 'contains'
  | 'notContains'
  | 'is'
  | 'isNot'
  | 'startsWith'
  | 'endsWith'
  | 'eq'
  | 'neq'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte'
  | 'between'
  | 'before'
  | 'after'
  | 'isAnyOf'
  | 'isNoneOf'
  | 'hasAnyOf'
  | 'hasAllOf'
  | 'hasNoneOf'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'isChecked'
  | 'isNotChecked';
```

### FilterValue

A filter's value: text or a date for one-value operators, a number, a pair for `between`, a list for the set operators.

```ts
type FilterValue = string | number | [number | string | null, number | string | null] | string[] | null | undefined;
```

### LinkComponent

A component that renders a link in place of a plain `<a>`, such as a router's.

```ts
type LinkComponent = React.ElementType<LinkComponentProps>;
```

### LinkComponentProps

The props a link component receives: every anchor attribute, the ref, and
an `href` that is always a string. Next.js's `Link` takes these as they
are; a router whose link takes `to` instead needs a one-line adapter:
`({ href, ...props }) => <RouterLink to={href} {...props} />`.

```ts
type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };
```

### PaginationProps

The props of Pagination: `get_component("Pagination")`.

### StatusRole

A status option's role, the Badge variant its cells take.

```ts
type StatusRole = 'info' | 'positive' | 'warning' | 'error' | 'neutral';
```

### TableView

One saved setup of a table. Every field is optional: a view leaves out what it does not set.

```ts
interface TableView {
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
```

### Total

Every calculation the totals footer offers, `none` included (Notion's Calculate set).

```ts
type Total = 'none' | 'count' | 'countDistinct' | 'empty' | 'filled' | 'percentEmpty' | 'sum' | 'avg' | 'min' | 'max' | 'range';
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `Partial` (typescript), `Pick` (typescript), `Promise` (typescript), `ReactNode` (react), `Record` (typescript).
