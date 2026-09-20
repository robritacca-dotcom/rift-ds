# Radio button

Radio button and radio group with vertical and horizontal layouts, animated dot indicator.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { RadioButton } from '@robr0/design-system';`
- Deep import: `import { RadioButton } from '@robr0/design-system/components/RadioButton/RadioButton';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/radio-button

## RadioButton props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Label text |
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
| value | `string` | no | `` | Currently selected value |
| name | `string` | yes |  | Radio group name |
| options | `{ label: string; value: string; disabled?: boolean \| undefined; }[]` | yes |  | Radio options |
| direction | `"horizontal" \| "vertical"` | no | `vertical` | Layout direction |
| onValueChange | `((value: string) => void)` | no |  | Called with the newly selected value |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((value: string) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |
