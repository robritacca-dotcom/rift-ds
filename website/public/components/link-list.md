# Link list

Linked items with logo, label, and subtitle.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { LinkList } from '@robr0/design-system';`
- Deep import: `import { LinkList } from '@robr0/design-system/components/LinkList/LinkList';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/link-list

## LinkList props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `LinkListItem[]` | yes |  | Links to render, in display order |
| className | `string` | no | `` | Additional CSS classes |
