# Attachment viewer

A preview dialog for a message's files, with download, stepping, and plain states for files it cannot show.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AttachmentViewer } from 'rift-ds';`
- Deep import: `import { AttachmentViewer } from 'rift-ds/components/Attachment/AttachmentViewer';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/attachment-viewer
- Schema: https://rift-ds.com/schema/components/attachment-viewer.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

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
| downloadLabel | `string` | no | `'Download'` | Text of the Download buttons. |
| closeLabel | `string` | no | `'Close'` | Accessible label for the close button. |
| previousLabel | `string` | no | `'Previous file'` | Accessible label for the previous-file button. |
| nextLabel | `string` | no | `'Next file'` | Accessible label for the next-file button. |
| retryLabel | `string` | no | `'Try again'` | Text of the retry button. |
| noPreviewLabel | `string` | no | `'No preview for this file type'` | Headline when a file has nothing the viewer can draw. |
| failedLabel | `string` | no | `'Couldn’t load this file'` | Headline when a file failed to load or is no longer available. |
| failedDescription | `string` | no | `'The link may have expired.'` | Sentence under `failedLabel`, when the file carries no error message of its own. |
| formatPosition | `((position: number, total: number) => string)` | no | `` (position, total) => `${position} of ${total}` `` | Builds the position text, e.g. "2 of 5", from a one-based index and the total. |
| locale | `string` | no |  | The BCP 47 locale file sizes are written in, such as `de-DE` (`1,5 MB`). Defaults to the nearest LocaleProvider's, else `en-US`. |
| className | `string` | no | `''` | Additional CSS classes — applied to the portal container, not the panel. |

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

Types from other packages: `ReactNode` (react).
