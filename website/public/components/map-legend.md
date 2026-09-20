# Map legend

The corner block of a map: its name, what it shows, and the key to its markers.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: maps
- Import: `import { MapLegend } from '@robr0/design-system';`
- Deep import: `import { MapLegend } from '@robr0/design-system/components/MapLegend/MapLegend';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/map-legend

## MapLegend props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | no |  | The map's name, set above the key. Intentionally shadows the native `title` tooltip attribute, which MapLegend does not expose. |
| description | `ReactNode` | no |  | One or two lines saying what the map shows. |
| items | `MapLegendItem[]` | no | `[]` | The key itself: one row per marker kind. |
| className | `string` | no | `` | Additional CSS classes |
