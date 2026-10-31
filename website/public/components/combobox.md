# Combobox

A filterable select that narrows options as the user types, with multi-select chips, grouping, and async loading.

Generated from the rift-ds registry and prop JSDoc, version 1.19.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { Combobox } from 'rift-ds';`
- Deep import: `import { Combobox } from 'rift-ds/components/Combobox/Combobox';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/combobox

## Combobox props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Combobox label text |
| placeholder | `string` | no | `Search…` | Placeholder shown in the text field when nothing is selected |
| value | `string \| string[]` | no |  | Selected value, controlled — a `string` in single mode, `string[]` when `multiple` is set. Leave undefined to let the combobox keep its own selection, seeded from `defaultValue`. |
| defaultValue | `string \| string[]` | no |  | Selection on first render when uncontrolled (`value` undefined) — a `string` in single mode, `string[]` when `multiple` is set. Omitted, the selection starts empty. |
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
| loadingMessage | `string` | no | `Loading…` | Status text shown in the menu while `loading` is set. Defaults to "Loading…". |
| clearable | `boolean` | no | `false` | Show a clear button once something is selected |
| clearLabel | `string` | no | `Clear selection` | Accessible name of the clear button. Defaults to "Clear selection". |
| removeLabel | `((label: string) => string)` | no | `(optionLabel) => `Remove ${optionLabel}`` | Accessible name of a chip's remove button in `multiple` mode, given the option's label. Defaults to "Remove <label>". |
| onValueChange | `((value: string \| string[]) => void)` | no |  | Called with the new selection — a `string` in single mode, `string[]` when `multiple` is set. |
| onSearchChange | `((query: string) => void)` | no |  | Called as the user types, for async/server-side filtering |
| manualFiltering | `boolean` | no | `false` | Skip built-in filtering — use when options are filtered upstream |
| className | `string` | no | `` | Additional CSS classes |
| onChange | `((value: string \| string[]) => void)` | no |  | Legacy change handler, kept for backwards compatibility. Deprecated: Use `onValueChange` instead. |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
| name | `string` | no |  | Form field name. When set, the selection submits with an enclosing form under this name through hidden inputs: the selected option's `value` in single mode (nothing until one is chosen), one entry per selected value in `multiple` mode, nothing while disabled. The search text the user types is never submitted. Also the fallback for the element id (`id \|\| name \|\| generated`). |
