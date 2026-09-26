# App sidebar

Collapsible navigation rail with accordion sub-items, category headings, and profile section.

Generated from the rift-ds registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { AppSidebar } from 'rift-ds';`
- Deep import: `import { AppSidebar } from 'rift-ds/components/AppSidebar/AppSidebar';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/app-sidebar

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
| logo | `ReactNode` | no |  | Logo element — defaults to the built-in brand mark |
| logoText | `string` | no | `Rift` | Text shown next to logo when expanded |
| showMobileTrigger | `boolean` | no | `true` | Below the mobile breakpoint the rail hides and this fixed hamburger button opens it as an overlay drawer instead. Set false when the host renders its own trigger in the page chrome. |
