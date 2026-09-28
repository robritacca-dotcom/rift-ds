# Message actions

An icon-button row for message-level actions like copy, retry, and feedback.

Generated from the rift-ds registry and prop JSDoc, version 1.1.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { MessageActions } from 'rift-ds';`
- Deep import: `import { MessageActions } from 'rift-ds/components/MessageActions/MessageActions';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/message-actions

## MessageActions props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `MessageAction[]` | yes |  | The actions, rendered left to right. |
| onActionClick | `((id: string) => void)` | no |  | Fires with the pressed action's id. |
| showTooltips | `boolean` | no | `true` | Wrap each button in a Tooltip showing its label. The label stays as `aria-label` either way. |
| className | `string` | no | `` | Additional CSS classes |
