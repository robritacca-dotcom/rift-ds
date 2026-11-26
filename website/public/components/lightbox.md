# Lightbox

Fullscreen media viewer on the shared overlay stack: deep scrim, caption chip, gallery stepping, trapped and restored focus.

Generated from the rift-ds registry and prop JSDoc, version 1.38.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: overlays
- Import: `import { Lightbox } from 'rift-ds';`
- Deep import: `import { Lightbox } from 'rift-ds/components/Lightbox/Lightbox';`
- Rendering: client component (declares 'use client')
- Size: 3.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/lightbox
- Schema: https://rift-ds.com/schema/components/lightbox.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Lightbox props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| open | `boolean` | yes |  | Whether the lightbox is open |
| onOpenChange | `(open: boolean) => void` | yes |  | Callback when the lightbox requests to close |
| src | `string` | no |  | The image to show. Omit it when `children` supplies the media. |
| alt | `string` | no |  | Image alt text — also the panel's accessible name. Required whenever `src` is set. |
| caption | `string` | no |  | Optional caption shown in a chip under the media |
| children | `ReactNode` | no |  | Custom media instead of `src` — a framework image component, a video, a live embed. Sized by the same viewport bounds the plain image gets. |
| dismissible | `boolean` | no | `true` | Whether ESC, backdrop click, and the close button can dismiss |
| onPrev | `(() => void)` | no |  | Steps to the previous item. Providing it renders the previous chevron and arms the Left arrow key — the consumer owns the collection and the index. |
| onNext | `(() => void)` | no |  | Steps to the next item — the next chevron and the Right arrow key. |
| viewerLabel | `string` | no | `'Media viewer'` | The panel's accessible name when neither `alt` nor `caption` is set. |
| closeLabel | `string` | no | `'Close viewer'` | Accessible name of the close button. |
| previousLabel | `string` | no | `'Previous'` | Accessible name of the previous button, shown with `onPrev`. |
| nextLabel | `string` | no | `'Next'` | Accessible name of the next button, shown with `onNext`. |
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
