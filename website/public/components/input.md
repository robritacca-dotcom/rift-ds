# Input

Text input with label, placeholder, left and right icons, helper text, and error states.

Generated from the rift-ds registry and prop JSDoc, version 1.0.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { Input } from 'rift-ds';`
- Deep import: `import { Input } from 'rift-ds/components/Input/Input';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/input

## Input props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Input label text |
| value | `string` | no |  | Current value |
| type | `"number" \| "search" \| "text" \| "tel" \| "url" \| "email" \| "password"` | no | `text` | Input type — curated subset; use a dedicated component for checkbox/radio/file |
| size | `"default" \| "compact"` | no | `default` | Component size (not the native character-width `size` attribute) |
| error | `boolean` | no | `false` | Error state — shows error styling and message |
| helperText | `string` | no |  | Helper or error message displayed below the input |
| iconLeft | `ReactNode` | no |  | Leading icon — Material Symbol name (string) or custom element (ReactNode) |
| iconRight | `ReactNode` | no |  | Trailing icon — Material Symbol name (string) or custom element (ReactNode) |
| onValueChange | `((value: string) => void)` | no |  | Convenience callback receiving the value directly. Fires alongside `onChange`, which keeps the standard React event signature so form libraries (react-hook-form, Formik, TanStack Form) work unmodified. |
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the <input> |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
