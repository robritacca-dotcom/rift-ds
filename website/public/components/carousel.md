# Carousel

Sliding content viewer with navigation arrows, dot indicators, auto-play, and keyboard support.

Generated from the rift-ds registry and prop JSDoc, version 1.18.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Carousel } from 'rift-ds';`
- Deep import: `import { Carousel } from 'rift-ds/components/Carousel/Carousel';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/carousel

## Carousel props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | no |  | Carousel slides |
| showDots | `boolean` | no | `true` | Show dot indicators |
| showArrows | `boolean` | no | `true` | Show previous/next navigation arrows |
| autoPlay | `boolean` | no | `false` | Auto-play slides |
| autoPlayInterval | `number` | no | `5000` | Auto-play interval in milliseconds |
| loop | `boolean` | no | `false` | Whether navigation should loop |
| slide | `number` | no |  | Index of the active slide (zero-based), for a controlled carousel. Leave it undefined to let the component keep its own position, seeded from `defaultSlide`. |
| defaultSlide | `number` | no | `0` | Index of the slide shown on first render when the carousel is uncontrolled (zero-based) |
| onSlideChange | `((index: number) => void)` | no |  | Called with the index of the slide being moved to |
| previousLabel | `string` | no | `Previous slide` | Accessible name of the previous-slide arrow |
| nextLabel | `string` | no | `Next slide` | Accessible name of the next-slide arrow |
| slideLabel | `((position: number, count: number) => string)` | no | `(position: number, count: number) => `Slide ${position} of ${count}`` | Accessible name of each slide, given its 1-based position and the slide count |
| slideRoleDescription | `string` | no | `slide` | Role description announced for each slide |
| dotsLabel | `string` | no | `Slide indicators` | Accessible name of the dot indicators' tab list |
| dotLabel | `((position: number) => string)` | no | `(position: number) => `Go to slide ${position}`` | Accessible name of each dot indicator, given its slide's 1-based position |
| className | `string` | no | `` | Additional CSS classes |
