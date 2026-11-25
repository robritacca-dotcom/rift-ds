# Wizard

A task in steps: the stepper, the step under its heading, and Back and Continue with a running summary.

Generated from the rift-ds registry and prop JSDoc, version 1.37.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: navigation
- Import: `import { Wizard } from 'rift-ds';`
- Deep import: `import { Wizard } from 'rift-ds/components/Wizard/Wizard';`
- Rendering: client component (declares 'use client')
- Size: 3.4 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/wizard
- Schema: https://rift-ds.com/schema/components/wizard.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Stepper](https://rift-ds.com/components/stepper.md) instead when only the progress is needed and the host lays out the steps and their buttons.

## Wizard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| steps | `WizardStep[]` | yes |  | The steps, in order. |
| step | `number` | no |  | The index of the step shown, for a controlled wizard. Leave it undefined to let the wizard keep its own, seeded from `defaultStep`. |
| defaultStep | `number` | no | `0` | The step shown on first render when the wizard is uncontrolled. Defaults to 0. |
| onStepChange | `((step: number) => void)` | no |  | Fires with the index of the step the reader moves to, by Back, Continue or a completed step in the stepper. |
| onFinish | `(() => void)` | no |  | Called when the reader presses the last step's finish button. |
| canAdvance | `boolean` | no | `true` | Whether the reader can move on from the step shown: false holds Continue and Finish, while the step's own fields say what is missing. Defaults to true. |
| summary | `ReactNode` | no |  | A running figure at the start of the footer, kept in view as the steps change: a total, a count of what is chosen. |
| allowStepClick | `boolean` | no | `true` | Lets the reader go back to a completed step from the stepper. Defaults to true. |
| backLabel | `string` | no | `'Back'` | The back button's text. Defaults to "Back". |
| nextLabel | `string` | no | `'Continue'` | The next button's text. Defaults to "Continue". |
| finishLabel | `string` | no | `'Finish'` | The last step's button text. Defaults to "Finish". |
| locale | `string` | no |  | The BCP 47 locale the stepper's step numbers are written in. Defaults to the nearest LocaleProvider's, else `en-US`. |
| headingLevel | `2 \| 4 \| 3` | no | `2` | The step heading's place in the outline. Defaults to 2, a section of a page. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Back, Continue and Finish are native buttons, as are the stepper’s completed steps, and focus moves to each step’s heading. Those keys belong to the platform, so no test of this library presses them.

## Types

### WizardStep

One step of a wizard.

```ts
interface WizardStep {
  /** A stable id for the step. */
  id: string;
  /** The step's name, in the stepper and as the heading of its content. */
  label: string;
  /** A line under the label in the stepper. */
  description?: string;
  /** What the step asks for. */
  content: React.ReactNode;
}
```

Types from other packages: `ReactNode` (react).
