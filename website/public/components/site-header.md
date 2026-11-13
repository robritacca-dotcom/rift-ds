# Site header

A site's sticky top bar of section pills and mega menus, folding to a drawer when the pills no longer fit.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { SiteHeader } from 'rift-ds';`
- Deep import: `import { SiteHeader } from 'rift-ds/components/SiteHeader/SiteHeader';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/site-header
- Schema: https://rift-ds.com/schema/components/site-header.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## SiteHeader props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| brand | `ReactNode` | no |  | The brand at the bar's start, usually a logo linking home. Rendered as given, so it carries its own link. |
| sections | `SiteHeaderSection[]` | yes |  | The site's top-level sections, in order. |
| currentHref | `string` | no |  | The path of the page being viewed, used to mark the current section, row and drawer item. |
| actions | `ReactNode` | no |  | Controls at the bar's end that stay at every width, such as a search button; `condensedActions`, when given, stand in for them on the condensed step. |
| condensedActions | `ReactNode` | no |  | The same controls drawn narrower, such as an icon-only CommandPaletteTrigger and a `cycle` ThemeToggle. When the full row stops fitting, these take the place of `actions` (the header adds `ds-site-header--condensed`), and the pills fold to the menu button only when the condensed row does not fit either. Without it the header folds as soon as the full row stops fitting. |
| wideActions | `ReactNode` | no |  | Controls at the bar's end that show only while the pills fit, such as a Get started button. Once the bar folds to its menu button they leave it; put their drawer twin in `drawerFooter`. |
| drawerFooter | `ReactNode` | no |  | Content for the drawer's footer, such as the controls `wideActions` holds in the bar. |
| drawerOpen | `boolean` | no |  | Whether the folded bar's drawer is open, for a host that owns that state. Pair with `onDrawerOpenChange`. |
| defaultDrawerOpen | `boolean` | no | `false` | Whether the drawer starts open, when the header owns its state. |
| onDrawerOpenChange | `((open: boolean) => void)` | no |  | Called when the drawer opens or closes, controlled or not. |
| initialFold | `"tablet" \| "mid" \| "never"` | no | `'tablet'` | Where the bar folds before it has measured itself: on the first frame, which a server-rendered page shows before its script runs. Below this breakpoint (`tablet` or the wider `mid`) the bar starts folded by CSS alone, so a phone never sees the pills overflow; the measurement takes over once the script runs. Pick the step nearest where the pills stop fitting, or `never` for a bar that fits at every width. |
| sticky | `boolean` | no | `true` | Whether the header sticks to the top of the viewport over a progressive blur. Off, it scrolls away with the page and draws no blur. |
| tintAfter | `number` | no | `48` | How far, in pixels, the page scrolls before the page-surface tint fades in over the sticky header's blur. |
| linkComponent | `LinkComponent` | no |  | The component every link renders through, so a router's link (Next.js `Link`) navigates without a reload. Falls back to the nearest `LinkProvider`, then `<a>`. |
| navLabel | `string` | no | `'Primary'` | The accessible name of the section links' `<nav>` landmark. |
| drawerOpenLabel | `string` | no | `'Open menu'` | The accessible name of the menu button that opens the drawer. |
| drawerTitle | `string` | no | `'Menu'` | The drawer's title, naming the dialog. Shown at its top when there is no `brand`; with one, the brand takes its place and the title is read only by assistive tech. |
| drawerCloseLabel | `string` | no | `'Close menu'` | The accessible name of the drawer's close button. |
| className | `string` | no | `''` | Additional CSS classes on the `<header>`. |

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

### MegaMenuItem

One link row in a mega menu: a page and the line that says what is on it.

```ts
interface MegaMenuItem {
  /** Where the row links. */
  href: string;
  /** The page's name. */
  label: string;
  /** One line on what the page holds, clamped to two lines in the panel. */
  description?: string;
  /** A Material Symbols name drawn in the row's icon tile. */
  icon?: string;
  /** An image path drawn in the icon tile instead of `icon`, for a brand or product mark. */
  logo?: string;
}
```

### MegaMenuShowcase

The featured card beside a mega menu's link grid: one link that is the whole card.

```ts
interface MegaMenuShowcase {
  /** Where the card links. */
  href: string;
  /** A short kicker above the title, set in the overline face. */
  overline?: string;
  /** The card's title, followed by a forward arrow. */
  label: string;
  /** One or two lines under the title. */
  description?: string;
  /**
   * A drawing that fills the card behind the copy. Decorative: the title and
   * description carry the meaning, so mark it `aria-hidden`.
   */
  cover?: React.ReactNode;
}
```

### SiteHeaderSection

One top-level section of the site: a pill in the bar, a row in the drawer.

```ts
interface SiteHeaderSection {
  /** A stable key for the section. */
  id: string;
  /** The pill's text. */
  label: string;
  /** The section's landing page: where a click on the pill goes. */
  href: string;
  /**
   * A mega menu for the section. Hovering or focusing the pill opens it; its
   * items are also the section's sub-list in the drawer.
   */
  mega?: {
    /** The panel's link rows. */
    items: MegaMenuItem[];
    /** A featured card beside the rows. */
    showcase?: MegaMenuShowcase;
  };
  /**
   * The section's sub-list in the drawer, when it should differ from its
   * menu's items: a page that needs a wide screen, say, left out of the
   * drawer that only narrow screens see. Defaults to the menu's items.
   */
  drawerItems?: { href: string; label: string }[];
  /**
   * Marks the section as the one being viewed. Left unset, the header works
   * it out from `currentHref`: the section's own page, a page under it, or
   * any page its menu lists.
   */
  current?: boolean;
}
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `ReactNode` (react).
