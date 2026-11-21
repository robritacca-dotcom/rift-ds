# Dropdown menu

Action menu opened from a trigger, with groups, sub-menus, shortcuts, radio and checkbox items, placed to stay on screen.

Generated from the rift-ds registry and prop JSDoc, version 1.32.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { DropdownMenu } from 'rift-ds';`
- Deep import: `import { DropdownMenu } from 'rift-ds/components/DropdownMenu/DropdownMenu';`
- Rendering: client component (declares 'use client')
- Size: 9.0 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/dropdown-menu
- Schema: https://rift-ds.com/schema/components/dropdown-menu.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Context menu](https://rift-ds.com/components/context-menu.md) instead when the menu opens on the content itself.
- Use [Dropdown](https://rift-ds.com/components/dropdown.md) instead when the choice is a form value.
- Use [Menu bar](https://rift-ds.com/components/menubar.md) instead when several menus sit side by side in a persistent bar.

## DropdownMenu props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| trigger | `ReactNode` | yes |  | Trigger element that opens the menu |
| items | `DropdownMenuEntry[]` | yes |  | Menu entries (items, groups, separators) |
| align | `"start" \| "end"` | no | `'start'` | Horizontal alignment of the panel |
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| open | `boolean` | no |  | Whether the menu is open (controlled mode) |
| defaultOpen | `boolean` | no | `false` | Whether the menu starts open when uncontrolled |
| onOpenChange | `((open: boolean) => void)` | no |  | Callback when the menu opens or closes |
| keyLabels | `Partial<Record<string, string>>` | no |  | Replaces any legend an item's `keys` is written with, such as `{ ctrl: 'Strg' }` for a German keyboard. |
| className | `string` | no | `''` | Additional CSS classes on the root wrapper, which holds the trigger and the panel |

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
