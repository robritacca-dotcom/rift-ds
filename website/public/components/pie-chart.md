# Pie chart

Proportional share of a whole as a pie or donut, with per-slice colours.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { PieChart } from '@robr0/design-system/charts'; // needs the optional recharts peer`
- Deep import: `import { PieChart } from '@robr0/design-system/components/Chart/PieChart';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/pie-chart

## PieChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | `PieSlice[]` | yes |  | Array of slices |
| title | `string` | no |  | Chart title |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| height | `number` | no | `350` | Chart area height in pixels |
| innerRadius | `number` | no | `0` | Inner radius for donut style (0 = solid pie) |
| outerRadius | `number` | no | `140` | Outer radius |
| showLegend | `boolean` | no | `true` | Show legend |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| className | `string` | no | `` | Additional CSS classes on the wrapper |
