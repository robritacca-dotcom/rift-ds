# App layout

Full-page template pairing the collapsible App sidebar with a content area, in flush, floating or inset mode, contained or full width.

Generated from the rift-ds registry and prop JSDoc, version 1.39.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { AppLayout } from 'rift-ds';`
- Deep import: `import { AppLayout } from 'rift-ds/components/AppLayout/AppLayout';`
- Rendering: client component (declares 'use client')
- Size: 16.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/app-layout
- Schema: https://rift-ds.com/schema/components/app-layout.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Site layout](https://rift-ds.com/components/site-layout.md) instead when the page is a site of pages under a top header, such as documentation.

## AppLayout props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| sections | `AppSidebarSection[]` | yes |  | Sidebar navigation sections |
| profile | `AppSidebarProfile` | no |  | Sidebar profile |
| activeKey | `string` | no |  | Active nav item key |
| activeSubKey | `string` | no |  | Active sub-item key |
| activeTertiaryKey | `string` | no |  | Active third-level item key, listed in the sidebar's side panel |
| subNav | `"accordion" \| "panel"` | no | `'panel'` | Where sub-items show: straight into the sidebar's side panel, or its accordion (see AppSidebar). |
| defaultExpanded | `boolean` | no | `true` | Whether sidebar starts expanded |
| logoText | `string` | no |  | Logo text next to icon |
| logo | `ReactNode` | no |  | Custom logo element |
| children | `ReactNode` | yes |  | Page content — centred in the main area |
| layout | `AppSidebarLayout` | no | `'inset'` | How the rail and the content meet the page, one of the three app shell modes. `flush` runs the rail edge to edge on the shell colour behind a hairline, the content centred beside it on the crisp app surface, nothing raised. `floating` floats the rail as a glass card, the content still centred. `inset` runs the rail flush on the shell colour and sets the content in a raised surface (hairline and floating shadow) inset from the other edges, which scrolls inside itself, and is the default. How wide the content runs is `width`, apart from the mode. |
| width | `"contained" \| "full"` | no | `'contained'` | How wide the content runs, in any `layout`: `contained` centres it at the contained width (1120px here, or `--ds-shell-contained-width` set on the layout); `full` runs it the whole width the mode leaves it. An app's working column, so it takes none of SiteLayout's site-scale `containedWidth` steps. `inset` no longer forces full width, as it did up to 1.32: pass `width="full"` for that edge-to-edge inset. |
| theme | `"inherit" \| "dark"` | no | `'dark'` | Colour scheme: 'dark' pins the layout to the dark theme (the historical behaviour and the default); 'inherit' drops the pin so the layout follows the surrounding data-theme like any other component. |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router; passed on to the AppSidebar rail. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
| sidebarProps | `AppLayoutSidebarProps` | no |  | The rest of the AppSidebar rail's options, passed through as they are, so an app on AppLayout has the same rail as the templates and a chat: folding sections (`collapsibleSections`), a footer action, the top and footer slots, the profile's more button, the drawer's entries and labels. The props AppLayout sets itself (the sections, the profile, the active keys, `subNav`, the logo, `layout`, the expanded state, the link component and the rail's seat) are its own. |
| className | `string` | no | `''` | Additional CSS classes on outer wrapper |

## Keyboard

The rail is AppSidebar, which carries the layout’s keys. The layout adds none of its own. AppSidebar's stories test these keys.

## Types

### AppLayoutSidebarProps

The AppSidebar options AppLayout passes through untouched (`sidebarProps`).

```ts
type AppLayoutSidebarProps = Omit<
  AppSidebarProps,
  | 'sections'
  | 'profile'
  | 'activeKey'
  | 'activeSubKey'
  | 'activeTertiaryKey'
  | 'subNav'
  | 'expanded'
  | 'defaultExpanded'
  | 'onExpandedChange'
  | 'logo'
  | 'logoText'
  | 'layout'
  | 'floating'
  | 'fixed'
  | 'responsive'
  | 'linkComponent'
>;
```

### AppSidebarItem

The props of AppSidebar: `get_component("AppSidebar")`.

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
  /** The quiet second line under the name, usually the email. Left empty, the row shows the name alone */
  email?: string;
  /** Avatar image URL */
  avatarUrl?: string;
  /** A mark of its own in the avatar's place, such as a generated avatar; wins over `avatarUrl` */
  avatar?: React.ReactNode;
}
```

### AppSidebarProps

The props of AppSidebar: `get_component("AppSidebar")`.

### AppSidebarSection

```ts
interface AppSidebarSection {
  /** The heading above the group. Optional for a single section and for the first; with more than one, give the rest their heading, so every group the gaps set apart is named. A section with `content` may name its own groups instead */
  category?: string;
  /** Nav items in this section. Pass an empty list for a section that is all `content` */
  items: AppSidebarItem[];
  /** Stable identity for the section's fold state, the key `collapsedSections` lists. Defaults to `category`; set it when the heading is translated or may change, or two headings share their text */
  id?: string;
  /**
   * The section's own content after its rows, for a rail whose content is
   * more than destinations (a chat's history). On the expanded rail it sits
   * under the section's fold, at the rail's expanded width; the collapsed
   * rail, which has no room for it, folds it away; in the drawer it follows
   * the section's rows on the first level. A function is told where it is
   * drawn, so its rows can close the drawer.
   */
  content?: React.ReactNode | ((context: AppSidebarSectionContext) => React.ReactNode);
  /** A button in the section's heading on the expanded rail, and a row after the section's rows in the drawer, such as a project list's add */
  action?: AppSidebarSectionAction;
}
```

### AppSidebarSectionAction

The props of AppSidebar: `get_component("AppSidebar")`.

### AppSidebarSectionContext

The props of AppSidebar: `get_component("AppSidebar")`.

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

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `Omit` (typescript), `ReactNode` (react).
