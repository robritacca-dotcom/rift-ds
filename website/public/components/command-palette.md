# Command palette

A modal Cmd+K launcher that searches a grouped command list, with keyboard navigation and shortcut hints.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: overlays
- Import: `import { CommandPalette } from '@robr0/design-system';`
- Deep import: `import { CommandPalette } from '@robr0/design-system/components/CommandPalette/CommandPalette';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/command-palette

## CommandPalette props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the palette is open |
| onOpenChange | `(open: boolean) => void` | yes |  | Callback when the palette requests to open or close |
| groups | `CommandPaletteGroup[]` | yes |  | Commands, grouped under headings |
| placeholder | `string` | no | `Type a command or search…` | Placeholder for the search field |
| emptyMessage | `string` | no | `No matching commands` | Message shown when the query matches nothing |
| loading | `boolean` | no | `false` | Show a loading affordance in place of results |
| hotkey | `boolean` | no | `true` | Bind Cmd+K / Ctrl+K globally to toggle the palette. Set to false when the host app owns the shortcut. |
| onSelect | `((command: CommandPaletteCommand) => void)` | no |  | Called with the chosen command, after its own `onSelect` |
| onSearchChange | `((query: string) => void)` | no |  | Called as the user types, for async/server-side search |
| manualFiltering | `boolean` | no | `false` | Skip built-in filtering — use when commands are filtered upstream |
| hideFooter | `boolean` | no | `false` | Hide the hint row at the bottom of the panel |
| className | `string` | no | `` | Additional CSS classes |
