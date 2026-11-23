# Panel

The plain dashboard surface: a rounded container with padding and a gap, borderless unless it needs an edge.

Generated from the rift-ds registry and prop JSDoc, version 1.36.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { Panel } from 'rift-ds';`
- Deep import: `import { Panel } from 'rift-ds/components/Panel/Panel';`
- Rendering: server-renderable (no 'use client')
- Size: 0.3 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/panel
- Schema: https://rift-ds.com/schema/components/panel.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Panel props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| padding | `"none" \| "default" \| "compact"` | no | `'default'` | Interior padding: 'default' uses --padding-500, 'compact' uses --padding-400, 'none' removes it |
| bordered | `boolean` | no | `false` | Draws the container border the Widget tile wears, so the panel keeps a visible edge in a theme whose page fill matches the panel's. |
| className | `string` | no | `''` | Additional CSS classes |
| children | `ReactNode` | no |  | Panel content |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

Types from other packages: `ReactNode` (react).
