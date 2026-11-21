# Nav list

Vertical navigation links for drawers and long sidebars: sections, three indent levels, expand toggles, a compact size and its own scroll.

Generated from the rift-ds registry and prop JSDoc, version 1.32.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { NavList } from 'rift-ds';`
- Deep import: `import { NavList } from 'rift-ds/components/NavList/NavList';`
- Rendering: client component (declares 'use client')
- Size: 3.2 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/nav-list
- Schema: https://rift-ds.com/schema/components/nav-list.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## NavList props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `NavListEntry[]` | yes |  | Navigation tree to render: rows, and at the top level, sections of rows. |
| size | `"default" \| "compact"` | no | `'default'` | Row density. `default` is the drawer's 40px top row; `compact` sets every row on the 32px compact control height, for a long sidebar of pages (a documentation site's hundred entries). |
| scrollable | `boolean` | no | `false` | Make the list its own scroll area: it fills the height its parent gives it, scrolls inside without carrying the page along at its ends, and brings the current row into view when it first renders. Put it in a column with a fixed or sticky height. |
| currentHref | `string` | no |  | href of the current page — the exactly matching row gets `aria-current="page"` and the active treatment. |
| expandedIds | `string[]` | no |  | Controlled list of expanded item ids. |
| defaultExpandedIds | `string[]` | no |  | Initially expanded item ids (uncontrolled). The branch and the collapsible section that hold the current page start open as well, so a reader landing deep in a long tree sees where they are. |
| onExpandedChange | `((expandedIds: string[]) => void)` | no |  | Fires with the full new list of expanded ids whenever a toggle is pressed, in both controlled and uncontrolled modes. |
| multiple | `boolean` | no | `false` | Allow several branches expanded at once. Default false: expanding one collapses its siblings, never the section or the rows it sits in. |
| onNavigate | `((item: NavListItem, event: MouseEvent<HTMLElement, MouseEvent>) => void)` | no |  | Fires when any link is clicked, alongside native navigation — e.g. to close the drawer that contains the list. |
| expandLabel | `((label: string) => string)` | no | `` (label) => `Expand ${label}` `` | Accessible name of a collapsed row's or section's toggle, given its label. Defaults to "Expand <label>". |
| collapseLabel | `((label: string) => string)` | no | `` (label) => `Collapse ${label}` `` | Accessible name of an expanded row's or section's toggle, given its label. Defaults to "Collapse <label>". |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router; passed on to each row's Button. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The collapsible section follows the WAI-ARIA disclosure pattern (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

| Key | What it does |
| --- | --- |
| Enter | Opens what it controls, and closes it when it is open. |
| Space | Does the same as Enter. |

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

### NavListEntry

A top-level entry: a row, or a section of rows.

```ts
type NavListEntry = NavListItem | NavListSection;
```

### NavListItem

```ts
interface NavListItem {
  /** Row text. */
  label: string;
  /** Link destination — every row is a real link. */
  href: string;
  /** Stable identity for expansion state and aria wiring. Defaults to `href`. */
  id?: string;
  /** Child rows, indented one level. Nesting is supported three levels deep. */
  items?: NavListItem[];
  /**
   * When false, an item with children renders no toggle and its children stay
   * visible — a permanent group rather than a collapsible section.
   * @default true
   */
  collapsible?: boolean;
  /**
   * Forces the current-page treatment on this row regardless of the exact
   * match against `currentHref` — for prefix-matched sections that should
   * stay current on their child routes.
   */
  current?: boolean;
  /** A short tag after the label, such as "New" or "Beta", drawn as a neutral Badge. */
  badge?: string;
}
```

### NavListSection

A titled section of rows: a heading over its items, the way a long
documentation sidebar groups its pages. Sections sit only at the top
level; their items nest like any others.

```ts
interface NavListSection {
  /** Marks the entry as a section rather than a row. */
  type: 'section';
  /** The section's heading. */
  label: string;
  /** The section's rows. */
  items: NavListItem[];
  /**
   * Stable identity for its expansion state. Defaults to the label. In
   * `expandedIds`, `defaultExpandedIds` and `onExpandedChange` a section
   * appears as `section:<id>`, so its id never collides with a row's.
   */
  id?: string;
  /**
   * Let the reader fold the section under its heading. Unlike a row with
   * `items`, which folds unless told not to, a section is a plain label
   * unless told to fold.
   * @default false
   */
  collapsible?: boolean;
}
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `HTMLElement` (typescript), `MouseEvent` (react).
