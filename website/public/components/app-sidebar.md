# App sidebar

Collapsible navigation rail with accordion sub-items, category headings, and profile section.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: layout
- Import: `import { AppSidebar } from '@robr0/design-system';`
- Deep import: `import { AppSidebar } from '@robr0/design-system/components/AppSidebar/AppSidebar';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/app-sidebar

## AppSidebar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| sections | `AppSidebarSection[]` | yes |  | Navigation sections |
| profile | `AppSidebarProfile` | no |  | Profile data for the bottom section |
| activeKey | `string` | no |  | Key of the currently active item |
| activeSubKey | `string` | no |  | Key of the currently active sub-item |
| defaultExpanded | `boolean` | no | `false` | Whether sidebar starts expanded |
| expanded | `boolean` | no |  | Controlled expanded state |
| onExpandedChange | `((expanded: boolean) => void)` | no |  | Callback when expand/collapse changes |
| onProfileMore | `(() => void)` | no |  | Callback when profile more button clicked |
| floating | `boolean` | no | `false` | Floats the rail off the viewport edges as a glass card: inset with rounded corners, the translucent glass fill over a backdrop blur, and the floating shadow. The inset defaults to 20px and is overridable via the --ds-sidebar-float-inset custom property. |
| topSlot | `ReactNode` | no |  | Rendered under the logo row, above the nav; fades out while collapsed |
| footerSlot | `ReactNode` | no |  | Rendered above the profile block; fades out while collapsed |
| className | `string` | no | `` | Additional CSS classes |
| logo | `ReactNode` | no |  | Logo element — defaults to built-in robr0 logo |
| logoText | `string` | no | `robr0` | Text shown next to logo when expanded |
