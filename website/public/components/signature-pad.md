# Signature pad

A signature drawn with a pointer or typed, kept as SVG with a PNG on demand.

Generated from the rift-ds registry and prop JSDoc, version 1.24.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { SignaturePad } from 'rift-ds';`
- Deep import: `import { SignaturePad } from 'rift-ds/components/SignaturePad/SignaturePad';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/signature-pad
- Schema: https://rift-ds.com/schema/components/signature-pad.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## SignaturePad props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Label text above the pad. |
| mode | `"both" \| "type" \| "draw"` | no | `both` | `draw` takes a drawn signature, `type` a typed name, `both` lets the reader choose. Defaults to `both`, since typing is the way in for anyone who cannot draw with a pointer. |
| value | `SignatureValue \| null` | no |  | The signature (controlled). A drawn one cannot be loaded back for editing: pass `null` to clear the pad, or keep the value the pad last handed over. |
| defaultValue | `{ kind: "typed"; text: string; } \| null` | no | `null` | The typed name the pad starts with (uncontrolled), which also starts it on the type tab. |
| onValueChange | `((value: SignatureValue \| null) => void)` | no |  | Called with the signature after each stroke, each change to the typed name, and each clear (with `null`). |
| height | `"default" \| "tall"` | no | `default` | The pad's height: `default`, or `tall` for a wider hand or a touch screen. |
| size | `"default" \| "compact"` | no | `default` | Component size |
| disabled | `boolean` | no | `false` | Whether the pad is disabled |
| error | `boolean` | no |  | Error state without a message of its own. |
| errorText | `ReactNode` | no |  | The error message under the pad; setting it marks the pad invalid. |
| helperText | `string` | no |  | Helper text below the pad. |
| required | `boolean` | no |  | Marks the pad required. |
| name | `string` | no |  | The form field name: the form receives the signature's SVG through a hidden input. |
| placeholderLabel | `string` | no | `Sign here` | Text on the baseline before anything is drawn. Defaults to "Sign here". |
| padLabel | `string` | no | `Signature drawing area` | The drawing surface's accessible name. Defaults to "Signature drawing area". |
| modeLabel | `string` | no | `Signature method` | Accessible name of the draw and type choice. Defaults to "Signature method". |
| drawLabel | `string` | no | `Draw` | The draw tab's text. Defaults to "Draw". |
| typeLabel | `string` | no | `Type` | The type tab's text. Defaults to "Type". |
| nameLabel | `string` | no | `Type your full name` | The typed name's field label. Defaults to "Type your full name". |
| clearLabel | `string` | no | `Clear` | The clear button's text. Defaults to "Clear". |
| undoLabel | `string` | no | `Undo` | The undo button's text. Defaults to "Undo". |
| addedLabel | `string` | no | `Signature added` | Announced politely after a stroke is drawn. Defaults to "Signature added". |
| clearedLabel | `string` | no | `Signature cleared` | Announced politely after the pad is cleared. Defaults to "Signature cleared". |
| className | `string` | no | `` | Additional CSS classes |
