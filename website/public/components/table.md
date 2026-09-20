# Table

Data table with flexible cell content, striped rows, compact sizing, and support for icons, inputs, buttons, and interactive controls.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { Table } from '@robr0/design-system';`
- Deep import: `import { Table } from '@robr0/design-system/components/Table/Table';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/table

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
