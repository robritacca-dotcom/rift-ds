# Data table

The wired table: sorting, search, row selection, and pagination assembled around Table.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { DataTable } from '@robr0/design-system';`
- Deep import: `import { DataTable } from '@robr0/design-system/components/DataTable/DataTable';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/data-table

## DataTable props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| columns | `DataTableColumn[]` | yes |  | Column definitions. |
| rows | `DataTableRow[]` | yes |  | Row data, as raw values the table can sort and search. |
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
| className | `string` | no | `` | Additional CSS classes |
