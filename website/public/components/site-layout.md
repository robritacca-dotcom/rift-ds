# Site layout

The frame of a docs or marketing site: header, sidebar, content, aside and footer, with the page's width and the sidebar's dock set apart.

Generated from the rift-ds registry and prop JSDoc, version 1.32.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { SiteLayout } from 'rift-ds';`
- Deep import: `import { SiteLayout } from 'rift-ds/components/SiteLayout/SiteLayout';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/site-layout
- Schema: https://rift-ds.com/schema/components/site-layout.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [App layout](https://rift-ds.com/components/app-layout.md) instead when the page is an app screen with a rail of tools rather than a site of pages.

## SiteLayout props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | The page's main content: the article, the page. |
| header | `ReactNode` | no |  | The top bar, usually a SiteHeader (give it the same `width` to line it up). |
| sidebar | `ReactNode` | no |  | The navigation column, usually a scrollable NavList: the wide-screen form of the site's sub-navigation. Sticks below the header; below 960px it leaves the page, and the header's own menu carries the same pages (give each SiteHeader section its `drawerItems`), so a reader has one menu, never two. |
| aside | `ReactNode` | no |  | The column after the content, usually an AnchorNav reading the page's headings. Gives way below 1152px in the `column` placement. |
| asidePlacement | `"column" \| "edge"` | no | `'column'` | Where the aside sits. `column` gives it a column of its own after the content. `edge` pins it to the window's end edge, centred on the height, and gives the content the room: the place for AnchorNav's `floating` variant, a minimap that opens on hover or focus. Hidden below 960px in either. |
| footer | `ReactNode` | no |  | The bottom of the site, usually a SiteFooter. |
| width | `"contained" \| "full"` | no | `'contained'` | How wide the page runs, the shell recipe's width axis. `contained` centres the columns at the contained width (1440px, or the nearest `--ds-shell-contained-width`); `full` runs them edge to edge, the side gutter aside. |
| footerWidth | `"contained" \| "full"` | no | `width` | How wide the footer's row runs, apart from the page. Defaults to `width`; set it to the header's width so the top and the bottom of the site match. |
| sidebarDock | `"content" \| "edge"` | no | `'content'` | Where the sidebar sits. `content` keeps it in the page's row, beside the content, so a contained page centres all three columns together. `edge` docks it to the window's start edge behind a hairline, and the content and aside are laid out (and contained) in the room after it. |
| mainId | `string` | no | `'main'` | The id of the main region, the skip link's target. |
| skipLinkLabel | `string` | no | `'Skip to content'` | The skip link's text, the page's first stop. Pass an empty string for none. |
| sidebarLabel | `string` | no | `'Pages'` | Accessible name of the sidebar's navigation landmark. |
| asideLabel | `string` | no | `'On this page'` | Accessible name of the aside's complementary landmark. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

A frame: its slots own their keys, and the skip link and the menu button are native. Those keys belong to the platform, so no test of this library presses them.

Types from other packages: `ReactNode` (react).
