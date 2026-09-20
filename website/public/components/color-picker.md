# Colour picker

Swatch trigger opening a saturation area, hue and alpha sliders, and a hex field; controlled or uncontrolled.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { ColorPicker } from '@robr0/design-system';`
- Deep import: `import { ColorPicker } from '@robr0/design-system/components/ColorPicker/ColorPicker';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/color-picker

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
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the trigger |
