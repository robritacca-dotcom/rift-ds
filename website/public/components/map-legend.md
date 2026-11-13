# Map legend

The corner block of a map: its name, what it shows, and the key to its markers.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: maps
- Import: `import { MapLegend } from 'rift-ds';`
- Deep import: `import { MapLegend } from 'rift-ds/components/MapLegend/MapLegend';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/map-legend
- Schema: https://rift-ds.com/schema/components/map-legend.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## MapLegend props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | no |  | The map's name, set above the key. Intentionally shadows the native `title` tooltip attribute, which MapLegend does not expose. |
| description | `ReactNode` | no |  | One or two lines saying what the map shows. |
| items | `MapLegendItem[]` | no | `[]` | The key itself: one row per marker kind. |
| className | `string` | no | `''` | Additional CSS classes |

## Types

### MapLegendItem

One row of the key.

```ts
interface MapLegendItem {
  /**
   * The marker the row explains. `point` and `anchor` draw Globe's cross and
   * square; `arc` draws a short stroke of the arc gradient; a `line` is a flat
   * rule in `color`; any React node renders as given.
   */
  glyph: 'point' | 'anchor' | 'arc' | 'line' | React.ReactNode;
  /** What the marker means. */
  label: React.ReactNode;
  /** Colour for the `line` glyph (and the `arc` glyph, replacing its gradient). Any CSS colour. */
  color?: string;
}
```

Types from other packages: `ReactNode` (react).
