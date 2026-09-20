# Line chart

Multi-series line chart for trends over time, with per-series colours and a summary row.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { LineChart } from '@robr0/design-system/charts'; // needs the optional recharts peer`
- Deep import: `import { LineChart } from '@robr0/design-system/components/Chart/LineChart';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/line-chart

## LineChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | `Record<string, unknown>[]` | yes |  | Array of data objects |
| xKey | `string` | no | `label` | Key in data for x-axis values |
| series | `LineSeriesConfig[]` | yes |  | One or more line series to render |
| title | `string` | no |  | Chart title |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| height | `number` | no | `350` | Chart area height in pixels |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| className | `string` | no | `` | Additional CSS classes on the wrapper |
