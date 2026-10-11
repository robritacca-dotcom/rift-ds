# Composer

An auto-growing message input with send and stop states, a page-context note, a file tray fed by picker, paste and drop, and Enter-to-send.

Generated from the rift-ds registry and prop JSDoc, version 1.7.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { Composer } from 'rift-ds';`
- Deep import: `import { Composer } from 'rift-ds/components/Composer/Composer';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/composer

## Composer props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `string` | no |  | Current value for controlled use. Pair with `onValueChange`. |
| defaultValue | `string` | no |  | Initial value for uncontrolled use. |
| onValueChange | `((value: string) => void)` | no |  | Convenience callback receiving the value directly. Fires alongside `onChange`, which keeps the standard React event signature so form libraries work unmodified. |
| onSubmit | `((value: string) => void)` | no |  | Fires with the current value on Enter (without Shift) and on the send button — never while `streaming`, never while a file in `files` is still uploading, and never when there is nothing to send. Text is enough, and so is a ready file on its own, in which case the value is an empty string. Composer does not clear the value: the consumer owns it and clears it after a successful submit. Shadows the native `onSubmit` attribute, which never fires on a textarea anyway. |
| streaming | `boolean` | no | `false` | A response is streaming: the send button becomes a stop button, submit is blocked, and Enter is inert. On a glowing composer (`aiGlow`) the gradient ring also stays lit and keeps turning while this is true. |
| onStop | `(() => void)` | no |  | Fires when the stop button is pressed while `streaming`. |
| maxRows | `number` | no | `8` | Growth cap in text rows before the textarea scrolls internally. |
| aiGlow | `boolean` | no | `false` | While focused, the shell wears AiButton's slowly rotating gradient ring and glow in place of the plain selected border — the system's "a model answers here" signal, for composers whose messages are answered by one. While `streaming`, the ring stays lit and turning whether or not the field holds focus. Off by default. |
| context | `ReactNode` | no |  | Contextual note rendered as a full-width, non-interactive chip — the "what the model is looking at" line a chat host pins over the message ("Looking at “Page name”"). `contextPlacement` decides where it sits. One line: a note too long for the shell truncates with an ellipsis. Composer owns the chip's chrome; the caller passes the text. |
| contextPlacement | `"inside" \| "above"` | no | `inside` | Where the `context` chip sits. `inside` (the default) pins it at the very top of the shell, above any attachments. `above` lifts it out of the shell into its own bar a small gap above it, so it reads as what the model can see rather than part of the message being typed. Either way its icon starts on the shell's text rail, and a click on it focuses the textarea. |
| contextIcon | `ReactNode` | no |  | Icon at the left of the context chip — Material Symbol name (string, e.g. `visibility`, `article`) or custom element (ReactNode). Decorative and hidden from assistive technology — the chip's text carries the meaning. None by default, matching the ai set's icon-free-unless-asked convention. |
| files | `AttachmentItem[]` | no |  | The files queued on this message, drawn as a scrolling row of square tiles above the textarea. Controlled by the caller: Composer draws the list and reports what was added or removed, and never stores a file. `useAttachments` is the usual owner. |
| onFilesSelected | `((files: File[]) => void)` | no |  | Fires with the files a person picked, pasted or dropped. Providing it arms all three: the attach button and its picker, file paste in the textarea, and drop on the shell. |
| onFileRemove | `((id: string) => void)` | no |  | Fires with the id of the file whose remove button was pressed. Its presence renders the buttons. |
| onFileClick | `((item: AttachmentItem) => void)` | no |  | Fires with a queued file when its tile is pressed. Its presence makes the tiles buttons. |
| accept | `string` | no |  | File types the picker offers, in the native `accept` syntax. |
| multiple | `boolean` | no | `true` | Whether the picker allows several files at once. |
| attachButton | `boolean` | no | `true` | Whether the built-in attach button shows when `onFilesSelected` is set. |
| pasteThreshold | `number` | no |  | Pasted text at least this many characters long becomes an attachment instead of landing in the textarea. Off unless set, and inert without `onPasteAsAttachment`. |
| onPasteAsAttachment | `((text: string) => void)` | no |  | Receives pasted text that met `pasteThreshold`. |
| attachLabel | `string` | no | `Attach files` | Accessible label for the attach button. |
| dropLabel | `string` | no | `Drop files to attach` | Text shown on the shell while files are dragged over it. |
| filesLabel | `string` | no | `Attachments` | Accessible label for the list of queued files. |
| formatFileAnnouncement | `((change: { type: "added" \| "removed" \| "failed"; names: string[]; }) => string)` | no | `({   type,   names, }: {   type: 'added' \| 'removed' \| 'failed';   names: string[]; }) => {   const list = names.join(', ');   if (type === 'added') return `Attached ${list}`;   if (type === 'removed') return `Removed ${list}`;   return `Could not attach ${list}`; }` | Builds the sentence announced to assistive technology when files join the queue, leave it, or fail. |
| attachments | `ReactNode` | no |  | Free-form row rendered above the textarea, after any `files`. Deprecated: Use `files` with `onFilesSelected` and `onFileRemove`, which draw the queue as tiles. |
| mentions | `MentionSource[]` | no |  | What a person can reference while typing, one source per trigger character: `@` for entities, `/` for skills. Typing a trigger at the start of a word opens a menu of that source's items, filtered as the word grows. Arrows move through it, Enter or Tab writes the choice into the text, Escape closes it. A mention is drawn in the tag colour wherever its exact name stands in the text; the value stays a plain string. |
| onMentionSelect | `((item: MentionItem, trigger: string) => void)` | no |  | Fires with the item a person chose from the mention menu, and the trigger that opened it. |
| mentionPlacement | `"top" \| "bottom"` | no | `top` | Which side of the trigger's line the mention menu opens on: `top` lays it over the text above, `bottom` over the text below. `top` suits a composer at the foot of a view. |
| formatMentionAnnouncement | `((count: number) => string)` | no | `(count: number) =>   count === 1 ? '1 suggestion' : `${count} suggestions`` | Builds the sentence announced to assistive technology when the mention menu opens or its matches change. |
| actions | `ReactNode` | no |  | Leading actions on the left of the action bar, after the attach button (a model picker). |
| trailingActions | `ReactNode` | no |  | Trailing actions on the right of the action bar, just before the send button (dictation, voice mode). |
| sendLabel | `string` | no | `Send message` | Accessible label for the send button. |
| stopLabel | `string` | no | `Stop generating` | Accessible label for the stop button. |
| className | `string` | no | `` | Additional CSS classes — applied to the shell, not the <textarea>. |
