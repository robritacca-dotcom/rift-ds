# Quote

Blockquotes and pull-quotes with attribution.

Generated from the rift-ds registry and prop JSDoc, version 1.23.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Quote } from 'rift-ds';`
- Deep import: `import { Quote } from 'rift-ds/components/Quote/Quote';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/quote
- Schema: https://rift-ds.com/schema/components/quote.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Quote props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | The quote text |
| attribution | `string` | no |  | Who said it, e.g. "Jordan Reyes" |
| detail | `string` | no |  | Context under the attribution, e.g. "Design Lead, Northlight" |
| variant | `"default" \| "pull"` | no | `default` | `default` is an inline blockquote; `pull` is a large display pull-quote |
| className | `string` | no | `` | Additional CSS classes |
