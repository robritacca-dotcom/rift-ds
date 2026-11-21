# Date input

Date input with native picker, calendar icon, label, and validation states.

Generated from the rift-ds registry and prop JSDoc, version 1.32.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { DateInput } from 'rift-ds';`
- Deep import: `import { DateInput } from 'rift-ds/components/DateInput/DateInput';`
- Rendering: client component (declares 'use client')
- Size: 1.1 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/date-input
- Schema: https://rift-ds.com/schema/components/date-input.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## DateInput props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Input label text |
| value | `string` | no |  | Current value (YYYY-MM-DD format) |
| size | `"default" \| "compact"` | no | `'default'` | Component size (not the native character-width `size` attribute) |
| error | `boolean` | no | `false` | Error state: marks the control invalid and, in the older form without `errorText`, recolours the helper text as the error message. |
| helperText | `string` | no |  | Helper text displayed below the control. With the older `error` flag and no `errorText`, it doubles as the error message. |
| errorText | `ReactNode` | no |  | The error message, shown under the control while the helper text keeps its place. Setting it marks the control invalid, so `error` is not needed alongside it; Field's spec owns the wiring. |
| min | `string` | no |  | Minimum selectable date (YYYY-MM-DD) |
| max | `string` | no |  | Maximum selectable date (YYYY-MM-DD) |
| onValueChange | `((value: string) => void)` | no |  | Convenience callback receiving the value directly. Fires alongside `onChange`, which keeps the standard React event signature so form libraries work unmodified. |
| className | `string` | no | `''` | Additional CSS classes — applied to the wrapper, not the <input> |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |

## Keyboard

A native date input: the browser owns its keys and its picker. Those keys belong to the platform, so no test of this library presses them.

Types from other packages: `ReactNode` (react).
