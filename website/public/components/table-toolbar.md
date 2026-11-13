# Table toolbar

The control bar over a table: search, filter chips, sort, group, columns, density, saved views and a bulk bar, wired to a DataTable in its toolbar slot.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { TableToolbar } from 'rift-ds';`
- Deep import: `import { TableToolbar } from 'rift-ds/components/TableToolbar/TableToolbar';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/table-toolbar
- Schema: https://rift-ds.com/schema/components/table-toolbar.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

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
| command | `TableToolbarCommand` | no |  | The AI command: a button at the bar's start that turns the whole row into a one-off composer, as selecting rows turns it into the bulk bar, whose text your handler turns into a whole table setup. It reaches everything a view holds (filters, sorts, search, columns, pinning, grouping, density), so it can do in a sentence what the bar's other controls do one at a time. A long request grows the composer to three rows, pushing the table down. The library calls no model; your handler does. A change or an error lands in a toast, in the surrounding ToastProvider's stack if there is one, else in the bar's own at the bottom-right. Shows only inside a DataTable. |
| labels | `Partial<TableToolbarLabels>` | no |  | The bar's words, merged over their English defaults. |
| filterLabels | `Partial<FilterLabels>` | no |  | The filters' words, merged over their English defaults (inside a DataTable, over the table's). |
| className | `string` | no | `''` | Additional CSS classes |

## Types

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

### DataTableSort

```ts
interface DataTableSort {
  /** The column being sorted. */
  key: string;
  /** Sort direction. */
  direction: 'asc' | 'desc';
}
```

### DataTableView

One saved setup of a table: its sorts, filters, search, columns, pinning, widths, grouping, density and page size. Selection, the page and open details are the session, never part of a view.

```ts
type DataTableView = TableView;
```

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

### FilterKind

The kinds of filter, each with its own operators. A typed column's kind follows its type; an untyped one's is read from its values.

```ts
type FilterKind = 'text' | 'number' | 'date' | 'enum' | 'tags' | 'boolean';
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

### TableToolbarAction

One of the bar's own actions: its primary action, or a secondary one beside it.

```ts
interface TableToolbarAction {
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
  /** On the primary action, the further actions its split button's menu offers (Import, a template); folded, they move into the More panel. */
  menu?: TableToolbarAction[];
}
```

### TableToolbarBulkAction

One action the bulk bar offers for the selected rows.

```ts
interface TableToolbarBulkAction {
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
```

### TableToolbarColumn

One column as a TableToolbar over some other table is told about it.

```ts
interface TableToolbarColumn {
  /** The column's key. */
  key: string;
  /** Its header text. */
  label: string;
  /** How it filters: `text`, `number`, `date`, `enum` (choices) or `tags`. Defaults to `text`, or `enum` when it has options. */
  filterType?: FilterKind;
  /** The choices an `enum` or `tags` filter offers. */
  options?: { value: string; label: string }[];
  /** Whether the Columns panel may hide it. Defaults to true. */
  hideable?: boolean;
  /** Whether the Columns panel may move it, DataTable's word for the same. Defaults to true. */
  reorderable?: boolean;
  /** Whether it can be filtered. Defaults to true. */
  filterable?: boolean;
  /** Whether it can be sorted. Defaults to true. */
  sortable?: boolean;
  /** Whether the rows can be grouped by it. Defaults to false. */
  groupable?: boolean;
}
```

### TableToolbarCommand

The AI command in a TableToolbar.

```ts
interface TableToolbarCommand {
  /** Turns the reader's text into a setup. A rejection shows as an error toast, using the error's message, and leaves the table alone. */
  onSubmit: (request: TableToolbarCommandRequest) => Promise<TableToolbarCommandResult>;
}
```

### TableToolbarCommandRequest

What a TableToolbar's command handler is given.

```ts
interface TableToolbarCommandRequest {
  /** What the reader typed. */
  text: string;
  /** The table's setup right now, so a command can refine it. */
  view: TableView;
  /** The columns, as the bar knows them: keys, labels, filter kinds and choices. */
  columns: ToolbarColumn[];
  /** Aborts when the table leaves the page while the command runs. */
  signal: AbortSignal;
}
```

### TableToolbarCommandResult

What a TableToolbar's command handler answers with.

```ts
interface TableToolbarCommandResult {
  /** The whole setup to apply; applying replaces the setup, and leaving it out changes nothing. */
  view?: TableView;
  /** What was done or found. A toast carries it, with an Undo when the setup changed; a setup that changed with no message takes the `commandApplied` label. */
  message?: string;
}
```

### TableToolbarLabels

Every word the control bar shows or announces, beyond the filters', each defaulting to English.

```ts
interface TableToolbarLabels {
  /** The bar's accessible name. */
  toolbar: string;
  /** The search field's placeholder and name. */
  search: string;
  /** The Columns button, its panel and the column list's name. */
  columns: string;
  /** The Columns panel's Show all button. */
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
  /** The More button, shown when the bar is folded, whose panel holds the secondary actions and the density switch. */
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
  /** The command button's label. */
  command: string;
  /** Closes the command's row and brings the bar back. */
  commandClose: string;
  /** The command composer's placeholder. */
  commandPlaceholder: string;
  /** The command composer's send button. */
  commandSend: string;
  /** Shown when a command changes the table without a message of its own. */
  commandApplied: string;
  /** Shown when a command fails without a message of its own. */
  commandFailed: string;
  /** Puts the table back as it was before the last command. */
  commandUndo: string;
  /** Closes a command's toast in the bar's own stack; inside a ToastProvider, its `dismissLabel` applies instead. */
  commandDismiss: string;
  /** The bulk bar's menu of the actions that do not fit. */
  moreBulkActions: string;
  /** The bulk bar's button that selects every matching row, given how many match. */
  selectAll: (count: number) => string;
  /** The bulk bar's button that clears the selection. */
  clearSelection: string;
  /** On a phone, the stop in the bar's own row that hands the keyboard to the bulk bar floating at the foot of the screen, given how many rows are selected. */
  goToBulkBar: (count: number) => string;
  /** Name of a column's move grip in the Columns panel, given its header. */
  moveColumn: (label: string) => string;
  /** Announced after the panel moves a column, given its header, its new position and the column count. */
  movedColumn: (label: string, position: number, count: number) => string;
}
```

### TableToolbarSelection

What a bulk action runs on. `ids` lists every selected row. `allMatching`
says the selection is every row that matches the search and filters,
which a server can act on as a query rather than a list, leaving out
`except`. A table that holds every row resolves `ids` in full either way.

```ts
interface TableToolbarSelection {
  /** The selected row ids. */
  ids: string[];
  /** Whether every matching row is selected. */
  allMatching: boolean;
  /** Matching rows left out of an `allMatching` selection. */
  except: string[];
}
```

### TableToolbarView

One saved view of the table: its label and its setup.

```ts
interface TableToolbarView {
  /** Stable id for the view. */
  id: string;
  /** The view's name, shown as its tab's label. */
  label: string;
  /** The table's setup the view holds. */
  view: DataTableView;
}
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

### ToolbarColumn

One column as the control bar sees it.

```ts
interface ToolbarColumn {
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
```

Types from other packages: `AbortSignal` (typescript), `Partial` (typescript), `Promise` (typescript), `ReactNode` (react), `Record` (typescript).
