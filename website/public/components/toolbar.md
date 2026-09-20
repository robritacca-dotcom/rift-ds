# Toolbar

A grouped strip of controls in one pill shell: clusters, separators, arrow-key focus, and a glass floating variant.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: layout
- Import: `import { Toolbar } from '@robr0/design-system';`
- Deep import: `import { Toolbar } from '@robr0/design-system/components/Toolbar/Toolbar';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/toolbar

## Toolbar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | Accessible name for the toolbar — what a screen reader calls the group. |
| orientation | `"horizontal" \| "vertical"` | no | `horizontal` | Which way the controls run. |
| variant | `"default" \| "floating"` | no | `default` | `default` is an attached bar on the container fill; `floating` is the glass pill for controls hovering over content — position it with your own layout (the component never fixes itself to the viewport). |
| children | `ReactNode` | no |  | The toolbar's controls — group unrelated clusters with `ToolbarSeparator`. |
| className | `string` | no | `` | Additional CSS classes |

## ToolbarSeparator props

No own props; native attributes pass through.
