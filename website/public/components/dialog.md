# Dialog

A general-purpose modal for focused tasks, with sizes, an optional footer, and full focus management.

Generated from the rift-ds registry and prop JSDoc, version 1.31.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { Dialog } from 'rift-ds';`
- Deep import: `import { Dialog } from 'rift-ds/components/Dialog/Dialog';`
- Rendering: client component (declares 'use client')
- Size: 5.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/dialog
- Schema: https://rift-ds.com/schema/components/dialog.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Alert dialog](https://rift-ds.com/components/alert-dialog.md) instead when the task is a simple confirm-or-cancel prompt.

## Dialog props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the dialog is open |
| onOpenChange | `(open: boolean) => void` | yes |  | Callback when dialog requests to close |
| title | `string` | yes |  | Dialog title. Note: this shadows the native `title` tooltip attribute, which Dialog does not expose. |
| description | `string` | no |  | Optional subtitle under the title |
| children | `ReactNode` | no |  | Dialog body content |
| footer | `ReactNode` | no |  | Optional footer slot — typically a row of Buttons |
| size | `"sm" \| "md" \| "lg"` | no | `'md'` | Panel width |
| dismissible | `boolean` | no | `true` | Whether ESC, backdrop click, and the close button can dismiss |
| closeLabel | `string` | no | `'Close dialog'` | Accessible name of the close button. |
| className | `string` | no | `''` | Additional CSS classes — applied to the portal container, not the panel |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA dialog pattern (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

| Key | What it does |
| --- | --- |
| On open | Opening moves focus inside. |
| Tab | Moves to the next control inside, and from the last back to the first. Focus never reaches the page behind. |
| Shift + Tab | Moves to the previous control inside, and from the first to the last. |
| Escape | Closes it and returns focus to what opened it. |

Types from other packages: `ReactNode` (react).
