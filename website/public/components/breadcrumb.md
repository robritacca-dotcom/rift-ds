# Breadcrumb

Hierarchical navigation trail showing the user's location within the site.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: navigation
- Import: `import { Breadcrumb } from '@robr0/design-system';`
- Deep import: `import { Breadcrumb } from '@robr0/design-system/components/Breadcrumb/Breadcrumb';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/breadcrumb

## Breadcrumb props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `BreadcrumbItem[]` | yes |  | Ordered list of breadcrumb items |
| maxItems | `number` | no |  | Maximum visible items before collapsing (min 2: first + last) |
| className | `string` | no | `` | Additional CSS classes |
| ariaLabel | `string` | no |  | Accessible name for the nav landmark. Override when more than one Breadcrumb can appear on a page — identically-named landmarks are indistinguishable to assistive technology. |
