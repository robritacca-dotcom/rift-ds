# Split button

Primary action with an attached menu of alternatives, composing Button and DropdownMenu in one pill, in primary or secondary emphasis and any tone.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { SplitButton } from 'rift-ds';`
- Deep import: `import { SplitButton } from 'rift-ds/components/SplitButton/SplitButton';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/split-button
- Schema: https://rift-ds.com/schema/components/split-button.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## SplitButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | Label of the primary action |
| onClick | `MouseEventHandler<HTMLButtonElement>` | no |  | Click handler for the primary action |
| items | `DropdownMenuEntry[]` | yes |  | Menu entries for the alternative actions |
| variant | `"neutral" \| "primary" \| "secondary"` | no | `'primary'` | Emphasis, shared by both segments: `primary` (filled) or `secondary` (outlined). The colour is `tone`'s job. `neutral` is the legacy value from before the split and renders as `variant="primary" tone="neutral"`. |
| tone | `"default" \| "destructive" \| "neutral"` | no |  | Colour, shared by both segments: `default` carries the action colour, `neutral` the greys, `destructive` the danger colour. |
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| disabled | `boolean` | no | `false` | Disables both segments |
| loading | `boolean` | no | `false` | Shows a spinner on the primary segment and blocks interaction while an async action runs |
| iconLeft | `string \| ReactNode` | no |  | Icon for the primary segment — Material Symbol name or custom element |
| align | `"start" \| "end"` | no | `'end'` | Horizontal alignment of the menu panel relative to the control |
| menuLabel | `string` | no | `'More actions'` | Accessible name of the menu trigger segment |
| className | `string` | no | `''` | Additional CSS classes, applied to the wrapper around both segments, not the primary button |

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

Types from other packages: `HTMLButtonElement` (typescript), `MouseEventHandler` (react), `ReactNode` (react).
