# Usage card

An agent's budgets at a glance: context window and plan limits as meter rows with reset captions.

Generated from the rift-ds registry and prop JSDoc, version 1.4.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { UsageCard } from 'rift-ds';`
- Deep import: `import { UsageCard } from 'rift-ds/components/UsageCard/UsageCard';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/usage-card

## UsageCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `UsageItem[]` | yes |  | The budgets to show, one meter row each |
| title | `string` | no |  | Card title in the shared chart-chrome header |
| subtitle | `string` | no |  | Supporting line under the title |
| thresholds | `{ warning?: number; error?: number; } \| undefined` | no |  | Fractions of an item's max where its fill recolours to warning and then error |
| bare | `boolean` | no | `false` | Chrome off (no border, padding, or fill) for use inside a panel that supplies the surface |
| className | `string` | no | `` | Additional CSS classes |
