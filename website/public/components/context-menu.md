# Context menu

Right-click menu at the pointer with groups, sub-menus, and shortcut hints.

Generated from the rift-ds registry and prop JSDoc, version 1.40.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { ContextMenu } from 'rift-ds';`
- Deep import: `import { ContextMenu } from 'rift-ds/components/ContextMenu/ContextMenu';`
- Rendering: client component (declares 'use client')
- Size: 7.9 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/context-menu
- Schema: https://rift-ds.com/schema/components/context-menu.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Dropdown menu](https://rift-ds.com/components/dropdown-menu.md) instead when the menu opens from a visible trigger.

## ContextMenu props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `DropdownMenuEntry[]` | yes |  | Menu entries — DropdownMenu's model (items, groups, separators). A context menu draws an item's label, icon, shortcut, selected and destructive states; it does not draw `description` or `checked`, and `closeOnSelect` is not read. |
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| ariaLabel | `string` | no |  | Legacy accessible-name prop for the menu. A native `aria-label` wins when both are passed, and names the menu rather than the wrapper. Deprecated: Pass the native `aria-label` attribute instead. |
| keyLabels | `Partial<Record<string, string>>` | no |  | Replaces any legend an item's `keys` is written with, such as `{ ctrl: 'Strg' }` for a German keyboard. |
| className | `string` | no | `''` | Additional CSS classes |
| children | `ReactNode` | yes |  | The right-clickable area the menu is attached to |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA menu pattern (https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).

| Key | What it does |
| --- | --- |
| On open | Opening the menu moves focus into it. |
| Arrow Down | Moves to the next item. |
| Arrow Up | Moves to the previous item. |
| End | Moves to the last item. |
| Home | Moves to the first item. |
| A letter | Moves to the next item whose name starts with it. |
| Escape | Closes the menu and returns focus to what opened it. |

## Types

### DropdownMenuEntry

```ts
type DropdownMenuEntry =
  | DropdownMenuItem
  | DropdownMenuSeparator
  | DropdownMenuGroup;
```

### DropdownMenuGroup

The props of DropdownMenu: `get_component("DropdownMenu")`.

### DropdownMenuItem

The props of DropdownMenu: `get_component("DropdownMenu")`.

### DropdownMenuSeparator

The props of DropdownMenu: `get_component("DropdownMenu")`.

### ShortcutKeyLabels

The legends a shortcut is drawn with, by modifier or key name. Merged over the platform's defaults.

```ts
type ShortcutKeyLabels = Partial<Record<string, string>>;
```

Types from other packages: `Partial` (typescript), `ReactNode` (react), `Record` (typescript).
