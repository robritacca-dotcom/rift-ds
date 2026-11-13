# Nav list

Vertical list of navigation links for drawers and menus, with three indent levels and per-row expand toggles.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { NavList } from 'rift-ds';`
- Deep import: `import { NavList } from 'rift-ds/components/NavList/NavList';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/nav-list
- Schema: https://rift-ds.com/schema/components/nav-list.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## NavList props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `NavListItem[]` | yes |  | Navigation tree to render. |
| currentHref | `string` | no |  | href of the current page — the exactly matching row gets `aria-current="page"` and the active treatment. |
| expandedIds | `string[]` | no |  | Controlled list of expanded item ids. |
| defaultExpandedIds | `string[]` | no |  | Initially expanded item ids (uncontrolled). |
| onExpandedChange | `((expandedIds: string[]) => void)` | no |  | Fires with the full new list of expanded ids whenever a toggle is pressed, in both controlled and uncontrolled modes. |
| multiple | `boolean` | no | `false` | Allow several sections expanded at once. Default false — expanding one collapses the rest. |
| onNavigate | `((item: NavListItem, event: MouseEvent<HTMLElement, MouseEvent>) => void)` | no |  | Fires when any link is clicked, alongside native navigation — e.g. to close the drawer that contains the list. |
| expandLabel | `((label: string) => string)` | no | `` (label) => `Expand ${label}` `` | Accessible name of a collapsed section's chevron toggle, given the row's label. Defaults to "Expand <label>". |
| collapseLabel | `((label: string) => string)` | no | `` (label) => `Collapse ${label}` `` | Accessible name of an expanded section's chevron toggle, given the row's label. Defaults to "Collapse <label>". |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router; passed on to each row's Button. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
| className | `string` | no | `''` | Additional CSS classes |

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
   */
  collapsible?: boolean;
  /**
   * Forces the current-page treatment on this row regardless of the exact
   * match against `currentHref` — for prefix-matched sections that should
   * stay current on their child routes.
   */
  current?: boolean;
}
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `HTMLElement` (typescript), `MouseEvent` (react).
