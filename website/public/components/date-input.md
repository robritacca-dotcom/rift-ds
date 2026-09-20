# Date input

Date input with native picker, calendar icon, label, and validation states.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { DateInput } from '@robr0/design-system';`
- Deep import: `import { DateInput } from '@robr0/design-system/components/DateInput/DateInput';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/date-input

## DateInput props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Input label text |
| value | `string` | no |  | Current value (YYYY-MM-DD format) |
| size | `"default" \| "compact"` | no | `default` | Component size (not the native character-width `size` attribute) |
| error | `boolean` | no | `false` | Error state |
| helperText | `string` | no |  | Helper or error message |
| min | `string` | no |  | Minimum selectable date (YYYY-MM-DD) |
| max | `string` | no |  | Maximum selectable date (YYYY-MM-DD) |
| onValueChange | `((value: string) => void)` | no |  | Convenience callback receiving the value directly. Fires alongside `onChange`, which keeps the standard React event signature so form libraries work unmodified. |
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the <input> |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
