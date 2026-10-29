# Bento tile

A feature tile for a bento grid, with a safe content area, a shader pair, solid or transparent background, and an overlay it opens into.

Generated from the rift-ds registry and prop JSDoc, version 1.17.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { BentoTile } from 'rift-ds';`
- Deep import: `import { BentoTile } from 'rift-ds/components/BentoTile/BentoTile';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/bento-tile

## BentoTile props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `ReactNode` | yes |  | The tile's heading, also the overlay's title. Note: this shadows the native `title` tooltip attribute, which BentoTile does not expose. |
| description | `ReactNode` | no |  | A line under the heading. |
| headingLevel | `2 \| 4 \| 3 \| 5 \| 6` | no | `3` | The heading level the title renders at, to fit the page's outline. Never `1`: a tile is never the page's top heading. |
| background | `"solid" \| "shader" \| "transparent"` | no | `shader` | What sits behind the content: the container surface with a shader pair over it (a wash of light in the bottom-left corner with a line texture laid over it, the default), the plain surface, or nothing. |
| highlight | `1 \| 2 \| 4 \| 3 \| 5 \| 6` | no |  | Which of the six shader pairs the tile wears: pair N is ambient colour N with texture N. Unset, tiles rotate through the set by their position among their siblings, so a grid of shader tiles comes out told apart. |
| align | `"center" \| "start" \| "end"` | no | `center` | Where the content sits in the space under the heading. Content that does not fit fades out at the edge it overflows. |
| children | `ReactNode` | no |  | The tile's content. Inert while the tile is expandable, since the whole tile is then the control. |
| expandedContent | `ReactNode` | no |  | What the overlay shows under the title. Passing it makes the tile expandable. |
| open | `boolean` | no |  | Whether the overlay is open (controlled). |
| defaultOpen | `boolean` | no | `false` | Whether the overlay starts open (uncontrolled). |
| onOpenChange | `((open: boolean) => void)` | no |  | Called when the overlay opens or closes. |
| expandLabel | `string` | no |  | Accessible name of the expand control. Defaults to "Open" and the title, when the title is a string. |
| closeLabel | `string` | no | `Close` | Accessible name of the overlay's close control. |
| className | `string` | no | `` | Additional CSS classes on the tile. |
