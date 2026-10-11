# Inspector input

One-row text field for inspector panels, with the name on the left and the value right-aligned in the bar.

Generated from the rift-ds registry and prop JSDoc, version 1.7.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: inspector
- Import: `import { InspectorInput } from 'rift-ds';`
- Deep import: `import { InspectorInput } from 'rift-ds/components/Inspector/InspectorInput';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/inspector-input

## InspectorInput props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | The setting's name, drawn inside the bar on the left, as the field's real <label>. |
| value | `string` | no |  | Current value. |
| type | `"search" \| "text" \| "tel" \| "url" \| "email"` | no | `text` | Input type: a curated subset of the single-line text types. |
| size | `"default" \| "compact"` | no | `default` | Component size, matching Button: `default` is 40px tall, `compact` 32px (not the native character-width `size` attribute). |
| onValueChange | `((value: string) => void)` | no |  | Convenience callback receiving the value directly. Fires alongside `onChange`, which keeps the standard React event signature so form libraries work unmodified. |
| className | `string` | no | `` | Additional CSS classes, applied to the bar rather than the <input>. |
