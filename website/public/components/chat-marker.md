# Chat marker

An inline conversation separator for date breaks and system notes.

Generated from the rift-ds registry and prop JSDoc, version 1.29.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ChatMarker } from 'rift-ds';`
- Deep import: `import { ChatMarker } from 'rift-ds/components/ChatMarker/ChatMarker';`
- Rendering: server-renderable (no 'use client')
- Size: 0.6 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/chat-marker
- Schema: https://rift-ds.com/schema/components/chat-marker.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ChatMarker props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| icon | `string \| ReactNode` | no |  | Leading icon — a Material Symbol name, or any custom element. |
| line | `boolean` | no | `true` | Draw the flanking divider lines. Turn off for a bare centred note. |
| className | `string` | no | `''` | Additional CSS classes |
| children | `ReactNode` | no |  | The marker text, e.g. "Today" or "Chat renamed". |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

Types from other packages: `ReactNode` (react).
