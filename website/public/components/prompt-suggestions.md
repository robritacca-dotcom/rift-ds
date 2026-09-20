# Prompt suggestions

A horizontal row of tappable prompt suggestions to start or steer a conversation.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { PromptSuggestions } from '@robr0/design-system';`
- Deep import: `import { PromptSuggestions } from '@robr0/design-system/components/PromptSuggestions/PromptSuggestions';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/prompt-suggestions

## PromptSuggestions props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| suggestions | `PromptSuggestion[]` | yes |  | The suggestions to render, in order. |
| onValueChange | `((id: string) => void)` | no |  | Fires with the tapped suggestion's `id`, one acknowledgment beat after the tap — the chosen chip pulses and its siblings dim first, so the choice is seen even when selection unmounts the row. |
| layout | `"wrap" \| "scroll" \| "stack"` | no |  | How the suggestions are arranged. `scroll` is one line that scrolls sideways behind edge fades. `wrap` runs them across as many lines as they need, for empty-state hero placements. `stack` gives each one its own line, for narrow columns where a wrapped row breaks unevenly and the ragged right edge reads as an accident. |
| wrap | `boolean` | no | `false` | Legacy alias for `layout="wrap"`; ignored when `layout` is set. Deprecated: Use `layout` instead, which also covers `stack`. |
| pending | `boolean` | no | `false` | The suggestions are still being generated: shimmer placeholder pills hold their place, matching the current size's chip geometry so nothing shifts when the real chips land. While pending the given `suggestions` are not rendered, the placeholders are hidden from assistive technology, and the row reports `aria-busy` instead. |
| pendingCount | `number` | no | `3` | How many placeholder pills the pending state holds space with. |
| entrance | `boolean` | no | `true` | Play the staggered pop-in when the items mount. On by default; a host re-showing a set that has already landed (reopening a panel over the same suggestions) turns it off, so the chips stand where they were instead of arriving twice. |
| size | `"default" \| "compact"` | no | `default` | Row scale. `default` sits at the body-paragraph scale, so a suggestion reads at the same weight as the messages it will become; `compact` is the quieter row for placements alongside a live conversation. |
| ariaLabel | `string` | no | `Suggested prompts` | Accessible name for the list. |
| className | `string` | no | `` | Additional CSS classes |
