# Kbd

A keyboard key rendered as a keycap, for shortcut hints in menus and prose.

Generated from the rift-ds registry and prop JSDoc, version 1.14.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Kbd } from 'rift-ds';`
- Deep import: `import { Kbd } from 'rift-ds/components/Kbd/Kbd';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/kbd

## Kbd props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| size | `"default" \| "compact"` | no | `default` | Key size |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | The key legend — e.g. ⌘, K, Esc, Shift. Ignored when `keys` is set. |
| keys | `string` | no |  | A whole shortcut in the shortcut grammar (`mod+k`, `shift+?`, `g i`), drawn as one keycap per key in the platform's legends: ⌘ K on a Mac, Ctrl K elsewhere. The server draws the non-Apple legends and the browser settles on its own after hydration. |
| keyLabels | `Partial<Record<string, string>>` | no |  | Replaces any legend `keys` is drawn with, such as `{ ctrl: 'Strg' }` for a German keyboard. Merged over the platform's defaults. |
