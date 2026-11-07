# Input

Text input with label, placeholder, left and right icons, helper text, and error states.

Generated from the rift-ds registry and prop JSDoc, version 1.24.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { Input } from 'rift-ds';`
- Deep import: `import { Input } from 'rift-ds/components/Input/Input';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/input
- Schema: https://rift-ds.com/schema/components/input.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Input props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Input label text |
| value | `string` | no |  | Current value |
| type | `"number" \| "search" \| "text" \| "tel" \| "url" \| "email" \| "password"` | no | `text` | Input type — curated subset; use a dedicated component for checkbox/radio/file |
| size | `"default" \| "compact"` | no | `default` | Component size (not the native character-width `size` attribute) |
| error | `boolean` | no | `false` | Error state — shows error styling and message |
| helperText | `string` | no |  | Helper text displayed below the input. With the older `error` flag and no `errorText`, it doubles as the error message. |
| errorText | `ReactNode` | no |  | The error message, shown under the input while the helper text keeps its place. Setting it marks the input invalid; Field's spec owns the wiring. |
| prefix | `ReactNode` | no |  | Text or a node inside the field before the value, read by a screen reader as part of the field (a currency symbol, `https://`, a country code). Not the decorative `iconLeft`. |
| suffix | `ReactNode` | no |  | Text or a node inside the field after the value, read by a screen reader as part of the field (a unit, `.com`, `%`). Not the decorative `iconRight`. |
| clearable | `boolean` | no | `false` | Show a clear button while the field holds a value. It empties the field, fires `onChange` and `onValueChange` with an empty value, then `onClear`, and returns focus to the field. |
| clearLabel | `string` | no | `Clear` | Accessible name of the clear button. Defaults to "Clear". |
| onClear | `(() => void)` | no |  | Called after the clear button empties the field. |
| iconLeft | `ReactNode` | no |  | Leading icon — Material Symbol name (string) or custom element (ReactNode) |
| iconRight | `ReactNode` | no |  | Trailing icon — Material Symbol name (string) or custom element (ReactNode) |
| onValueChange | `((value: string) => void)` | no |  | Convenience callback receiving the value directly. Fires alongside `onChange`, which keeps the standard React event signature so form libraries (react-hook-form, Formik, TanStack Form) work unmodified. |
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the <input> |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
