# Treemap

Nested rectangles sized by value for part-to-whole breakdowns.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { Treemap } from '@robr0/design-system/charts'; // needs the optional recharts peer`
- Deep import: `import { Treemap } from '@robr0/design-system/components/Chart/Treemap';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/treemap

## Treemap props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | `TreemapDataItem[]` | yes |  | Hierarchical data — each item needs `name` and `size` (or `children`) |
| dataKey | `string` | no | `size` | Key used for sizing rectangles |
| title | `string` | no |  | Chart title |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| height | `number` | no | `350` | Chart area height in pixels |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| className | `string` | no | `` | Additional CSS classes on the wrapper |
