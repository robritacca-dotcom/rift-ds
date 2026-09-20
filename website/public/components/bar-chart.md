# Bar chart

Vertical bars for comparing values across categories or time, with summary stats and tooltips.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { BarChart } from '@robr0/design-system/charts'; // needs the optional recharts peer`
- Deep import: `import { BarChart } from '@robr0/design-system/components/Chart/BarChart';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/bar-chart

## BarChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | `Record<string, unknown>[]` | yes |  | Array of data objects |
| xKey | `string` | no | `label` | Key in data for x-axis values |
| yKey | `string` | no | `value` | Key in data for y-axis values |
| dataLabel | `string` | no | `Value` | Display name for the data series (shown in tooltip) |
| title | `string` | no |  | Chart title |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| barColor | `string` | no |  | Bar fill colour — CSS value or token reference |
| height | `number` | no | `350` | Chart area height in pixels |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| className | `string` | no | `` | Additional CSS classes on the wrapper |
