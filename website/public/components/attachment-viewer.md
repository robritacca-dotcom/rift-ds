# Attachment viewer

A preview dialog for a message's files, with download, stepping, and plain states for files it cannot show.

Generated from the rift-ds registry and prop JSDoc, version 1.4.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AttachmentViewer } from 'rift-ds';`
- Deep import: `import { AttachmentViewer } from 'rift-ds/components/Attachment/AttachmentViewer';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/attachment-viewer

## AttachmentViewer props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the viewer is open. |
| onOpenChange | `(open: boolean) => void` | yes |  | Fires when the viewer asks to close: the close button, Escape, or the backdrop. |
| items | `AttachmentItem[]` | yes |  | The files the viewer steps through, in order. |
| activeId | `string` | no |  | Id of the file on show, for controlled use. Pair with `onActiveChange`. |
| defaultActiveId | `string` | no |  | Id of the file shown first, for uncontrolled use. Defaults to the first item. |
| onActiveChange | `((id: string) => void)` | no |  | Fires with the id of the file stepped to. |
| renderPreview | `((item: AttachmentItem) => ReactNode)` | no |  | Draws a file the viewer cannot: the pages of a PDF, a media player, a rendered spreadsheet. Return nothing to fall back to the built-in view. |
| onDownload | `((item: AttachmentItem) => void)` | no |  | Fires with the file on show when Download is pressed. Its presence renders the buttons. |
| onRetry | `((item: AttachmentItem) => void)` | no |  | Fires with a file that failed to load when "Try again" is pressed. Its presence renders the button. |
| dismissible | `boolean` | no | `true` | Whether Escape, the backdrop and the close button dismiss the viewer. |
| downloadLabel | `string` | no | `Download` | Text of the Download buttons. |
| closeLabel | `string` | no | `Close` | Accessible label for the close button. |
| previousLabel | `string` | no | `Previous file` | Accessible label for the previous-file button. |
| nextLabel | `string` | no | `Next file` | Accessible label for the next-file button. |
| retryLabel | `string` | no | `Try again` | Text of the retry button. |
| noPreviewLabel | `string` | no | `No preview for this file type` | Headline when a file has nothing the viewer can draw. |
| failedLabel | `string` | no | `Couldn’t load this file` | Headline when a file failed to load or is no longer available. |
| failedDescription | `string` | no | `The link may have expired.` | Sentence under `failedLabel`, when the file carries no error message of its own. |
| formatPosition | `((position: number, total: number) => string)` | no | `(position, total) => `${position} of ${total}`` | Builds the position text, e.g. "2 of 5", from a one-based index and the total. |
| className | `string` | no | `` | Additional CSS classes — applied to the portal container, not the panel. |
