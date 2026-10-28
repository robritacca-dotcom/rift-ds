# Mega menu

A wide navigation panel of icon rows with descriptions, beside an optional featured card.

Generated from the rift-ds registry and prop JSDoc, version 1.16.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { MegaMenu } from 'rift-ds';`
- Deep import: `import { MegaMenu } from 'rift-ds/components/MegaMenu/MegaMenu';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/mega-menu

## MegaMenu props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the panel shows. Controlled by design: the host owns the triggers that open it, so it owns this state too. A closed panel fades out and is `inert`, so its links leave the tab order. |
| items | `MegaMenuItem[]` | yes |  | The link rows, laid out four to a column and wrapping into further columns. |
| showcase | `MegaMenuShowcase` | no |  | A featured card in its own column beside the link grid. |
| currentHref | `string` | no |  | The path of the page being viewed. A row whose `href` is this path, or a parent of it, is marked as the current page. |
| onNavigate | `(() => void)` | no |  | Called when any link in the panel is followed, so a host can close it. |
| linkComponent | `LinkComponent` | no |  | The component every link renders through, so a router's link (Next.js `Link`) navigates without a reload. The panel is server-renderable, so it cannot read a `LinkProvider`; a client host resolves one and passes it here. Defaults to `<a>`. |
| className | `string` | no | `` | Additional CSS classes on the panel. |
