# Widget

A titled section for a dashboard, a form, or settings, with rows, groups, a footer, an optional fold, and a board of columns.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Widget } from 'rift-ds';`
- Deep import: `import { Widget } from 'rift-ds/components/Widget/Widget';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/widget
- Schema: https://rift-ds.com/schema/components/widget.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Widget props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The tile's heading. Also the section's accessible name, unless an `aria-label` is passed. Note: this shadows the native `title` tooltip attribute, which Widget does not expose. |
| count | `number` | no |  | A quiet figure after the title: how many rows the tile holds, how many are open. |
| action | `ReactNode` | no |  | Trailing header slot, opposite the title — a compact button, a link, a period label. |
| titleAs | `"h2" \| "h3" \| "h4"` | no | `'h3'` | Heading element for the title, so the tile takes its place in the page's outline. |
| description | `ReactNode` | no |  | A line of quieter text under the title, saying what the section holds. It also describes the section to a screen reader. |
| footer | `ReactNode` | no |  | A slot under the body, behind a divider: the section's actions (Save, Cancel), a total, a link to everything. |
| padding | `"none" \| "default" \| "compact"` | no | `'default'` | The inset: `default` the tile's own, `compact` a step tighter for dense settings, `none` for a body that runs edge to edge (a table, a map) while the header and footer keep the default inset. |
| collapsible | `boolean` | no | `false` | Let the reader fold the section away: the title becomes a button that shows and hides the body and footer, which leave the tab order and the accessibility tree while hidden. |
| open | `boolean` | no |  | Whether a collapsible section is open (controlled). Pair with `onOpenChange`. |
| defaultOpen | `boolean` | no | `true` | Whether a collapsible section starts open (uncontrolled). Defaults to true. |
| onOpenChange | `((open: boolean) => void)` | no |  | Called with the new open state when the reader folds or unfolds a collapsible section. |
| children | `ReactNode` | no |  | The tile's body: WidgetRows, WidgetGroups, a chart, a figure, a form, anything. |
| locale | `string` | no | `'en-US'` | The BCP 47 locale the count is written in, such as `ar-EG`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. |
| className | `string` | no | `''` | Additional CSS classes |

## WidgetGrid props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| columns | `1 \| 2 \| 3` | no | `2` | The most columns the board runs to. It folds to fewer as its own width narrows. |
| children | `ReactNode` | no |  | The Widgets on the board, in reading order: they fill the first column, then the next. |
| className | `string` | no | `''` | Additional CSS classes |

## WidgetGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | The run's quiet label, e.g. "Waiting on you". |
| children | `ReactNode` | no |  | The rows in this run. |
| className | `string` | no | `''` | Additional CSS classes |

## WidgetRow props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The row's main line. Note: this shadows the native `title` tooltip attribute, which WidgetRow does not expose. |
| description | `string` | no |  | A quiet second line under the title: who, where, or how much. |
| leading | `ReactNode` | no |  | Leading mark — a StatusDot, a PixelAvatar, an Avatar, a Spinner, an icon. Decorative unless the element names itself. |
| meta | `ReactNode` | no |  | Trailing fact in the caption face: a date, an amount, a state. |
| href | `string` | no |  | Renders the row as a link to this URL. |
| className | `string` | no | `''` | Additional CSS classes |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router; a plain `<a>` when unset. This component can render on the server, so it never reads a LinkProvider: pass the prop even under one. |

## Types

### LinkComponent

A component that renders a link in place of a plain `<a>`, such as a router's.

```ts
type LinkComponent = React.ElementType<LinkComponentProps>;
```

### LinkComponentProps

The props a link component receives: every anchor attribute, the ref, and
an `href` that is always a string. Next.js's `Link` takes these as they
are; a router whose link takes `to` instead needs a one-line adapter:
`({ href, ...props }) => <RouterLink to={href} {...props} />`.

```ts
type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `ReactNode` (react).
