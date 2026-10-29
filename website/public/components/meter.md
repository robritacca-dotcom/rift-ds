# Meter

Level indicator for a known quantity, with a status-coloured fill and an optional value readout.

Generated from the rift-ds registry and prop JSDoc, version 1.17.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: feedback
- Import: `import { Meter } from 'rift-ds';`
- Deep import: `import { Meter } from 'rift-ds/components/Meter/Meter';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/meter

## Meter props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number` | no | `0` | Current level |
| min | `number` | no | `0` | Lower bound of the range |
| max | `number` | no | `100` | Upper bound of the range |
| label | `string` | no |  | Visible label naming what is measured, doubling as the meter's accessible name. A native `aria-label` takes precedence, and with neither the meter is announced as "Level". |
| showValue | `boolean` | no | `false` | Shows the value readout on the trailing edge of the label row |
| valueText | `string` | no |  | Readout override — replaces the default percentage, spoken via aria-valuetext |
| variant | `"error" \| "info" \| "positive" \| "warning" \| "neutral"` | no | `info` | Status role colouring the fill |
| size | `"default" \| "compact"` | no | `default` | Component size (bar height) |
| locale | `string` | no | `en-US` | The BCP 47 locale the default percentage readout is written in, such as `ar-EG`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. |
| className | `string` | no | `` | Additional CSS classes |
