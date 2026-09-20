# Interrupt card

A human-in-the-loop checkpoint with a question from the agent and option buttons to decide.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { InterruptCard } from '@robr0/design-system';`
- Deep import: `import { InterruptCard } from '@robr0/design-system/components/InterruptCard/InterruptCard';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/interrupt-card

## InterruptCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The question, e.g. "Allow file edit?". |
| description | `string` | no |  | One line of context under the title. |
| icon | `ReactNode` | no |  | Leading Material Symbol name, or any custom element. No icon by default. |
| options | `InterruptCardOption[]` | no |  | The choices, rendered as buttons left to right. |
| onValueChange | `((value: string) => void)` | no |  | Fires with the chosen option's value. |
| value | `string` | no |  | The already-chosen value. When set, the card renders its answered state: the options are replaced by a quiet echo of the chosen label. |
| answeredLabel | `string` | no |  | Override the echoed text in the answered state (default: the chosen option's label). |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | Detail slot between the description and the options — typically a `<ToolCall status="pending">` showing what wants to run. |
