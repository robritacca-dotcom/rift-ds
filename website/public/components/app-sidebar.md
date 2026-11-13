# App sidebar

Collapsible navigation rail with accordion sub-items, a side panel for a third level, category headings, and a profile section.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { AppSidebar } from 'rift-ds';`
- Deep import: `import { AppSidebar } from 'rift-ds/components/AppSidebar/AppSidebar';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/app-sidebar
- Schema: https://rift-ds.com/schema/components/app-sidebar.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## AppSidebar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| sections | `AppSidebarSection[]` | yes |  | Navigation sections |
| profile | `AppSidebarProfile` | no |  | Profile data for the bottom section |
| activeKey | `string` | no |  | Key of the currently active item |
| activeSubKey | `string` | no |  | Key of the currently active sub-item |
| activeTertiaryKey | `string` | no |  | Key of the currently active third-level item, listed in the side panel |
| subNav | `"accordion" \| "panel"` | no | `'accordion'` | Where an item's sub-items show. `accordion` (the default) opens them under the row, and a sub-item's own children open in a side panel as level 3. `panel` skips the accordion: a top-level item opens its sub-items straight into the side panel, with their children as the panel's accordion, and the collapsed rail shows each label under its icon. On small screens both modes drill in inside the drawer instead. |
| defaultPanelOpen | `boolean` | no | `true` | Whether the side panel starts open when there is one to show |
| panelOpen | `boolean` | no |  | Controlled open state of the side panel |
| onPanelOpenChange | `((open: boolean) => void)` | no |  | Called when the side panel opens or collapses |
| defaultExpanded | `boolean` | no | `false` | Whether sidebar starts expanded |
| expanded | `boolean` | no |  | Controlled expanded state |
| onExpandedChange | `((expanded: boolean) => void)` | no |  | Callback when expand/collapse changes |
| onProfileMore | `(() => void)` | no |  | Callback when profile more button clicked |
| layout | `AppSidebarLayout` | no |  | How the rail meets the page, one of the three app shell modes. `flush` runs it edge to edge on the shell colour behind a hairline divider, nothing raised. `floating` floats it off the viewport edges as a glass card: inset with rounded corners, the translucent glass fill over a backdrop blur, and the floating shadow (the inset defaults to 20px and is overridable via the --ds-sidebar-float-inset custom property). `inset` runs it flush on the app shell colour, beside a raised content surface inset from the edges, as AppLayout's `inset` layout draws it. Inside a host that marks itself a shell (AppLayout, a chat or template page), the rail reads that host's mode from the shell recipe. Defaults to `flush` (or `floating` while the deprecated `floating` is set). |
| floating | `boolean` | no | `false` | Floats the rail as a glass card, the same as `layout="floating"`. Deprecated: Use `layout="floating"`. |
| topSlot | `ReactNode` | no |  | Rendered under the logo row, above the nav; fades out while collapsed |
| persistentTopSlot | `boolean` | no | `false` | Keeps `topSlot` shown while collapsed instead of fading it, clipped by the sweeping rail as the nav rows are, for content that draws its own collapsed form: a switcher that holds its mark on the rail's axis and fades the rest. The slot carries `data-expanded`, so its content can key off the rail's state |
| footerSlot | `ReactNode` | no |  | Rendered above the profile block; fades out while collapsed |
| collapsedFooterSlot | `ReactNode` | no |  | Rendered above the profile block while the rail is collapsed, in `footerSlot`'s place: the same controls at their smallest, such as a SegmentedControl's or ThemeToggle's `cycle` circle, stacked and centred on the rail's axis. The two forms share one cell and crossfade with the rail, and whichever is hidden is inert |
| className | `string` | no | `''` | Additional CSS classes |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
| logo | `ReactNode` | no |  | Logo element — defaults to the built-in brand mark |
| logoText | `string` | no | `'Rift'` | Text shown next to logo when expanded |
| showMobileTrigger | `boolean` | no | `true` | Below the mobile breakpoint the rail hides and this fixed hamburger button opens it as an overlay drawer instead. Set false when the host renders its own trigger in the page chrome. |
| openLabel | `string` | no | `'Open navigation'` | Accessible name of the mobile hamburger trigger that opens the drawer |
| closeLabel | `string` | no | `'Close navigation'` | Accessible name of the toggle when it closes the mobile drawer |
| expandLabel | `string` | no | `'Expand sidebar'` | Accessible name of the toggle (and the collapsed logo) when it expands the rail |
| collapseLabel | `string` | no | `'Collapse sidebar'` | Accessible name of the toggle when it collapses the rail |
| profileMoreLabel | `string` | no | `'Profile options'` | Accessible name of the profile block's more button |
| menuLabel | `string` | no | `'Menu'` | Back-button text in the mobile drawer's drill-in when the open level has no parent row to name (a top-level item opened with `subNav="panel"`) |

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
