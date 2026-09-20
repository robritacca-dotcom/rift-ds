# Tooltip

Contextual text label that appears on hover or focus with position and delay options.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: overlays
- Import: `import { Tooltip } from '@robr0/design-system';`
- Deep import: `import { Tooltip } from '@robr0/design-system/components/Tooltip/Tooltip';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/tooltip

## Tooltip props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | no |  | Trigger element |
| content | `string` | yes |  | Tooltip text content |
| position | `"top" \| "bottom" \| "left" \| "right"` | no | `top` | Preferred position |
| showDelay | `number` | no | `300` | Delay before showing (in ms) |
| hideDelay | `number` | no | `150` | Delay before hiding (in ms) |
| className | `string` | no | `` | Additional CSS classes |
