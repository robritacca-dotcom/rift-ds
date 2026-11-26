# Prompt suggestions

Tappable prompt suggestions to start or steer a conversation, as a scrolling or wrapping row, a stack, tiles, cards or a numbered list.

Generated from the rift-ds registry and prop JSDoc, version 1.38.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { PromptSuggestions } from 'rift-ds';`
- Deep import: `import { PromptSuggestions } from 'rift-ds/components/PromptSuggestions/PromptSuggestions';`
- Rendering: client component (declares 'use client')
- Size: 4.3 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/prompt-suggestions
- Schema: https://rift-ds.com/schema/components/prompt-suggestions.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## PromptSuggestions props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| suggestions | `PromptSuggestion[]` | yes |  | The suggestions to render, in order. |
| onValueChange | `((id: string) => void)` | no |  | Fires with the tapped suggestion's `id`, one acknowledgment beat after the tap — the chosen chip pulses and its siblings dim first, so the choice is seen even when selection unmounts the row. |
| layout | `"list" \| "wrap" \| "scroll" \| "stack" \| "tiles" \| "cards"` | no |  | How the suggestions are arranged. `scroll` is one line that scrolls sideways behind edge fades. `wrap` runs them across as many lines as they need, for empty-state hero placements. `stack` gives each one its own line, for narrow columns where a wrapped row breaks unevenly and the ragged right edge reads as an accident. `tiles` and `cards` leave the chip behind for an empty-state home screen: `tiles` is an even row of quiet blocks, each an icon over a label and its `description`; `cards` gives each suggestion a tinted cover holding its icon, with the label and description beneath. Both fold to fewer columns as their own width narrows. `list` gathers them into one panel of full-width rows, each a coloured dot (or its icon), the label and its description on one line, for a short set of examples under a composer. |
| numbered | `boolean` | no | `false` | Number the `list` rows 1 to 9, each with its digit as a keycap at the row's end, and let that digit pick the row from anywhere on the page outside a text field. Other layouts ignore it, and rows past the ninth carry no number. |
| heading | `string` | no |  | A short line over the suggestions, such as "Start from an example". It names the list for assistive technology in place of `aria-label`, and the list and the heading are wrapped in a group so the heading sits outside the list. The ref, `className` and every other prop stay on the list itself. |
| wrap | `boolean` | no | `false` | Legacy alias for `layout="wrap"`; ignored when `layout` is set. Deprecated: Use `layout` instead, which also covers `stack`. |
| pending | `boolean` | no | `false` | The suggestions are still being generated: shimmer placeholder pills hold their place, matching the current size's chip geometry so nothing shifts when the real chips land. While pending the given `suggestions` are not rendered, the placeholders are hidden from assistive technology, and the row reports `aria-busy` instead. |
| pendingCount | `number` | no | `3` | How many placeholder pills the pending state holds space with. |
| entrance | `boolean` | no | `true` | Play the staggered pop-in when the items mount. On by default; a host re-showing a set that has already landed (reopening a panel over the same suggestions) turns it off, so the chips stand where they were instead of arriving twice. |
| size | `"default" \| "compact"` | no | `'default'` | Row scale. `default` sits at the body-paragraph scale, so a suggestion reads at the same weight as the messages it will become; `compact` is the quieter row for placements alongside a live conversation. |
| value | `string` | no |  | The `id` of the suggestion already taken. Set, the row becomes the record of that choice: the taken suggestion outlined solid in the strongest ink, the rest faded behind a dashed line, and none of them tappable any more. The same treatment QuestionCard gives a pick. For a row that stays on screen after use, such as the follow-ups under an earlier answer. |
| chosenLabel | `string` | no | `'(chosen)'` | Visually hidden text read after the taken suggestion once `value` is set. Defaults to "(chosen)". |
| ariaLabel | `string` | no | `'Suggested prompts'` | Legacy accessible-name prop for the list. Defaults to "Suggested prompts"; a native `aria-label` wins when both are passed. Deprecated: Pass the native `aria-label` attribute instead. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The suggestions follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |

## Types

### PromptSuggestion

One tappable suggestion in the row.

```ts
interface PromptSuggestion {
  /** Stable identifier passed to `onValueChange`. */
  id: string;
  /** The suggestion text shown in the chip. */
  label: string;
  /** Optional leading icon — Material Symbol name (string) or custom element (ReactNode). In the `cards` layout it stands in the card's cover. */
  icon?: string | React.ReactNode;
  /** A quiet second line under the label, drawn by the `tiles`, `cards` and `list` layouts: what the tile leads to, the full question a card asks, or the rest of a row's line beside its label. The chip layouts have no room for it and leave it out. */
  description?: string;
}
```

Types from other packages: `ReactNode` (react).
