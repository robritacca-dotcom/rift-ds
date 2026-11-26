# Pie chart

Proportional share of a whole as a pie or donut, with per-slice colours.

Generated from the rift-ds registry and prop JSDoc, version 1.39.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: charts
- Import: `import { PieChart } from 'rift-ds/charts'; // needs the optional recharts peer`
- Deep import: `import { PieChart } from 'rift-ds/components/Chart/PieChart';`
- Rendering: client component (declares 'use client')
- Size: 1.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/pie-chart
- Schema: https://rift-ds.com/schema/components/pie-chart.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## PieChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| locale | `string` | no |  | The BCP 47 locale the values, tooltips and value axis are written in, such as `de-DE`. Defaults to the nearest LocaleProvider's, else `en-US`. |
| data | `PieSlice[]` | yes |  | Array of slices |
| title | `string` | no |  | Chart title, in the shared chart header; it also names the figure. Note: this replaces the native `title` tooltip attribute, which the chart does not expose. |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| height | `number` | no | `350` | Chart area height in pixels |
| innerRadius | `string \| number` | no | `0` | Inner radius for a donut (0 for a solid pie): pixels, or a percentage of the room the plot has, such as `'60%'`, so the hole scales with the chart. |
| outerRadius | `string \| number` | no | `'90%'` | Outer radius: pixels, or a percentage of the room the plot has once the header and legend take theirs. Defaults to `'90%'`, so the pie fits any `height` without running into its legend. |
| showLegend | `boolean` | no | `true` | Show legend |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| className | `string` | no | `''` | Additional CSS classes on the wrapper |

## Keyboard

The chart takes focus and the arrow keys step through its data points, which is the charting engine’s own keyboard layer. Those keys belong to the platform, so no test of this library presses them.

## Types

### ChartSummaryItem

```ts
interface ChartSummaryItem {
  /** Label shown above the value */
  label: string;
  /** Formatted value to display */
  value: string | number;
}
```

### PieSlice

```ts
interface PieSlice {
  /** Display name */
  name: string;
  /** Numeric value */
  value: number;
  /** Slice fill colour */
  color?: string;
}
```
