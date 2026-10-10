# App layout

Full-page template pairing the collapsible App sidebar with a centred content area.

Generated from the rift-ds registry and prop JSDoc, version 1.5.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { AppLayout } from 'rift-ds';`
- Deep import: `import { AppLayout } from 'rift-ds/components/AppLayout/AppLayout';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/app-layout

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
| theme | `"inherit" \| "dark"` | no | `dark` | Colour scheme: 'dark' pins the layout to the dark theme (the historical behaviour and the default); 'inherit' drops the pin so the layout follows the surrounding data-theme like any other component. |
| className | `string` | no | `` | Additional CSS classes on outer wrapper |
