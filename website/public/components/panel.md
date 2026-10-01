# Panel

The plain dashboard surface: a rounded container with no border or shadow, just padding and a gap.

Generated from the rift-ds registry and prop JSDoc, version 1.2.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { Panel } from 'rift-ds';`
- Deep import: `import { Panel } from 'rift-ds/components/Panel/Panel';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/panel

## Panel props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| padding | `"none" \| "default" \| "compact"` | no | `default` | Interior padding: 'default' uses --padding-500, 'compact' uses --padding-400, 'none' removes it |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | Panel content |
