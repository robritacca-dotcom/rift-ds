# Tool call

The record of one tool invocation, with its arguments and result behind a disclosure.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { ToolCall } from '@robr0/design-system';`
- Deep import: `import { ToolCall } from '@robr0/design-system/components/ToolCall/ToolCall';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/tool-call

## ToolCall props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| name | `string` | yes |  | The tool that was invoked, shown in monospace. |
| status | `ToolCallStatus` | no | `success` | Where the call has got to. Drives the colour, the indicator, and the default status text. |
| summary | `string` | no |  | One line describing this particular call, e.g. the target path or query. |
| duration | `string` | no |  | How long the call took, e.g. "1.2s". Free text, so callers keep their own formatting. |
| statusLabel | `string` | no |  | Override the status text shown beside the indicator. |
| open | `boolean` | no |  | Open state for controlled use. Pair with `onOpenChange`. |
| defaultOpen | `boolean` | no | `false` | Open state for uncontrolled use. |
| onOpenChange | `((open: boolean) => void)` | no |  | Fires whenever the panel opens or closes. |
| actions | `ReactNode` | no |  | Controls for a call awaiting a decision — allow, deny, always allow. Rendered outside the collapsible panel, so approving never requires expanding the call first. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | The call's arguments and result. |
