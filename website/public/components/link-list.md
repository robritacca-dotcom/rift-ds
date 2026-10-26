# Link list

Linked items with logo, label, and subtitle.

Generated from the rift-ds registry and prop JSDoc, version 1.14.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { LinkList } from 'rift-ds';`
- Deep import: `import { LinkList } from 'rift-ds/components/LinkList/LinkList';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/link-list

## LinkList props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `LinkListItem[]` | yes |  | Links to render, in display order |
| className | `string` | no | `` | Additional CSS classes |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router; a plain `<a>` when unset. This component can render on the server, so it never reads a LinkProvider: pass the prop even under one. |
