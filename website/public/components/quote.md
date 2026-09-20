# Quote

Blockquotes and pull-quotes with attribution.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { Quote } from '@robr0/design-system';`
- Deep import: `import { Quote } from '@robr0/design-system/components/Quote/Quote';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/quote

## Quote props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | The quote text |
| attribution | `string` | no |  | Who said it, e.g. "Jordan Reyes" |
| detail | `string` | no |  | Context under the attribution, e.g. "Design Lead, Northlight" |
| variant | `"default" \| "pull"` | no | `default` | `default` is an inline blockquote; `pull` is a large display pull-quote |
| className | `string` | no | `` | Additional CSS classes |
