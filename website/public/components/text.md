# Text

Running text in a tier of the type scale, with tones, truncation, and tabular figures.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: typography
- Import: `import { Text } from 'rift-ds';`
- Deep import: `import { Text } from 'rift-ds/components/Text/Text';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/text
- Schema: https://rift-ds.com/schema/components/text.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Text props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| tier | `TextTier` | no | `paragraph` | The type style: `paragraph` for body copy, `paragraph-sm` for helper copy and table cells, `caption` for the smallest notes, `overline` for an eyebrow above a title, `code` for an inline identifier in the code face. |
| as | `"div" \| "em" \| "label" \| "p" \| "span" \| "strong"` | no | `p` | The element it renders as. Defaults to `p`; `span` sits inside a line, `label` names a control (pass `htmlFor`). |
| tone | `"inherit" \| "default" \| "error" \| "positive" \| "warning" \| "neutral"` | no | `default` | The colour role: `default` the primary text, `neutral` the secondary for quieter copy, a status role for a message of that kind, `inherit` the surrounding colour. |
| weight | `"default" \| "emphasis"` | no | `default` | `emphasis` sets the tier's emphasis weight, the one heavier weight the type scale gives running text. |
| truncate | `boolean` | no | `false` | Keep the text on one line, ending in an ellipsis where it runs out of room. |
| lines | `number` | no |  | Clamp the text to this many lines, ending in an ellipsis. Overrides `truncate`. |
| numeric | `boolean` | no | `false` | Tabular figures, so digits line up in a column of amounts or times. |
| align | `"center" \| "start" \| "end"` | no |  | Where the text sits on the line, along the reading direction. `end` lines up a column of amounts. |
| htmlFor | `string` | no |  | The control this text names, when `as` is `label`. |
| children | `ReactNode` | no |  | The text. |
| className | `string` | no | `` | Additional CSS classes. |
