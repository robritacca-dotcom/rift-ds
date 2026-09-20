# Drawer

An edge-anchored modal panel that slides in from any side, for filter panels, detail views, and mobile navigation.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: overlays
- Import: `import { Drawer } from '@robr0/design-system';`
- Deep import: `import { Drawer } from '@robr0/design-system/components/Drawer/Drawer';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/drawer

## Drawer props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the drawer is open |
| onOpenChange | `(open: boolean) => void` | yes |  | Callback when the drawer requests to close |
| title | `string` | yes |  | Drawer title. Note: this shadows the native `title` tooltip attribute, which Drawer does not expose. |
| description | `string` | no |  | Optional subtitle under the title |
| children | `ReactNode` | no |  | Drawer body content |
| footer | `ReactNode` | no |  | Optional footer slot — typically a row of Buttons |
| side | `"top" \| "bottom" \| "left" \| "right"` | no | `right` | Edge the panel slides in from |
| size | `"sm" \| "md" \| "lg"` | no | `md` | Panel size along the axis it slides on |
| dismissible | `boolean` | no | `true` | Whether ESC, scrim click, and the close button can dismiss |
| className | `string` | no | `` | Additional CSS classes — applied to the portal container, not the panel |
