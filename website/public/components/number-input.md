# Number input

Numeric field with increment and decrement steppers and min/max clamping.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { NumberInput } from '@robr0/design-system';`
- Deep import: `import { NumberInput } from '@robr0/design-system/components/NumberInput/NumberInput';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/number-input

## NumberInput props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Input label text |
| value | `number \| ""` | no |  | Current value (controlled). Pass an empty string for an empty field |
| defaultValue | `number` | no |  | Initial value (uncontrolled) |
| min | `number` | no |  | Minimum allowed value — steppers stop here, and typed values clamp to it on blur |
| max | `number` | no |  | Maximum allowed value — steppers stop here, and typed values clamp to it on blur |
| step | `number` | no | `1` | Amount each stepper click (or arrow key) changes the value by |
| size | `"default" \| "compact"` | no | `default` | Component size (not the native character-width `size` attribute) |
| error | `boolean` | no | `false` | Error state — shows error styling and message |
| helperText | `string` | no |  | Helper or error message displayed below the input |
| onValueChange | `((value: number \| null) => void)` | no |  | Convenience callback receiving the numeric value directly — `null` when the field is empty or unparseable. Fires on typing alongside `onChange` (which keeps the standard React event signature so form libraries work unmodified) and also on stepper clicks, where no native change event exists. |
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the <input> |
