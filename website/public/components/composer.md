# Composer

An auto-growing message input with send and stop states, a page-context note, a file tray fed by picker, paste and drop, and Enter-to-send.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { Composer } from 'rift-ds';`
- Deep import: `import { Composer } from 'rift-ds/components/Composer/Composer';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/composer
- Schema: https://rift-ds.com/schema/components/composer.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Composer props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `string` | no |  | Current value for controlled use. Pair with `onValueChange`. |
| defaultValue | `string` | no |  | Initial value for uncontrolled use. |
| onValueChange | `((value: string) => void)` | no |  | Convenience callback receiving the value directly. Fires alongside `onChange`, which keeps the standard React event signature so form libraries work unmodified. |
| onSubmit | `((value: string) => void)` | no |  | Fires with the current value on Enter (without Shift) and on the send button — never while `streaming`, never while a file in `files` is still uploading, and never when there is nothing to send. Text is enough, and so is a ready file on its own, in which case the value is an empty string. Composer does not clear the value: the consumer owns it and clears it after a successful submit. Shadows the native `onSubmit` attribute, which never fires on a textarea anyway. |
| streaming | `boolean` | no | `false` | A response is streaming: the send button becomes a stop button, submit is blocked, and Enter is inert. On a glowing composer (`aiGlow`) the gradient ring also stays lit and keeps turning while this is true. |
| onStop | `(() => void)` | no |  | Fires when the stop button is pressed while `streaming`. |
| size | `"default" \| "compact"` | no | `'default'` | The mini composer's density (`inline` as `true`), matching a table's or a bar's: `compact` takes the smaller text, height and button. Every other composer has the one size, so it ignores this. |
| inline | `boolean \| "chat"` | no | `false` | One row with the send button on the text's line. `true` makes the shell exactly `size`'s control height, so it lines up with an Input or a table's toolbar: the mini composer, for AI input inside other content such as a table, never for a chat. `chat` gives the button a full-size control and room around it: for a chat with nothing to seat in a footer, where a `context` note inside takes a line of its own over the row. Above one row (`maxRows`), typing grows the shell with the send button held in the bottom corner. A placeholder stays on one line and ends in an ellipsis. |
| maxRows | `number` | no | `inline === true ? 3 : 12` | Growth cap in text rows before the textarea scrolls internally. Defaults to 12 in a chat composer, or 3 in the mini composer. |
| aiGlow | `boolean` | no | `false` | While focused, the shell wears AiButton's slowly rotating gradient ring and glow in place of the plain selected border — the system's "a model answers here" signal, for composers whose messages are answered by one. While `streaming`, the ring stays lit and turning whether or not the field holds focus. Off by default. |
| context | `ReactNode` | no |  | Contextual note rendered as a full-width, non-interactive chip — the "what the model is looking at" line a chat host pins over the message ("Looking at “Page name”"). `contextPlacement` decides where it sits. One line: a note too long for the shell truncates with an ellipsis. Composer owns the chip's chrome; the caller passes the text. |
| contextPlacement | `"inside" \| "above"` | no | `'inside'` | Where the `context` chip sits. `inside` (the default) pins it at the very top of the shell, above any attachments. `above` lifts it out of the shell into its own bar a small gap above it, so it reads as what the model can see rather than part of the message being typed. Either way its icon starts on the shell's text rail, and a click on it focuses the textarea. |
| contextIcon | `string \| ReactNode` | no |  | Icon at the left of the context chip — Material Symbol name (string, e.g. `visibility`, `article`) or custom element (ReactNode). Decorative and hidden from assistive technology — the chip's text carries the meaning. None by default, matching the ai set's icon-free-unless-asked convention. |
| onContextClear | `(() => void)` | no |  | Called by the context chip's clear button, which appears only when this is set: for a host whose note follows something the reader focused (a selection, a highlighted passage) and can go back to the page as a whole. |
| contextClearLabel | `string` | no | `'Clear context'` | The accessible name of the context chip's clear button. Defaults to "Clear context". |
| files | `AttachmentItem[]` | no |  | The files queued on this message, drawn as a scrolling row of square tiles above the textarea. Controlled by the caller: Composer draws the list and reports what was added or removed, and never stores a file. `useAttachments` is the usual owner. |
| onFilesSelected | `((files: File[]) => void)` | no |  | Fires with the files a person picked, pasted or dropped. Providing it arms all three: the attach button and its picker, file paste in the textarea, and drop on the shell. |
| onFileRemove | `((id: string) => void)` | no |  | Fires with the id of the file whose remove button was pressed. Its presence renders the buttons. |
| onFileClick | `((item: AttachmentItem) => void)` | no |  | Fires with a queued file when its tile is pressed. Its presence makes the tiles buttons. |
| accept | `string` | no |  | File types the picker offers, in the native `accept` syntax. |
| multiple | `boolean` | no | `true` | Whether the picker allows several files at once. |
| attachButton | `boolean` | no | `true` | Whether the built-in attach button shows when `onFilesSelected` is set. |
| pasteThreshold | `number` | no |  | Pasted text at least this many characters long becomes an attachment instead of landing in the textarea. Off unless set, and inert without `onPasteAsAttachment`. |
| onPasteAsAttachment | `((text: string) => void)` | no |  | Receives pasted text that met `pasteThreshold`. |
| attachLabel | `string` | no | `'Attach files'` | Accessible label for the attach button. |
| dropLabel | `string` | no | `'Drop files to attach'` | Text shown on the shell while files are dragged over it. |
| filesLabel | `string` | no | `'Attachments'` | Accessible label for the list of queued files. |
| attachmentTileLabels | `(Pick<AttachmentTileProps, "uploadingLabel" \| "errorLabel" \| "unavailableLabel" \| "progressLabel"> & { removeLabel?: ((name: string) => string); })` | no |  | The words each queued file's tile writes, merged over the tile's English defaults: its status lines ("Uploading…", "Upload failed", "Unavailable"), its progress spinner's name, and its remove button's name, which is given the file name and defaults to "Remove" followed by it. |
| formatFileAnnouncement | `((change: { type: "failed" \| "added" \| "removed"; names: string[]; }) => string)` | no | `` ({ type, names, }: { type: 'added' \| 'removed' \| 'failed'; names: string[]; }) => { const list = names.join(', '); if (type === 'added') return `Attached ${list}`; if (type === 'removed') return `Removed ${list}`; return `Could not attach ${list}`; } `` | Builds the sentence announced to assistive technology when files join the queue, leave it, or fail. |
| attachments | `ReactNode` | no |  | Free-form row rendered above the textarea, after any `files`. Deprecated: Use `files` with `onFilesSelected` and `onFileRemove`, which draw the queue as tiles. |
| mentions | `MentionSource[]` | no |  | What a person can reference while typing, one source per trigger character: `@` for entities, `/` for skills. Typing a trigger at the start of a word opens a menu of that source's items, filtered as the word grows. Arrows move through it, Enter or Tab writes the choice into the text, Escape closes it. A mention is drawn in the tag colour wherever its exact name stands in the text; the value stays a plain string. |
| onMentionSelect | `((item: MentionItem, trigger: string) => void)` | no |  | Fires with the item a person chose from the mention menu, and the trigger that opened it. |
| mentionPlacement | `"top" \| "bottom"` | no | `'top'` | Which side of the trigger's line the mention menu opens on: `top` lays it over the text above, `bottom` over the text below. `top` suits a composer at the foot of a view. |
| formatMentionAnnouncement | `((count: number) => string)` | no | `` (count: number) => count === 1 ? '1 suggestion' : `${count} suggestions` `` | Builds the sentence announced to assistive technology when the mention menu opens or its matches change. |
| actions | `ReactNode` | no |  | Leading actions on the left of the action bar, after the attach button (a model picker). |
| trailingActions | `ReactNode` | no |  | Trailing actions on the right of the action bar, just before the send button (dictation, voice mode). |
| sendLabel | `string` | no | `'Send message'` | Accessible label for the send button. |
| stopLabel | `string` | no | `'Stop generating'` | Accessible label for the stop button. |
| locale | `string` | no |  | The BCP 47 locale file sizes are written in, such as `de-DE` (`1,5 MB`). Defaults to the nearest LocaleProvider's, else `en-US`. |
| className | `string` | no | `''` | Additional CSS classes — applied to the shell, not the <textarea>. |

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

### MentionItem

One thing a person can reference: a teammate, a file, a skill.

```ts
type MentionItem = {
  /** Stable identity, unique within its source. */
  id: string;
  /** The name shown in the menu and written into the text after the trigger character. */
  label: string;
  /** A quieter second phrase on the same row: a role, a path, what a skill does. */
  description?: string;
  /** Leading mark: a Material Symbol name, or any node (an Avatar). Decorative. */
  icon?: string | React.ReactNode;
  /** Extra words the filter matches on besides the label. */
  keywords?: string[];
  /** Listed but not choosable. */
  disabled?: boolean;
};
```

### MentionSource

Everything one trigger character opens: `@` for entities, `/` for skills.

```ts
type MentionSource = {
  /** The single character that opens this source. */
  trigger: string;
  /** The items it offers. */
  items: MentionItem[];
  /** Accessible name for this source's menu ("People", "Skills"). */
  label?: string;
};
```

Types from other packages: `ComponentPropsWithoutRef` (react), `File` (typescript), `HTMLButtonElement` (typescript), `MouseEventHandler` (react), `Omit` (typescript), `Pick` (typescript), `ReactNode` (react).
