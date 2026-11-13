# Table

Data table with flexible cell content, striped rows, compact sizing, and support for icons, inputs, buttons, and interactive controls.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Table } from 'rift-ds';`
- Deep import: `import { Table } from 'rift-ds/components/Table/Table';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/table
- Schema: https://rift-ds.com/schema/components/table.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Table props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| columns | `TableColumn[]` | yes |  | Column definitions |
| rows | `TableRow[]` | yes |  | Row data |
| size | `"default" \| "compact"` | no | `'default'` | Visual size |
| striped | `boolean` | no | `false` | Alternating row background colours |
| bordered | `boolean` | no | `false` | Adds an outer border + border-radius container, a tinted thead background, and `--color-divider` row lines — matching the bordered table style used on markdown content pages. |
| columnDividers | `boolean` | no | `false` | Draws a vertical line between columns, as well as the lines between rows. |
| caption | `string` | no |  | Accessible caption for the table |
| captionHidden | `boolean` | no | `false` | Whether to visually hide the caption (still available to screen readers) |
| className | `string` | no | `''` | Additional CSS classes |

## Types

### TableColumn

```ts
interface TableColumn {
  /** Unique column identifier, used as the key into each row's cells */
  key: string;
  /** Header label displayed in the column header */
  header: React.ReactNode;
  /** Optional column width (CSS value like '200px', '30%', 'auto') */
  width?: string;
  /** Text alignment for cells in this column. `start` (the default) and `end` follow the reading direction, so a number column set to `end` sits right in English and left in Arabic; `left` and `right` are screen sides. */
  align?: 'start' | 'center' | 'end' | 'left' | 'right';
  /** The column's current sort, the direction DataTable's sorts use, set as `aria-sort` on its header so a screen reader announces it while reading the column. Leave unset on unsorted columns. */
  sort?: 'asc' | 'desc';
  /** Whether this column names each row. Its cells render as row headers (`<th scope="row">`), so moving along a row announces which record it is. */
  rowHeader?: boolean;
}
```

### TableRow

```ts
interface TableRow {
  /** Unique row identifier */
  id: string;
  /** Cell values keyed by column key — each accepts any React node */
  cells: Record<string, React.ReactNode>;
  /** Whether the row is selected, drawn with the table's selected-row tint. */
  selected?: boolean;
}
```

Types from other packages: `ReactNode` (react), `Record` (typescript).
