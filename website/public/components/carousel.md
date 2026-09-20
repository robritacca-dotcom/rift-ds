# Carousel

Sliding content viewer with navigation arrows, dot indicators, auto-play, and keyboard support.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { Carousel } from '@robr0/design-system';`
- Deep import: `import { Carousel } from '@robr0/design-system/components/Carousel/Carousel';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/carousel

## Carousel props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | no |  | Carousel slides |
| showDots | `boolean` | no | `true` | Show dot indicators |
| showArrows | `boolean` | no | `true` | Show previous/next navigation arrows |
| autoPlay | `boolean` | no | `false` | Auto-play slides |
| autoPlayInterval | `number` | no | `5000` | Auto-play interval in milliseconds |
| loop | `boolean` | no | `false` | Whether navigation should loop |
| onSlideChange | `((index: number) => void)` | no |  | Callback when active slide changes |
| className | `string` | no | `` | Additional CSS classes |
