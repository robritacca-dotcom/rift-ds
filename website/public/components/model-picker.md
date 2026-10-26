# Model picker

A model selector for chat surfaces, with per-model descriptions and an optional effort row.

Generated from the rift-ds registry and prop JSDoc, version 1.14.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ModelPicker } from 'rift-ds';`
- Deep import: `import { ModelPicker } from 'rift-ds/components/ModelPicker/ModelPicker';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/model-picker

## ModelPicker props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| models | `ModelPickerModel[]` | yes |  | The models on offer, in display order. |
| value | `string` | no |  | Selected model value for controlled use. Pair with `onValueChange`. |
| defaultValue | `string` | no |  | Initially selected model value for uncontrolled use. Defaults to the first model. |
| onValueChange | `((value: string) => void)` | no |  | Fires with the newly selected model's value. |
| placeholder | `string` | no | `Choose a model` | Text the trigger shows when no model is selected, and the trigger's accessible name when no `aria-label` is passed. Defaults to "Choose a model". |
| effort | `string` | no |  | Selected effort level for controlled use. Setting this (or `defaultEffort`) is what makes the effort row appear at all. |
| defaultEffort | `string` | no |  | Initially selected effort level for uncontrolled use. |
| onEffortChange | `((effort: string) => void)` | no |  | Fires with the newly selected effort value. |
| effortOptions | `ModelPickerEffortOption[]` | no | `[   { label: 'Low', value: 'low' },   { label: 'Medium', value: 'medium' },   { label: 'High', value: 'high' }, ]` | The effort levels on offer. Defaults to low, medium and high. |
| listLabel | `string` | no | `Model` | Accessible name of the model list in the open panel. |
| effortLabel | `string` | no | `Effort` | Heading of the effort row, which is also the accessible name of its radio group. |
| placement | `"top" \| "bottom"` | no | `bottom` | Which side of the trigger the panel opens on. In a composer pinned to the bottom of the screen, use `top`. |
| size | `"default" \| "compact"` | no | `default` | Trigger size, on the row-control scale: `default` is 40px, `compact` 32px, so it lines up with the fields and buttons beside it. |
| disabled | `boolean` | no | `false` | Whether the whole control is disabled. |
| className | `string` | no | `` | Additional CSS classes |
