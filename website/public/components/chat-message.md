# Chat message

A single chat turn with avatar, author, timestamp, and bubble or plain content aligned by role.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { ChatMessage } from '@robr0/design-system';`
- Deep import: `import { ChatMessage } from '@robr0/design-system/components/ChatMessage/ChatMessage';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/chat-message

## ChatMessage props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| role | `"user" \| "assistant"` | no | `assistant` | Which side of the conversation this turn belongs to. Drives alignment and the default surface: user turns are right-aligned bubbles, assistant turns are surface-less full-width text. Shadows the ARIA role attribute; the root renders no ARIA role. |
| avatar | `ReactNode` | no |  | Avatar slot, e.g. an `<Avatar>`. Omit for no gutter at all. |
| showAvatar | `boolean` | no | `true` | Show the passed avatar. When false the avatar is hidden but its gutter space is kept, so consecutive rows in a run stay aligned. |
| author | `string` | no |  | Display name shown above the content. |
| timestamp | `string` | no |  | Time shown beside the author, e.g. "2:41 PM". Free text, so callers keep their own formatting. |
| grouped | `boolean` | no | `false` | Consecutive-message mode: hides the avatar (keeping its gutter), drops the author and timestamp, and tightens the spacing to the row above. |
| bubble | `boolean` | no |  | Override the role's default surface. Explicit true on an assistant turn renders a received bubble; explicit false on a user turn renders plain text. |
| tail | `boolean` | no | `false` | Square the speaker-side bottom corner of the bubble — bottom-right on a sent bubble, bottom-left on a received one. Only meaningful when a bubble renders. |
| size | `"default" \| "compact"` | no | `default` | Compact drops the type one size step and tightens the bubble padding. |
| pending | `boolean` | no | `false` | Waiting for the first content: renders a three-dot pulse in place of children. |
| pendingLabel | `string` | no | `Waiting for a reply` | Accessible text announced for the pending state. |
| actions | `ReactNode` | no |  | Action row under the content, revealed on hover and keyboard focus (always visible on touch) — `showActions` pins it on. |
| showActions | `boolean` | no | `false` | Always show the action row instead of revealing it on hover and focus. For surfaces where the actions are part of the response — a copy or feedback row — rather than a secondary affordance. |
| footer | `ReactNode` | no |  | Footer slot under the content — a sources row, an edited note. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | The message content. The package ships no markdown renderer; render markdown yourself, ideally wrapped in Prose, and pass the result. |
