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
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| ariaLabel | `string` | no |  | Accessible name for the menu |
| keyLabels | `Partial<Record<string, string>>` | no |  | Replaces any legend an item's `keys` is written with, such as `{ ctrl: 'Strg' }` for a German keyboard. |
| className | `string` | no | `''` | Additional CSS classes |
| children | `ReactNode` | yes |  | The right-clickable area the menu is attached to |

## Types

### DropdownMenuEntry

```ts
type DropdownMenuEntry =
  | DropdownMenuItem
  | DropdownMenuSeparator
  | DropdownMenuGroup;
```

### DropdownMenuGroup

```ts
interface DropdownMenuGroup {
  type: 'group';
  /** Section heading */
  label: string;
  /** Items within the group */
  items: DropdownMenuEntry[];
}
```

### DropdownMenuItem

```ts
interface DropdownMenuItem {
  type?: 'item';
  /** Display label */
  label: string;
  /** A line under the label, such as what the choice does or means. It wraps the row to two lines in the caption style; the icon stays centred on the pair. */
  description?: string;
  /** Keyboard shortcut hint as literal text (e.g. "⇧ ⌘ P"). `keys` writes it for the reader's platform instead. */
  shortcut?: string;
  /** Keyboard shortcut hint in the shortcut grammar (`mod+shift+p`), written for the reader's platform (⇧⌘P on a Mac, Ctrl+Shift+P elsewhere) and announced through `aria-keyshortcuts`. Display only: bind the action itself with `useShortcut`. Wins over `shortcut`. */
  keys?: Shortcut;
  /** Item icon — Material Symbol name (string) or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** A trailing icon after the label, such as `open_in_new` on an item that opens another site. Decorative: say what the item does in its label. A Material Symbol name (string) or a custom element (ReactNode). Ignored on an item that opens a sub-menu. */
  iconRight?: string | React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Marks a dangerous or irreversible item (delete, remove…): it takes the destructive colour, with the error tint on hover and focus */
  destructive?: boolean;
  /** Marks the item as the current choice of a set: it holds the passive wash and a trailing check, and is announced as a checked radio item. Leave undefined on plain action items; pass `false` on the unchosen members of a set so they are announced as radio items too. Ignored on an item that opens a sub-menu. */
  selected?: boolean;
  /** Marks the item as one of a set picked independently: it leads with the checkbox's box, ticked when true, and is announced as a checkbox item. Leave undefined on plain action items. The host toggles it in `onClick`. Ignored on an item that opens a sub-menu. */
  checked?: boolean;
  /** Whether choosing the item closes the menu. Defaults to false for a checkbox item, so several can be toggled in one visit, and true for every other item. */
  closeOnSelect?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Nested sub-menu items */
  children?: DropdownMenuEntry[];
}
```

### DropdownMenuSeparator

```ts
interface DropdownMenuSeparator {
  type: 'separator';
}
```

### Shortcut

A shortcut in the grammar above, such as `mod+k`, `shift+?` or `g i`.

```ts
type Shortcut = string;
```

### ShortcutKeyLabels

The legends a shortcut is drawn with, by modifier or key name. Merged over the platform's defaults.

```ts
type ShortcutKeyLabels = Partial<Record<string, string>>;
```

Types from other packages: `Partial` (typescript), `ReactNode` (react), `Record` (typescript).
