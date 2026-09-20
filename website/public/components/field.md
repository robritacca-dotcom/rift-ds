# Field

The shared scaffolding for labelled form controls: label, required marker, helper and error text, and the ARIA wiring that ties them together.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { Field } from '@robr0/design-system';`
- Deep import: `import { Field } from '@robr0/design-system/components/Field/Field';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/field

## Field props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Label text rendered above the control |
| children | `ReactNode` | no |  | The form control this field labels |
| helperText | `string` | no |  | Helper or error message rendered below the control |
| aside | `ReactNode` | no |  | Optional content rendered opposite the helper text — a character counter, a unit, a "0/280". Present only when supplied; without it the helper sits directly in the field's column and no extra wrapper is introduced. |
| error | `boolean` | no | `false` | Error state — recolours the helper text and marks the control invalid |
| required | `boolean` | no | `false` | Marks the field required and renders the required marker |
| disabled | `boolean` | no | `false` | Whether the control is disabled — dims the label |
| size | `"default" \| "compact"` | no | `default` | Component size |
| id | `string` | no |  | id for the control. Generated when omitted, so the label/control/helper association works with no configuration. |
| className | `string` | no | `` | Additional CSS classes |
