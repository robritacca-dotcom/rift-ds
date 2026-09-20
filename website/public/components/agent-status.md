# Agent status

A dot-matrix indicator and status line reporting what an agent is doing right now.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { AgentStatus } from '@robr0/design-system';`
- Deep import: `import { AgentStatus } from '@robr0/design-system/components/AgentStatus/AgentStatus';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/agent-status

## AgentStatus props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| state | `AgentStatusState` | no | `thinking` | What the agent is doing. Drives the colour, the default label, and whether the matrix animates. |
| label | `string` | no |  | Status text. Falls back to a default for the state. Ignored when `children` are given. |
| pattern | `"braille" \| "orbit" \| "breathe" \| "snake" \| "fill-sweep" \| "pulse" \| "columns" \| "checkerboard" \| "scan" \| "rain" \| "cascade" \| "sparkle" \| "wave-rows" \| "helix" \| "diagonal-swipe"` | no | `orbit` | Which dot-matrix choreography to run. |
| shimmer | `boolean` | no |  | Sweep a highlight across the label while the agent is active. Defaults to on for `thinking`, `working` and `waiting`, off for the resting states. |
| size | `"default" \| "compact" \| "sm" \| "md"` | no | `default` | Indicator and text scale, paired with ChatMessage's sizes: `default` matches default message text, `compact` matches compact message text. `sm` and `md` are legacy aliases for `compact` and `default`. |
| variant | `"inline" \| "bar"` | no | `inline` | `inline` sits in a line of content; `bar` is a full-width row for the top of a panel. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | Status text, when it needs markup the `label` string cannot express. |
