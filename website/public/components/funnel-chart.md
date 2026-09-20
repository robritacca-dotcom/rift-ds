# Funnel chart

Ordered funnel stages as centred trapezoid bands, each sized by its share of the first stage.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: charts
- Import: `import { FunnelChart } from '@robr0/design-system/charts'; // needs the optional recharts peer`
- Deep import: `import { FunnelChart } from '@robr0/design-system/components/FunnelChart/FunnelChart';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/funnel-chart

## FunnelChart props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| data | `FunnelStage[]` | yes |  | Ordered stages, first stage widest. Each later stage's width is its share of the first. |
| title | `string` | no |  | Chart title, in the shared chart header. |
| subtitle | `string` | no |  | Description text below the title. |
| bare | `boolean` | no | `false` | Strip the card chrome (border, padding, fill) when the chart sits inside another panel that supplies the surface |
| height | `number` | no | `190` | Chart area height in pixels. |
| showLabels | `boolean` | no | `true` | Shows each stage's name beside its band. Turn off when a legend under the chart already carries the names. |
| minStageShare | `number` | no |  | Floor percentage from the stepped-bar rendering this chart used to have. Deprecated: The funnel now draws true trapezoids sized by value, so a height floor no longer applies; the prop is ignored. |
| className | `string` | no | `` | Additional CSS classes |
