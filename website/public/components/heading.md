# Heading

A heading whose outline level and type tier are chosen apart.

Generated from the rift-ds registry and prop JSDoc, version 1.25.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: typography
- Import: `import { Heading } from 'rift-ds';`
- Deep import: `import { Heading } from 'rift-ds/components/Heading/Heading';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/heading
- Schema: https://rift-ds.com/schema/components/heading.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Heading props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| level | `1 \| 2 \| 4 \| 3 \| 5 \| 6` | no | `2` | The heading's place in the document outline, which sets the element (`h1` to `h6`). Choose it for the outline, never for the size. |
| tier | `HeadingTier` | no |  | The type style it wears, apart from `level`, so a card's `h3` can look like a small title and a page's `h1` like a display line. Defaults to the level's own: heading-1 to heading-3 for levels 1 to 3, title-body below. |
| tone | `"default" \| "neutral"` | no | `default` | The colour role: `default` takes the tier's own (the display or heading text colour a theme can tone), `neutral` the secondary text colour for a quieter title. |
| truncate | `boolean` | no | `false` | Keep the heading on one line, ending in an ellipsis where it runs out of room. The full text stays in the accessible name. |
| balance | `boolean` | no | `false` | Balance the lines of a heading that wraps, so the last line is never a lone word. |
| align | `"center" \| "start" \| "end"` | no |  | Where the text sits on the line, along the reading direction. |
| children | `ReactNode` | no |  | The heading's text. |
| className | `string` | no | `` | Additional CSS classes. |
