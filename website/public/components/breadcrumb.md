# Breadcrumb

Hierarchical navigation trail showing the user's location within the site.

Generated from the rift-ds registry and prop JSDoc, version 1.0.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { Breadcrumb } from 'rift-ds';`
- Deep import: `import { Breadcrumb } from 'rift-ds/components/Breadcrumb/Breadcrumb';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/breadcrumb

## Breadcrumb props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `BreadcrumbItem[]` | yes |  | Ordered list of breadcrumb items |
| maxItems | `number` | no |  | Maximum visible items before collapsing (min 2: first + last) |
| className | `string` | no | `` | Additional CSS classes |
| ariaLabel | `string` | no |  | Accessible name for the nav landmark. Override when more than one Breadcrumb can appear on a page — identically-named landmarks are indistinguishable to assistive technology. |
