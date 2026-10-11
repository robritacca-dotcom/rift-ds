# Attachment group

The files on a sent message: one picture at its own shape, or a grid of tiles that collapses behind a count.

Generated from the rift-ds registry and prop JSDoc, version 1.7.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AttachmentGroup } from 'rift-ds';`
- Deep import: `import { AttachmentGroup } from 'rift-ds/components/Attachment/AttachmentGroup';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/attachment-group

## AttachmentGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `AttachmentItem[]` | yes |  | The files on the message, in order. |
| align | `"start" \| "end"` | no | `start` | Which edge the layout hugs: `end` for the sender's own turns. |
| max | `number` | no | `4` | Most cells shown before the rest collapse. Over the limit, the last cell becomes a "+N" button standing for the hidden files. |
| open | `boolean` | no |  | Whether the overflow is expanded, for controlled use. Pair with `onOpenChange`. |
| defaultOpen | `boolean` | no | `false` | Whether the overflow starts expanded, for uncontrolled use. |
| onOpenChange | `((open: boolean) => void)` | no |  | Fires when the overflow expands or collapses. |
| viewer | `boolean` | no | `true` | Open a pressed file in the built-in AttachmentViewer, which steps through the rest of the group. Turn it off to handle presses yourself through `onItemClick`. |
| onItemClick | `((item: AttachmentItem) => void)` | no |  | Fires when a file is pressed, whether or not the viewer opens. |
| renderPreview | `((item: AttachmentItem) => ReactNode)` | no |  | Passed to the viewer: draws a file it cannot, such as the pages of a PDF. |
| onDownload | `((item: AttachmentItem) => void)` | no |  | Passed to the viewer: fires when Download is pressed, and renders the buttons. |
| onRetry | `((item: AttachmentItem) => void)` | no |  | Passed to the viewer: fires when "Try again" is pressed on a file that failed to load. |
| size | `"default" \| "compact"` | no | `default` | Tile size, passed to every tile. |
| label | `string` | no | `Attachments` | Accessible label for the list. |
| showMoreLabel | `((hidden: number) => string)` | no | `(hidden) => `Show ${hidden} more`` | Builds the accessible label of the "+N" button from the hidden count. |
| showLessLabel | `string` | no | `Show fewer` | Text of the collapse button under an expanded group. |
| className | `string` | no | `` | Additional CSS classes |
