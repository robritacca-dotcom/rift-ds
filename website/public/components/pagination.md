# Pagination

Numbered page navigation for long datasets, with ellipses, disabled end arrows, and a compact readout mode.

Generated from the rift-ds registry and prop JSDoc, version 1.12.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { Pagination } from 'rift-ds';`
- Deep import: `import { Pagination } from 'rift-ds/components/Pagination/Pagination';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/pagination

## Pagination props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| page | `number` | no |  | Current page (1-based), for a controlled pager. Leave it undefined to let the component keep its own page, seeded from `defaultPage`. |
| defaultPage | `number` | no | `1` | Page shown on first render when the pager is uncontrolled (1-based) |
| pageCount | `number` | yes |  | Total number of pages |
| onPageChange | `((page: number) => void)` | no |  | Called with the page the user requests |
| siblingCount | `number` | no | `1` | Pages shown on each side of the current page |
| size | `"default" \| "compact"` | no | `default` | Component size — compact swaps the numbers for a "Page X of Y" readout |
| ariaLabel | `string` | no |  | Legacy accessible-name prop for the nav landmark. Deprecated: Pass the native `aria-label` attribute instead. |
| previousLabel | `string` | no | `Previous page` | Accessible name of the previous-page arrow |
| nextLabel | `string` | no | `Next page` | Accessible name of the next-page arrow |
| pageLabel | `((page: number) => string)` | no | `(page: number) => `Page ${page}`` | Accessible name of a numbered page button, given its page number |
| readoutLabel | `((page: number, pageCount: number) => string)` | no | `(page: number, pageCount: number) => `Page ${page} of ${pageCount}`` | Text of the compact size's readout, given the current page and the page count |
| className | `string` | no | `` | Additional CSS classes |
