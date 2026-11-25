# Alert dialog

Modal confirmation overlay with title, description, and confirm / cancel actions.

Generated from the rift-ds registry and prop JSDoc, version 1.37.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { AlertDialog } from 'rift-ds';`
- Deep import: `import { AlertDialog } from 'rift-ds/components/AlertDialog/AlertDialog';`
- Rendering: client component (declares 'use client')
- Size: 3.9 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/alert-dialog
- Schema: https://rift-ds.com/schema/components/alert-dialog.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Dialog](https://rift-ds.com/components/dialog.md) instead when the task needs more than a confirm or a cancel.

## AlertDialog props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the dialog is open |
| onOpenChange | `(open: boolean) => void` | yes |  | Callback when dialog requests to close |
| title | `string` | yes |  | Dialog title, rendered as the heading that names the dialog. Replaces the native `title` tooltip attribute. |
| description | `string` | no |  | Dialog description / body text |
| confirmLabel | `string` | no | `'Confirm'` | Confirm button label |
| cancelLabel | `string` | no | `'Cancel'` | Cancel button label |
| onConfirm | `(() => void)` | no |  | Callback when confirm is clicked |
| onCancel | `(() => void)` | no |  | Callback when cancel is clicked |
| tone | `"default" \| "destructive"` | no |  | Colour of the dialog's icon, title and confirm action: `destructive` for dangerous or irreversible actions. |
| variant | `"default" \| "destructive"` | no |  | Legacy name for `tone`, from before colour moved onto its own prop. Deprecated: Use `tone` instead. |
| className | `string` | no | `''` | Additional CSS classes on the overlay container (the ref and native attributes go on the panel) |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA dialog pattern (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

| Key | What it does |
| --- | --- |
| On open | Opening moves focus inside. |
| Tab | Moves to the next control inside, and from the last back to the first. Focus never reaches the page behind. |
| Shift + Tab | Moves to the previous control inside, and from the first to the last. |
| Escape | Closes it and returns focus to what opened it. |
