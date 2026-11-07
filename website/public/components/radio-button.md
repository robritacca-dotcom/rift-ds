# Radio button

Radio button and radio group with vertical and horizontal layouts, animated dot indicator.

Generated from the rift-ds registry and prop JSDoc, version 1.25.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { RadioButton } from 'rift-ds';`
- Deep import: `import { RadioButton } from 'rift-ds/components/RadioButton/RadioButton';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/radio-button
- Schema: https://rift-ds.com/schema/components/radio-button.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## RadioButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Label text |
| helperText | `string` | no |  | Helper or error message rendered under the label text |
| error | `boolean` | no | `false` | Error state — recolours the helper text. Deliberately no `aria-invalid`: ARIA does not allow it on `role="radio"`; group-level errors carry it on the radiogroup via RadioGroup's `error`. |
| checked | `boolean` | no | `false` | Whether this radio is selected |
| disabled | `boolean` | no | `false` | Whether the radio is disabled |
| value | `string` | no |  | Value for this radio option, passed to the callbacks and submitted under `name`. A form reads "on", the native radio's, when it is omitted. |
| onValueChange | `((value: string) => void)` | no |  | Called with this radio's value when selected |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((value: string) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
| name | `string` | no |  | Form field name. When set, the radio submits its `value` with an enclosing form through a hidden input while checked, nothing otherwise or while disabled, as a native radio does. Grouping stays React state (`RadioGroup` passes its own `name` to every option, so exactly one entry submits). |

## RadioGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Group label |
| helperText | `string` | no |  | Helper or error message rendered below the group |
| error | `boolean` | no | `false` | Error state — recolours the helper text and marks the group invalid |
| required | `boolean` | no | `false` | Marks the group required and renders the required marker on its label |
| value | `string` | no |  | Currently selected value, controlled. Leave undefined to let the group keep its own selection, seeded from `defaultValue`. |
| defaultValue | `string` | no |  | Selected value on first render when uncontrolled (`value` undefined). |
| name | `string` | no |  | Form field name. When set, the checked option's `value` submits with an enclosing form through one hidden input, as a native radio set does; a disabled option submits nothing. Grouping itself stays React state (`value`/`onValueChange`). |
| options | `{ label: string; value: string; disabled?: boolean \| undefined; }[]` | yes |  | Radio options |
| direction | `"horizontal" \| "vertical"` | no | `vertical` | Layout direction |
| onValueChange | `((value: string) => void)` | no |  | Called with the newly selected value |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((value: string) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |

## RadioIndicator props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | no | `false` | Whether the circle shows its dot. |
| className | `string` | no | `` | Additional CSS classes |
