# Input

Text input with label, placeholder, icons, a prefix or suffix, a clear button, helper text, and error states.

Generated from the rift-ds registry and prop JSDoc, version 1.38.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { Input } from 'rift-ds';`
- Deep import: `import { Input } from 'rift-ds/components/Input/Input';`
- Rendering: client component (declares 'use client')
- Size: 5.7 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/input
- Schema: https://rift-ds.com/schema/components/input.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Textarea](https://rift-ds.com/components/textarea.md) instead when the content needs more than one line.

## Input props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Input label text |
| value | `string` | no |  | Current value |
| type | `"number" \| "search" \| "text" \| "tel" \| "url" \| "email" \| "password"` | no | `'text'` | Input type — curated subset; use a dedicated component for checkbox/radio/file |
| size | `"default" \| "compact"` | no | `'default'` | Component size (not the native character-width `size` attribute) |
| variant | `"default" \| "quiet"` | no | `'default'` | The field's form. `quiet` draws no border or fill at rest, only the leading icon and the placeholder, and reveals the full field while it is hovered, focused or holds a value, or while the nearest ancestor marked `data-quiet-host` (a list row) is hovered. For a list where every row can take an optional entry. An error always shows the full field. |
| error | `boolean` | no | `false` | Error state — shows error styling and message |
| helperText | `string` | no |  | Helper text displayed below the input. With the older `error` flag and no `errorText`, it doubles as the error message. |
| errorText | `ReactNode` | no |  | The error message, shown under the input while the helper text keeps its place. Setting it marks the input invalid; Field's spec owns the wiring. |
| prefix | `ReactNode` | no |  | Text or a node inside the field before the value, read by a screen reader as part of the field (a currency symbol, `https://`, a country code). Not the decorative `iconLeft`. Note: this shadows the native `prefix` attribute (an RDFa vocabulary), which Input does not expose. |
| suffix | `ReactNode` | no |  | Text or a node inside the field after the value, read by a screen reader as part of the field (a unit, `.com`, `%`). Not the decorative `iconRight`. |
| action | `ReactNode` | no |  | A control inside the field at its end, after the suffix: a show/hide button, a copy button. Unlike `suffix` it is not read as part of the field; it is a control of its own. |
| clearable | `boolean` | no | `false` | Show a clear button while the field holds a value. It empties the field, fires `onChange` and `onValueChange` with an empty value, then `onClear`, and returns focus to the field. |
| clearLabel | `string` | no | `'Clear'` | Accessible name of the clear button. Defaults to "Clear". |
| onClear | `(() => void)` | no |  | Called after the clear button empties the field. |
| iconLeft | `string \| ReactNode` | no |  | Leading icon — Material Symbol name (string) or custom element (ReactNode) |
| iconRight | `string \| ReactNode` | no |  | Trailing icon — Material Symbol name (string) or custom element (ReactNode) |
| onValueChange | `((value: string) => void)` | no |  | Convenience callback receiving the value directly. Fires alongside `onChange`, which keeps the standard React event signature so form libraries (react-hook-form, Formik, TanStack Form) work unmodified. |
| className | `string` | no | `''` | Additional CSS classes — applied to the wrapper, not the <input> |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA text field pattern (https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/).

| Key | What it does |
| --- | --- |
| Typing | Enters text in the named field. |

Types from other packages: `ReactNode` (react).
