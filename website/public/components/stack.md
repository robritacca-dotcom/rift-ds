# Stack

Children in one direction, a column or a row, with a gap from the scale between them.

Generated from the rift-ds registry and prop JSDoc, version 1.39.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { Stack } from 'rift-ds';`
- Deep import: `import { Stack } from 'rift-ds/components/Stack/Stack';`
- Rendering: server-renderable (no 'use client')
- Size: 0.3 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/stack
- Schema: https://rift-ds.com/schema/components/stack.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Grid](https://rift-ds.com/components/grid.md) instead when the children should sit in equal columns that fold by the room the grid has.

## Stack props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| direction | `"row" \| "column"` | no | `'column'` | `column` lays the children top to bottom; `row` lays them in the reading direction. |
| gap | `StackGap` | no | `'400'` | The space between children, as a step on the gap scale (`--gap-400` by default). |
| align | `"center" \| "start" \| "end" \| "baseline" \| "stretch"` | no | `'stretch' in a column, 'center' in a row` | How children line up across the stack: `stretch` fills it, which keeps cards in a row the same height. A column stretches and a row centres unless it is set. |
| justify | `"center" \| "start" \| "end" \| "between"` | no | `'start'` | How children spread along the stack. `between` pushes the first and last to the ends. |
| wrap | `boolean` | no | `false` | Lets a row wrap onto more lines when it runs out of room, keeping the gap between lines. |
| as | `"div" \| "fieldset" \| "footer" \| "form" \| "header" \| "li" \| "nav" \| "ol" \| "section" \| "span" \| "ul"` | no | `'div'` | The element the stack renders as, so it can be a list, a section or a form. |
| children | `ReactNode` | no |  | The stack's children. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

## Types

### StackGap

A step on the gap scale, as the `--gap-*` token it names.

```ts
type StackGap = '050' | '100' | '200' | '300' | '400' | '500' | '1000' | '1500' | '2000' | '3000';
```

Types from other packages: `ReactNode` (react).
