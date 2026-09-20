# Message card

A structured rich-content card embedded in a chat message, with media, title, body, and actions.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { MessageCard } from '@robr0/design-system';`
- Deep import: `import { MessageCard } from '@robr0/design-system/components/MessageCard/MessageCard';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/message-card

## MessageCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | no |  | Card heading. |
| description | `string` | no |  | One or two lines under the title. |
| media | `ReactNode` | no |  | Top media slot — an image or chart, inset from the card edges with its own rounded corners. |
| icon | `ReactNode` | no |  | Small leading icon beside the title — a Material Symbol name, or any custom element. |
| meta | `string` | no |  | Free-text metadata line, e.g. a domain or date, so callers keep their own formatting. |
| actions | `ReactNode` | no |  | Action row rendered in a footer outside the body — small secondary or tertiary Buttons, mirroring ToolCall's actions footer. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | Body content between the description and the footer — rich content, a Prose block, a DocumentChip row. |
