# Stepper

Step-by-step progress indicator for wizards and multi-stage flows.

Generated from the rift-ds registry and prop JSDoc, version 1.19.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { Stepper } from 'rift-ds';`
- Deep import: `import { Stepper } from 'rift-ds/components/Stepper/Stepper';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/stepper

## Stepper props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| steps | `StepperStep[]` | yes |  | Ordered list of steps in the flow |
| activeStep | `number` | yes |  | Index of the active step. Steps before it render as complete (check icon), steps after it as upcoming (step number). Pass `steps.length` to mark the whole flow complete. |
| onStepClick | `((index: number) => void)` | no |  | Callback with the clicked step's index. When provided, completed steps and the active step become buttons so the reader can revisit an earlier stage; upcoming steps stay non-interactive either way. |
| orientation | `"horizontal" \| "vertical"` | no | `horizontal` | Layout direction |
| completeLabel | `string` | no | `Completed` | Status read after a completed step's label. The check mark that draws the state is decorative, so this visually hidden text is what tells a screen reader a done step from an upcoming one. Defaults to "Completed". |
| locale | `string` | no |  | The BCP 47 locale the step numbers is written in, such as `ar-EG`. Defaults to the nearest LocaleProvider's, else `en-US`. |
| className | `string` | no | `` | Additional CSS classes |
