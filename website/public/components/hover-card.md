# Hover card

Rich preview panel that opens from hover or focus, with interactive content and position options.

Generated from the rift-ds registry and prop JSDoc, version 1.1.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { HoverCard } from 'rift-ds';`
- Deep import: `import { HoverCard } from 'rift-ds/components/HoverCard/HoverCard';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/hover-card

## HoverCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | no |  | Trigger element |
| content | `ReactNode` | yes |  | Panel content — arbitrary elements, unlike Tooltip's plain text. In running text inside a `<p>`, keep it phrasing-level (spans): a block element would end the paragraph mid-parse. |
| position | `"top" \| "bottom" \| "left" \| "right"` | no | `bottom` | Preferred position |
| showDelay | `number` | no | `300` | Delay before showing (in ms) |
| hideDelay | `number` | no | `150` | Delay before hiding (in ms) |
| className | `string` | no | `` | Additional CSS classes |
