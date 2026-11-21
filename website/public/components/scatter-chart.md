# Scatter chart

Plots point clusters across two axes to show correlation and distribution.

Generated from the rift-ds registry and prop JSDoc, version 1.32.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: charts
- Import: `import { ScatterChart } from 'rift-ds/charts'; // needs the optional recharts peer`
- Deep import: `import { ScatterChart } from 'rift-ds/components/Chart/ScatterChart';`
- Rendering: client component (declares 'use client')
- Size: 2.0 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/scatter-chart
- Schema: https://rift-ds.com/schema/components/scatter-chart.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ScatterChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| locale | `string` | no |  | The BCP 47 locale the values, tooltips and value axis are written in, such as `de-DE`. Defaults to the nearest LocaleProvider's, else `en-US`. |
| datasets | `ScatterDatasetConfig[]` | yes |  | One or more scatter datasets to plot |
| xKey | `string` | no | `'x'` | Key in data for x-axis values |
| yKey | `string` | no | `'y'` | Key in data for y-axis values |
| xLabel | `string` | no | `'X'` | Display label for x-axis |
| yLabel | `string` | no | `'Y'` | Display label for y-axis |
| title | `string` | no |  | Chart title, in the shared chart header; it also names the figure. Note: this replaces the native `title` tooltip attribute, which the chart does not expose. |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| height | `number` | no | `350` | Chart area height in pixels |
| yAxisFormatter | `((value: number) => string)` | no |  | Y-axis tick formatter, such as a currency or a percent. Defaults to a short number in the chart's locale. |
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

### ScatterDatasetConfig

```ts
interface ScatterDatasetConfig {
  /** Display name for this dataset (shown in tooltip and legend) */
  name: string;
  /** Array of data points */
  data: Record<string, unknown>[];
  /** Fill colour */
  color?: string;
}
```

Types from other packages: `Record` (typescript).
