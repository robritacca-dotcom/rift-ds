# Gauge

A radial dial for a single bounded reading, recoloured through the status roles as it crosses thresholds.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { Gauge } from '@robr0/design-system';`
- Deep import: `import { Gauge } from '@robr0/design-system/components/Gauge/Gauge';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/gauge

## Gauge props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number` | yes |  | Current reading. Clamped into the `min`–`max` range for drawing. |
| min | `number` | no | `0` | Lower bound of the dial. |
| max | `number` | no | `100` | Upper bound of the dial. |
| tone | `"error" \| "positive" \| "warning" \| "neutral" \| "accent"` | no | `accent` | Colour role for the value arc. `accent` (the default) follows the chart palette's lead colour. Ignored while a threshold matches — thresholds exist so the dial recolours itself as the reading crosses them. |
| thresholds | `GaugeThreshold[]` | no |  | Colour switch points, e.g. warning at 70 and error at 90. The highest threshold at or below the current reading wins; below them all, the `tone` prop applies. |
| showValue | `boolean` | no | `true` | Shows the reading in the centre of the dial. |
| formatValue | `((value: number) => string)` | no |  | Formats the centre reading — for units, precision, or locale. |
| label | `string` | no |  | What the reading measures, shown as a caption under it and used as the accessible name, e.g. "CPU usage". |
| title | `string` | no |  | Chart title, in the shared chart header. |
| subtitle | `string` | no |  | Description text below the title. |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| size | `number` | no | `120` | Rendered dial diameter in pixels. The arc geometry scales with it. |
| strokeWidth | `number` | no | `12` | Arc thickness in pixels. |
| className | `string` | no | `` | Additional CSS classes |
