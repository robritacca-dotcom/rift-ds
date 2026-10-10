# Sidebar panel

Secondary navigation column listing one section's pages, with group headings and one level of accordion nesting.

Generated from the rift-ds registry and prop JSDoc, version 1.5.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { SidebarPanel } from 'rift-ds';`
- Deep import: `import { SidebarPanel } from 'rift-ds/components/SidebarPanel/SidebarPanel';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/sidebar-panel

## SidebarPanel props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `SidebarPanelItem[]` | yes |  | Items to list, optionally grouped with `group` and nested one level with `children` |
| title | `string` | no |  | Heading at the top of the panel, usually the label of the item that opened it. Also the panel's accessible name |
| activeKey | `string` | no |  | Key of the item for the current page. Its accordion parent starts open |
| defaultOpenKeys | `string[]` | no |  | Keys of the accordion rows open on first render, in addition to the active item's parent |
| onCollapse | `(() => void)` | no |  | Renders a collapse button beside the heading and calls this when it is pressed |
| onBack | `(() => void)` | no |  | Renders a back row above the heading and calls this when it is pressed; the drill-in navigation on small screens |
| backLabel | `string` | no | `Back` | Label of the back row |
| className | `string` | no | `` | Additional CSS classes |
