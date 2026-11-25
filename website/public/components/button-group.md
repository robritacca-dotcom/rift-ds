# Button group

Horizontal and vertical button group layouts for related actions and navigation patterns.

Generated from the rift-ds registry and prop JSDoc, version 1.37.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: actions
- Import: `import { ButtonGroup } from 'rift-ds';`
- Deep import: `import { ButtonGroup } from 'rift-ds/components/ButtonGroup/ButtonGroup';`
- Rendering: server-renderable (no 'use client')
- Size: 1.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/button-group
- Schema: https://rift-ds.com/schema/components/button-group.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ButtonGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| orientation | `"horizontal" \| "vertical"` | no | `'horizontal'` | Orientation of the button group |
| buttons | `ButtonProps[]` | yes |  | Array of button configurations |
| ariaLabel | `string` | no |  | Legacy accessible-name prop for the group. Deprecated: Pass the native `aria-label` attribute instead. |
| className | `string` | no | `''` | Additional CSS class |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The buttons follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |

## Types

### ButtonProps

The props of Button: `get_component("Button")`.

Types from other packages: `Array` (typescript).
