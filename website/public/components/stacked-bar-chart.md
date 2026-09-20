# Stacked bar chart

Bars split into stacked segments to compare totals and their composition.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { StackedBarChart } from '@robr0/design-system/charts'; // needs the optional recharts peer`
- Deep import: `import { StackedBarChart } from '@robr0/design-system/components/Chart/StackedBarChart';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/stacked-bar-chart

## StackedBarChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | `Record<string, unknown>[]` | yes |  | Array of data objects |
| xKey | `string` | no | `label` | Key in data for x-axis values |
| series | `BarSeriesConfig[]` | yes |  | One or more bar series to render (stacked) |
| title | `string` | no |  | Chart title |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| height | `number` | no | `350` | Chart area height in pixels |
| yAxisFormatter | `((value: number) => string)` | no |  | Y-axis tick formatter |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| className | `string` | no | `` | Additional CSS classes on the wrapper |
