# Interrupt card

A human-in-the-loop checkpoint with a question from the agent and option buttons to decide.

Generated from the rift-ds registry and prop JSDoc, version 1.26.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { InterruptCard } from 'rift-ds';`
- Deep import: `import { InterruptCard } from 'rift-ds/components/InterruptCard/InterruptCard';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/interrupt-card
- Schema: https://rift-ds.com/schema/components/interrupt-card.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## InterruptCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The question, e.g. "Allow file edit?". Note: this shadows the native `title` tooltip attribute, which InterruptCard does not expose. |
| description | `string` | no |  | One line of context under the title. |
| icon | `ReactNode` | no |  | A Material Symbol name trailing the title, or any custom element. No icon by default. |
| options | `InterruptCardOption[]` | no |  | The choices, rendered as buttons left to right. |
| onValueChange | `((value: string) => void)` | no |  | Fires with the chosen option's value. |
| value | `string` | no |  | The already-chosen value. When set, the card renders its answered state: the options give way to the chosen one's read-out, worded as the decision made, in the status that choice records. |
| answeredLabel | `string` | no |  | Override the answered read-out's text (default: the chosen option's `answeredLabel`, then its label). |
| waitingLabel | `string` | no | `Waiting for your decision` | Visually hidden status announced while the card waits for a decision. Defaults to "Waiting for your decision". |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | Detail slot between the description and the options — typically a `<ToolCall status="pending">` showing what wants to run. |
| bare | `boolean` | no | `false` | Strip the card chrome (fill, border, radius) when the card sits inside another panel that supplies the surface, such as AiButton's request panel. |
