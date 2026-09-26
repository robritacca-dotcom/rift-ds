# Divider

A thin rule separating stacked content, with optional inline label and vertical orientation.

Generated from the rift-ds registry and prop JSDoc, version 1.0.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { Divider } from 'rift-ds';`
- Deep import: `import { Divider } from 'rift-ds/components/Divider/Divider';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/divider

## Divider props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `"horizontal" \| "vertical"` | no | `horizontal` | Divider direction |
| label | `string` | no |  | Optional label rendered inline in the line (horizontal only) |
| labelPosition | `"center" \| "start"` | no | `center` | Label placement along the line |
| spacing | `"none" \| "sm" \| "md" \| "lg"` | no | `md` | Margin around the divider (block for horizontal, inline for vertical) |
| className | `string` | no | `` | Additional CSS classes |
