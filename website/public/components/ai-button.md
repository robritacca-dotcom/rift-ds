# AI button

The AI entry point: icon and label ringed by a turning gradient and glow, with an optional hover-summoned AI-summary panel and prompt chips.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { AiButton } from '@robr0/design-system';`
- Deep import: `import { AiButton } from '@robr0/design-system/components/AiButton/AiButton';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/ai-button

## AiButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no | `Ask AI` | Button text content |
| icon | `ReactNode` | no | `auto_awesome` | Leading icon — Material Symbol name (string) or custom element (ReactNode) |
| size | `"default" \| "compact"` | no | `default` | Button size |
| disabled | `boolean` | no |  | Whether the button is disabled |
| href | `string` | no |  | Optional href — renders as <a> instead of <button> |
| target | `string` | no |  | Optional target attribute for links |
| rel | `string` | no |  | Optional rel attribute for links |
| summary | `AiButtonSummary` | no |  | A TLDR panel the button can summon: overline, title, a pre-written summary revealed through a skeleton beat and a typed stream (once per mount — later openings show it instantly, as if cached), and optional prompt chips. Hovering the button opens it after the standard hover delay; the pointer keeps it alive anywhere over the button or panel, and it hides a grace period after leaving both. Omit for the plain button. |
| summaryPlacement | `"top" \| "bottom"` | no | `top` | Which side of the button the summary panel opens on. |
| summaryPinned | `boolean` | no | `false` | Holds the summary panel open regardless of hover — for callers that reveal it on their own signal (scroll depth, dwell). Hover mechanics still run when it flips back off. |
| onSummaryDismiss | `(() => void)` | no |  | Fires when the panel's dismiss button is pressed. The panel closes itself either way; hovering away and back re-summons it. |
| onSummarySuggestion | `((id: string) => void)` | no |  | Fires with the tapped summary suggestion's `id`. |
| className | `string` | no | `` | Additional CSS classes |
