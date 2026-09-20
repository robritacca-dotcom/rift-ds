# Badge

Small inline status labels with info, positive, warning, error, and neutral variants.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { Badge } from '@robr0/design-system';`
- Deep import: `import { Badge } from '@robr0/design-system/components/Badge/Badge';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/badge

## Badge props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | Badge label text |
| variant | `"error" \| "info" \| "positive" \| "warning" \| "neutral"` | no | `neutral` | Badge variant determines colour |
| className | `string` | no | `` | Additional CSS classes |
