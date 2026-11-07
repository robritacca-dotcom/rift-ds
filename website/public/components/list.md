# List

Ordered and unordered lists marked with a disc, a number, a check, or an icon.

Generated from the rift-ds registry and prop JSDoc, version 1.25.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: typography
- Import: `import { List } from 'rift-ds';`
- Deep import: `import { List } from 'rift-ds/components/List/List';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/list
- Schema: https://rift-ds.com/schema/components/list.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## List props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| variant | `"plain" \| "unordered" \| "ordered"` | no | `unordered` | `unordered` is a `ul`, `ordered` an `ol` whose order means something (steps), `plain` a `ul` with no markers and no indent. |
| marker | `"number" \| "none" \| (string & {}) \| "disc" \| "check"` | no |  | The mark before each item: a disc, the item's number, the form controls' check, nothing, or a Material Symbol name (`star`, `bolt`). Defaults to the variant's own: disc, number, none. |
| spacing | `"default" \| "compact" \| "relaxed"` | no | `default` | The room between items: `compact` for dense lists, `relaxed` for items with descriptions. |
| size | `"default" \| "compact"` | no | `default` | The items' type size: `default` the paragraph face, `compact` the small paragraph face. |
| start | `number` | no |  | The number an ordered list counts from. |
| reversed | `boolean` | no |  | Count an ordered list down instead of up. |
| children | `ReactNode` | no |  | The items, each a `ListItem`. |
| className | `string` | no | `` | Additional CSS classes. |

## ListItem props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | no |  | The item's text. |
| description | `ReactNode` | no |  | A line of quieter text under the item. |
| icon | `ReactNode` | no |  | A Material Symbol name or a node that replaces this item's marker. A directional glyph mirrors in a right-to-left context. |
| className | `string` | no | `` | Additional CSS classes. |
