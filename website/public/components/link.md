# Link

A text link inside a sentence or on its own, routed through the app's link component.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: typography
- Import: `import { Link } from 'rift-ds';`
- Deep import: `import { Link } from 'rift-ds/components/Link/Link';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/link
- Schema: https://rift-ds.com/schema/components/link.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Link props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| href | `string` | yes |  | Where the link goes. |
| children | `ReactNode` | yes |  | The link text. |
| variant | `"inline" \| "standalone"` | no | `'inline'` | `inline` sits inside a sentence, underlined and in the sentence's colour; `standalone` stands on its own line or beside a control, in the tertiary action text colour and its own type face. Both are underlined. |
| size | `"default" \| "compact"` | no | `'default'` | The standalone link's type size: `default` the paragraph face, `compact` the small paragraph face. An inline link always takes the size of the text around it. Distinct from no native attribute of an anchor. |
| external | `boolean` | no | `false` | The link leaves the app: it opens in a new tab with `rel="noopener noreferrer"`, carries an outward mark, and tells a screen reader it opens a new tab. |
| externalLabel | `string` | no | `'(opens in a new tab)'` | Read after an external link's text, hidden from the eye. Defaults to "(opens in a new tab)". |
| disabled | `boolean` | no | `false` | Hold the link inert: it renders as text with `aria-disabled`, at the library's disabled treatment, and goes nowhere. |
| iconLeft | `string \| ReactNode` | no |  | A Material Symbol name or a node before the text. A directional glyph mirrors in a right-to-left context. |
| iconRight | `string \| ReactNode` | no |  | A Material Symbol name or a node after the text. A directional glyph mirrors in a right-to-left context. |
| linkComponent | `LinkComponent` | no |  | The component the link renders with, such as Next.js's `Link`, so it navigates through the app's router; a plain `<a>` when unset. This component can render on the server, so it never reads a LinkProvider: pass the prop even under one. An external link always renders a plain `<a>`. |
| className | `string` | no | `''` | Additional CSS classes. |

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
