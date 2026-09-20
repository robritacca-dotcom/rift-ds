# Panel

The plain dashboard surface: a rounded container with no border or shadow, just padding and a gap.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: layout
- Import: `import { Panel } from '@robr0/design-system';`
- Deep import: `import { Panel } from '@robr0/design-system/components/Panel/Panel';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/panel

## Panel props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| padding | `"none" \| "default" \| "compact"` | no | `default` | Interior padding: 'default' uses --padding-lg, 'compact' uses --padding-md, 'none' removes it |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | Panel content |
