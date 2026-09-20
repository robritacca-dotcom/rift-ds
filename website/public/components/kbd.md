# Kbd

A keyboard key rendered as a keycap, for shortcut hints in menus and prose.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { Kbd } from '@robr0/design-system';`
- Deep import: `import { Kbd } from '@robr0/design-system/components/Kbd/Kbd';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/kbd

## Kbd props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| size | `"default" \| "compact"` | no | `default` | Key size |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | The key legend — e.g. ⌘, K, Esc, Shift |
