# Grid

Equal columns that fold by their own width, with a gap from the scale and cells that share a row’s height.

Generated from the rift-ds registry and prop JSDoc, version 1.39.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { Grid } from 'rift-ds';`
- Deep import: `import { Grid } from 'rift-ds/components/Grid/Grid';`
- Rendering: server-renderable (no 'use client')
- Size: 0.3 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/grid
- Schema: https://rift-ds.com/schema/components/grid.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Stack](https://rift-ds.com/components/stack.md) instead when the children run in one line, a column or a row, rather than in equal columns.
- Use [Widget](https://rift-ds.com/components/widget.md) instead when the board is of Widget tiles of different heights that should pack without holes.

## Grid props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| columns | `1 \| 2 \| 4 \| 3 \| 5 \| 6` | no | `3` | How many equal columns the grid runs to at full width. It folds to fewer as its own width narrows, never below `minColumnWidth`. |
| minColumnWidth | `string` | no | `'12rem'` | The narrowest a column may get before the grid drops one, as a CSS length (`16rem`). Defaults to `12rem`. |
| gap | `StackGap` | no | `'500'` | The space between cells, both ways, as a step on the gap scale (`--gap-500` by default). |
| align | `"center" \| "start" \| "end" \| "stretch"` | no | `'stretch'` | How cells sit in their row: `stretch`, the default, makes every card in a row the same height. |
| as | `"div" \| "ol" \| "section" \| "ul"` | no | `'div'` | The element the grid renders as, so a grid of cards can be a list. |
| children | `ReactNode` | no |  | The cells, in reading order. |
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
