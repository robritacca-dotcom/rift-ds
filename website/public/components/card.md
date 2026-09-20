# Card

Card components for previews, navigation, and token documentation, from content cards to colour swatches and typography specimens.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { Card } from '@robr0/design-system';`
- Deep import: `import { Card } from '@robr0/design-system/components/Card/Card';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/card

## Card props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| variant | `"default" \| "case-study"` | no | `default` | Card variant |
| title | `string` | yes |  | Card title displayed below the preview. Note: this shadows the native `title` tooltip attribute, which Card does not expose. |
| children | `ReactNode` | no |  | Preview content rendered inside the card (default variant only) |
| interactive | `boolean` | no | `false` | Whether the card is interactive (hoverable) |
| className | `string` | no | `` | Additional CSS classes |
| href | `string` | no |  | Navigation href — renders the card as an <a> tag |
| coverSrc | `string` | no |  | Cover image src |
| cover | `ReactNode` | no |  | Cover content rendered in place of the image — for a cover that is drawn rather than photographed (an SVG, a chart, a live preview). Takes precedence over `coverSrc`, and fills the same fixed-ratio slot. |
| coverAlt | `string` | no |  | Cover image alt text |
| companyLogo | `string` | no |  | Path to the company logo shown in the eyebrow |
| companyName | `string` | no |  | Company name shown in the eyebrow |
| dek | `string` | no |  | Subtitle / dek line below the title |
| placeholder | `boolean` | no | `false` | Render as a disabled placeholder (no href, dimmed, not interactive) |
