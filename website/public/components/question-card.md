# Question card

An agent's question with answers to pick: one or several, a set asked a step at a time, kept as a record once answered.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { QuestionCard } from 'rift-ds';`
- Deep import: `import { QuestionCard } from 'rift-ds/components/QuestionCard/QuestionCard';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/question-card
- Schema: https://rift-ds.com/schema/components/question-card.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## QuestionCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| questions | `QuestionCardQuestion[]` | yes |  | The questions, asked one at a time when there is more than one. |
| values | `QuestionCardAnswer[]` | no |  | The answers already given. When set, the card renders its answered state and stops taking input: the options stay where they were, the picked ones marked and the rest dimmed, so the record of the choice stays in place. An empty array records a skip. |
| onValuesChange | `((answers: QuestionCardAnswer[]) => void)` | no |  | Fires with every question's answer once the last one is given. |
| onSkip | `(() => void)` | no |  | Fires when the person declines to answer. Its presence is what shows the Skip button. |
| disabled | `boolean` | no | `false` | The moment to answer has passed: the options stay on screen, dimmed and inert, under a line saying so. |
| labels | `Partial<QuestionCardLabels>` | no |  | Replacement copy for the words the card draws itself. |
| className | `string` | no | `''` | Additional CSS classes |

## QuestionSummary props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `QuestionSummaryItem[]` | yes |  | The questions and their answers, in the order they were asked. |
| missingLabel | `string` | no | `'No answer'` | What stands in the answer's place for a question left without one. |
| variant | `"plain" \| "card"` | no | `'card'` | `card` draws the summary in its own hairline frame, as a set's record under the reply that asked it. `plain` drops the frame, for a surface that brings its own, such as the message bubble that sent the answers. |
| className | `string` | no | `''` | Additional CSS classes |

## Types

### QuestionCardAnswer

What the person answered to one question.

```ts
interface QuestionCardAnswer {
  /** The `id` of the question answered. */
  questionId: string;
  /** The `value` of every option picked, in the options' order. */
  values: string[];
  /** The text written in the "Something else" field, when it was used. */
  other?: string;
}
```

### QuestionCardLabels

Every word the card draws itself, for a host writing in another voice or language.

```ts
interface QuestionCardLabels {
  /** The last row's label when `other` is set. */
  other: string;
  /** The placeholder of the field that row opens. */
  otherPlaceholder: string;
  /** The button that sends the answers. */
  submit: string;
  /** The button that moves to the next question in a set. */
  next: string;
  /** The button that moves back a question in a set. */
  back: string;
  /** The button that declines to answer, shown when `onSkip` is passed. */
  skip: string;
  /** The line an answered-by-skipping card shows. */
  skipped: string;
  /** The line a card shows when the moment to answer passed. */
  unanswered: string;
  /** The step count beside a set's heading. */
  step: (current: number, total: number) => string;
  /** The line above a one-answer question's options. */
  chooseOne: string;
  /** The line above a several-answer question's options, from its `min` and `max`. */
  chooseMany: (min: number, max: number, total: number) => string;
  /** Visually hidden text read after each picked option in the answered record. Defaults to "(chosen)". */
  chosen?: string;
}
```

### QuestionCardOption

One answer a question offers.

```ts
interface QuestionCardOption {
  /** Stable identifier reported in the answer's `values`. */
  value: string;
  /** The answer as the person would say it, e.g. "Next.js". One line. */
  label: string;
  /** A quiet second line under the label: what choosing it means. */
  description?: string;
}
```

### QuestionCardQuestion

One question the card asks.

```ts
interface QuestionCardQuestion {
  /** Stable identifier reported in the answer's `questionId`. */
  id: string;
  /** The question in a few words, e.g. "Which framework?". Shown as the step's heading in a set, and the options' accessible name always. */
  prompt: string;
  /** `single` takes one option, `multi` any number of them. */
  mode?: 'single' | 'multi';
  /** The answers on offer, in order. */
  options: QuestionCardOption[];
  /** Offer a last "Something else" row that opens a text field, for an answer the options do not hold. */
  other?: boolean;
  /** `multi` only: the fewest options that make an answer. Defaults to 1. */
  min?: number;
  /** `multi` only: the most options that can be picked. Defaults to all of them. */
  max?: number;
}
```

### QuestionSummaryItem

One question in a summary, and what was answered to it.

```ts
interface QuestionSummaryItem {
  /** The question, as it was asked. */
  prompt: string;
  /** Every answer given, as the person would say each one. Empty when none was. */
  answers: string[];
}
```

Types from other packages: `Partial` (typescript).
