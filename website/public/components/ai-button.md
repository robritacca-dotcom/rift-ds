# AI button

The AI entry point: icon and label ringed by a turning gradient and glow, with an optional hover-summoned AI-summary panel and prompt chips.

Generated from the rift-ds registry and prop JSDoc, version 1.13.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AiButton } from 'rift-ds';`
- Deep import: `import { AiButton } from 'rift-ds/components/AiButton/AiButton';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/ai-button

## AiButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no | `Ask AI` | Button text content |
| icon | `ReactNode` | no | `auto_awesome` | Leading icon — Material Symbol name (string) or custom element (ReactNode) |
| size | `"default" \| "compact"` | no | `default` | Button size |
| disabled | `boolean` | no |  | Whether the button is disabled |
| status | `AgentStatusState` | no |  | What the agent behind the button is doing, in AgentStatus's vocabulary. The label never changes; the icon carries the state. `thinking` and `working` show AgentStatusMark and spin the ring faster, `waiting` shows a raised hand in the warning colour with the ring at rest, and `done` and `error` turn the button to their status colours with a check or an error glyph, then return to the resting look after a beat. The button stays clickable throughout, unlike Button's `loading`, so a click can open the conversation to watch the work. |
| statusLabel | `((status: AgentStatusState) => string)` | no | `(s: AgentStatusState) => DEFAULT_STATUS_LABELS[s]` | What a screen reader hears when the status changes, given the status. Defaults to English per status; `idle` says nothing. |
| href | `string` | no |  | Optional href — renders as <a> instead of <button> |
| target | `string` | no |  | Optional target attribute for links |
| rel | `string` | no |  | Optional rel attribute for links |
| summary | `AiButtonSummary` | no |  | A TLDR panel the button can summon: overline, title, a pre-written summary revealed through a skeleton beat and a typed stream (once per mount — later openings show it instantly, as if cached), and optional prompt chips. Hovering the button opens it after the standard hover delay; the pointer keeps it alive anywhere over the button or panel, and it hides a grace period after leaving both. Omit for the plain button. |
| summaryPlacement | `"top" \| "bottom"` | no | `top` | Which side of the button the summary panel opens on. |
| request | `ReactNode` | no |  | What the agent needs from the person while `status` is `waiting`: any content, drawn in a glass panel at the button. An InterruptCard approval is the usual filling; a question, a form or a preview work the same way. It opens each time the status becomes `waiting` and stays open without hover. Escape or a click on the button folds it back into the button, where the raised hand keeps showing, and another click opens it again. While it is open the summary panel never opens. |
| requestOpen | `boolean` | no |  | Whether the request panel is open, for a host that owns it (say, to keep it shut while the chat shows the request). Leave undefined to let the button manage it. |
| defaultRequestOpen | `boolean` | no | `true` | Whether the request panel starts open, when the button manages it. Each later move into `waiting` opens it again. |
| onRequestOpenChange | `((open: boolean) => void)` | no |  | Fires when the request panel opens or closes, including when a move into `waiting` opens it. |
| requestPlacement | `"top" \| "bottom"` | no | `top` | Which side of the button the request panel opens on. |
| requestRegionLabel | `string` | no | `Waiting for you` | Accessible name of the request panel. |
| summaryPinned | `boolean` | no | `false` | Holds the summary panel open regardless of hover — for callers that reveal it on their own signal (scroll depth, dwell). Hover mechanics still run when it flips back off. |
| onSummaryDismiss | `(() => void)` | no |  | Fires when the panel's dismiss button is pressed. The panel closes itself either way; hovering away and back re-summons it. |
| onSummarySuggestion | `((id: string) => void)` | no |  | Fires with the tapped summary suggestion's `id`. |
| summaryRegionLabel | `((title: string) => string)` | no | `(title: string) => `Summary: ${title}`` | Accessible name of the summary panel, given the summary's title. Defaults to "Summary: " followed by the title. |
| dismissLabel | `string` | no | `Dismiss summary` | Accessible name of the summary panel's dismiss button. |
| suggestionsLabel | `string` | no | `Suggested prompts` | Accessible name of the summary panel's group of prompt chips. |
| className | `string` | no | `` | Additional CSS classes |
| linkComponent | `LinkComponent` | no |  | The component the link renders with, such as Next.js's `Link`, so it navigates through the app's router. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
