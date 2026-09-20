# Gantt chart

Phases and tasks as bars on a shared timeline, with milestones, progress, and a today rule.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { GanttChart } from '@robr0/design-system';`
- Deep import: `import { GanttChart } from '@robr0/design-system/components/GanttChart/GanttChart';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/gantt-chart

## GanttChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `GanttChartItem[]` | yes |  | Task bars, in display order. |
| milestones | `GanttChartMilestone[]` | no | `[]` | Point-in-time markers, each rendered as its own diamond row at the end of its group. |
| range | `{ start: string; end: string; }` | no |  | Explicit timeline window (YYYY-MM-DD both ends). Without it the range fits the data, snapped outward to whole months. |
| showToday | `boolean` | no | `true` | Draws the vertical today rule when today falls inside the range. |
| today | `string` | no |  | Pins the today rule to a given day (YYYY-MM-DD) instead of the render-time clock, so a statically built page and its hydrating client can never disagree about where the rule sits. |
| showGrid | `boolean` | no | `true` | Draws the faint vertical gridline at each month boundary behind the bars. |
| selectedId | `string` | no |  | Id of the highlighted item. Selection is controlled; pair it with `onItemClick`. |
| onItemClick | `((item: GanttChartItem) => void)` | no |  | Called with the item when a bar is clicked. Bars render as buttons only when this is set; without it the chart is inert and renders from a Server Component. |
| title | `string` | no |  | Chart title, in the shared chart header. |
| subtitle | `string` | no |  | Description text below the title. |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| className | `string` | no | `` | Additional CSS classes |
