# Divider

A thin rule separating stacked content, with optional inline label and vertical orientation.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: layout
- Import: `import { Divider } from '@robr0/design-system';`
- Deep import: `import { Divider } from '@robr0/design-system/components/Divider/Divider';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/divider

## Divider props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `"horizontal" \| "vertical"` | no | `horizontal` | Divider direction |
| label | `string` | no |  | Optional label rendered inline in the line (horizontal only) |
| labelPosition | `"center" \| "start"` | no | `center` | Label placement along the line |
| spacing | `"none" \| "sm" \| "md" \| "lg"` | no | `md` | Margin around the divider (block for horizontal, inline for vertical) |
| className | `string` | no | `` | Additional CSS classes |
