# App sidebar

Collapsible navigation rail with accordion sub-items, a side panel for a third level, category headings, and a profile section.

Generated from the rift-ds registry and prop JSDoc, version 1.0.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

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
| activeTertiaryKey | `string` | no |  | Key of the currently active third-level item, listed in the side panel |
| subNav | `"accordion" \| "panel"` | no | `accordion` | Where an item's sub-items show. `accordion` (the default) opens them under the row, and a sub-item's own children open in a side panel as level 3. `panel` skips the accordion: a top-level item opens its sub-items straight into the side panel, with their children as the panel's accordion, and the collapsed rail shows each label under its icon. On small screens both modes drill in inside the drawer instead. |
| defaultPanelOpen | `boolean` | no | `true` | Whether the side panel starts open when there is one to show |
| panelOpen | `boolean` | no |  | Controlled open state of the side panel |
| onPanelOpenChange | `((open: boolean) => void)` | no |  | Called when the side panel opens or collapses |
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
