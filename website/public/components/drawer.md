# Drawer

An edge-anchored modal panel that slides in from any side, for filter panels, detail views, and mobile navigation.

Generated from the rift-ds registry and prop JSDoc, version 1.16.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { Drawer } from 'rift-ds';`
- Deep import: `import { Drawer } from 'rift-ds/components/Drawer/Drawer';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/drawer

## Drawer props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the drawer is open |
| onOpenChange | `(open: boolean) => void` | yes |  | Callback when the drawer requests to close |
| title | `string` | yes |  | Drawer title. Note: this shadows the native `title` tooltip attribute, which Drawer does not expose. |
| description | `string` | no |  | Optional subtitle under the title |
| heading | `ReactNode` | no |  | Content shown in place of the title text, such as a site's logo. The `title` still names the dialog, read by assistive tech from a visually hidden heading. |
| children | `ReactNode` | no |  | Drawer body content |
| footer | `ReactNode` | no |  | Optional footer slot — typically a row of Buttons |
| side | `"top" \| "bottom" \| "start" \| "end" \| "left" \| "right"` | no | `right` | Edge the panel slides in from. `left` and `right` are the screen's edges in any reading direction; `start` and `end` follow it, so a `start` drawer opens on the left in English and on the right in Arabic. |
| size | `"sm" \| "md" \| "lg"` | no | `md` | Panel size along the axis it slides on |
| dismissible | `boolean` | no | `true` | Whether ESC, scrim click, and the close button can dismiss |
| closeLabel | `string` | no | `Close drawer` | Accessible name of the close button. |
| className | `string` | no | `` | Additional CSS classes — applied to the portal container, not the panel |
