# Button group

Horizontal and vertical button group layouts for related actions and navigation patterns.

Generated from the rift-ds registry and prop JSDoc, version 1.1.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { ButtonGroup } from 'rift-ds';`
- Deep import: `import { ButtonGroup } from 'rift-ds/components/ButtonGroup/ButtonGroup';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/button-group

## ButtonGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `"horizontal" \| "vertical"` | no | `horizontal` | Orientation of the button group |
| buttons | `ButtonProps[]` | yes |  | Array of button configurations |
| ariaLabel | `string` | no |  | Accessible label for the group |
| className | `string` | no | `` | Additional CSS class |
