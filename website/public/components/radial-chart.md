# Radial chart

Concentric progress rings for completion and KPI readouts.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { RadialChart } from '@robr0/design-system/charts'; // needs the optional recharts peer`
- Deep import: `import { RadialChart } from '@robr0/design-system/components/Chart/RadialChart';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/radial-chart

## RadialChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | `RadialDataItem[]` | yes |  | Array of data items — each renders as a concentric ring |
| maxValue | `number` | no | `100` | Maximum value for the radial scale (100 = percentage) |
| title | `string` | no |  | Chart title |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| height | `number` | no | `350` | Chart area height in pixels |
| innerRadius | `number` | no | `40` | Inner radius of the innermost ring |
| outerRadius | `number` | no | `140` | Outer radius of the outermost ring |
| showLegend | `boolean` | no | `true` | Show legend |
| centerLabel | `string` | no |  | Headline printed in the donut hole, e.g. "46%"; pairs best with showLegend false, since the legend shifts the rings above centre |
| centerSublabel | `string` | no |  | Small caption under the centre headline |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| className | `string` | no | `` | Additional CSS classes on the wrapper |
