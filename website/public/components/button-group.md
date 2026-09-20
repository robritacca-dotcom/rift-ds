# Button group

Horizontal and vertical button group layouts for related actions and navigation patterns.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: actions
- Import: `import { ButtonGroup } from '@robr0/design-system';`
- Deep import: `import { ButtonGroup } from '@robr0/design-system/components/ButtonGroup/ButtonGroup';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/button-group

## ButtonGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `"horizontal" \| "vertical"` | no | `horizontal` | Orientation of the button group |
| buttons | `ButtonProps[]` | yes |  | Array of button configurations |
| ariaLabel | `string` | no |  | Accessible label for the group |
| className | `string` | no | `` | Additional CSS class |
