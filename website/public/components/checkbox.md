# Checkbox

Custom checkbox with check and indeterminate states, keyboard accessible with animated transitions.

Generated from the rift-ds registry and prop JSDoc, version 1.1.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

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
| checked | `boolean` | no | `false` | Whether the checkbox is checked |
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
| values | `string[]` | no | `[]` | Currently selected values |
| direction | `"horizontal" \| "vertical"` | no | `vertical` | Layout direction |
| size | `"default" \| "compact"` | no | `default` | Component size |
| onValuesChange | `((values: string[]) => void)` | no |  | Called with the next selected values |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((values: string[]) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValuesChange` instead. |
