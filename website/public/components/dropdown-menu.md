# Dropdown menu

Contextual menu with sections, sub-menus, keyboard shortcuts, and inset-gap hover styling.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: overlays
- Import: `import { DropdownMenu } from '@robr0/design-system';`
- Deep import: `import { DropdownMenu } from '@robr0/design-system/components/DropdownMenu/DropdownMenu';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/dropdown-menu

## DropdownMenu props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| trigger | `ReactNode` | yes |  | Trigger element that opens the menu |
| items | `DropdownMenuEntry[]` | yes |  | Menu entries (items, groups, separators) |
| align | `"start" \| "end"` | no | `start` | Horizontal alignment of the panel |
| size | `"default" \| "compact"` | no | `default` | Component size |
| className | `string` | no | `` | Additional CSS classes |
