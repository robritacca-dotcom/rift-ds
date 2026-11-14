# Chat header

The top row of a chat surface, with the conversation title and its controls.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ChatHeader } from 'rift-ds';`
- Deep import: `import { ChatHeader } from 'rift-ds/components/ChatHeader/ChatHeader';`
- Rendering: server-renderable (no 'use client')
- Size: 0.3 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/chat-header
- Schema: https://rift-ds.com/schema/components/chat-header.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ChatHeader props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `ReactNode` | no |  | The chat or assistant name. Deliberately shadows the native `title` tooltip attribute — a header's title is content, not a tooltip. Pass a string for the default treatment, or your own heading element. |
| actions | `ReactNode` | no |  | Trailing controls: a new-chat CircularButton, a view switcher, a close button. The slot only lays them out — each control owns its behaviour. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The buttons follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |

Types from other packages: `ReactNode` (react).
