# Context menu

Right-click menu at the pointer with groups, sub-menus, and shortcut hints.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { ContextMenu } from 'rift-ds';`
- Deep import: `import { ContextMenu } from 'rift-ds/components/ContextMenu/ContextMenu';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/context-menu
- Schema: https://rift-ds.com/schema/components/context-menu.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ContextMenu props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `DropdownMenuEntry[]` | yes |  | Menu entries — DropdownMenu's model (items, groups, separators). A context menu draws an item's label, icon, shortcut, selected and destructive states; it does not draw `description` or `checked`, and `closeOnSelect` is not read. |
| size | `"default" \| "compact"` | no | `default` | Component size |
| ariaLabel | `string` | no |  | Accessible name for the menu |
| keyLabels | `Partial<Record<string, string>>` | no |  | Replaces any legend an item's `keys` is written with, such as `{ ctrl: 'Strg' }` for a German keyboard. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | yes |  | The right-clickable area the menu is attached to |
