# Widget

A titled tile for a dashboard or home screen, with rows, labelled groups, and a board that packs tiles into columns.

Generated from the rift-ds registry and prop JSDoc, version 1.6.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Widget } from 'rift-ds';`
- Deep import: `import { Widget } from 'rift-ds/components/Widget/Widget';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/widget

## Widget props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The tile's heading. Also the section's accessible name, unless an `aria-label` is passed. Note: this shadows the native `title` tooltip attribute, which Widget does not expose. |
| count | `number` | no |  | A quiet figure after the title: how many rows the tile holds, how many are open. |
| action | `ReactNode` | no |  | Trailing header slot, opposite the title — a compact button, a link, a period label. |
| titleAs | `"h2" \| "h3" \| "h4"` | no | `h3` | Heading element for the title, so the tile takes its place in the page's outline. |
| children | `ReactNode` | no |  | The tile's body: WidgetRows, WidgetGroups, a chart, a figure, anything. |
| className | `string` | no | `` | Additional CSS classes |

## WidgetGrid props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| columns | `2 \| 1 \| 3` | no | `2` | The most columns the board runs to. It folds to fewer as its own width narrows. |
| children | `ReactNode` | no |  | The Widgets on the board, in reading order: they fill the first column, then the next. |
| className | `string` | no | `` | Additional CSS classes |

## WidgetGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | The run's quiet label, e.g. "Waiting on you". |
| children | `ReactNode` | no |  | The rows in this run. |
| className | `string` | no | `` | Additional CSS classes |

## WidgetRow props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The row's main line. Note: this shadows the native `title` tooltip attribute, which WidgetRow does not expose. |
| description | `string` | no |  | A quiet second line under the title: who, where, or how much. |
| leading | `ReactNode` | no |  | Leading mark — a StatusDot, a PixelAvatar, an Avatar, a Spinner, an icon. Decorative unless the element names itself. |
| meta | `ReactNode` | no |  | Trailing fact in the caption face: a date, an amount, a state. |
| href | `string` | no |  | Renders the row as a link to this URL. |
| className | `string` | no | `` | Additional CSS classes |
