# Chat marker

An inline conversation separator for date breaks and system notes.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { ChatMarker } from '@robr0/design-system';`
- Deep import: `import { ChatMarker } from '@robr0/design-system/components/ChatMarker/ChatMarker';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/chat-marker

## ChatMarker props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| icon | `ReactNode` | no |  | Leading icon — a Material Symbol name, or any custom element. |
| line | `boolean` | no | `true` | Draw the flanking divider lines. Turn off for a bare centred note. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | The marker text, e.g. "Today" or "Chat renamed". |
