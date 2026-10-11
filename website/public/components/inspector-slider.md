# Inspector slider

One-row slider for inspector panels, where the whole bar is the control and its fill is the value.

Generated from the rift-ds registry and prop JSDoc, version 1.7.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: inspector
- Import: `import { InspectorSlider } from 'rift-ds';`
- Deep import: `import { InspectorSlider } from 'rift-ds/components/Inspector/InspectorSlider';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/inspector-slider

## InspectorSlider props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | The setting's name, drawn inside the bar on the left. Also the range's accessible name. |
| value | `number` | no |  | Current value (controlled). Leave unset and use `defaultValue` for an uncontrolled slider. |
| defaultValue | `number` | no |  | Starting value for an uncontrolled slider. Defaults to `min`. |
| min | `number` | no | `0` | Minimum value. |
| max | `number` | no | `100` | Maximum value. |
| step | `number` | no | `1` | Step increment. Also sets how many decimals the reading shows (0.02 reads "0.50"). |
| format | `((value: number) => string)` | no |  | Formats the reading on the right, and the value a screen reader announces. Defaults to the step's precision. |
| size | `"default" \| "compact"` | no | `default` | Component size, matching Button: `default` is 40px tall, `compact` 32px (not the native character-width `size` attribute). |
| onValueChange | `((value: number) => void)` | no |  | Convenience callback receiving the numeric value directly. Fires alongside `onChange`, which keeps the standard React event signature. |
| className | `string` | no | `` | Additional CSS classes, applied to the bar rather than the <input>. |
