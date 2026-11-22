# Hover card

Rich preview panel that opens from hover or focus, with interactive content and position options.

Generated from the rift-ds registry and prop JSDoc, version 1.34.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { HoverCard } from 'rift-ds';`
- Deep import: `import { HoverCard } from 'rift-ds/components/HoverCard/HoverCard';`
- Rendering: client component (declares 'use client')
- Size: 2.6 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/hover-card
- Schema: https://rift-ds.com/schema/components/hover-card.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## HoverCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | no |  | Trigger element |
| content | `ReactNode` | yes |  | Panel content — arbitrary elements, unlike Tooltip's plain text. In running text inside a `<p>`, keep it phrasing-level (spans): a block element would end the paragraph mid-parse. Note: this shadows the native `content` attribute, which HoverCard does not expose. |
| position | `"top" \| "bottom" \| "left" \| "right" \| "start" \| "end"` | no | `'bottom'` | Preferred position. `left` and `right` are screen sides; `start` and `end` follow the reading direction, so `end` opens to the right in English and to the left in Arabic. |
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
