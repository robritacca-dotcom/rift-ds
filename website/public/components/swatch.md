# Swatch

Clickable colour tile for preset palettes and picker triggers, with a theme-aware selection ring.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: forms
- Import: `import { Swatch } from '@robr0/design-system';`
- Deep import: `import { Swatch } from '@robr0/design-system/components/Swatch/Swatch';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/swatch

## Swatch props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `string` | yes |  | The colour this swatch shows — any valid CSS colour, typically a hex value |
| label | `string` | no |  | Accessible name for the swatch. Defaults to the colour value, which is meaningful but terse — prefer a human name ("Teal 07") when you have one. |
| selected | `boolean` | no | `false` | Selected state — renders the selection ring and sets aria-pressed |
| size | `"default" \| "compact"` | no | `default` | Swatch size |
| shape | `"circle" \| "square"` | no | `circle` | Corner treatment — circle matches the site's preset grids; square suits picker triggers |
| disabled | `boolean` | no | `false` | Whether the swatch is disabled |
| className | `string` | no | `` | Additional CSS classes |
