# Hover card

Rich preview panel that opens from hover or focus, with interactive content and position options.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: overlays
- Import: `import { HoverCard } from '@robr0/design-system';`
- Deep import: `import { HoverCard } from '@robr0/design-system/components/HoverCard/HoverCard';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/hover-card

## HoverCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | no |  | Trigger element |
| content | `ReactNode` | yes |  | Panel content — arbitrary elements, unlike Tooltip's plain text. In running text inside a `<p>`, keep it phrasing-level (spans): a block element would end the paragraph mid-parse. |
| position | `"top" \| "bottom" \| "left" \| "right"` | no | `bottom` | Preferred position |
| showDelay | `number` | no | `300` | Delay before showing (in ms) |
| hideDelay | `number` | no | `150` | Delay before hiding (in ms) |
| className | `string` | no | `` | Additional CSS classes |
