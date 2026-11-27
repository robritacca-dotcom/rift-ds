# Site footer

The bottom of a site: brand, columns of links, and a row of small print and social links.

Generated from the rift-ds registry and prop JSDoc, version 1.40.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { SiteFooter } from 'rift-ds';`
- Deep import: `import { SiteFooter } from 'rift-ds/components/SiteFooter/SiteFooter';`
- Rendering: server-renderable (no 'use client')
- Size: 0.7 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/site-footer
- Schema: https://rift-ds.com/schema/components/site-footer.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## SiteFooter props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| columns | `SiteFooterColumn[]` | no | `[]` | The sitemap columns, in order along the row. Leave it out for a footer of small print alone. |
| brand | `ReactNode` | no |  | The brand at the start of the footer: a logo, a name, or both. |
| description | `ReactNode` | no |  | A line about the site under the brand. |
| social | `ReactNode` | no |  | Social or utility controls for the bottom row's end, such as IconButtons. |
| legal | `ReactNode` | no |  | The bottom row's small print: a copyright, a licence, a privacy link. |
| navLabel | `string` | no | `'Site'` | Accessible name of the navigation landmark that holds the columns. |
| externalLabel | `string` | no | `'(opens in a new tab)'` | Text read after an external link's name, for a screen reader. |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`. A plain `<a>` when unset. Server-renderable, so it reads no LinkProvider: pass it here. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Plain links: the browser owns Tab and Enter. Those keys belong to the platform, so no test of this library presses them.

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

### SiteFooterColumn

A labelled column of footer links.

```ts
interface SiteFooterColumn {
  /** The column's heading, e.g. "Docs". */
  label: string;
  /** Its links, in order. */
  links: SiteFooterLink[];
}
```

### SiteFooterLink

One link in a footer column.

```ts
interface SiteFooterLink {
  /** Link text. */
  label: string;
  /** Where it goes. */
  href: string;
  /** The link leaves the site: it opens in a new tab and says so. */
  external?: boolean;
}
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `ReactNode` (react).
