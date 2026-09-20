# Dropdown

Custom select dropdown with keyboard navigation, disabled options, and error states.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { Dropdown } from '@robr0/design-system';`
- Deep import: `import { Dropdown } from '@robr0/design-system/components/Dropdown/Dropdown';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/dropdown

## Dropdown props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Dropdown label text |
| placeholder | `string` | no | `Select an option` | Placeholder when no value selected |
| value | `string` | no |  | Currently selected value |
| options | `DropdownOption[]` | yes |  | Available options (flat list) |
| groups | `DropdownOptionGroup[]` | no |  | Optional grouped options — when provided, renders groups with labels and separators |
| size | `"default" \| "compact"` | no | `default` | Component size |
| disabled | `boolean` | no | `false` | Whether the dropdown is disabled |
| required | `boolean` | no | `false` | Whether the dropdown is required |
| error | `boolean` | no | `false` | Error state |
| helperText | `string` | no |  | Helper or error message |
| onValueChange | `((value: string) => void)` | no |  | Called with the newly selected value |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((value: string) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
| name | `string` | no |  | Used only as a fallback for deriving the element id (`id \|\| name \|\| label`).  Note: Dropdown renders a `<div role="combobox">`, not a native `<select>`, so `name` does **not** make it participate in native form submission. |
