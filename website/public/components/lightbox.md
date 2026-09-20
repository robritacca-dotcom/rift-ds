# Lightbox

Fullscreen media viewer on the shared overlay stack: deep scrim, caption chip, gallery stepping, trapped and restored focus.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: overlays
- Import: `import { Lightbox } from '@robr0/design-system';`
- Deep import: `import { Lightbox } from '@robr0/design-system/components/Lightbox/Lightbox';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/lightbox

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
| className | `string` | no | `` | Additional CSS classes — applied to the portal container, not the panel |
