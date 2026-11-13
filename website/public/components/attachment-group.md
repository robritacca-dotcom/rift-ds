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

### AttachmentTileOwnProps

Props owned by AttachmentTile itself — everything else falls through to the root element.

```ts
type AttachmentTileOwnProps = {
  /** File name, extension included. Truncates in the middle so the extension stays visible. */
  name: string;
  /**
   * What kind of file it is, which picks the type mark: a coloured lettered
   * glyph for the well-known formats, a neutral extension badge for the
   * rest. Derive it with `getFileKind`.
   */
  kind?: FileKind;
  /** Short uppercase label on the type mark. Defaults from the kind and the extension. */
  typeLabel?: string;
  /** Where the file is in its life. Anything but `ready` shows the name with a status line. */
  status?: AttachmentStatus;
  /** Upload progress, 0 to 100, reported to assistive technology while `uploading`. */
  progress?: number;
  /**
   * Image that fills the tile while `ready`: an object URL for a picture, or
   * a first page the host rendered for a document. A non-image kind keeps
   * its type mark over the corner.
   */
  previewSrc?: string;
  /** Alt text for the preview. Defaults to the file name. */
  previewAlt?: string;
  /**
   * Whether the type mark sits over the corner of a preview. Defaults to on
   * for a document's first page, which still has to say what format it is,
   * and off for a picture, which is its own description. A sent message
   * turns it on for pictures too.
   */
  previewMark?: boolean;
  /** First lines of a pasted block, drawn as a faded excerpt filling the tile while `ready`. */
  excerpt?: string;
  /** Secondary line under the name while `ready`, e.g. "1.2 MB". Callers keep their own formatting. */
  meta?: string;
  /** Why the file failed. Replaces `errorLabel` on the status line. */
  error?: string;
  /**
   * Tile size. Compact shrinks the square and drops the secondary line of a
   * ready file. Unrelated to any native `size` attribute: the root is a div.
   */
  size?: 'default' | 'compact';
  /** Click handler. Its presence makes the tile body a button. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Remove handler. Its presence renders the corner remove button. */
  onRemove?: () => void;
  /** Status line while `uploading`. */
  uploadingLabel?: string;
  /** Status line while `error`, when no `error` message is given. */
  errorLabel?: string;
  /** Status line while `unavailable`. */
  unavailableLabel?: string;
  /** Accessible label for the remove button. Defaults to "Remove" and the file name. */
  removeLabel?: string;
  /** Accessible name of the upload progress spinner while `uploading`, given the file name. Defaults to "Uploading" followed by the name. */
  progressLabel?: (name: string) => string;
  /** Additional CSS classes */
  className?: string;
};
```

### AttachmentTileProps

```ts
interface AttachmentTileProps
  extends AttachmentTileOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AttachmentTileOwnProps> {}
```

### AttachmentViewerOwnProps

Props owned by AttachmentViewer itself — everything else falls through to the panel.

```ts
type AttachmentViewerOwnProps = {
  /** Whether the viewer is open. */
  open: boolean;
  /** Fires when the viewer asks to close: the close button, Escape, or the backdrop. */
  onOpenChange: (open: boolean) => void;
  /** The files the viewer steps through, in order. */
  items: AttachmentItem[];
  /** Id of the file on show, for controlled use. Pair with `onActiveChange`. */
  activeId?: string;
  /** Id of the file shown first, for uncontrolled use. Defaults to the first item. */
  defaultActiveId?: string;
  /** Fires with the id of the file stepped to. */
  onActiveChange?: (id: string) => void;
  /**
   * Draws a file the viewer cannot: the pages of a PDF, a media player, a
   * rendered spreadsheet. Return nothing to fall back to the built-in view.
   */
  renderPreview?: (item: AttachmentItem) => React.ReactNode;
  /** Fires with the file on show when Download is pressed. Its presence renders the buttons. */
  onDownload?: (item: AttachmentItem) => void;
  /** Fires with a file that failed to load when "Try again" is pressed. Its presence renders the button. */
  onRetry?: (item: AttachmentItem) => void;
  /** Whether Escape, the backdrop and the close button dismiss the viewer. */
  dismissible?: boolean;
  /** Text of the Download buttons. */
  downloadLabel?: string;
  /** Accessible label for the close button. */
  closeLabel?: string;
  /** Accessible label for the previous-file button. */
  previousLabel?: string;
  /** Accessible label for the next-file button. */
  nextLabel?: string;
  /** Text of the retry button. */
  retryLabel?: string;
  /** Headline when a file has nothing the viewer can draw. */
  noPreviewLabel?: string;
  /** Headline when a file failed to load or is no longer available. */
  failedLabel?: string;
  /** Sentence under `failedLabel`, when the file carries no error message of its own. */
  failedDescription?: string;
  /** Builds the position text, e.g. "2 of 5", from a one-based index and the total. */
  formatPosition?: (position: number, total: number) => string;
  /** The BCP 47 locale file sizes are written in, such as `de-DE` (`1,5 MB`). Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** Additional CSS classes — applied to the portal container, not the panel. */
  className?: string;
};
```

### AttachmentViewerProps

```ts
interface AttachmentViewerProps
  extends AttachmentViewerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AttachmentViewerOwnProps> {}
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

Types from other packages: `ComponentPropsWithoutRef` (react), `HTMLButtonElement` (typescript), `MouseEventHandler` (react), `Omit` (typescript), `Pick` (typescript), `ReactNode` (react).
