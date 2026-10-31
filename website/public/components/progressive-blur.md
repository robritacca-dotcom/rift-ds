# Progressive blur

A backdrop blur that dissolves along one edge, with an optional page tint that fades in.

Generated from the rift-ds registry and prop JSDoc, version 1.19.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: effects
- Import: `import { ProgressiveBlur } from 'rift-ds';`
- Deep import: `import { ProgressiveBlur } from 'rift-ds/components/ProgressiveBlur/ProgressiveBlur';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/progressive-blur

## ProgressiveBlur props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| side | `"top" \| "bottom"` | no | `top` | The side the blur is anchored to, as Drawer names its edge: fully frosted there, dissolving to clear toward the opposite side. `top` sits behind a header, `bottom` behind a toolbar or a footer bar. |
| tinted | `boolean` | no | `false` | Whether the page-surface tint shows over the blur. It fades on change, so a header can bring it in once the page has scrolled; the blur itself never fades. |
| className | `string` | no | `` | Additional CSS classes on the root. |
