# Data table

The wired table: sorting, search, row selection, and pagination assembled around Table.

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
| pageSize | `number` | no |  | Rows per page. Setting this turns on the built-in pagination. |
| selectable | `boolean` | no | `false` | Adds a checkbox column with a select-all header. |
| selectedIds | `string[]` | no |  | Selected row ids for controlled use. Pair with `onSelectionChange`. |
| defaultSelectedIds | `string[]` | no |  | Initially selected row ids for uncontrolled use. |
| onSelectionChange | `((ids: string[]) => void)` | no |  | Fires with the full list of selected row ids after every change. |
| sort | `DataTableSort \| null` | no |  | Sort state for controlled use. Pair with `onSortChange`; `null` means unsorted. |
| defaultSort | `DataTableSort` | no |  | Initial sort state for uncontrolled use. |
| onSortChange | `((sort: DataTableSort \| null) => void)` | no |  | Fires with the new sort state — `null` when a third click clears the sort. |
| searchable | `boolean` | no | `false` | Shows the built-in search field, matching against every column's raw value. |
| searchPlaceholder | `string` | no | `Search` | Placeholder for the search field. |
| toolbar | `ReactNode` | no |  | Slot beside the search field for consumer-owned filter controls. |
| size | `"default" \| "compact"` | no | `default` | Visual size, passed through to the underlying Table. |
| striped | `boolean` | no | `false` | Alternating row backgrounds, passed through to the underlying Table. |
| caption | `string` | no |  | Accessible caption for the underlying table (visually hidden). |
| emptyState | `ReactNode` | no |  | What to render when no rows match — defaults to a built-in empty state. |
| selectAllLabel | `string` | no | `Select all rows on this page` | Accessible name of the select-all checkbox in the header, shown with `selectable`. |
| selectRowLabel | `((row: R) => string)` | no | `(row: R) => {         const nameKey = (columns.find((col) => col.rowHeader) ?? columns[0])?.key;         const name = nameKey === undefined ? undefined : row.values[nameKey];         return name == null \|\| name === '' ? `Select row ${row.id}` : `Select ${name}`;       }` | Accessible name of a row's checkbox, given the row. Defaults to "Select" followed by the value of the `rowHeader` column (else the first column), and to "Select row" with the id only when that value is empty. |
| sortLabel | `((header: string, direction: "desc" \| "asc" \| null) => string)` | no | `(header: string) => header` | Accessible name of a sortable header's button, given the column's header text (its `key` when the header is not a string) and its current sort direction, `null` when unsorted. Defaults to the header text alone: the sort state is the header's `aria-sort`, so naming it here too would read it twice. |
| sortAnnouncement | `((header: string, direction: "desc" \| "asc" \| null) => string)` | no | `(header: string, direction: DataTableSort['direction'] \| null) =>         direction === null           ? 'Sort cleared'           : `Sorted by ${header}, ${direction === 'asc' ? 'ascending' : 'descending'}`` | Announced when the sort changes, given the header text and the new direction, `null` when cleared. Defaults to "Sorted by Name, ascending" or "Sort cleared". |
| pageAnnouncement | `((page: number, pageCount: number, first: number, last: number, total: number) => string)` | no | `(page: number, pageCount: number, first: number, last: number, total: number) =>         `Page ${page} of ${pageCount}, rows ${first} to ${last} of ${total}`` | Announced when the page changes, given the page, the page count, the first and last row shown and the total. Defaults to "Page 2 of 7, rows 21 to 40 of 140". |
| resultsLabel | `((count: number) => string)` | no | `(count: number) => `${count} result${count === 1 ? '' : 's'}`` | Footer count of the rows that match, given the count. Defaults to "1 result" or "N results". |
| selectedLabel | `((count: number) => string)` | no | `(count: number) => `${count} selected`` | Footer count shown instead of the results while rows are selected, given the count. Defaults to "N selected". |
| paginationLabels | `Pick<PaginationProps, "aria-label" \| "previousLabel" \| "nextLabel" \| "readoutLabel">` | no |  | The built-in pager's words, merged over its English defaults: the arrows' names ("Previous page", "Next page"), the readout ("Page 2 of 4") and the landmark's name ("Pagination"). The pager is always the compact size, so its numbered-page names never render and are not offered here. |
| emptyStateLabels | `Partial<Pick<EmptyStateProps, "title" \| "description">>` | no |  | The built-in empty state's words, merged over its English defaults ("No matching rows", "Adjust the search or filters and try again."). Ignored when `emptyState` replaces the whole node. |
| className | `string` | no | `` | Additional CSS classes |
