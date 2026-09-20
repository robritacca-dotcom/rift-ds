# Slider

Range input for selecting a value between a minimum and maximum, in default and compact sizes.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { Slider } from '@robr0/design-system';`
- Deep import: `import { Slider } from '@robr0/design-system/components/Slider/Slider';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/slider

## Slider props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number` | no | `50` | Current value |
| min | `number` | no | `0` | Minimum value |
| max | `number` | no | `100` | Maximum value |
| step | `number` | no | `1` | Step increment |
| size | `"default" \| "compact"` | no | `default` | Component size (not the native character-width `size` attribute) |
| onValueChange | `((value: number) => void)` | no |  | Convenience callback receiving the numeric value directly. Fires alongside `onChange`, which keeps the standard React event signature so form libraries work unmodified. |
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the <input> |
| ariaLabel | `string` | no | `Slider` | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
