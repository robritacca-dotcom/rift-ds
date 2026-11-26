# Drill menu

A drill-in menu for a phone: one level at a time, thumb-tall rows with a second line, a current value or a chosen mark, and a back row naming its way out.

Generated from the rift-ds registry and prop JSDoc, version 1.39.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { DrillMenu } from 'rift-ds';`
- Deep import: `import { DrillMenu } from 'rift-ds/components/DrillMenu/DrillMenu';`
- Rendering: client component (declares 'use client')
- Size: 6.7 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/drill-menu
- Schema: https://rift-ds.com/schema/components/drill-menu.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Side nav](https://rift-ds.com/components/side-nav.md) instead when the list sits in a sidebar beside the page and branches should open in place.

## DrillMenu props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `DrillMenuEntry[]` | yes |  | The first level's rows and sections. A row with `items` drills into the next level. |
| currentHref | `string` | no |  | href of the current page: the exactly matching row gets `aria-current="page"` and the current treatment, and every row on the way to it the current treatment. |
| path | `string[]` | no |  | The ids of the rows drilled into, first level first: `[]` is the first level. Pair with `onPathChange`. |
| defaultPath | `string[]` | no |  | The path the menu opens on, when it owns its state. Left out, it opens on the deepest level that holds the current page (`currentHref`, or a row marked `current`), so a reader deep in a section reopens the menu where they are; `[]` opens on the first level always. |
| onPathChange | `((path: string[]) => void)` | no |  | Fires with the new path whenever a row drills in or the back row steps out, in both controlled and uncontrolled modes. |
| onNavigate | `((item: DrillMenuItem, event: MouseEvent<HTMLElement, MouseEvent>) => void)` | no |  | Fires when a link row is followed, alongside native navigation, such as to close the drawer the menu sits in. |
| header | `ReactNode` | no |  | Content above the first level's rows, such as a search field. |
| rootLabel | `string` | no | `'Menu'` | The back row's text on the second level, naming the first. |
| backLabel | `((title: string) => string)` | no | `` (title) => `Back to ${title}` `` | The back row's accessible name, given the title of the level it returns to. Defaults to "Back to <title>". |
| overviewLabel | `((label: string) => string)` | no | `` (label) => `${label} overview` `` | The overview row's text on a level whose row has an `href`, given that row's label. Defaults to "<label> overview". |
| navLabel | `string` | no | `'Menu'` | The accessible name of the `<nav>` landmark. |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
| className | `string` | no | `''` | Additional CSS classes. |

## Keyboard

Its rows are links and buttons, and the browser owns Tab, Enter and Space. A step moves focus to the new level’s title, and back to the row it came from on the way out. Those keys belong to the platform, so no test of this library presses them.

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
   * The menu stays on its level; a choice list's rows set `selected` too.
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
  /**
   * The section's own content after its rows, for a section that is more
   * than a list of destinations: a chat's history in AppSidebar's drawer,
   * say. It scrolls with the level and leaves with it on a drill.
   */
  content?: React.ReactNode;
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

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `HTMLButtonElement` (typescript), `HTMLElement` (typescript), `MouseEvent` (react), `ReactNode` (react).
