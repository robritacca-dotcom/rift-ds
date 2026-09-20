# Scatter chart

Plots point clusters across two axes to show correlation and distribution.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { ScatterChart } from '@robr0/design-system/charts'; // needs the optional recharts peer`
- Deep import: `import { ScatterChart } from '@robr0/design-system/components/Chart/ScatterChart';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/scatter-chart

## ScatterChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| datasets | `ScatterDatasetConfig[]` | yes |  | One or more scatter datasets to plot |
| xKey | `string` | no | `x` | Key in data for x-axis values |
| yKey | `string` | no | `y` | Key in data for y-axis values |
| xLabel | `string` | no | `X` | Display label for x-axis |
| yLabel | `string` | no | `Y` | Display label for y-axis |
| title | `string` | no |  | Chart title |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| height | `number` | no | `350` | Chart area height in pixels |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| className | `string` | no | `` | Additional CSS classes on the wrapper |
