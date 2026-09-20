# Stat

Headline metrics with labels and trend deltas.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { Stat } from '@robr0/design-system';`
- Deep import: `import { Stat } from '@robr0/design-system/components/Stat/Stat';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/stat

## Stat props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `string` | yes |  | The headline number, e.g. "~900%" or "3.8M" |
| label | `string` | yes |  | What the number measures |
| delta | `string` | no |  | Optional change annotation, e.g. "+42% vs last quarter" |
| trend | `"neutral" \| "up" \| "down"` | no | `neutral` | Direction of the delta — colours it and adds an arrow |
| deltaPlacement | `"inline" \| "stacked"` | no | `stacked` | Where the delta sits: stacked below the label, or inline to the right of the value, bottom-aligned |
| size | `"default" \| "large"` | no | `default` | Stat size |
| className | `string` | no | `` | Additional CSS classes |
