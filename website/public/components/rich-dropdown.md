# Rich dropdown

Dropdown's rich sibling: options preview their own heading face, body face, and key colour.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { RichDropdown } from '@robr0/design-system';`
- Deep import: `import { RichDropdown } from '@robr0/design-system/components/RichDropdown/RichDropdown';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/rich-dropdown

## RichDropdown props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Field label text |
| placeholder | `string` | no | `Select an option` | Placeholder when no value selected |
| value | `string` | no |  | Selected option value for controlled use. Pair with `onValueChange`. |
| defaultValue | `string` | no |  | Initially selected option value for uncontrolled use. |
| options | `RichDropdownOption[]` | yes |  | The options on offer, in display order. |
| disabled | `boolean` | no | `false` | Whether the picker is disabled |
| required | `boolean` | no | `false` | Whether the picker is required |
| error | `boolean` | no | `false` | Error state |
| helperText | `string` | no |  | Helper or error message |
| onValueChange | `((value: string) => void)` | no |  | Fires with the newly selected option's value. |
| className | `string` | no | `` | Additional CSS classes |
| name | `string` | no |  | Used only as a fallback for deriving the element id (`id \|\| name \|\| label`).  Note: RichDropdown renders a `<div role="combobox">`, not a native `<select>`, so `name` does **not** make it participate in native form submission. |
