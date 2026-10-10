# Attachment tile

One file as a square: a picture, a coloured mark for well-known formats, or a neutral badge, with upload states.

Generated from the rift-ds registry and prop JSDoc, version 1.5.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AttachmentTile } from 'rift-ds';`
- Deep import: `import { AttachmentTile } from 'rift-ds/components/Attachment/AttachmentTile';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/attachment-tile

## AttachmentTile props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string` | yes |  | File name, extension included. Truncates in the middle so the extension stays visible. |
| kind | `FileKind` | no | `generic` | What kind of file it is, which picks the type mark: a coloured lettered glyph for the well-known formats, a neutral extension badge for the rest. Derive it with `getFileKind`. |
| typeLabel | `string` | no |  | Short uppercase label on the type mark. Defaults from the kind and the extension. |
| status | `AttachmentStatus` | no | `ready` | Where the file is in its life. Anything but `ready` shows the name with a status line. |
| progress | `number` | no |  | Upload progress, 0 to 100, reported to assistive technology while `uploading`. |
| previewSrc | `string` | no |  | Image that fills the tile while `ready`: an object URL for a picture, or a first page the host rendered for a document. A non-image kind keeps its type mark over the corner. |
| previewAlt | `string` | no |  | Alt text for the preview. Defaults to the file name. |
| previewMark | `boolean` | no |  | Whether the type mark sits over the corner of a preview. Defaults to on for a document's first page, which still has to say what format it is, and off for a picture, which is its own description. A sent message turns it on for pictures too. |
| excerpt | `string` | no |  | First lines of a pasted block, drawn as a faded excerpt filling the tile while `ready`. |
| meta | `string` | no |  | Secondary line under the name while `ready`, e.g. "1.2 MB". Callers keep their own formatting. |
| error | `string` | no |  | Why the file failed. Replaces `errorLabel` on the status line. |
| size | `"default" \| "compact"` | no | `default` | Tile size. Compact shrinks the square and drops the secondary line of a ready file. Unrelated to any native `size` attribute: the root is a div. |
| onClick | `MouseEventHandler<HTMLButtonElement>` | no |  | Click handler. Its presence makes the tile body a button. |
| onRemove | `(() => void)` | no |  | Remove handler. Its presence renders the corner remove button. |
| uploadingLabel | `string` | no | `Uploading…` | Status line while `uploading`. |
| errorLabel | `string` | no | `Upload failed` | Status line while `error`, when no `error` message is given. |
| unavailableLabel | `string` | no | `Unavailable` | Status line while `unavailable`. |
| removeLabel | `string` | no |  | Accessible label for the remove button. Defaults to "Remove" and the file name. |
| className | `string` | no | `` | Additional CSS classes |

## AttachmentItem props

No own props; native attributes pass through.

## AttachmentStatus props

No own props; native attributes pass through.

## FileKind props

No own props; native attributes pass through.

## FileKindMeta props

No own props; native attributes pass through.

## FileLike props

No own props; native attributes pass through.

## formatBytes props

No own props; native attributes pass through.

## getFileExtension props

No own props; native attributes pass through.

## getFileKind props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string` | yes |  | File name, extension included. |
| type | `string` | no |  | Mime type, when the source reported one. |

## getFileTypeLabel props

No own props; native attributes pass through.

## matchesAccept props

No own props; native attributes pass through.

## splitFileName props

No own props; native attributes pass through.
