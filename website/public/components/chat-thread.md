# Chat thread

A scrollable conversation column with edge fades, send anchoring, and a subtle scrollbar.

Generated from the rift-ds registry and prop JSDoc, version 1.0.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ChatThread } from 'rift-ds';`
- Deep import: `import { ChatThread } from 'rift-ds/components/ChatThread/ChatThread';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/chat-thread

## ChatThread props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| anchor | `boolean` | no | `true` | Scroll a newly appended turn to the top of the viewport, pushing the prior conversation upward. When a user turn and the agent's pending turn are appended in the same update, the first new child is the one anchored — the response streams in below it. Detection diffs the DOM child count, so replacing turns in place (a future regenerate or edit-last-turn) neither re-anchors nor resizes the spacer. |
| ariaLabel | `string` | no | `Conversation` | Accessible name for the scrollable conversation region. |
| jumpLabel | `string` | no | `Scroll to the latest message` | Accessible name for the scroll-to-bottom control. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | The conversation, in order: ChatMessages, ChatMarkers. |
