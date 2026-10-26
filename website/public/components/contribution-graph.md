# Contribution graph

A year of activity, one cell per day.

Generated from the rift-ds registry and prop JSDoc, version 1.14.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: charts
- Import: `import { ContributionGraph } from 'rift-ds';`
- Deep import: `import { ContributionGraph } from 'rift-ds/components/ContributionGraph/ContributionGraph';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/contribution-graph

## ContributionGraph props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| days | `ContributionDay[]` | yes |  | One entry per day, ordered oldest to newest |
| title | `string` | no |  | Chart title, in the shared chart header. Note: this replaces the native `title` tooltip attribute, which the graph does not expose. |
| subtitle | `string` | no |  | Description text below the title. |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| caption | `string` | no |  | Summary line shown under the grid, e.g. "496 contributions in the last year" |
| showMonthLabels | `boolean` | no | `true` | Show month labels above the grid |
| showLegend | `boolean` | no | `true` | Show the Less → More legend under the grid |
| gridLabel | `string` | no |  | Accessible name for the grid of day cells, which renders as one image. Falls back to `caption`, then to "Contribution activity". |
| lessLabel | `string` | no | `Less` | The legend's low-end word. Defaults to "Less". |
| moreLabel | `string` | no | `More` | The legend's high-end word. Defaults to "More". |
| locale | `string` | no | `en-US` | The BCP 47 locale the dates are written in: the default month labels above the grid ("Jan" to "Dec" in `en-US`) and the date in each cell's default tooltip ("Jul 8, 2026"). Defaults to `en-US`. |
| monthLabels | `string[]` | no |  | The month labels above the grid: twelve entries, January first. Defaults to the short month names in `locale` ("Jan" to "Dec" in `en-US`); a list of any other length falls back to the default. |
| cellLabel | `((count: number, date: Date) => string)` | no |  | A day cell's tooltip, given its count and date. Defaults to "No contributions", "1 contribution" or "N contributions", then "on" and the date in `locale`'s short form (e.g. "Jul 8, 2026"). |
| className | `string` | no | `` | Additional CSS classes |
