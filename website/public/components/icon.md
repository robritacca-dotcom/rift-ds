# Icon

One Material Symbol on the icon scale, decorative or named, plain or on a round tile.

Generated from the rift-ds registry and prop JSDoc, version 1.37.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: typography
- Import: `import { Icon } from 'rift-ds';`
- Deep import: `import { Icon } from 'rift-ds/components/Icon/Icon';`
- Rendering: server-renderable (no 'use client')
- Size: 0.6 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/icon
- Schema: https://rift-ds.com/schema/components/icon.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Icon props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string` | yes |  | The Material Symbol's name (`settings`, `arrow_forward`). A glyph that points along the reading direction mirrors in a right-to-left context. |
| size | `"500" \| "600" \| "800" \| "1200"` | no | `'600'` | The size, as a step on the icon scale (`--icon-size-600`, the size beside body text, by default). |
| tone | `"inherit" \| "default" \| "neutral"` | no | `'default'` | The glyph's colour role. `inherit` takes the colour of the text around it. |
| filled | `boolean` | no | `false` | Draws the filled form of the glyph, as a selected nav item does. |
| label | `string` | no |  | What the icon means, when it carries meaning no text beside it says. With a label the icon is an image with that name; without one it is decorative and hidden from assistive tech. |
| tile | `boolean` | no | `false` | Sets the glyph on a round tile of the icon fill, the mark at the head of a stat card or a list row. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.
