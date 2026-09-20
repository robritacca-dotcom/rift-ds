# Reasoning

A model's thinking, disclosed behind a one-line summary and collapsed once it finishes.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { Reasoning } from '@robr0/design-system';`
- Deep import: `import { Reasoning } from '@robr0/design-system/components/Reasoning/Reasoning';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/reasoning

## Reasoning props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| streaming | `boolean` | no | `false` | The model is still producing the trace. Opens the panel and shimmers the summary. |
| duration | `number` | no |  | Seconds spent reasoning, shown in the summary once complete. |
| label | `string` | no |  | Override the summary line. By default it reports the streaming state and the duration. |
| summary | `ReactNode` | no |  | Replace the summary text with custom content — typically an AgentStatus, pairing the live indicator with the trace disclosure. The node owns its own appearance and announcement, so Reasoning's shimmer and live region stand down. |
| summaryOnly | `boolean` | no | `false` | Render the summary line alone, with no chevron, no trigger, and no panel — for a model that reports what it is doing but produces no trace to read. A disclosure that opens onto nothing is a promise the component cannot keep, so it stops being one. |
| size | `"default" \| "compact"` | no | `default` | Text scale, paired with ChatMessage's sizes: `default` matches default message text, `compact` matches compact message text. |
| open | `boolean` | no |  | Open state for controlled use. Pair with `onOpenChange`. |
| defaultOpen | `boolean` | no |  | Open state for uncontrolled use. Defaults to open while `streaming`. |
| onOpenChange | `((open: boolean) => void)` | no |  | Fires whenever the panel opens or closes, from a click or from the stream ending. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | The reasoning trace. |
