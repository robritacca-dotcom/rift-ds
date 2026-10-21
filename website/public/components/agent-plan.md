# Agent plan

A collapsible checklist of an agent's task, with live step states and a progress readout.

Generated from the rift-ds registry and prop JSDoc, version 1.10.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AgentPlan } from 'rift-ds';`
- Deep import: `import { AgentPlan } from 'rift-ds/components/AgentPlan/AgentPlan';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/agent-plan

## AgentPlan props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| steps | `AgentPlanStep[]` | yes |  | The plan, in order. Step status drives each row's indicator and colour. |
| title | `string` | no |  | Header text. Left unset, it is computed from the steps — "3 steps left", or "All steps complete" once everything is done. Note: this shadows the native `title` tooltip attribute, which AgentPlan does not expose. |
| remainingLabel | `((remaining: number) => string)` | no | `(remaining: number) =>   `${remaining} step${remaining === 1 ? '' : 's'} left`` | The computed header while steps remain, given how many are left. Defaults to "1 step left" or "N steps left". Ignored when `title` is set. |
| completeLabel | `string` | no | `All steps complete` | The computed header once every step is complete. Defaults to "All steps complete". Ignored when `title` is set. |
| statusLabels | `Partial<Record<AgentPlanStepStatus, string>>` | no |  | Visually hidden text announcing each step's status after its label. Merged over the English defaults (Not started, In progress, Completed, Failed). |
| open | `boolean` | no |  | Open state for controlled use. Pair with `onOpenChange`. |
| defaultOpen | `boolean` | no | `true` | Open state for uncontrolled use. |
| onOpenChange | `((open: boolean) => void)` | no |  | Fires whenever the step list opens or closes. |
| className | `string` | no | `` | Additional CSS classes |
