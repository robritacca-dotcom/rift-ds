# Pagination

Numbered page navigation for long datasets, with ellipses, disabled end arrows, and a compact readout mode.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: navigation
- Import: `import { Pagination } from '@robr0/design-system';`
- Deep import: `import { Pagination } from '@robr0/design-system/components/Pagination/Pagination';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/pagination

## Pagination props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| page | `number` | yes |  | Current page (1-based) |
| pageCount | `number` | yes |  | Total number of pages |
| onPageChange | `(page: number) => void` | yes |  | Callback with the requested page |
| siblingCount | `number` | no | `1` | Pages shown on each side of the current page |
| size | `"default" \| "compact"` | no | `default` | Component size — compact swaps the numbers for a "Page X of Y" readout |
| ariaLabel | `string` | no | `Pagination` | Accessible label for the nav landmark |
| className | `string` | no | `` | Additional CSS classes |
