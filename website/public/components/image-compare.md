# Image compare

Before-and-after image comparison with a draggable divider, keyboard control, and corner labels.

Generated from the rift-ds registry and prop JSDoc, version 1.7.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { ImageCompare } from 'rift-ds';`
- Deep import: `import { ImageCompare } from 'rift-ds/components/ImageCompare/ImageCompare';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/image-compare

## ImageCompare props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| beforeSrc | `string` | yes |  | Source of the image revealed on the left of the divider |
| afterSrc | `string` | yes |  | Source of the image revealed on the right of the divider |
| beforeAlt | `string` | yes |  | Alt text for the before image |
| afterAlt | `string` | yes |  | Alt text for the after image |
| beforeLabel | `string` | no | `Before` | Corner label over the before side |
| afterLabel | `string` | no | `After` | Corner label over the after side |
| showLabels | `boolean` | no | `true` | Whether the corner labels render |
| position | `number` | no |  | Divider position as a percentage from the left (controlled) |
| defaultPosition | `number` | no | `50` | Initial divider position for uncontrolled use |
| onPositionChange | `((position: number) => void)` | no |  | Convenience callback receiving the divider position on every change |
| aspectRatio | `string` | no | `16 / 10` | CSS aspect-ratio of the frame (both images are sized to cover it) |
| className | `string` | no | `` | Additional CSS classes |
