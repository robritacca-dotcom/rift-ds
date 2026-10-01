# Prose

Token-styled typography for rendered markdown and rich agent output.

Generated from the rift-ds registry and prop JSDoc, version 1.2.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { Prose } from 'rift-ds';`
- Deep import: `import { Prose } from 'rift-ds/components/Prose/Prose';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/prose

## Prose props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| size | `"default" \| "sm"` | no | `default` | Body scale. `sm` maps paragraphs, lists and code to the small paragraph tokens for dense chat contexts. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | The rendered markup to style — the output of whatever markdown renderer the consumer uses. |
