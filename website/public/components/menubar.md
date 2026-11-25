# Menu bar

A persistent row of menus, like an app's File, Edit and View, with arrow keys along the bar.

Generated from the rift-ds registry and prop JSDoc, version 1.37.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { Menubar } from 'rift-ds';`
- Deep import: `import { Menubar } from 'rift-ds/components/Menubar/Menubar';`
- Rendering: client component (declares 'use client')
- Size: 9.5 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/menubar
- Schema: https://rift-ds.com/schema/components/menubar.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Toolbar](https://rift-ds.com/components/toolbar.md) instead when the bar holds controls that act at once rather than menus.
- Use [Dropdown menu](https://rift-ds.com/components/dropdown-menu.md) instead when one menu opens from one trigger.

## Menubar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| menus | `MenubarMenu[]` | yes |  | The menus, in order along the bar. |
| label | `string` | no | `'Menu bar'` | Accessible name for the bar. |
| size | `"default" \| "compact"` | no | `'default'` | Trigger and menu size. |
| keyLabels | `Partial<Record<string, string>>` | no |  | Key names for the shortcut hints in every menu, for a keyboard other than English (passed to each DropdownMenu). |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA menu bar pattern (https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).

| Key | What it does |
| --- | --- |
| Tab | Moves focus into the bar at the last menu it was on, and out of the bar on the next press. |
| Arrow Right | Moves to the next menu, opening it if a menu is open. The opposite arrow in a right-to-left layout. |
| Arrow Left | Moves to the previous menu, opening it if a menu is open. The opposite arrow in a right-to-left layout. |
| End | Moves to the last menu. |
| Home | Moves to the first menu. |
| Arrow Down | Opens the menu and moves into it; the menu's own keys then apply. |
| Escape | Closes the open menu and returns focus to its name in the bar. |

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

### MenubarMenu

One menu in the bar: its trigger's label and the entries it opens.

```ts
interface MenubarMenu {
  /** The trigger's text, e.g. "File". Also the open menu's accessible name. */
  label: string;
  /** The menu's entries, in DropdownMenu's shape: items, groups, separators, checkbox and radio items, sub-menus and shortcuts. */
  items: DropdownMenuEntry[];
  /** Show the trigger but do not let it open. */
  disabled?: boolean;
  /** Stable identity for the menu, when two menus share a label. Defaults to the label. */
  id?: string;
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
