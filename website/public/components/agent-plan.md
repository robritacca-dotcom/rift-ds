# Agent plan

A collapsible checklist of an agent's task, with live step states and a progress readout.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { AgentPlan } from '@robr0/design-system';`
- Deep import: `import { AgentPlan } from '@robr0/design-system/components/AgentPlan/AgentPlan';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/agent-plan

## AgentPlan props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| steps | `AgentPlanStep[]` | yes |  | The plan, in order. Step status drives each row's indicator and colour. |
| title | `string` | no |  | Header text. Left unset, it is computed from the steps — "3 steps left", or "All steps complete" once everything is done. |
| open | `boolean` | no |  | Open state for controlled use. Pair with `onOpenChange`. |
| defaultOpen | `boolean` | no | `true` | Open state for uncontrolled use. |
| onOpenChange | `((open: boolean) => void)` | no |  | Fires whenever the step list opens or closes. |
| className | `string` | no | `` | Additional CSS classes |
