# Message actions

An icon-button row for message-level actions like copy, retry, and feedback.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { MessageActions } from '@robr0/design-system';`
- Deep import: `import { MessageActions } from '@robr0/design-system/components/MessageActions/MessageActions';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/message-actions

## MessageActions props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `MessageAction[]` | yes |  | The actions, rendered left to right. |
| onActionClick | `((id: string) => void)` | no |  | Fires with the pressed action's id. |
| showTooltips | `boolean` | no | `true` | Wrap each button in a Tooltip showing its label. The label stays as `aria-label` either way. |
| className | `string` | no | `` | Additional CSS classes |
