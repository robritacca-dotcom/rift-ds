# Combo chart

Bar and line series in one chart, with an optional second y-axis for pairs in different units, like spend and ROAS.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { ComboChart } from '@robr0/design-system/charts'; // needs the optional recharts peer`
- Deep import: `import { ComboChart } from '@robr0/design-system/components/Chart/ComboChart';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/combo-chart

## ComboChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | `Record<string, unknown>[]` | yes |  | Array of data objects |
| xKey | `string` | no | `label` | Key in data for x-axis values |
| barKey | `string` | yes |  | Key in data for the bar series |
| barLabel | `string` | no |  | Display name for the bar series, shown in the tooltip; defaults to the key |
| lineKey | `string` | yes |  | Key in data for the line series |
| lineLabel | `string` | no |  | Display name for the line series, shown in the tooltip; defaults to the key |
| barColor | `string` | no |  | Bar fill colour (CSS value or token reference) |
| lineColor | `string` | no |  | Line stroke colour (CSS value or token reference) |
| secondaryAxis | `boolean` | no | `true` | Plot the line on its own right-hand y-axis, for series in different units |
| title | `string` | no |  | Chart title |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| height | `number` | no | `350` | Chart area height in pixels |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| className | `string` | no | `` | Additional CSS classes on the wrapper |
