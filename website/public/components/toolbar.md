# Toolbar

A grouped strip of controls in one pill shell: clusters, separators, arrow-key focus, and a glass floating variant.

Generated from the rift-ds registry and prop JSDoc, version 1.32.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { Toolbar } from 'rift-ds';`
- Deep import: `import { Toolbar } from 'rift-ds/components/Toolbar/Toolbar';`
- Rendering: client component (declares 'use client')
- Size: 0.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/toolbar
- Schema: https://rift-ds.com/schema/components/toolbar.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Menu bar](https://rift-ds.com/components/menubar.md) instead when the controls are named menus of commands, like an app's File and Edit.

## Toolbar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | Accessible name for the toolbar — what a screen reader calls the group. |
| orientation | `"horizontal" \| "vertical"` | no | `'horizontal'` | Which way the controls run. |
| variant | `"default" \| "floating"` | no | `'default'` | `default` is an attached bar on the container fill; `floating` is the glass pill for controls hovering over content — position it with your own layout (the component never fixes itself to the viewport). |
| children | `ReactNode` | no |  | The toolbar's controls — group unrelated clusters with `ToolbarSeparator`. |
| className | `string` | no | `''` | Additional CSS classes |

## ToolbarSeparator props

No own props; native attributes pass through.

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA toolbar pattern (https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/).

| Key | What it does |
| --- | --- |
| Arrow Right | Moves to the next control. The opposite arrow in a right-to-left layout. |
| Arrow Left | Moves to the previous control. The opposite arrow in a right-to-left layout. |
| End | Moves to the last control. |
| Home | Moves to the first control. |

Types from other packages: `ReactNode` (react).
