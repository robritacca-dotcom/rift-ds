# Tooltip

Contextual text label that appears on hover or focus with position and delay options.

Generated from the rift-ds registry and prop JSDoc, version 1.30.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { Tooltip } from 'rift-ds';`
- Deep import: `import { Tooltip } from 'rift-ds/components/Tooltip/Tooltip';`
- Rendering: client component (declares 'use client')
- Size: 2.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/tooltip
- Schema: https://rift-ds.com/schema/components/tooltip.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Tooltip props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | no |  | Trigger element |
| content | `string` | yes |  | Tooltip text content. Replaces the native `content` attribute, which only means something on a `<meta>` element. |
| position | `"top" \| "bottom" \| "start" \| "end" \| "left" \| "right"` | no | `'top'` | Preferred position. `left` and `right` are screen sides; `start` and `end` follow the reading direction, so `end` opens to the right in English and to the left in Arabic. |
| showDelay | `number` | no | `300` | Delay before showing (in ms) |
| hideDelay | `number` | no | `150` | Delay before hiding (in ms) |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA tooltip pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/).

| Key | What it does |
| --- | --- |
| On focus | Focusing the trigger shows it. |
| Escape | Hides it and leaves focus on the trigger. |

Types from other packages: `ReactNode` (react).
