# Command palette

A modal Cmd+K launcher that searches a grouped command list, with keyboard navigation and shortcut hints.

Generated from the rift-ds registry and prop JSDoc, version 1.18.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { CommandPalette } from 'rift-ds';`
- Deep import: `import { CommandPalette } from 'rift-ds/components/CommandPalette/CommandPalette';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/command-palette

## CommandPalette props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the palette is open |
| onOpenChange | `(open: boolean) => void` | yes |  | Callback when the palette requests to open or close |
| groups | `CommandPaletteGroup[]` | yes |  | Commands, grouped under headings |
| placeholder | `string` | no | `Type a command or search…` | Placeholder for the search field |
| emptyMessage | `string` | no | `No matching commands` | Message shown when the query matches nothing |
| loading | `boolean` | no | `false` | Show a loading affordance in place of results |
| loadingMessage | `string` | no | `Loading…` | Status text shown in place of results while `loading` is set. Defaults to "Loading…". |
| hotkey | `boolean` | no | `true` | Bind Cmd+K / Ctrl+K globally to toggle the palette. Set to false when the host app owns the shortcut. |
| hotkeyKeys | `string \| string[]` | no | `['meta+k', 'ctrl+k']` | The shortcuts that toggle the palette when `hotkey` is on, in the shortcut grammar. Defaults to `['meta+k', 'ctrl+k']`, so both answer on every platform. They go through the shared shortcut listener, so they fire from a text field and over an open dialog. |
| keyLabels | `Partial<Record<string, string>>` | no |  | Replaces any legend a command's `keys` is drawn with, such as `{ ctrl: 'Strg' }` for a German keyboard. |
| onSelect | `((command: CommandPaletteCommand) => void)` | no |  | Called with the chosen command, after its own `onSelect`. Replaces the native `onSelect` (text-selection) handler on the panel. |
| onSearchChange | `((query: string) => void)` | no |  | Called as the user types, for async/server-side search |
| manualFiltering | `boolean` | no | `false` | Skip built-in filtering — use when commands are filtered upstream |
| hideFooter | `boolean` | no | `false` | Hide the hint row at the bottom of the panel |
| hintLabels | `{ navigate?: string; select?: string; close?: string \| undefined; escapeKey?: string \| undefined; } \| undefined` | no |  | The words in the hint row, merged over the English defaults: the text beside each key ("to navigate", "to select", "to close") and `escapeKey`, the visible name on the Escape key cap ("esc"). |
| closeLabel | `string` | no | `Close command palette` | Accessible name of the close button |
| className | `string` | no | `` | Additional CSS classes on the overlay container (the ref and native attributes go on the panel) |
