# Stat

Headline metrics with labels and trend deltas.

Generated from the rift-ds registry and prop JSDoc, version 1.19.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Stat } from 'rift-ds';`
- Deep import: `import { Stat } from 'rift-ds/components/Stat/Stat';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/stat

## Stat props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `ReactNode` | yes |  | The headline number, e.g. "~900%" or "3.8M" — or a node, such as an AnimatedNumber, for figures that move |
| label | `string` | yes |  | What the number measures |
| delta | `string` | no |  | Optional change annotation, e.g. "+42% vs last quarter" |
| trend | `"neutral" \| "up" \| "down"` | no | `neutral` | Direction of the delta — colours it and adds an arrow |
| deltaPlacement | `"auto" \| "inline" \| "stacked"` | no | `stacked` | Where the delta sits: stacked below the label, inline to the right of the value (bottom-aligned), or `auto`: inline while the stat has room and stacked once it is narrow, such as a KPI tile in a two-up phone grid. `auto` fills its parent's width and reads its own, so it restacks wherever it sits, whatever the viewport. |
| size | `"default" \| "large"` | no | `default` | Stat size |
| locale | `string` | no | `en-US` | The BCP 47 locale a number `value` is written in, such as `ar-EG`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. |
| className | `string` | no | `` | Additional CSS classes |
