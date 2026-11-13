# App layout

Full-page template pairing the collapsible App sidebar with a content area, in one of the three app shell modes: flush, floating or inset.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { AppLayout } from 'rift-ds';`
- Deep import: `import { AppLayout } from 'rift-ds/components/AppLayout/AppLayout';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/app-layout
- Schema: https://rift-ds.com/schema/components/app-layout.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## AppLayout props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| sections | `AppSidebarSection[]` | yes |  | Sidebar navigation sections |
| profile | `AppSidebarProfile` | no |  | Sidebar profile |
| activeKey | `string` | no |  | Active nav item key |
| activeSubKey | `string` | no |  | Active sub-item key |
| activeTertiaryKey | `string` | no |  | Active third-level item key, listed in the sidebar's side panel |
| subNav | `"accordion" \| "panel"` | no |  | Where sub-items show: the sidebar's accordion, or straight into its side panel (see AppSidebar) |
| defaultExpanded | `boolean` | no | `true` | Whether sidebar starts expanded |
| logoText | `string` | no |  | Logo text next to icon |
| logo | `ReactNode` | no |  | Custom logo element |
| children | `ReactNode` | yes |  | Page content — centred in the main area |
| layout | `AppSidebarLayout` | no | `'flush'` | How the rail and the content meet the page, one of the three app shell modes. `flush` (the default) runs the rail edge to edge on the shell colour behind a hairline, the content centred beside it on the crisp app surface, nothing raised. `floating` floats the rail as a glass card, the content still centred. `inset` runs the rail flush on the shell colour and sets the content full width in a raised surface (hairline and floating shadow) inset from the other edges, which scrolls inside itself. |
| theme | `"inherit" \| "dark"` | no | `'dark'` | Colour scheme: 'dark' pins the layout to the dark theme (the historical behaviour and the default); 'inherit' drops the pin so the layout follows the surrounding data-theme like any other component. |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router; passed on to the AppSidebar rail. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
| className | `string` | no | `''` | Additional CSS classes on outer wrapper |

## Types

### AppSidebarItem

```ts
interface AppSidebarItem {
  /** Unique key for this item */
  key: string;
  /** Item icon — Material Symbol name (string) or custom element (ReactNode). Optional only when `pixelAvatar` draws the mark instead */
  icon?: string | React.ReactNode;
  /**
   * Draws a generated PixelAvatar in the icon seat instead of `icon`, for
   * rows that name a thing rather than a place — projects, workspaces,
   * accounts. `true` seeds the character from `label`; a string seeds it
   * from that value, so a renamed item can keep its character by passing a
   * stable id. The sidebar spreads the inks across all of its avatar rows,
   * so neighbours differ in colour as well as shape. The character is
   * decorative: the label beside it is the name
   */
  pixelAvatar?: boolean | string;
  /** Display label (shown when expanded) */
  label: string;
  /** Click handler — also fires on a link item, so a consumer can route client-side */
  onClick?: () => void;
  /** Renders the item as a real link to this URL instead of a button. Ignored when the item has children, whose row is the accordion toggle */
  href?: string;
  /** Trailing pill, e.g. unread items. A count takes the count badge colours and, while the rail is collapsed, rides the icon's corner; a word stays a quiet pill, hidden while collapsed */
  badge?: string | number;
  /** Sub-items: an accordion under the row, or the side panel's contents when `subNav="panel"` */
  children?: AppSidebarSubItem[];
}
```

### AppSidebarLayout

The three app shell modes, how the rail meets the page: edge to edge behind a hairline, floating as a card, or flush beside a raised inset surface.

```ts
type AppSidebarLayout = 'flush' | 'floating' | 'inset';
```

### AppSidebarProfile

```ts
interface AppSidebarProfile {
  /** User display name */
  name: string;
  /** User email */
  email: string;
  /** Avatar image URL */
  avatarUrl?: string;
}
```

### AppSidebarSection

```ts
interface AppSidebarSection {
  /** Optional category label above the group */
  category?: string;
  /** Nav items in this section */
  items: AppSidebarItem[];
}
```

### AppSidebarSubItem

```ts
interface AppSidebarSubItem {
  /** Unique key for this sub-item */
  key: string;
  /** Display label */
  label: string;
  /** Click handler — also fires on a link sub-item, so a consumer can route client-side */
  onClick?: () => void;
  /** Renders the sub-item as a real link to this URL instead of a button. Ignored when the sub-item has children, whose row opens them */
  href?: string;
  /** Trailing pill, e.g. unread items. A count takes the count badge colours; a word stays a quiet pill */
  badge?: string | number;
  /** Group heading this entry sits under when it is listed in the panel (see `subNav`); ignored in the accordion */
  group?: string;
  /**
   * The next level down. With `subNav="accordion"` a sub-item's children are
   * level 3 and open in the side panel; with `subNav="panel"` they are the
   * panel's own accordion. Navigation stops at three levels, so deeper
   * children are not rendered.
   */
  children?: AppSidebarSubItem[];
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
