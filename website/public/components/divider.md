# Divider

A thin rule separating stacked content, with optional inline label and vertical orientation.

Generated from the rift-ds registry and prop JSDoc, version 1.31.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { Divider } from 'rift-ds';`
- Deep import: `import { Divider } from 'rift-ds/components/Divider/Divider';`
- Rendering: server-renderable (no 'use client')
- Size: 0.4 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/divider
- Schema: https://rift-ds.com/schema/components/divider.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Divider props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `"horizontal" \| "vertical"` | no | `'horizontal'` | Divider direction |
| label | `string` | no |  | Optional label rendered inline in the line (horizontal only) |
| labelPosition | `"center" \| "start"` | no | `'center'` | Label placement along the line |
| spacing | `"none" \| "sm" \| "md" \| "lg"` | no | `'md'` | Margin around the divider (block for horizontal, inline for vertical) |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.
