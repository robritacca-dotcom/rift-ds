# Dialog

A general-purpose modal for focused tasks, with sizes, an optional footer, and full focus management.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: overlays
- Import: `import { Dialog } from '@robr0/design-system';`
- Deep import: `import { Dialog } from '@robr0/design-system/components/Dialog/Dialog';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/dialog

## Dialog props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the dialog is open |
| onOpenChange | `(open: boolean) => void` | yes |  | Callback when dialog requests to close |
| title | `string` | yes |  | Dialog title. Note: this shadows the native `title` tooltip attribute, which Dialog does not expose. |
| description | `string` | no |  | Optional subtitle under the title |
| children | `ReactNode` | no |  | Dialog body content |
| footer | `ReactNode` | no |  | Optional footer slot — typically a row of Buttons |
| size | `"sm" \| "md" \| "lg"` | no | `md` | Panel width |
| dismissible | `boolean` | no | `true` | Whether ESC, backdrop click, and the close button can dismiss |
| className | `string` | no | `` | Additional CSS classes — applied to the portal container, not the panel |
