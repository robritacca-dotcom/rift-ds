# Dropdown menu

Action menu opened from a trigger, with groups, sub-menus, shortcuts, radio and checkbox items, placed to stay on screen.

Generated from the rift-ds registry and prop JSDoc, version 1.19.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { DropdownMenu } from 'rift-ds';`
- Deep import: `import { DropdownMenu } from 'rift-ds/components/DropdownMenu/DropdownMenu';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/dropdown-menu

## DropdownMenu props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| trigger | `ReactNode` | yes |  | Trigger element that opens the menu |
| items | `DropdownMenuEntry[]` | yes |  | Menu entries (items, groups, separators) |
| align | `"start" \| "end"` | no | `start` | Horizontal alignment of the panel |
| size | `"default" \| "compact"` | no | `default` | Component size |
| open | `boolean` | no |  | Whether the menu is open (controlled mode) |
| defaultOpen | `boolean` | no | `false` | Whether the menu starts open when uncontrolled |
| onOpenChange | `((open: boolean) => void)` | no |  | Callback when the menu opens or closes |
| keyLabels | `Partial<Record<string, string>>` | no |  | Replaces any legend an item's `keys` is written with, such as `{ ctrl: 'Strg' }` for a German keyboard. |
| className | `string` | no | `` | Additional CSS classes on the root wrapper, which holds the trigger and the panel |
