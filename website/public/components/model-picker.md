# Model picker

A model selector for chat surfaces, with per-model descriptions and an optional effort row.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { ModelPicker } from '@robr0/design-system';`
- Deep import: `import { ModelPicker } from '@robr0/design-system/components/ModelPicker/ModelPicker';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/model-picker

## ModelPicker props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| models | `ModelPickerModel[]` | yes |  | The models on offer, in display order. |
| value | `string` | no |  | Selected model value for controlled use. Pair with `onValueChange`. |
| defaultValue | `string` | no |  | Initially selected model value for uncontrolled use. Defaults to the first model. |
| onValueChange | `((value: string) => void)` | no |  | Fires with the newly selected model's value. |
| effort | `string` | no |  | Selected effort level for controlled use. Setting this (or `defaultEffort`) is what makes the effort row appear at all. |
| defaultEffort | `string` | no |  | Initially selected effort level for uncontrolled use. |
| onEffortChange | `((effort: string) => void)` | no |  | Fires with the newly selected effort value. |
| effortOptions | `ModelPickerEffortOption[]` | no | `[   { label: 'Low', value: 'low' },   { label: 'Medium', value: 'medium' },   { label: 'High', value: 'high' }, ]` | The effort levels on offer. Defaults to low, medium and high. |
| placement | `"top" \| "bottom"` | no | `bottom` | Which side of the trigger the panel opens on. In a composer pinned to the bottom of the screen, use `top`. |
| disabled | `boolean` | no | `false` | Whether the whole control is disabled. |
| className | `string` | no | `` | Additional CSS classes |
