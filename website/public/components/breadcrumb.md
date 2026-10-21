# Breadcrumb

Hierarchical navigation trail showing the user's location within the site.

Generated from the rift-ds registry and prop JSDoc, version 1.11.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

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
| ariaLabel | `string` | no |  | Legacy accessible-name prop for the nav landmark. Deprecated: Pass the native `aria-label` attribute instead. |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router; a plain `<a>` when unset. This component can render on the server, so it never reads a LinkProvider: pass the prop even under one. |
