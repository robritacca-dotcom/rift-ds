# Skeleton

Placeholder loading indicators with text, circular, and rectangular variants.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: feedback
- Import: `import { Skeleton } from '@robr0/design-system';`
- Deep import: `import { Skeleton } from '@robr0/design-system/components/Skeleton/Skeleton';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/skeleton

## Skeleton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| variant | `"text" \| "circular" \| "rectangular"` | no | `text` | Shape of the skeleton |
| width | `string` | no |  | Width (CSS value, e.g. '100%', '200px') |
| height | `string` | no |  | Height (CSS value, e.g. '20px', '100px') |
| lines | `number` | no | `1` | Number of text lines to render (only for text variant) |
| className | `string` | no | `` | Additional CSS classes |
