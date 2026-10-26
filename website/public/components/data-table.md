# Data table

The wired table: sort, search, filters, selection, paging, column and row controls, and inline editing, on a headless engine.

Generated from the rift-ds registry and prop JSDoc, version 1.13.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { DataTable } from 'rift-ds';`
- Deep import: `import { DataTable } from 'rift-ds/components/DataTable/DataTable';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/data-table

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
| pageSizeLabel | `string` | no | `Rows per page` | The page size picker's label. Defaults to "Rows per page". |
| phoneLayout | `"scroll" \| "stack"` | no | `scroll` | How the table reads when it is narrower than a phone (its own width, under `BREAKPOINT_PHONE_PX`, so a table in a narrow panel counts): `scroll` keeps the rows and scrolls sideways with the row header pinned; `stack` draws each row as a card, its row header as the title and every other column as a label and value pair. Defaults to `scroll`. |
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
| renderDetail | `((row: R) => ReactNode)` | no |  | Renders a row's details: adds a chevron column, and an opened row shows this beneath it, across the table's width. Rendered only once opened. |
| expandedIds | `string[]` | no |  | The ids of the rows whose details are open, for controlled use. Pair with `onExpandedIdsChange`. |
| defaultExpandedIds | `string[]` | no |  | The rows open to begin with, for uncontrolled use. |
| onExpandedIdsChange | `((ids: string[]) => void)` | no |  | Fires with the open rows' ids after one opens or closes. |
| expandMode | `"multiple" \| "single"` | no | `multiple` | Whether several rows' details can be open at once (`multiple`, the default) or opening one closes the rest (`single`). |
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
| searchPlaceholder | `string` | no | `Search` | Placeholder for the search field. |
| toolbar | `ReactNode` | no |  | Slot beside the search field for consumer-owned filter controls. |
| size | `"default" \| "compact"` | no |  | The table's density, and the controls' with it: `default` rows with the search field and pager at the default row-control height, `compact` rows with both at the compact one. Controls inside the rows (checkboxes, grips, menu and action buttons) stay compact at either density, so a row's height is its text's. |
| striped | `boolean` | no | `false` | Alternating row backgrounds, passed through to the underlying Table. |
| caption | `string` | no |  | Accessible caption for the underlying table (visually hidden). |
| emptyState | `ReactNode` | no |  | What to render when no rows match — defaults to a built-in empty state. |
| selectAllLabel | `string` | no | `Select all rows on this page` | Accessible name of the select-all checkbox in the header, shown with `selectable`. |
| selectRowLabel | `((row: R) => string)` | no | `(row: R) => {     const nameKey = (columnsProp.find((col) => col.rowHeader) ?? columnsProp[0])?.key;     const name = nameKey === undefined ? undefined : row.values[nameKey];     return name == null \|\| name === '' ? `Select row ${row.id}` : `Select ${name}`;   }` | Accessible name of a row's checkbox, given the row. Defaults to "Select" followed by the value of the `rowHeader` column (else the first column), and to "Select row" with the id only when that value is empty. |
| sortLabel | `((header: string, direction: "desc" \| "asc" \| null) => string)` | no | `(header: string) => header` | Accessible name of a sortable header's button, given the column's header text (its `key` when the header is not a string) and its current sort direction, `null` when unsorted. Defaults to the header text alone: the sort state is the header's `aria-sort`, so naming it here too would read it twice. |
| sortAnnouncement | `((header: string, direction: "desc" \| "asc" \| null) => string)` | no | `(header: string, direction: DataTableSort['direction'] \| null) =>     direction === null ? 'Sort cleared' : `Sorted by ${header}, ${direction === 'asc' ? 'ascending' : 'descending'}`` | Announced when the sort changes, given the header text and the new direction, `null` when cleared. Defaults to "Sorted by Name, ascending" or "Sort cleared". |
| sortRankLabel | `((name: string, rank: number, direction: "desc" \| "asc") => string)` | no | `(name: string, rank: number, direction: DataTableSort['direction']) =>     `${name}, sort ${rank}, ${direction === 'asc' ? 'ascending' : 'descending'}`` | With several sorts, names a header's sort button after the first: given the `sortLabel` name, its rank and its direction. Defaults to "Owner, sort 2, ascending". The first sort's header carries `aria-sort` instead. |
| pageAnnouncement | `((page: number, pageCount: number, first: number, last: number, total: number) => string)` | no | `(page: number, pageCount: number, first: number, last: number, total: number) =>     `Page ${page} of ${pageCount}, rows ${first} to ${last} of ${total}`` | Announced when the page changes, given the page, the page count, the first and last row shown and the total. Defaults to "Page 2 of 7, rows 21 to 40 of 140". |
| resultsLabel | `((count: number) => string)` | no | `(count: number) => `${count} result${count === 1 ? '' : 's'}`` | Footer count of the rows that match, given the count. Defaults to "1 result" or "N results". |
| selectedLabel | `((count: number) => string)` | no | `(count: number) => `${count} selected`` | Footer count shown instead of the results while rows are selected, given the count. Defaults to "N selected". |
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
| cellText | `DataTableCellText` | no | `wrap` | How every cell's text fits unless its column says otherwise: `wrap` (the default), `nowrap`, `truncate` or `lines-2`. |
| rowActions | `((row: R) => DataTableRowAction[])` | no |  | The actions a row offers, in an actions column that sticks to the end edge: inline ones as icon buttons, the rest in a More menu. |
| editMode | `"cell" \| "row"` | no | `cell` | How editable cells edit: `cell` (the default) edits one cell at a time, started with Enter, F2, a typed character or a double click; `row` adds an Edit button to each row that opens every editable cell of the row at once, with Save and Cancel. |
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
| rowActionsVisibility | `"hover" \| "always"` | no | `hover` | When the inline actions show: on row hover and focus (the default, and always on a touch screen), or always. The More button shows at rest either way, so the column never reads as empty. |
| className | `string` | no | `` | Additional CSS classes |
