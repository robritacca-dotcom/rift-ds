# Resource timeline

Hours within one day: a row per person or resource and a bar from each start to its end, on an axis of hours.

Generated from the rift-ds registry and prop JSDoc, version 1.39.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { ResourceTimeline } from 'rift-ds';`
- Deep import: `import { ResourceTimeline } from 'rift-ds/components/ResourceTimeline/ResourceTimeline';`
- Rendering: server-renderable (no 'use client')
- Size: 1.6 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/resource-timeline
- Schema: https://rift-ds.com/schema/components/resource-timeline.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Gantt chart](https://rift-ds.com/components/gantt-chart.md) instead when the bars run over days and months rather than hours within one day.

## ResourceTimeline props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| rows | `ResourceTimelineRow[]` | yes |  | The rows, top to bottom. |
| startHour | `number` | no | `6` | The first hour the axis shows, 0 to 23. Defaults to 6. |
| endHour | `number` | no | `22` | The hour the axis ends at, 1 to 24. Defaults to 22. |
| now | `string` | no |  | A line at this time (`HH:MM`), such as the time now. |
| label | `string` | yes |  | The timeline's name, read before its rows ("Bookings, Tuesday 4 March"). |
| rowHeaderLabel | `string` | no | `'Name'` | The header of the label column. Defaults to "Name". |
| onBarClick | `((bar: ResourceTimelineBar, row: ResourceTimelineRow) => void)` | no |  | Called with the bar and its row when a bar is pressed; bars are buttons only when it is set. |
| locale | `string` | no | `'en-US'` | The BCP 47 locale the times are written in, such as `de-DE`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

## Types

### ResourceTimelineBar

One stretch of time on a row: a booking, a meeting, a run.

```ts
interface ResourceTimelineBar {
  /** A stable id for the bar. */
  id: string;
  /** When it starts, as 24-hour `HH:MM`. */
  start: string;
  /** When it ends, as 24-hour `HH:MM`. */
  end: string;
  /** A short label on the bar ("Front desk", "Break"). */
  label?: string;
  /** The bar's accent. Defaults to `neutral`. */
  color?: ResourceTimelineColor;
}
```

### ResourceTimelineColor

The accents a bar can take, the core accent roles the calendar's events use.

```ts
type ResourceTimelineColor =
  "neutral" | "coral" | "violet" | "cobalt" | "amber" | "gold" | "mint";
```

### ResourceTimelineRow

One row of the timeline: a person, a room, a machine.

```ts
interface ResourceTimelineRow {
  /** A stable id for the row. */
  id: string;
  /** What the row is, shown in the label column. */
  label: string;
  /** The row's bars, in any order. */
  bars: ResourceTimelineBar[];
}
```
