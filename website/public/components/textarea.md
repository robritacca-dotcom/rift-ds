# Textarea

Multi-line text input with character counter, resize control, helper text, and error states.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { Textarea } from '@robr0/design-system';`
- Deep import: `import { Textarea } from '@robr0/design-system/components/Textarea/Textarea';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/textarea

## Textarea props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Textarea label text |
| value | `string` | no | `` | Current value |
| size | `"default" \| "compact"` | no | `default` | Component size |
| error | `boolean` | no | `false` | Error state — shows error styling and message |
| helperText | `string` | no |  | Helper or error message displayed below |
| resize | `"none" \| "both" \| "horizontal" \| "vertical"` | no | `vertical` | Whether the textarea is resizable |
| maxLength | `number` | no |  | Max character count — shows counter when set |
| onValueChange | `((value: string) => void)` | no |  | Convenience callback receiving the value directly. Fires alongside `onChange`, which keeps the standard React event signature so form libraries work unmodified. |
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the <textarea> |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
