# Legend tile

The labelled value tile under a chart: a series dot, the series name, and its reading, on an inset fill.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { LegendTile } from '@robr0/design-system';`
- Deep import: `import { LegendTile } from '@robr0/design-system/components/LegendTile/LegendTile';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/legend-tile

## LegendTile props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | The series name shown above the value. Truncates with an ellipsis rather than wrapping. |
| value | `string \| number` | yes |  | The reading for this series. Numbers are formatted with `toLocaleString()`; pass a string when the value carries its own formatting or a unit. |
| swatch | `string` | no |  | Any CSS colour for the series dot — consumers typically pass a chart palette token, e.g. `var(--color-chart-series-1)`. When omitted, no dot renders. |
| className | `string` | no | `` | Additional CSS classes |
