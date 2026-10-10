# Inspector colour picker

One-row colour setting for inspector panels, with the hex and a round swatch at the bar's end and ColorPicker's own panel.

Generated from the rift-ds registry and prop JSDoc, version 1.6.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: inspector
- Import: `import { InspectorColorPicker } from 'rift-ds';`
- Deep import: `import { InspectorColorPicker } from 'rift-ds/components/Inspector/InspectorColorPicker';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/inspector-color-picker

## InspectorColorPicker props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | yes |  | The setting's name, drawn inside the bar on the left. Also the start of the trigger's accessible name. |
| value | `string` | no |  | Current colour as a hex string — 3, 6 or 8 digit, with or without `#`. |
| defaultValue | `string` | no |  | Initial colour for uncontrolled use. |
| onValueChange | `((value: string) => void)` | no |  | Called with the colour as an uppercase hex string (`#RRGGBB`, or `#RRGGBBAA` when `showAlpha` and alpha is below 100%). Fires live while dragging, as in ColorPicker. |
| showAlpha | `boolean` | no | `false` | Add an alpha (opacity) slider to the panel and emit 8-digit hex when alpha is below 100%. |
| name | `string` | no |  | When set, a hidden input carries the current hex under this name, so the picker joins native form submission. |
| disabled | `boolean` | no | `false` | Whether the picker is disabled. |
| size | `"default" \| "compact"` | no | `default` | Component size, matching Button: `default` is 40px tall, `compact` 32px. |
| className | `string` | no | `` | Additional CSS classes, applied to the wrapper. |
