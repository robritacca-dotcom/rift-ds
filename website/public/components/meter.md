# Meter

Level indicator for a known quantity, with a status-coloured fill and an optional value readout.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: feedback
- Import: `import { Meter } from '@robr0/design-system';`
- Deep import: `import { Meter } from '@robr0/design-system/components/Meter/Meter';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/meter

## Meter props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number` | no | `0` | Current level |
| min | `number` | no | `0` | Lower bound of the range |
| max | `number` | no | `100` | Upper bound of the range |
| label | `string` | no |  | Visible label naming what is measured, doubling as the accessible name |
| showValue | `boolean` | no | `false` | Shows the value readout on the trailing edge of the label row |
| valueText | `string` | no |  | Readout override — replaces the default percentage, spoken via aria-valuetext |
| variant | `"error" \| "info" \| "positive" \| "warning" \| "neutral"` | no | `info` | Status role colouring the fill |
| size | `"default" \| "compact"` | no | `default` | Component size (bar height) |
| className | `string` | no | `` | Additional CSS classes |
