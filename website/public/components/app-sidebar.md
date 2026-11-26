# App sidebar

Collapsible navigation rail whose sub-items open in a side panel beside it or an accordion beneath their row, with category headings and a profile section.

Generated from the rift-ds registry and prop JSDoc, version 1.38.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { AppSidebar } from 'rift-ds';`
- Deep import: `import { AppSidebar } from 'rift-ds/components/AppSidebar/AppSidebar';`
- Rendering: client component (declares 'use client')
- Size: 16.4 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/app-sidebar
- Schema: https://rift-ds.com/schema/components/app-sidebar.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Thread panel](https://rift-ds.com/components/thread-panel.md) instead when a standalone chat history rail is enough, one that renders on the server.

## AppSidebar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| sections | `AppSidebarSection[]` | yes |  | Navigation sections |
| collapsibleSections | `boolean` | no | `false` | Let the reader fold each titled section under its heading: the heading becomes a toggle with a chevron, and the section's rows glide shut beneath it. Every section starts open. A section is known by its `id`, or its `category` when it has none, the key the fold state lists. The collapsed rail and the phone drawer show every row whatever is folded, since neither shows the headings. |
| collapsedSections | `string[]` | no |  | Controlled list of folded sections, by each section's `id` (its `category` when it has none). Needs `collapsibleSections`. |
| defaultCollapsedSections | `string[]` | no |  | Sections folded at first (uncontrolled), by `id` (else `category`). Needs `collapsibleSections`. |
| onCollapsedSectionsChange | `((collapsedSections: string[]) => void)` | no |  | Fires with the full new list of folded sections whenever a heading is pressed, in both controlled and uncontrolled modes. |
| profile | `AppSidebarProfile` | no |  | Profile data for the bottom section |
| activeKey | `string` | no |  | Key of the currently active item. When one of its children is the current page (`activeSubKey` or `activeTertiaryKey`), that child carries `aria-current` instead, and this row drops its fill while the child shows below it. |
| activeSubKey | `string` | no |  | Key of the currently active sub-item |
| activeTertiaryKey | `string` | no |  | Key of the currently active third-level item, listed in the side panel |
| subNav | `"accordion" \| "panel"` | no | `'panel'` | Where an item's sub-items show. `panel` (the default) opens a top-level item's sub-items straight into the side panel, with their children as the panel's accordion, and the collapsed rail shows each label under its icon. `accordion` opens them under the row instead, and a sub-item's own children open in a side panel as level 3. On small screens both modes drill in inside the drawer instead. |
| defaultPanelOpen | `boolean` | no | `true` | Whether the side panel starts open when there is one to show |
| panelOpen | `boolean` | no |  | Controlled open state of the side panel |
| onPanelOpenChange | `((open: boolean) => void)` | no |  | Called when the side panel opens or collapses |
| defaultExpanded | `boolean` | no | `false` | Whether sidebar starts expanded |
| expanded | `boolean` | no |  | Controlled expanded state |
| onExpandedChange | `((expanded: boolean) => void)` | no |  | Callback when expand/collapse changes |
| collapsible | `boolean` | no | `true` | Whether the reader can collapse the rail. `false` keeps it expanded: no toggle, and a click on the rail opens nothing. |
| responsive | `AppSidebarResponsive` | no | `'viewport'` | How the rail decides between its rail and its drawer form. `viewport` (the default) follows the window: the rail folds on entering the tablet band and turns into the drawer at the mobile breakpoint. `container` does the same by the width of the rail's parent, for a rail inside a framed host. `rail` and `drawer` leave the decision to the host, which measures its own room (a chat does, at its own widths). Every value but `viewport` needs `fixed={false}`: the drawer then covers the parent, not the page, and holds no page scroll lock. |
| drawerOpen | `boolean` | no |  | Controlled open state of the drawer form |
| defaultDrawerOpen | `boolean` | no | `false` | Whether the drawer form starts open (uncontrolled) |
| onDrawerOpenChange | `((open: boolean) => void)` | no |  | Called when the drawer opens or closes, including every close of its own: the scrim, the close button, Escape, a destination row, and growing back into the rail form |
| foldForPanel | `boolean` | no | `false` | Fold the rail to its icon form when the side panel opens and its parent has too little room for the expanded rail, the panel and a readable column beside them: under 1000px (the 280px rail, the 240px panel and a 480px column). For a rail in a narrow host, such as a chat. |
| keyLabels | `Partial<Record<string, string>>` | no |  | Replaces any legend an item's `keys` hint is drawn with, such as `{ ctrl: 'Strg' }` for a German keyboard |
| onProfileMore | `(() => void)` | no |  | Callback when profile more button clicked |
| layout | `AppSidebarLayout` | no | `'inset'` | How the rail meets the page, one of the three app shell modes. `flush` runs it edge to edge on the shell colour behind a hairline divider, nothing raised. `floating` floats it off the viewport edges as a glass card: inset with rounded corners, the translucent glass fill over a backdrop blur, and the floating shadow (the inset defaults to 20px and is overridable via the --ds-sidebar-float-inset custom property). `inset` runs it flush on the app shell colour, beside a raised content surface inset from the edges, as AppLayout's `inset` layout draws it. Inside a host that marks itself a shell (AppLayout, a chat or template page), the rail reads that host's mode from the shell recipe. Defaults to `inset` (or `floating` while the deprecated `floating` is set). |
| floating | `boolean` | no | `false` | Floats the rail as a glass card, the same as `layout="floating"`. Deprecated: Use `layout="floating"`. |
| fixed | `boolean` | no | `true` | Pin the rail to the viewport. `true` (the default) fixes it to the viewport's start edge at the viewport's height, with the side panel and the phone drawer fixed beside it, as a full-page app wants. `false` lays it out in its parent instead, for a framed preview or a layout that is not the whole page: the parent is a flex row with a definite height, the rail is its first item at the parent's height (sticky, so it holds while the parent scrolls), and the content beside it gives way as the rail expands and the side panel opens. On a phone the trigger, the scrim and the drawer stay inside the parent too. |
| topSlot | `ReactNode` | no |  | Rendered under the logo row, above the nav; fades out while collapsed |
| persistentTopSlot | `boolean` | no | `false` | Keeps `topSlot` shown while collapsed instead of fading it, clipped by the sweeping rail as the nav rows are, for content that draws its own collapsed form: a switcher that holds its mark on the rail's axis and fades the rest. The slot carries `data-expanded`, so its content can key off the rail's state |
| footerSlot | `ReactNode` | no |  | Rendered above the profile block; fades out while collapsed |
| drawerTopEntries | `DrillMenuEntry[]` | no |  | Rows above the sections in the phone drawer, in DrillMenu's shape, such as a switcher that drills into its choices. When set, the drawer shows these in `topSlot`'s place, since a dropdown has no room to open on a full-screen menu. |
| drawerBottomEntries | `DrillMenuEntry[]` | no |  | Rows after the sections in the phone drawer, in DrillMenu's shape, such as appearance settings that drill into their choices. When set, the drawer shows these in `footerSlot`'s place. |
| footerAction | `ReactNode` | no |  | One primary action at the rail's foot, below the profile and full width, as the site header's drawer pins its call to action: in the expanded rail and the phone drawer alike, where it stays in view while the levels above it scroll. The collapsed rail has no room for it, so it fades out with the labels and is inert. |
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
| menuLabel | `string` | no | `'Menu'` | The phone drawer's menu: the accessible name of its navigation, and what the back row says on every second level |
| drawerBackLabel | `((title: string) => string)` | no | `` (title) => `Back to ${title}` `` | The phone drawer's back row's accessible name, given the title of the level it returns to, for a site in another language. The drill menu's own default. |
| drawerOverviewLabel | `((label: string) => string)` | no | `` (label) => `${label} overview` `` | The text of the overview row a drilled level opens with when its row has a page of its own, given that row's label, for a site in another language. The drill menu's own default. |

## Keyboard

In its drawer form (below the mobile breakpoint, or when its host asks) the rail is a modal drawer: opening moves focus inside, Tab stays inside, and Escape closes it. The component's own stories test these keys.

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
  /** The setting's current value at the row's trailing end while expanded, such as "Dark" on a row whose sub-items are a setting's choices */
  value?: string;
  /** Sub-items: an accordion under the row, or the side panel's contents when `subNav="panel"` */
  children?: AppSidebarSubItem[];
  /** A keyboard hint at the row's end while expanded, in the shortcut grammar (`mod+shift+o`), drawn in the reader's platform legends. Decorative: bind the action with `useShortcut` */
  keys?: Shortcut;
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
  /** The quiet second line under the name, usually the email. Left empty, the row shows the name alone */
  email?: string;
  /** Avatar image URL */
  avatarUrl?: string;
  /** A mark of its own in the avatar's place, such as a generated avatar; wins over `avatarUrl` */
  avatar?: React.ReactNode;
}
```

### AppSidebarResponsive

How the rail decides between its rail and drawer forms.

```ts
type AppSidebarResponsive = 'viewport' | 'container' | 'rail' | 'drawer';
```

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

A button in a section's heading, such as a project list's add.

```ts
interface AppSidebarSectionAction {
  /** Its accessible name, and the row's text in the drawer. */
  label: string;
  /** A Material Symbol name. Defaults to `add`. */
  icon?: string;
  /** What pressing it does. */
  onClick: () => void;
}
```

### AppSidebarSectionContext

What a section's `content` function is told about where it is drawn.

```ts
interface AppSidebarSectionContext {
  /** Whether the rail is expanded (the drawer always is). */
  expanded: boolean;
  /** Whether it is drawn in the drawer rather than on the rail. */
  drawer: boolean;
  /** Closes the drawer, for content whose rows are destinations. Does nothing on the rail. */
  closeDrawer: () => void;
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
  /** A second line under the label, shown where the sub-item is listed in the side panel and the phone drawer */
  description?: string;
  /** Icon before the label in the side panel and the phone drawer: a Material Symbol name or a custom element, such as a swatch */
  icon?: string | React.ReactNode;
  /** In a list of choices (a setting's options), whether this one is chosen: true carries the chosen mark in the side panel and the phone drawer. Picking a choice is an action, so the panel and the drawer stay open */
  selected?: boolean;
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

### Shortcut

A shortcut in the grammar above, such as `mod+k`, `shift+?` or `g i`.

```ts
type Shortcut = string;
```

### ShortcutKeyLabels

The legends a shortcut is drawn with, by modifier or key name. Merged over the platform's defaults.

```ts
type ShortcutKeyLabels = Partial<Record<string, string>>;
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `HTMLButtonElement` (typescript), `MouseEvent` (react), `Partial` (typescript), `ReactNode` (react), `Record` (typescript).
