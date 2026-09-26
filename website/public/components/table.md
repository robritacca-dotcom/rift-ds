# Table

Data table with flexible cell content, striped rows, compact sizing, and support for icons, inputs, buttons, and interactive controls.

Generated from the rift-ds registry and prop JSDoc, version 1.0.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Table } from 'rift-ds';`
- Deep import: `import { Table } from 'rift-ds/components/Table/Table';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/table

## Table props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| columns | `TableColumn[]` | yes |  | Column definitions |
| rows | `TableRow[]` | yes |  | Row data |
| size | `"default" \| "compact"` | no | `default` | Visual size |
| striped | `boolean` | no | `false` | Alternating row background colours |
| bordered | `boolean` | no | `false` | Adds an outer border + border-radius container, a tinted thead background, and `--color-divider` row lines — matching the bordered table style used on markdown content pages. |
| caption | `string` | no |  | Accessible caption for the table |
| captionHidden | `boolean` | no | `false` | Whether to visually hide the caption (still available to screen readers) |
| className | `string` | no | `` | Additional CSS classes |
