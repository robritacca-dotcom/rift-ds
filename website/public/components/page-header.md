# Page header

The top of a page: its breadcrumb, title, description and actions, folding the actions under the text when narrow.

Generated from the rift-ds registry and prop JSDoc, version 1.30.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { PageHeader } from 'rift-ds';`
- Deep import: `import { PageHeader } from 'rift-ds/components/PageHeader/PageHeader';`
- Rendering: server-renderable (no 'use client')
- Size: 1.0 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/page-header
- Schema: https://rift-ds.com/schema/components/page-header.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Section title](https://rift-ds.com/components/section-title.md) instead when the heading opens a section within a page rather than the page itself.

## PageHeader props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `ReactNode` | yes |  | The page's title, its heading. Note: this shadows the native `title` tooltip attribute, which PageHeader does not expose. |
| description | `ReactNode` | no |  | A sentence under the title on what the page is for or what it holds. |
| breadcrumb | `BreadcrumbItem[]` | no |  | The trail above the title, from the top of the app to this page; the last item is this page and takes no `href`. |
| actions | `ReactNode` | no |  | The page's own actions at the end of the title row: one primary Button, a secondary or two. On a narrow page they take the row under the text. |
| headingLevel | `1 \| 2` | no | `1` | The heading's place in the outline. The page's title is its `h1`; a header inside a tab or a pane can be an `h2`. |
| linkComponent | `LinkComponent` | no |  | The component the breadcrumb's links render with, such as Next.js's `Link`, so they navigate through the app's router; a plain `<a>` when unset. This component can render on the server, so it never reads a LinkProvider: pass the prop even under one. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Its breadcrumb links and the actions passed in are native links and buttons, reached with Tab. Those keys belong to the platform, so no test of this library presses them.

## Types

### BreadcrumbItem

```ts
interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Link href — omit for the current / last item */
  href?: string;
}
```

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
