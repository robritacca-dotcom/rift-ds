# Masked input

A field that writes its value into a shape as it is typed, with a sensitive mode that hides it.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { MaskedInput } from 'rift-ds';`
- Deep import: `import { MaskedInput } from 'rift-ds/components/MaskedInput/MaskedInput';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/masked-input
- Schema: https://rift-ds.com/schema/components/masked-input.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## MaskedInput props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Label text above the field. |
| mask | `Mask` | yes |  | The shape of the value: a pattern where `#` takes a digit, `A` a letter and `*` either (`'(###) ###-####'`), or a function from the raw characters to the shown text. `MASK_PRESETS` holds common patterns. |
| value | `string` | no |  | The raw value, the characters without the mask's separators (`"5550100199"`) (controlled). Pair with `onValueChange`. |
| defaultValue | `string` | no | `` | The raw value the field starts with (uncontrolled). |
| onValueChange | `((value: string, formatted: string) => void)` | no |  | Called with the raw value and the shown text as the reader types. Fires alongside the native `onChange`. |
| sensitive | `boolean` | no | `false` | Hide the value as dots until it is revealed: a tax ID, a card number. Defaults `autoComplete` to `off`. |
| revealable | `boolean` | no | `false` | Add a show and hide button to a sensitive field. |
| revealed | `boolean` | no |  | Whether a sensitive value is shown (controlled). Pair with `onRevealedChange`. |
| defaultRevealed | `boolean` | no | `false` | Whether a sensitive value starts shown (uncontrolled). Defaults to false. |
| onRevealedChange | `((revealed: boolean) => void)` | no |  | Called with the new state when the reader shows or hides the value, or it hides itself. |
| visibleTail | `number` | no | `0` | How many of the last characters of a hidden value stay readable while the field is not focused, so a reader can tell which card it is. Defaults to 0. |
| autoHideAfter | `number \| boolean` | no | `false` | Hide a revealed value again after this many milliseconds, or after the library's reveal timeout with `true`. Off by default. |
| showLabel | `string` | no | `Show` | Accessible name of the reveal button while the value is hidden. Defaults to "Show". |
| hideLabel | `string` | no | `Hide` | Accessible name of the reveal button while the value is shown. Defaults to "Hide". |
| size | `"default" \| "compact"` | no | `default` | Component size (not the native character-width `size` attribute). |
| helperText | `string` | no |  | Helper text below the field. |
| errorText | `ReactNode` | no |  | The error message under the field; setting it marks the field invalid. |
| error | `boolean` | no |  | Error state without a message of its own. |
| name | `string` | no |  | The form field name. The form receives the raw value through a hidden input, never the shown text. |
| className | `string` | no | `` | Additional CSS classes, applied to the wrapper. |
