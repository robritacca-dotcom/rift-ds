# Stepper

Step-by-step progress indicator for wizards and multi-stage flows.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: navigation
- Import: `import { Stepper } from '@robr0/design-system';`
- Deep import: `import { Stepper } from '@robr0/design-system/components/Stepper/Stepper';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/stepper

## Stepper props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| steps | `StepperStep[]` | yes |  | Ordered list of steps in the flow |
| activeStep | `number` | yes |  | Index of the active step. Steps before it render as complete (check icon), steps after it as upcoming (step number). Pass `steps.length` to mark the whole flow complete. |
| onStepClick | `((index: number) => void)` | no |  | Callback with the clicked step's index. When provided, completed steps and the active step become buttons so the reader can revisit an earlier stage; upcoming steps stay non-interactive either way. |
| orientation | `"horizontal" \| "vertical"` | no | `horizontal` | Layout direction |
| className | `string` | no | `` | Additional CSS classes |
