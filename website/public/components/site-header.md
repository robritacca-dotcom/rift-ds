# Site header

A site's sticky top bar of section pills and mega menus, folding to a drawer when the pills no longer fit or below a set breakpoint.

Generated from the rift-ds registry and prop JSDoc, version 1.37.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { SiteHeader } from 'rift-ds';`
- Deep import: `import { SiteHeader } from 'rift-ds/components/SiteHeader/SiteHeader';`
- Rendering: client component (declares 'use client')
- Size: 12.8 kB gzipped with everything it imports, peer dependencies not counted
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
| drawerFooter | `ReactNode` | no |  | Content for the drawer's footer, such as the controls `wideActions` holds in the bar. It shows on the drawer's first level only: a level the reader drilled into leaves it out. |
| drawerHeader | `ReactNode` | no |  | Content above the drawer's first level of rows, such as a search field. It leaves when the reader drills in. |
| drawerEntries | `DrillMenuEntry[]` | no |  | More of the drawer's first level, after the sections: rows and sections of DrillMenu entries, such as a row that drills into a site's resources or a group of settings that drill into their choices. Plain rows ahead of the first section join the sections' own list, with no gap; a section starts a group of its own. |
| drawerOpen | `boolean` | no |  | Whether the folded bar's drawer is open, for a host that owns that state. Pair with `onDrawerOpenChange`. |
| defaultDrawerOpen | `boolean` | no | `false` | Whether the drawer starts open, when the header owns its state. |
| onDrawerOpenChange | `((open: boolean) => void)` | no |  | Called when the drawer opens or closes, controlled or not. |
| initialFold | `"tablet" \| "mid" \| "never"` | no | `foldBelow ?? 'tablet'` | Where the bar folds before it has measured itself: on the first frame, which a server-rendered page shows before its script runs. Below this breakpoint (`tablet` or the wider `mid`) the bar starts folded by CSS alone, so a phone never sees the pills overflow; the measurement takes over once the script runs. Pick the step nearest where the pills stop fitting, or `never` for a bar that fits at every width. Defaults to `foldBelow` when that is set, so a bar told to fold at a step starts folded there too and never shifts when its script runs. |
| foldBelow | `"tablet" \| "mid"` | no | `undefined` | Fold the bar into its menu at or below this breakpoint even when the pills would fit (`tablet` is 959px and below, `mid` 1279px), for a site whose sidebar of pages leaves the page there: the menu then carries the pages (each section's `drawerItems`), so the reader always has one way in. Leave it out to fold only when the row runs out of room. |
| sticky | `boolean` | no | `true` | Whether the header sticks to the top of the viewport over a progressive blur. Off, it scrolls away with the page and draws no blur. |
| tintAfter | `number` | no | `0` | How far, in pixels, the page scrolls before the page-surface tint fades in over the sticky header's blur. By default it arrives with the first pixel of scroll, at the fast step, so page text never slides up under a clear bar. |
| linkComponent | `LinkComponent` | no |  | The component every link renders through, so a router's link (Next.js `Link`) navigates without a reload. Falls back to the nearest `LinkProvider`, then `<a>`. |
| navLabel | `string` | no | `'Primary'` | The accessible name of the section links' `<nav>` landmark. |
| drawerOpenLabel | `string` | no | `'Open menu'` | The accessible name of the menu button that opens the drawer. |
| drawerTitle | `string` | no | `'Menu'` | The drawer's title, naming the dialog. Shown at its top when there is no `brand`; with one, the brand takes its place and the title is read only by assistive tech. |
| drawerCloseLabel | `string` | no | `'Close menu'` | The accessible name of the drawer's close button. |
| width | `"contained" \| "full"` | no | `undefined` | How wide the bar's contents run, read from the shell recipe's width axis. `contained` centres them in the contained width (1440px, or the nearest `--ds-shell-contained-width`) with the side gutter, lining up with a contained page below; `full` runs them edge to edge, the gutter aside. Leave it out and the bar fills whatever box the host gives it, with no gutter of its own; inside a SiteLayout it follows the layout's `headerWidth` instead. |
| className | `string` | no | `''` | Additional CSS classes on the `<header>`. |

## Keyboard

Focusing a section opens its panel, Arrow Down moves into it, and Escape closes it. The component's own stories test these keys.

## Types

### DrillMenuEntry

An entry on a level: a row, or a section of rows.

```ts
type DrillMenuEntry = DrillMenuItem | DrillMenuSection;
```

### DrillMenuItem

```ts
interface DrillMenuItem {
  /** Row text. */
  label: string;
  /**
   * Where the row links. On a row with `items` it is the level's landing
   * page instead: the level opens with an overview row linking to it.
   */
  href?: string;
  /** Stable identity, used in `path`. Defaults to `href`, then `label`. */
  id?: string;
  /** A second line under the label, in the secondary text style. */
  description?: string;
  /** Icon before the label: a Material Symbol name (string) or a custom element, such as a swatch or a brand mark. */
  icon?: string | React.ReactNode;
  /** A pill after the label: a count (a number, or digits with an optional `+`) on the count badge pair, a word such as "New" as a quiet pill. */
  badge?: string | number;
  /** The setting's current value at the row's trailing end, such as "Dark", on a row that drills into a list of choices. */
  value?: string;
  /** The heading of the level this row opens, and the name the back rows below it give that level. Defaults to `label`, for a row whose label is a value (a chosen account) rather than the level's name. */
  title?: string;
  /** Rows on the level this row opens. A row with items drills in instead of navigating. */
  items?: DrillMenuEntry[];
  /**
   * Marks the row as the page being viewed, regardless of the exact match
   * against `currentHref`, for a section that stays current on its child
   * routes.
   */
  current?: boolean;
  /** On an `onClick` row in a list of choices, whether it is the chosen one: true carries the chosen mark, and either value sets `aria-pressed`. */
  selected?: boolean;
  /** The link leaves the site: it opens in a new tab and carries an outward arrow. */
  external?: boolean;
  /**
   * Makes the row an action rather than a link, such as a pick or a copy.
   * The stack stays on its level; a choice list's rows set `selected` too.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
```

### DrillMenuSection

A group of rows under an optional heading: one level's resources or
settings, say, set apart from the rows above it.

```ts
interface DrillMenuSection {
  /** Marks the entry as a section rather than a row. */
  type: 'section';
  /** The heading over the rows. Leave it out for a group set apart by space alone. */
  label?: string;
  /** The section's rows. */
  items: DrillMenuItem[];
  /**
   * `prominent` draws the rows in the heading-3 style on a taller row, for
   * a menu that wants its top level louder. The site header's and the app
   * sidebar's drawers keep the default rows.
   * @default 'default'
   */
  variant?: 'default' | 'prominent';
  /** Stable identity for the React key. Defaults to the label. */
  id?: string;
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

### SiteHeaderDrawerItem

A page in a section's drawer level. One with `items` drills into a level
of its own (a category of pages), opening with an overview row to `href`.

```ts
interface SiteHeaderDrawerItem {
  /** Where the row links; on a row with `items`, the overview row's destination. */
  href: string;
  /** Row text. */
  label: string;
  /** A second line under the label. */
  description?: string;
  /** Icon before the label: a Material Symbol name or a custom element. */
  icon?: string | React.ReactNode;
  /** The pages on the level this row opens. */
  items?: SiteHeaderDrawerItem[];
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
  drawerItems?: SiteHeaderDrawerItem[];
  /**
   * Marks the section as the one being viewed. Left unset, the header works
   * it out from `currentHref`: the section's own page, a page under it, or
   * any page its menu lists.
   */
  current?: boolean;
}
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `HTMLButtonElement` (typescript), `MouseEvent` (react), `ReactNode` (react).
