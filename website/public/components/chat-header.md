# Chat header

The top row of a chat surface, with the conversation title and its controls.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { ChatHeader } from '@robr0/design-system';`
- Deep import: `import { ChatHeader } from '@robr0/design-system/components/ChatHeader/ChatHeader';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/chat-header

## ChatHeader props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `ReactNode` | no |  | The chat or assistant name. Deliberately shadows the native `title` tooltip attribute — a header's title is content, not a tooltip. Pass a string for the default treatment, or your own heading element. |
| actions | `ReactNode` | no |  | Trailing controls: a new-chat CircularButton, a view switcher, a close button. The slot only lays them out — each control owns its behaviour. |
| className | `string` | no | `` | Additional CSS classes |
