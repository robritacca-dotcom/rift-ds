# Attachment group

The files on a sent message: one picture at its own shape, or a grid of tiles that collapses behind a count.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AttachmentGroup } from 'rift-ds';`
- Deep import: `import { AttachmentGroup } from 'rift-ds/components/Attachment/AttachmentGroup';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/attachment-group
- Schema: https://rift-ds.com/schema/components/attachment-group.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## AttachmentGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `AttachmentItem[]` | yes |  | The files on the message, in order. |
| align | `"start" \| "end"` | no | `'start'` | Which edge the layout hugs: `end` for the sender's own turns. |
| max | `number` | no | `4` | Most cells shown before the rest collapse. Over the limit, the last cell becomes a "+N" button standing for the hidden files. |
| open | `boolean` | no |  | Whether the overflow is expanded, for controlled use. Pair with `onOpenChange`. |
| defaultOpen | `boolean` | no | `false` | Whether the overflow starts expanded, for uncontrolled use. |
| onOpenChange | `((open: boolean) => void)` | no |  | Fires when the overflow expands or collapses. |
| viewer | `boolean` | no | `true` | Open a pressed file in the built-in AttachmentViewer, which steps through the rest of the group. Turn it off to handle presses yourself through `onItemClick`. |
| onItemClick | `((item: AttachmentItem) => void)` | no |  | Fires when a file is pressed, whether or not the viewer opens. |
| renderPreview | `((item: AttachmentItem) => ReactNode)` | no |  | Passed to the viewer: draws a file it cannot, such as the pages of a PDF. |
| onDownload | `((item: AttachmentItem) => void)` | no |  | Passed to the viewer: fires when Download is pressed, and renders the buttons. |
| onRetry | `((item: AttachmentItem) => void)` | no |  | Passed to the viewer: fires when "Try again" is pressed on a file that failed to load. |
| size | `"default" \| "compact"` | no | `'default'` | Tile size, passed to every tile. |
| label | `string` | no | `'Attachments'` | Accessible label for the list. |
| showMoreLabel | `((hidden: number) => string)` | no | `` (hidden) => `Show ${hidden} more` `` | Builds the accessible label of the "+N" button from the hidden count. |
| showLessLabel | `string` | no | `'Show fewer'` | Text of the collapse button under an expanded group. |
| attachmentTileLabels | `Pick<AttachmentTileProps, "uploadingLabel" \| "errorLabel" \| "unavailableLabel" \| "progressLabel">` | no |  | The status lines and progress name every tile writes, merged over the tile's English defaults ("Uploading…", "Upload failed", "Unavailable"). |
| attachmentViewerLabels | `Pick<AttachmentViewerProps, "closeLabel" \| "downloadLabel" \| "previousLabel" \| "nextLabel" \| "retryLabel" \| "noPreviewLabel" \| "failedLabel" \| "failedDescription" \| "formatPosition">` | no |  | The words the built-in viewer writes, merged over its English defaults: its buttons ("Download", "Close", "Previous file", "Next file", "Try again"), its fallback headlines and the position text ("2 of 5"). |
| locale | `string` | no |  | The BCP 47 locale file sizes are written in, such as `de-DE` (`1,5 MB`). Defaults to the nearest LocaleProvider's, else `en-US`. |
| className | `string` | no | `''` | Additional CSS classes |

## Types

### AttachmentItem

One attachment as the family passes it around: what a tile draws, what a
group lays out, and what `useAttachments` keeps. Plain data, so it
serialises and crosses the server boundary; the `File` itself stays with
whoever owns the upload.

```ts
interface AttachmentItem {
  /** Stable identity, unique within its list. */
  id: string;
  /** File name, extension included. */
  name: string;
  /** What kind of file it is. */
  kind: FileKind;
  /**
   * Short label on the file's type mark, replacing the one derived from its
   * kind and extension (`getFileTypeLabel`: "PDF", "DOC", the extension, or
   * "FILE"), wherever the family draws the mark: the tile, a lone picture's
   * badge, the viewer and a composer's queue. Set it to localise the mark or
   * to name a format the derivation does not know.
   */
  typeLabel?: string;
  /** Size in bytes. */
  size?: number;
  /** Mime type, when the source reported one. */
  mimeType?: string;
  /** Where the file is in its life. */
  status: AttachmentStatus;
  /** Upload progress, 0 to 100, while `status` is `uploading`. */
  progress?: number;
  /** Why it failed, while `status` is `error`. */
  error?: string;
  /** Image that fills the tile: an object URL for a picture, or a
      host-rendered first page for a document. */
  previewSrc?: string;
  /** Alt text for the preview. Defaults to the name. */
  previewAlt?: string;
  /** Full-size image for the viewer, when the preview is a thumbnail.
      Defaults to `previewSrc`. */
  src?: string;
  /** The file itself, for the viewer to show a PDF or a text file in place
      (through DocumentViewer) and for a picture with no `src`. Distinct
      from `src`, which is always an image. */
  fileUrl?: string;
  /** Intrinsic width of the preview, to reserve its shape before it loads. */
  width?: number;
  /** Intrinsic height of the preview. */
  height?: number;
  /** First lines of a pasted block, drawn as the tile's excerpt. */
  excerpt?: string;
}
```

### AttachmentStatus

Where an attachment is in its life: usable, on its way, failed, or gone.

```ts
type AttachmentStatus = 'ready' | 'uploading' | 'error' | 'unavailable';
```

### AttachmentTileProps

The props of AttachmentTile: `get_component("AttachmentTile")`.

### AttachmentViewerProps

The props of AttachmentViewer: `get_component("AttachmentViewer")`.

### FileKind

```ts
type FileKind =
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'image'
  | 'audio'
  | 'video'
  | 'archive'
  | 'code'
  | 'text'
  | 'pasted'
  | 'generic';
```

Types from other packages: `Pick` (typescript), `ReactNode` (react).
