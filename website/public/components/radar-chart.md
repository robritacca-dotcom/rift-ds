# Radar chart

Multi-axis comparison of series across categories on a radial grid.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { RadarChart } from '@robr0/design-system/charts'; // needs the optional recharts peer`
- Deep import: `import { RadarChart } from '@robr0/design-system/components/Chart/RadarChart';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/radar-chart

## RadarChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | `Record<string, unknown>[]` | yes |  | Array of data objects — each should have a category key and one or more value keys |
| categoryKey | `string` | no | `subject` | Key in data for the category labels on each axis |
| series | `RadarSeriesConfig[]` | yes |  | One or more radar series to render |
| title | `string` | no |  | Chart title |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| height | `number` | no | `350` | Chart area height in pixels |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| className | `string` | no | `` | Additional CSS classes on the wrapper |
