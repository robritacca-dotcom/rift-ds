# Pagination

Numbered page navigation with ellipses and a compact readout, or links to the previous and next page of a sequence.

Generated from the rift-ds registry and prop JSDoc, version 1.37.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { Pagination } from 'rift-ds';`
- Deep import: `import { Pagination } from 'rift-ds/components/Pagination/Pagination';`
- Rendering: client component (declares 'use client')
- Size: 1.7 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/pagination
- Schema: https://rift-ds.com/schema/components/pagination.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Pagination props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| variant | `"numbered" \| "adjacent"` | no | `'numbered'` | The pager's form. `numbered` (the default) steps through numbered pages of one list. `adjacent` links to the page before and after this one in a sequence (a guide's chapters, a set of articles) as two cards naming them, and takes `previous` and `next` instead of page numbers. |
| previous | `PaginationLink` | no |  | The page before this one, for the `adjacent` form. Leave it out on the first page. |
| next | `PaginationLink` | no |  | The page after this one, for the `adjacent` form. Leave it out on the last page. |
| previousText | `string` | no | `'Previous'` | The eyebrow over the previous page's title in the `adjacent` form. |
| nextText | `string` | no | `'Next'` | The eyebrow over the next page's title in the `adjacent` form. |
| linkComponent | `LinkComponent` | no |  | The component that renders the `adjacent` form's links, such as Next.js's `Link`. Defaults to the nearest LinkProvider's, else a plain `<a>`. |
| page | `number` | no |  | Current page (1-based), for a controlled pager. Leave it undefined to let the component keep its own page, seeded from `defaultPage`. |
| defaultPage | `number` | no | `1` | Page shown on first render when the pager is uncontrolled (1-based) |
| pageCount | `number` | no |  | Total number of pages. Required for the `numbered` form; the `adjacent` form ignores it. |
| onPageChange | `((page: number) => void)` | no |  | Called with the page the user requests |
| siblingCount | `number` | no | `1` | Pages shown on each side of the current page |
| size | `"default" \| "compact"` | no | `'default'` | Component size — compact swaps the numbers for a "Page X of Y" readout |
| ariaLabel | `string` | no |  | Legacy accessible-name prop for the nav landmark. Deprecated: Pass the native `aria-label` attribute instead. |
| previousLabel | `string` | no | `'Previous page'` | Accessible name of the previous-page arrow |
| nextLabel | `string` | no | `'Next page'` | Accessible name of the next-page arrow |
| pageLabel | `((page: number) => string)` | no | `` (page: number) => `Page ${page}` `` | Accessible name of a numbered page button, given its page number |
| readoutLabel | `((page: number, pageCount: number) => string)` | no | `` (page: number, pageCount: number) => `Page ${page} of ${pageCount}` `` | Text of the compact size's readout, given the current page and the page count |
| locale | `string` | no |  | The BCP 47 locale the page numbers is written in, such as `ar-EG`. Defaults to the nearest LocaleProvider's, else `en-US`. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The page buttons follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |

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

### PaginationLink

A neighbouring page the `adjacent` form links to.

```ts
interface PaginationLink {
  /** Where the link goes. */
  href: string;
  /** The page's title, shown under the Previous or Next eyebrow. */
  label: string;
}
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react).
