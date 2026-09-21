# Slider

Range input for selecting a value between a minimum and maximum, in default and compact sizes.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://dragonspine-delta.vercel.app/api/mcp.

- Category: forms
- Import: `import { Slider } from '@robr0/design-system';`
- Deep import: `import { Slider } from '@robr0/design-system/components/Slider/Slider';`
- Rendering: client component (declares 'use client')
- Live docs: https://dragonspine-delta.vercel.app/components/slider

## Slider props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Label text rendered above the slider |
| helperText | `string` | no |  | Helper or error message rendered below the slider |
| error | `boolean` | no | `false` | Error state — recolours the helper text and marks the slider invalid |
| required | `boolean` | no | `false` | Marks the slider required and renders the required marker on its label |
| showValue | `boolean` | no | `false` | Shows the current value opposite the helper line |
| value | `number` | no | `50` | Current value |
| min | `number` | no | `0` | Minimum value |
| max | `number` | no | `100` | Maximum value |
| step | `number` | no | `1` | Step increment |
| size | `"default" \| "compact"` | no | `default` | Component size (not the native character-width `size` attribute) |
| onValueChange | `((value: number) => void)` | no |  | Convenience callback receiving the numeric value directly. Fires alongside `onChange`, which keeps the standard React event signature so form libraries work unmodified. |
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the <input> |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
