# Command palette trigger

The entry point to a command palette: a button dressed as a search field, with the shortcut's keycaps, at the row-control height.

Generated from the rift-ds registry and prop JSDoc, version 1.15.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { CommandPaletteTrigger } from 'rift-ds';`
- Deep import: `import { CommandPaletteTrigger } from 'rift-ds/components/CommandPaletteTrigger/CommandPaletteTrigger';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/command-palette-trigger

## CommandPaletteTrigger props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no | `Search or ask anything` | The prompt the field shows, which is also the button's accessible name. |
| shortcut | `string[]` | no |  | The keyboard shortcut drawn as literal keycaps at the end, one key per entry, in place of `keys`. Pass an empty array for none. |
| keys | `string` | no | `mod+k` | The keyboard shortcut drawn at the end, in the shortcut grammar, in the reader's platform legends. Defaults to `mod+k`: ⌘ K on a Mac and Ctrl K elsewhere, announced as both, since CommandPalette answers to either. `shortcut` wins when it is given. |
| keyLabels | `Partial<Record<string, string>>` | no |  | Replaces any legend `keys` is drawn with, such as `{ ctrl: 'Strg' }` for a German keyboard. |
| icon | `ReactNode` | no | `search` | Leading icon — Material Symbol name (string) or custom element (ReactNode). |
| size | `"default" \| "compact"` | no | `default` | Control size, on the row-control scale: `default` is 40px, `compact` 32px. |
| iconOnly | `boolean` | no | `false` | Fold to the icon alone, a circle the row height across, for a row with no room for the field. The label stays the accessible name. |
| className | `string` | no | `` | Additional CSS classes |
