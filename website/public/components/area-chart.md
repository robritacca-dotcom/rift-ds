# Area chart

Filled area chart for showing volume over time, with stacked and single-series variants.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { AreaChart } from '@robr0/design-system/charts'; // needs the optional recharts peer`
- Deep import: `import { AreaChart } from '@robr0/design-system/components/Chart/AreaChart';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/area-chart

## AreaChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | `Record<string, unknown>[]` | yes |  | Array of data objects |
| xKey | `string` | no | `label` | Key in data for x-axis values |
| series | `AreaSeriesConfig[]` | yes |  | One or more area series to render |
| stacked | `boolean` | no | `false` | Whether areas stack on top of each other |
| title | `string` | no |  | Chart title |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| height | `number` | no | `350` | Chart area height in pixels |
| showLegend | `boolean` | no | `true` | Show the legend under a multi-series chart |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| className | `string` | no | `` | Additional CSS classes on the wrapper |
