# Alert dialog

Modal confirmation overlay with title, description, and confirm / cancel actions.

Generated from the rift-ds registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { AlertDialog } from 'rift-ds';`
- Deep import: `import { AlertDialog } from 'rift-ds/components/AlertDialog/AlertDialog';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/alert-dialog

## AlertDialog props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the dialog is open |
| onOpenChange | `(open: boolean) => void` | yes |  | Callback when dialog requests to close |
| title | `string` | yes |  | Dialog title |
| description | `string` | no |  | Dialog description / body text |
| confirmLabel | `string` | no | `Confirm` | Confirm button label |
| cancelLabel | `string` | no | `Cancel` | Cancel button label |
| onConfirm | `(() => void)` | no |  | Callback when confirm is clicked |
| onCancel | `(() => void)` | no |  | Callback when cancel is clicked |
| variant | `"default" \| "destructive"` | no | `default` | Destructive variant for dangerous actions |
| className | `string` | no | `` | Additional CSS classes |
