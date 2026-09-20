# Pin input

Segmented one-time-code input with auto-advance, paste support, and completion callback.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { PinInput } from '@robr0/design-system';`
- Deep import: `import { PinInput } from '@robr0/design-system/components/PinInput/PinInput';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/pin-input

## PinInput props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| length | `number` | no | `6` | Number of cells, one character each |
| value | `string` | no |  | Current code (controlled) — character at index n renders in cell n |
| defaultValue | `string` | no |  | Initial code (uncontrolled) |
| onValueChange | `((value: string) => void)` | no |  | Convenience callback receiving the joined code whenever any cell changes. There is no single native `onChange` here: the control is a group of one-character inputs, so the value callback is the primary API. |
| onComplete | `((value: string) => void)` | no |  | Fires once when every cell is filled, with the complete code |
| mask | `boolean` | no | `false` | Render cells as password fields, hiding the entered characters |
| format | `"numeric" \| "alphanumeric"` | no | `numeric` | Accepted characters — `numeric` rejects non-digits and sets a numeric keyboard |
| label | `string` | no |  | Label text rendered above the cells; also names the group for screen readers |
| helperText | `string` | no |  | Helper or error message displayed below the cells |
| error | `boolean` | no | `false` | Error state — recolours cell borders and the helper text |
| disabled | `boolean` | no | `false` | Whether the whole control is disabled |
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the cells |
