# Context menu

Right-click menu at the pointer with groups, sub-menus, and shortcut hints.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: overlays
- Import: `import { ContextMenu } from '@robr0/design-system';`
- Deep import: `import { ContextMenu } from '@robr0/design-system/components/ContextMenu/ContextMenu';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/context-menu

## ContextMenu props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `DropdownMenuEntry[]` | yes |  | Menu entries — the same model as DropdownMenu (items, groups, separators) |
| size | `"default" \| "compact"` | no | `default` | Component size |
| ariaLabel | `string` | no |  | Accessible name for the menu |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | yes |  | The right-clickable area the menu is attached to |
