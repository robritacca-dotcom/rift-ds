# Question card

An agent's question with answers to pick: one or several, a set asked a step at a time, kept as a record once answered.

Generated from the rift-ds registry and prop JSDoc, version 1.10.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { QuestionCard } from 'rift-ds';`
- Deep import: `import { QuestionCard } from 'rift-ds/components/QuestionCard/QuestionCard';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/question-card

## QuestionCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| questions | `QuestionCardQuestion[]` | yes |  | The questions, asked one at a time when there is more than one. |
| values | `QuestionCardAnswer[]` | no |  | The answers already given. When set, the card renders its answered state and stops taking input: the options stay where they were, the picked ones marked and the rest dimmed, so the record of the choice stays in place. An empty array records a skip. |
| onValuesChange | `((answers: QuestionCardAnswer[]) => void)` | no |  | Fires with every question's answer once the last one is given. |
| onSkip | `(() => void)` | no |  | Fires when the person declines to answer. Its presence is what shows the Skip button. |
| disabled | `boolean` | no | `false` | The moment to answer has passed: the options stay on screen, dimmed and inert, under a line saying so. |
| labels | `Partial<QuestionCardLabels>` | no |  | Replacement copy for the words the card draws itself. |
| className | `string` | no | `` | Additional CSS classes |

## QuestionSummary props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `QuestionSummaryItem[]` | yes |  | The questions and their answers, in the order they were asked. |
| missingLabel | `string` | no | `No answer` | What stands in the answer's place for a question left without one. |
| variant | `"plain" \| "card"` | no | `card` | `card` draws the summary in its own hairline frame, as a set's record under the reply that asked it. `plain` drops the frame, for a surface that brings its own, such as the message bubble that sent the answers. |
| className | `string` | no | `` | Additional CSS classes |
