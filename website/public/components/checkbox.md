# Checkbox

Custom checkbox with check and indeterminate states, keyboard accessible with animated transitions.

Generated from the rift-ds registry and prop JSDoc, version 1.13.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { Checkbox } from 'rift-ds';`
- Deep import: `import { Checkbox } from 'rift-ds/components/Checkbox/Checkbox';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/checkbox

## Checkbox props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Label text |
| helperText | `string` | no |  | Helper or error message rendered under the label text |
| error | `boolean` | no | `false` | Error state — recolours the helper text and marks the checkbox invalid |
| checked | `boolean` | no |  | Whether the checkbox is checked, controlled. Leave undefined to let the checkbox keep its own state, seeded from `defaultChecked`. |
| defaultChecked | `boolean` | no | `false` | Whether the checkbox starts checked when uncontrolled (`checked` undefined). |
| indeterminate | `boolean` | no | `false` | Whether the checkbox is in an indeterminate state |
| disabled | `boolean` | no | `false` | Whether the checkbox is disabled |
| size | `"default" \| "compact"` | no | `default` | Component size |
| onCheckedChange | `((checked: boolean) => void)` | no |  | Called with the next checked state when toggled |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((checked: boolean) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onCheckedChange` instead. |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
| name | `string` | no |  | Legacy form-field name. Deprecated: No-op. This component renders a `<div role="checkbox">`, not a native `<input>`, so it cannot participate in native form submission. Declared only so the attribute is not forwarded to an element that rejects it. |

## CheckboxGroup props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Group label |
| helperText | `string` | no |  | Helper or error message rendered below the group |
| error | `boolean` | no | `false` | Error state — recolours the helper text and marks the group invalid |
| required | `boolean` | no | `false` | Marks the group required and renders the required marker on its label |
| items | `{ label: string; value: string; disabled?: boolean \| undefined; }[]` | yes |  | Checkbox options |
| values | `string[]` | no |  | Currently selected values, controlled. Leave undefined to let the group keep its own selection, seeded from `defaultValues`. |
| defaultValues | `string[]` | no | `[]` | Selected values on first render when uncontrolled (`values` undefined). |
| direction | `"horizontal" \| "vertical"` | no | `vertical` | Layout direction |
| size | `"default" \| "compact"` | no | `default` | Component size |
| onValuesChange | `((values: string[]) => void)` | no |  | Called with the next selected values |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((values: string[]) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValuesChange` instead. |

## CheckboxIndicator props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| checked | `boolean` | no | `false` | Whether the box shows its check. |
| indeterminate | `boolean` | no | `false` | Whether the box shows the minus of an indeterminate state (ignored when `checked`). |
| size | `"default" \| "compact"` | no | `default` | Box size: `default` is 24px, `compact` 20px. |
| className | `string` | no | `` | Additional CSS classes |

## CheckIcon props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| className | `string` | no | `ds-checkbox__icon` | Additional CSS classes; the default is the checkbox icon's, which sizes and colours it. |

## MinusIcon props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| className | `string` | no | `ds-checkbox__icon` | Additional CSS classes; the default is the checkbox icon's, which sizes and colours it. |
