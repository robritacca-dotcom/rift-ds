# Combo chart

Bar and line series in one chart, with an optional second y-axis for pairs in different units, like spend and ROAS.

Generated from the rift-ds registry and prop JSDoc, version 1.36.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: charts
- Import: `import { ComboChart } from 'rift-ds/charts'; // needs the optional recharts peer`
- Deep import: `import { ComboChart } from 'rift-ds/components/Chart/ComboChart';`
- Rendering: client component (declares 'use client')
- Size: 2.4 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/combo-chart
- Schema: https://rift-ds.com/schema/components/combo-chart.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ComboChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| locale | `string` | no |  | The BCP 47 locale the values, tooltips and value axis are written in, such as `de-DE`. Defaults to the nearest LocaleProvider's, else `en-US`. |
| data | `Record<string, unknown>[]` | yes |  | Array of data objects |
| xKey | `string` | no | `'label'` | Key in data for x-axis values |
| barKey | `string` | yes |  | Key in data for the bar series |
| barLabel | `string` | no |  | Display name for the bar series, shown in the tooltip; defaults to the key |
| lineKey | `string` | yes |  | Key in data for the line series |
| lineLabel | `string` | no |  | Display name for the line series, shown in the tooltip; defaults to the key |
| barColor | `string` | no |  | Bar fill colour (CSS value or token reference) |
| lineColor | `string` | no |  | Line stroke colour (CSS value or token reference) |
| secondaryAxis | `boolean` | no | `true` | Plot the line on its own right-hand y-axis, for series in different units |
| title | `string` | no |  | Chart title, in the shared chart header; it also names the figure. Note: this replaces the native `title` tooltip attribute, which the chart does not expose. |
| subtitle | `string` | no |  | Description text below the title |
| summaryItems | `ChartSummaryItem[]` | no |  | Summary stats displayed in the header |
| height | `number` | no | `350` | Chart area height in pixels |
| yAxisFormatter | `((value: number) => string)` | no |  | Tick formatter for the bar series' axis, such as a currency. Defaults to a short number in the chart's locale. |
| secondaryAxisFormatter | `((value: number) => string)` | no |  | Tick formatter for the line series' axis when `secondaryAxis` draws it, such as a percent. Defaults to a short number in the chart's locale. |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| onActiveChange | `ChartActiveHandler` | no |  | Called when the active point changes: with the row of `data` under the pointer or the keyboard cursor and its index, and with `null, null` once neither is on the plot. For a headline figure that follows the cursor. |
| className | `string` | no | `''` | Additional CSS classes on the wrapper |

## Keyboard

The chart takes focus and the arrow keys step through its data points, which is the charting engine’s own keyboard layer. Those keys belong to the platform, so no test of this library presses them.

## Types

### ChartActiveHandler

The `onActiveChange` callback of the charts drawn from one `data` array
over a shared x-axis (Area, Line, Bar, StackedBar, Combo): the active row
of `data` and its index, or `null, null` when no point is active.

```ts
type ChartActiveHandler = (
  datum: Record<string, unknown> | null,
  index: number | null,
) => void;
```

### ChartSummaryItem

```ts
interface ChartSummaryItem {
  /** Label shown above the value */
  label: string;
  /** Formatted value to display */
  value: string | number;
}
```

Types from other packages: `Record` (typescript).
