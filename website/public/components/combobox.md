# Combobox

A filterable select that narrows options as the user types, with multi-select chips, grouping, and async loading.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { Combobox } from '@robr0/design-system';`
- Deep import: `import { Combobox } from '@robr0/design-system/components/Combobox/Combobox';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/combobox

## Combobox props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Combobox label text |
| placeholder | `string` | no | `Search…` | Placeholder shown in the text field when nothing is selected |
| value | `string \| string[]` | no |  | Selected value — a `string` in single mode, `string[]` when `multiple` is set. Leave undefined for an empty selection. |
| options | `ComboboxOption[]` | yes |  | Available options (flat list) |
| groups | `ComboboxOptionGroup[]` | no |  | Optional grouped options — when provided, `options` is ignored |
| multiple | `boolean` | no | `false` | Allow selecting more than one option; selections render as removable chips |
| size | `"default" \| "compact"` | no | `default` | Component size |
| disabled | `boolean` | no | `false` | Whether the combobox is disabled |
| required | `boolean` | no | `false` | Whether the combobox is required |
| error | `boolean` | no | `false` | Error state — shows error styling and message |
| helperText | `string` | no |  | Helper or error message displayed below the field |
| loading | `boolean` | no | `false` | Show a loading affordance in the menu — for async option fetching |
| emptyMessage | `string` | no | `No results found` | Message shown when the filter matches no options |
| clearable | `boolean` | no | `false` | Show a clear button once something is selected |
| onValueChange | `((value: string \| string[]) => void)` | no |  | Called with the new selection — a `string` in single mode, `string[]` when `multiple` is set. |
| onSearchChange | `((query: string) => void)` | no |  | Called as the user types, for async/server-side filtering |
| manualFiltering | `boolean` | no | `false` | Skip built-in filtering — use when options are filtered upstream |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((value: string \| string[]) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
| name | `string` | no |  | Used only as a fallback for deriving the element id (`id \|\| name \|\| generated`).  Note: Combobox renders a `<div>` wrapper around a text input, not a native `<select>`, so `name` does **not** make the selection participate in native form submission. |
