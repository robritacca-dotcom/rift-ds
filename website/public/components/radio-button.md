# Radio button

Radio button and radio group with vertical and horizontal layouts, animated dot indicator.

Generated from the rift-ds registry and prop JSDoc, version 1.7.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { RadioButton } from 'rift-ds';`
- Deep import: `import { RadioButton } from 'rift-ds/components/RadioButton/RadioButton';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/radio-button

## RadioButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Label text |
| helperText | `string` | no |  | Helper or error message rendered under the label text |
| error | `boolean` | no | `false` | Error state — recolours the helper text. Deliberately no `aria-invalid`: ARIA does not allow it on `role="radio"`; group-level errors carry it on the radiogroup via RadioGroup's `error`. |
| checked | `boolean` | no | `false` | Whether this radio is selected |
| disabled | `boolean` | no | `false` | Whether the radio is disabled |
| value | `string` | no | `` | Value for this radio option |
| onValueChange | `((value: string) => void)` | no |  | Called with this radio's value when selected |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((value: string) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
| name | `string` | no |  | Legacy form-field name. Deprecated: No-op. This component renders a `<div role="radio">`, not a native `<input type="radio">`, so it does not group by name or participate in native form submission — `RadioGroup` handles grouping in React state. Declared only so the attribute is not forwarded to an element that rejects it. |

## RadioGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Group label |
| helperText | `string` | no |  | Helper or error message rendered below the group |
| error | `boolean` | no | `false` | Error state — recolours the helper text and marks the group invalid |
| required | `boolean` | no | `false` | Marks the group required and renders the required marker on its label |
| value | `string` | no | `` | Currently selected value |
| name | `string` | no |  | Legacy grouping name, never used. Deprecated: No-op. Grouping is React state (`value`/`onValueChange`), not native `name` semantics — the group renders `role="radiogroup"` over `<div role="radio">`s, so there is nothing for a name to group. |
| options | `{ label: string; value: string; disabled?: boolean \| undefined; }[]` | yes |  | Radio options |
| direction | `"horizontal" \| "vertical"` | no | `vertical` | Layout direction |
| onValueChange | `((value: string) => void)` | no |  | Called with the newly selected value |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((value: string) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |
