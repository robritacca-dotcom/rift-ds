# Contribution graph

A year of activity, one cell per day.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { ContributionGraph } from '@robr0/design-system';`
- Deep import: `import { ContributionGraph } from '@robr0/design-system/components/ContributionGraph/ContributionGraph';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/contribution-graph

## ContributionGraph props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| days | `ContributionDay[]` | yes |  | One entry per day, ordered oldest to newest |
| title | `string` | no |  | Chart title, in the shared chart header. |
| subtitle | `string` | no |  | Description text below the title. |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| caption | `string` | no |  | Summary line shown under the grid, e.g. "496 contributions in the last year" |
| showMonthLabels | `boolean` | no | `true` | Show month labels above the grid |
| showLegend | `boolean` | no | `true` | Show the Less → More legend under the grid |
| className | `string` | no | `` | Additional CSS classes |
