# Site header

A site's sticky top bar of section pills and mega menus, folding to a drawer when the pills no longer fit.

Generated from the rift-ds registry and prop JSDoc, version 1.17.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { SiteHeader } from 'rift-ds';`
- Deep import: `import { SiteHeader } from 'rift-ds/components/SiteHeader/SiteHeader';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/site-header

## SiteHeader props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| brand | `ReactNode` | no |  | The brand at the bar's start, usually a logo linking home. Rendered as given, so it carries its own link. |
| sections | `SiteHeaderSection[]` | yes |  | The site's top-level sections, in order. |
| currentHref | `string` | no |  | The path of the page being viewed, used to mark the current section, row and drawer item. |
| actions | `ReactNode` | no |  | Controls at the bar's end that stay at every width, such as a search button. |
| wideActions | `ReactNode` | no |  | Controls at the bar's end that show only while the pills fit, such as a theme toggle. Once the bar folds to its menu button they leave it; put their drawer twin in `drawerFooter`. |
| drawerFooter | `ReactNode` | no |  | Content for the drawer's footer, such as the controls `wideActions` holds in the bar. |
| drawerOpen | `boolean` | no |  | Whether the folded bar's drawer is open, for a host that owns that state. Pair with `onDrawerOpenChange`. |
| defaultDrawerOpen | `boolean` | no | `false` | Whether the drawer starts open, when the header owns its state. |
| onDrawerOpenChange | `((open: boolean) => void)` | no |  | Called when the drawer opens or closes, controlled or not. |
| initialFold | `"tablet" \| "mid" \| "never"` | no | `tablet` | Where the bar folds before it has measured itself: on the first frame, which a server-rendered page shows before its script runs. Below this breakpoint (`tablet` or the wider `mid`) the bar starts folded by CSS alone, so a phone never sees the pills overflow; the measurement takes over once the script runs. Pick the step nearest where the pills stop fitting, or `never` for a bar that fits at every width. |
| sticky | `boolean` | no | `true` | Whether the header sticks to the top of the viewport over a progressive blur. Off, it scrolls away with the page and draws no blur. |
| tintAfter | `number` | no | `48` | How far, in pixels, the page scrolls before the page-surface tint fades in over the sticky header's blur. |
| linkComponent | `LinkComponent` | no |  | The component every link renders through, so a router's link (Next.js `Link`) navigates without a reload. Falls back to the nearest `LinkProvider`, then `<a>`. |
| navLabel | `string` | no | `Primary` | The accessible name of the section links' `<nav>` landmark. |
| drawerOpenLabel | `string` | no | `Open menu` | The accessible name of the menu button that opens the drawer. |
| drawerTitle | `string` | no | `Menu` | The drawer's title, naming the dialog. Shown at its top when there is no `brand`; with one, the brand takes its place and the title is read only by assistive tech. |
| drawerCloseLabel | `string` | no | `Close menu` | The accessible name of the drawer's close button. |
| className | `string` | no | `` | Additional CSS classes on the `<header>`. |
