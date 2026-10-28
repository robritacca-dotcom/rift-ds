# Agent status

What an agent is doing right now, as a dot matrix and status line, a floating pill, a square mark for icon slots, or a ring around any element.

Generated from the rift-ds registry and prop JSDoc, version 1.16.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AgentStatus } from 'rift-ds';`
- Deep import: `import { AgentStatus } from 'rift-ds/components/AgentStatus/AgentStatus';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/agent-status

## AgentStatus props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| state | `AgentStatusState` | no | `thinking` | What the agent is doing. Drives the colour, the default label, and whether the matrix animates. |
| label | `string` | no |  | Status text. Falls back to a default for the state. Ignored when `children` are given. |
| pattern | `"braille" \| "orbit" \| "breathe" \| "snake" \| "fill-sweep" \| "pulse" \| "columns" \| "checkerboard" \| "scan" \| "rain" \| "cascade" \| "sparkle" \| "wave-rows" \| "helix" \| "diagonal-swipe" \| "twinkle"` | no |  | Which dot-matrix choreography to run. Defaults to `breathe` while `waiting`, a still pulse that reads as the person's turn (the same as AgentStatusMark), and `orbit` otherwise. |
| shimmer | `boolean` | no |  | Sweep a highlight across the label while the agent is active. Defaults to on for `thinking`, `working` and `waiting`, off for the resting states. |
| size | `"default" \| "compact" \| "sm" \| "md"` | no | `default` | Indicator and text scale, paired with ChatMessage's sizes: `default` matches default message text, `compact` matches compact message text. `sm` and `md` are legacy aliases for `compact` and `default`. |
| variant | `"inline" \| "bar" \| "pill"` | no | `inline` | `inline` sits in a line of content; `bar` is a full-width row for the top of a panel; `pill` is a glass pill for a status that floats over the page while a run goes on; once it ends the dots fill solid in the status colour, as in every variant. The pill does not position itself. |
| action | `ReactNode` | no |  | A trailing control after the status text, such as a link that opens the run. Meant for the `pill` and `bar` variants. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | Status text, when it needs markup the `label` string cannot express. |

## AgentStatusMark props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| state | `AgentStatusState` | no | `working` | What the agent is doing. Drives the colour and whether the dots animate, as on AgentStatus. Defaults to `working`, unlike AgentStatus's `thinking`: the mark stands in for an icon on a control (AiButton's, a pill's), where the commonest moment it is drawn is a run under way, while the labelled AgentStatus most often opens a reply. |
| pattern | `"braille" \| "orbit" \| "breathe" \| "snake" \| "fill-sweep" \| "pulse" \| "columns" \| "checkerboard" \| "scan" \| "rain" \| "cascade" \| "sparkle" \| "wave-rows" \| "helix" \| "diagonal-swipe" \| "twinkle"` | no |  | Which choreography to run: every AgentStatus pattern, redrawn for the square grid. Defaults to `breathe` while `waiting`, a still pulse that reads as the person's turn, and `orbit` otherwise. |
| className | `string` | no | `` | Additional CSS classes |
