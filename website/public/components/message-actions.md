# Message actions

An icon-button row for message-level actions like copy, retry, and feedback.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { MessageActions } from 'rift-ds';`
- Deep import: `import { MessageActions } from 'rift-ds/components/MessageActions/MessageActions';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/message-actions
- Schema: https://rift-ds.com/schema/components/message-actions.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## MessageActions props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `MessageAction[]` | yes |  | The actions, rendered left to right. |
| onActionClick | `((id: string) => void)` | no |  | Fires with the pressed action's id. |
| showTooltips | `boolean` | no | `true` | Wrap each button in a Tooltip showing its label. The label stays as `aria-label` either way. |
| className | `string` | no | `''` | Additional CSS classes |

## Types

### MessageAction

One action in the row: a stable id, a glyph, and an accessible name.

```ts
interface MessageAction {
  /** Stable identifier passed to `onActionClick`. */
  id: string;
  /** Button glyph — Material Symbol name (string) or custom element (ReactNode). */
  icon: string | React.ReactNode;
  /** Accessible name, also shown as the tooltip. */
  label: string;
  /** Marks the action as selected, e.g. the chosen feedback thumb. */
  active?: boolean;
  /** Disables just this action. */
  disabled?: boolean;
  /** Marks a dangerous or irreversible action, e.g. deleting the message: it rests like its neighbours and takes the danger colour on hover. */
  destructive?: boolean;
}
```

Types from other packages: `ReactNode` (react).
