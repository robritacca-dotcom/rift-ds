# Table toolbar

The control bar over a table: search, filters as chips, the columns panel, density and a count, reading a DataTable's state with no props.

Generated from the rift-ds registry and prop JSDoc, version 1.13.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { TableToolbar } from 'rift-ds';`
- Deep import: `import { TableToolbar } from 'rift-ds/components/TableToolbar/TableToolbar';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/table-toolbar

## TableToolbar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| columns | `TableToolbarColumn[]` | no |  | The columns the bar filters and shows, for a bar over some other table. Inside a DataTable's `toolbar` the table's own columns are used. |
| filters | `Filter[]` | no |  | The filters, for controlled use. Inside a DataTable the table's filters are used unless this is set. |
| defaultFilters | `Filter[]` | no |  | Starting filters, for uncontrolled use outside a DataTable. |
| onFiltersChange | `((filters: Filter[]) => void)` | no |  | Fires with every filter after one is added, changed or removed. |
| search | `string` | no |  | The search text, for controlled use. Inside a DataTable the table's search is used unless this is set. |
| defaultSearch | `string` | no |  | Starting search text, for uncontrolled use outside a DataTable. |
| onSearchChange | `((search: string) => void)` | no |  | Fires with the search text as it changes. |
| hiddenColumns | `string[]` | no |  | Hidden column keys, for controlled use. Inside a DataTable the table's are used unless this is set. |
| defaultHiddenColumns | `string[]` | no |  | Starting hidden keys, for uncontrolled use outside a DataTable. |
| onHiddenColumnsChange | `((hidden: string[]) => void)` | no |  | Fires with every hidden key after the Columns panel changes one. |
| size | `"default" \| "compact"` | no |  | The density the bar's controls take and its switch sets, for controlled use. Inside a DataTable the table's density is used unless this is set. |
| defaultSize | `"default" \| "compact"` | no |  | Starting density, for uncontrolled use outside a DataTable. |
| onSizeChange | `((size: "default" \| "compact") => void)` | no |  | Fires when the density switch changes. |
| count | `{ shown: number; total: number; }` | no |  | The result count's numbers, outside a DataTable: rows that match and rows in all. |
| searchable | `boolean` | no | `true` | Shows the search field. Defaults to true. |
| filterable | `boolean` | no | `true` | Shows the Filter button and the filter chips. Defaults to true. |
| columnsPanel | `boolean` | no | `true` | Shows the Columns panel. Defaults to true. |
| densitySwitch | `boolean` | no | `true` | Shows the density switch (in More when the bar folds). Defaults to true. |
| showCount | `boolean` | no |  | Shows the result count in the bar. Defaults to true over some other table and false inside a DataTable, whose footer carries the count; set it to move the count into the bar, and the footer leaves it out. |
| columnOrder | `string[]` | no |  | Every column key in display order, for controlled use. Inside a DataTable the table's order is used unless this is set. |
| defaultColumnOrder | `string[]` | no |  | Starting column order, for uncontrolled use outside a DataTable. |
| onColumnOrderChange | `((order: string[]) => void)` | no |  | Fires with the full column order after the Columns panel moves one. |
| bulkActions | `TableToolbarBulkAction[]` | no | `[]` | The actions for the selected rows. Inside a DataTable with `selectable`, selecting a row turns the bar, at the same height, into the bulk bar: Clear, the count, Select all N, then these, the first non-destructive one and the first destructive one labelled and the rest in a More menu. |
| sorts | `DataTableSort[]` | no |  | Every sort, first sort first, for controlled use. Inside a DataTable the table's sorts are used unless this is set. |
| defaultSorts | `DataTableSort[]` | no |  | Initial sorts for uncontrolled use. |
| onSortsChange | `((sorts: DataTableSort[]) => void)` | no |  | Fires with every sort after the sort panel changes one. |
| views | `TableToolbarView[]` | no |  | Saved views, shown as tabs over the bar inside a DataTable: picking one applies its setup to the table, its tab shows a dot while the table no longer matches it, and its menu saves, saves as new, resets, renames and deletes. For controlled use; store them however you like (each `view` is plain data). Pair with `onViewsChange`. |
| defaultViews | `TableToolbarView[]` | no |  | The saved views to start with, for uncontrolled use. |
| onViewsChange | `((views: TableToolbarView[]) => void)` | no |  | Fires with every view after one is saved, added, renamed or deleted. |
| activeView | `string` | no |  | The active view's id, for controlled use. Pair with `onActiveViewChange`. |
| defaultActiveView | `string` | no |  | The view active to begin with, for uncontrolled use. Defaults to the first. |
| onActiveViewChange | `((id: string) => void)` | no |  | Fires with the id of the view picked or added. |
| grouping | `string[]` | no |  | The column keys the rows are grouped by, for controlled use. Inside a DataTable the table's grouping is used unless this is set. |
| defaultGrouping | `string[]` | no |  | The grouping to start with, for uncontrolled use. |
| onGroupingChange | `((grouping: string[]) => void)` | no |  | Fires with the new grouping when the Group panel changes it. |
| groupable | `boolean` | no | `true` | Shows the Group button, whose panel picks the column the rows group by. Defaults to true; it shows when a column is `groupable`. |
| sortable | `boolean` | no | `true` | Shows the Sort button, whose panel orders, flips and removes the sorts. Defaults to true; inside a DataTable it shows when a column sorts, and holds one sort unless the table has `multiSort`. |
| primaryAction | `TableToolbarAction` | no |  | The page's main action (New project, Invite), drawn as the primary button at the bar's end. |
| secondaryActions | `TableToolbarAction[]` | no | `[]` | Actions beside the primary one (Export, Import), drawn as icon buttons before it, each named and tooltipped by its label; folded, they move into the More panel. |
| actions | `ReactNode` | no |  | Any other controls at the bar's end, after the actions. |
| labels | `Partial<TableToolbarLabels>` | no |  | The bar's words, merged over their English defaults. |
| filterLabels | `Partial<FilterLabels>` | no |  | The filters' words, merged over their English defaults (inside a DataTable, over the table's). |
| className | `string` | no | `` | Additional CSS classes |
