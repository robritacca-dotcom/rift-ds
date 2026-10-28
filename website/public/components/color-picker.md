# Colour picker

Swatch trigger opening a saturation area, hue and alpha sliders, and a hex field; controlled or uncontrolled.

Generated from the rift-ds registry and prop JSDoc, version 1.16.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { ColorPicker } from 'rift-ds';`
- Deep import: `import { ColorPicker } from 'rift-ds/components/ColorPicker/ColorPicker';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/color-picker

## ColorPicker props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Field label text |
| value | `string` | no |  | Current colour as a hex string — 3, 6 or 8 digit, with or without `#` |
| defaultValue | `string` | no | `#118AB2` | Initial colour for uncontrolled use |
| onValueChange | `((value: string) => void)` | no |  | Convenience callback receiving the colour as an uppercase hex string (`#RRGGBB`, or `#RRGGBBAA` when `showAlpha` and alpha < 100%). Fires live while dragging. |
| showText | `boolean` | no | `false` | Show the current hex value as text inside the trigger |
| showAlpha | `boolean` | no | `false` | Add an alpha (opacity) slider and emit 8-digit hex when alpha < 100% |
| size | `"default" \| "compact"` | no | `default` | Component size |
| disabled | `boolean` | no | `false` | Whether the picker is disabled |
| required | `boolean` | no | `false` | Whether the field is required |
| error | `boolean` | no | `false` | Error state |
| helperText | `string` | no |  | Helper or error message |
| name | `string` | no |  | When set, a hidden `<input type="hidden">` carries the current hex value under this name so the picker participates in native form submission. |
| panelLabel | `string` | no |  | Accessible name of the open panel. Defaults to the field label followed by "colour picker", or "Colour picker" without a label. |
| saturationLabel | `string` | no | `Saturation and brightness` | Accessible name of the saturation and brightness area. |
| saturationValueText | `((saturation: number, brightness: number) => string)` | no | `(saturation: number, brightness: number) =>         `Saturation ${saturation}%, brightness ${brightness}%`` | Spoken value of the saturation and brightness area, given both as whole percentages. |
| hueLabel | `string` | no | `Hue` | Accessible name of the hue slider. |
| alphaLabel | `string` | no | `Alpha` | Accessible name of the alpha slider, shown with `showAlpha`. |
| hexLabel | `string` | no | `Hex colour value` | Accessible name of the hex text field. |
| triggerLabel | `((hex: string) => string)` | no | `(hex: string) => `Choose colour, ${hex}`` | Accessible name of the swatch trigger when there is no visible `label`, given the current hex value. Defaults to "Choose colour, " followed by the hex (`Choose colour, #118AB2`). A passed `aria-label` still wins. |
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the trigger |
