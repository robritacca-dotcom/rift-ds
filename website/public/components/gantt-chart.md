# Gantt chart

Phases and tasks as bars on a shared timeline, with milestones, progress, and a today rule.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: charts
- Import: `import { GanttChart } from 'rift-ds';`
- Deep import: `import { GanttChart } from 'rift-ds/components/GanttChart/GanttChart';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/gantt-chart
- Schema: https://rift-ds.com/schema/components/gantt-chart.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## GanttChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `GanttChartItem[]` | yes |  | Task bars, in display order. |
| milestones | `GanttChartMilestone[]` | no | `[]` | Point-in-time markers, each rendered as its own diamond row at the end of its group. |
| range | `{ start: string; end: string; }` | no |  | Explicit timeline window (YYYY-MM-DD both ends). Without it the range fits the data. Either way the window snaps outward to whole months, so an explicit range starts on the first of its start month and runs to the end of its end month. |
| showToday | `boolean` | no | `true` | Draws the vertical today rule when today falls inside the range. |
| today | `string` | no |  | Pins the today rule to a given day (YYYY-MM-DD) instead of the render-time clock, so a statically built page and its hydrating client can never disagree about where the rule sits. |
| showGrid | `boolean` | no | `true` | Draws the faint vertical gridline at each month boundary behind the bars. |
| selectedId | `string` | no |  | Id of the highlighted item. Selection is controlled; pair it with `onItemClick`. |
| onItemClick | `((item: GanttChartItem) => void)` | no |  | Called with the item when a bar is clicked. Bars render as buttons only when this is set; without it the chart is inert and renders from a Server Component. |
| title | `string` | no |  | Chart title, in the shared chart header. Note: this shadows the native `title` tooltip attribute, which GanttChart does not expose. |
| subtitle | `string` | no |  | Description text below the title. |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| todayLabel | `string` | no | `'Today'` | The visible label on the today rule. Defaults to "Today". |
| locale | `string` | no | `'en-US'` | The BCP 47 locale the dates are written in: the month names on the axis ("Jan 2026", then "Feb"), and the days in each bar's and milestone's tooltip and accessible text ("Mar 9, 2026"). Defaults to `en-US`. |
| rangeLabel | `((start: string, end: string) => string)` | no | `` (start: string, end: string) => `${start} to ${end}` `` | The span in a bar's tooltip and accessible text, given its first and last day already formatted in `locale`. Defaults to "<start> to <end>". |
| progressLabel | `((percent: number) => string)` | no | `` (percent: number) => `${percent}% complete` `` | The completion in a bar's tooltip and accessible text, given the rounded percentage. Defaults to "<percent>% complete". |
| projectedLabel | `string` | no | `'projected'` | The word a `projected` bar's tooltip and accessible text carries. Defaults to "projected". |
| className | `string` | no | `''` | Additional CSS classes |

## Types

### GanttChartColor

Accent roles a Gantt bar or milestone can take — the core accent vocabulary shared with EventCalendar.

```ts
type GanttChartColor =
  | 'neutral'
  | 'coral'
  | 'violet'
  | 'cobalt'
  | 'amber'
  | 'gold'
  | 'mint';
```

### GanttChartItem

One task bar on the timeline.

```ts
interface GanttChartItem {
  /** Unique item identifier. Selection and the click callback key on it. */
  id: string;
  /** Task name, shown in the sticky label column. */
  label: string;
  /** First day of the bar (YYYY-MM-DD). */
  start: string;
  /** Last day of the bar, inclusive (YYYY-MM-DD). */
  end: string;
  /** Accent for the bar, from the core accent roles. Defaults to `neutral`. */
  color?: GanttChartColor;
  /** Completion from 0 to 100. When set, the bar shows a quiet track with the accent filling this share; without it the whole bar takes the accent. */
  progress?: number;
  /** Draws the bar as a dashed outline, for planned or tentative work whose dates are targets rather than commitments. */
  projected?: boolean;
  /** Group heading this item sits under. Items sharing a group render under one heading row; omit for a flat chart. */
  group?: string;
  /** Extra line appended to the bar's tooltip and accessible text, e.g. "Target: Q4 2026". */
  detail?: string;
}
```

### GanttChartMilestone

A point-in-time marker on the timeline, drawn as a diamond on its own row.

```ts
interface GanttChartMilestone {
  /** Unique milestone identifier. */
  id: string;
  /** Milestone name, shown in the sticky label column. */
  label: string;
  /** The day the diamond sits on (YYYY-MM-DD). */
  date: string;
  /** Accent for the diamond, from the core accent roles. Defaults to `neutral`. */
  color?: GanttChartColor;
  /** Group heading this milestone sits under, matching the items' group labels. */
  group?: string;
}
```
