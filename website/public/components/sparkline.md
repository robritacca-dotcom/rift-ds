# Sparkline

Inline trend line for stats and table cells, drawn without axes or chrome.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { Sparkline } from '@robr0/design-system';`
- Deep import: `import { Sparkline } from '@robr0/design-system/components/Sparkline/Sparkline';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/sparkline

## Sparkline props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | `number[]` | yes |  | The series to plot, in order. Values are normalised into the viewBox. |
| variant | `"area" \| "line"` | no | `line` | Rendering treatment — a bare line, or a line with a soft fill underneath. |
| tone | `"positive" \| "neutral" \| "accent" \| "negative"` | no | `accent` | Colour role for the line and end dot. `accent` follows the chart palette's lead colour; `positive`/`negative` map to the status text tokens; `neutral` recedes to secondary text. |
| showDot | `boolean` | no | `true` | Marks the final point with a small dot. |
| strokeWidth | `number` | no | `2` | Line thickness in viewBox units — an SVG geometry attribute, not a token. |
| width | `number` | no | `120` | ViewBox width. Also the default rendered width; the SVG scales to its container when sized externally via CSS. Intentionally shadows the native SVG `width` attribute, which it sets. |
| height | `number` | no | `32` | ViewBox height. Also the default rendered height; the SVG scales to its container when sized externally via CSS. Intentionally shadows the native SVG `height` attribute, which it sets. |
| label | `string` | no |  | Accessible description of the trend, e.g. "Revenue, trending up". When omitted the SVG is decorative and hidden from assistive technology. |
| className | `string` | no | `` | Additional CSS classes |
