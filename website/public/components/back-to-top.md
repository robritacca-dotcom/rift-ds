# Back to top

A round button in the page's corner that appears on a long scroll and takes the reader back to the top.

Generated from the rift-ds registry and prop JSDoc, version 1.38.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { BackToTop } from 'rift-ds';`
- Deep import: `import { BackToTop } from 'rift-ds/components/BackToTop/BackToTop';`
- Rendering: client component (declares 'use client')
- Size: 4.7 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/back-to-top
- Schema: https://rift-ds.com/schema/components/back-to-top.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## BackToTop props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| threshold | `number` | no | `640` | How far, in px, the page scrolls before the button appears. `0` shows it at once. |
| label | `string` | no | `'Back to top'` | Accessible name and tooltip of the button. |
| focusTarget | `string` | no |  | The id of the element to move focus to after the jump (the page's main region, say), so a keyboard reader continues from the top too. Leave it out to keep focus on the button. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

A native button: the browser owns Enter and Space, and the press scrolls the page. Those keys belong to the platform, so no test of this library presses them.
