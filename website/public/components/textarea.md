# Textarea

Multi-line text input with character counter, resize control, helper text, and error states.

Generated from the rift-ds registry and prop JSDoc, version 1.29.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { Textarea } from 'rift-ds';`
- Deep import: `import { Textarea } from 'rift-ds/components/Textarea/Textarea';`
- Rendering: client component (declares 'use client')
- Size: 1.1 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/textarea
- Schema: https://rift-ds.com/schema/components/textarea.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Input](https://rift-ds.com/components/input.md) instead when the value fits on a single line.

## Textarea props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Textarea label text |
| value | `string` | no |  | Current value (controlled). Leave it undefined for an uncontrolled textarea, which keeps its own state seeded from `defaultValue`. |
| defaultValue | `string` | no |  | Initial value when uncontrolled (`value` undefined). |
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| error | `boolean` | no | `false` | Error state: marks the control invalid and, in the older form without `errorText`, recolours the helper text as the error message. |
| helperText | `string` | no |  | Helper text displayed below the control. With the older `error` flag and no `errorText`, it doubles as the error message. |
| errorText | `ReactNode` | no |  | The error message, shown under the control while the helper text keeps its place. Setting it marks the control invalid, so `error` is not needed alongside it; Field's spec owns the wiring. |
| resize | `"none" \| "both" \| "horizontal" \| "vertical"` | no | `'vertical'` | Whether the textarea is resizable |
| maxLength | `number` | no |  | Max character count — shows counter when set |
| onValueChange | `((value: string) => void)` | no |  | Convenience callback receiving the value directly. Fires alongside `onChange`, which keeps the standard React event signature so form libraries work unmodified. |
| className | `string` | no | `''` | Additional CSS classes — applied to the wrapper, not the <textarea> |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA text field pattern (https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/).

| Key | What it does |
| --- | --- |
| Typing | Enters text in the named field. |

Types from other packages: `ReactNode` (react).
