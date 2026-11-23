# Form section

A part of a form or a settings page: a heading and its sentence, the fields in a grid, and the section’s own actions.

Generated from the rift-ds registry and prop JSDoc, version 1.36.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { FormSection } from 'rift-ds';`
- Deep import: `import { FormSection } from 'rift-ds/components/FormSection/FormSection';`
- Rendering: server-renderable (no 'use client')
- Size: 1.1 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/form-section
- Schema: https://rift-ds.com/schema/components/form-section.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Widget](https://rift-ds.com/components/widget.md) instead when the section is a dashboard tile rather than part of a form.

## FormSection props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The section's heading. Note: this shadows the native `title` tooltip attribute, which FormSection does not expose. |
| description | `ReactNode` | no |  | A sentence on what the fields are for or what changing them does. |
| children | `ReactNode` | no |  | The fields, laid out in `columns`. |
| columns | `1 \| 2 \| 3` | no | `1` | How many columns the fields run to; they fold to one as the section narrows. |
| layout | `"aside" \| "stacked"` | no | `'stacked'` | `stacked` puts the heading above the fields; `aside` sets it in a column beside them, the settings page's layout, stacking when the section is narrow. |
| actions | `ReactNode` | no |  | The section's own controls, at the foot of the fields: a Save, a Cancel. |
| headingLevel | `2 \| 4 \| 3` | no | `2` | The heading's place in the outline. Defaults to 2, a section of a page. |
| divider | `boolean` | no | `false` | Draws a rule above the section, for a column of sections. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

It holds the fields and actions passed in, each a native control reached with Tab. Those keys belong to the platform, so no test of this library presses them.

Types from other packages: `ReactNode` (react).
