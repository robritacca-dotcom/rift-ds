# Command palette

A modal Cmd+K launcher that searches a grouped command list, with keyboard navigation and shortcut hints.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { CommandPalette } from 'rift-ds';`
- Deep import: `import { CommandPalette } from 'rift-ds/components/CommandPalette/CommandPalette';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/command-palette
- Schema: https://rift-ds.com/schema/components/command-palette.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## CommandPalette props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the palette is open |
| onOpenChange | `(open: boolean) => void` | yes |  | Callback when the palette requests to open or close |
| groups | `CommandPaletteGroup[]` | yes |  | Commands, grouped under headings |
| placeholder | `string` | no | `'Type a command or search…'` | Placeholder for the search field |
| emptyMessage | `string` | no | `'No matching commands'` | Message shown when the query matches nothing |
| loading | `boolean` | no | `false` | Show a loading affordance in place of results |
| loadingMessage | `string` | no | `'Loading…'` | Status text shown in place of results while `loading` is set. Defaults to "Loading…". |
| hotkey | `boolean` | no | `true` | Bind Cmd+K / Ctrl+K globally to toggle the palette. Set to false when the host app owns the shortcut. |
| hotkeyKeys | `string \| string[]` | no | `['meta+k', 'ctrl+k']` | The shortcuts that toggle the palette when `hotkey` is on, in the shortcut grammar. Defaults to `['meta+k', 'ctrl+k']`, so both answer on every platform. They go through the shared shortcut listener, so they fire from a text field and over an open dialog. |
| keyLabels | `Partial<Record<string, string>>` | no |  | Replaces any legend a command's `keys` is drawn with, such as `{ ctrl: 'Strg' }` for a German keyboard. |
| onSelect | `((command: CommandPaletteCommand) => void)` | no |  | Called with the chosen command, after its own `onSelect`. Replaces the native `onSelect` (text-selection) handler on the panel. |
| onSearchChange | `((query: string) => void)` | no |  | Called as the user types, for async/server-side search |
| manualFiltering | `boolean` | no | `false` | Skip built-in filtering — use when commands are filtered upstream |
| hideFooter | `boolean` | no | `false` | Hide the hint row at the bottom of the panel |
| hintLabels | `{ navigate?: string; select?: string; close?: string \| undefined; escapeKey?: string \| undefined; } \| undefined` | no |  | The words in the hint row, merged over the English defaults: the text beside each key ("to navigate", "to select", "to close") and `escapeKey`, the visible name on the Escape key cap ("esc"). |
| closeLabel | `string` | no | `'Close command palette'` | Accessible name of the close button |
| className | `string` | no | `''` | Additional CSS classes on the overlay container (the ref and native attributes go on the panel) |

## Types

### CommandPaletteCommand

```ts
interface CommandPaletteCommand {
  /** Stable identifier */
  id: string;
  /** Display label — the primary text matched when filtering */
  label: string;
  /** Optional secondary line under the label */
  description?: string;
  /** Optional icon — Material Symbol name (string) or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** Keyboard shortcut shown on the right as literal keycaps, e.g. ['⌘', 'P']. `keys` draws it for the visitor's platform instead. */
  shortcut?: string[];
  /** Keyboard shortcut shown on the right in the shortcut grammar (`mod+p`), drawn in the platform's legends: ⌘ P on a Mac, Ctrl P elsewhere. Display only: bind the action itself with `useShortcut`. Wins over `shortcut`. */
  keys?: Shortcut;
  /** Custom node at the row's right edge, after any `shortcut` — a badge or affordance the keycap slot can't express. It renders inside the option row, so keep it non-interactive: a focusable element here would nest controls. */
  trailing?: React.ReactNode;
  /** Extra terms that should match this command when filtering */
  keywords?: string[];
  /** Whether the command is disabled */
  disabled?: boolean;
  /** Marks a dangerous or irreversible command (delete, remove…): the row takes the danger colour, the same as a destructive DropdownMenu item */
  destructive?: boolean;
  /** Called when this command is chosen */
  onSelect?: () => void;
}
```

### CommandPaletteGroup

```ts
interface CommandPaletteGroup {
  /** Group heading */
  label: string;
  /** Commands within the group */
  commands: CommandPaletteCommand[];
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
