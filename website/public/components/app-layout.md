# App layout

Full-page template pairing the collapsible App sidebar with a centred content area.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: layout
- Import: `import { AppLayout } from '@robr0/design-system';`
- Deep import: `import { AppLayout } from '@robr0/design-system/components/AppLayout/AppLayout';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/app-layout

## AppLayout props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| sections | `AppSidebarSection[]` | yes |  | Sidebar navigation sections |
| profile | `AppSidebarProfile` | no |  | Sidebar profile |
| activeKey | `string` | no |  | Active nav item key |
| activeSubKey | `string` | no |  | Active sub-item key |
| defaultExpanded | `boolean` | no | `true` | Whether sidebar starts expanded |
| logoText | `string` | no |  | Logo text next to icon |
| logo | `ReactNode` | no |  | Custom logo element |
| children | `ReactNode` | yes |  | Page content — centred in the main area |
| theme | `"inherit" \| "dark"` | no | `dark` | Colour scheme: 'dark' pins the layout to the dark theme (the historical behaviour and the default); 'inherit' drops the pin so the layout follows the surrounding data-theme like any other component. |
| className | `string` | no | `` | Additional CSS classes on outer wrapper |
