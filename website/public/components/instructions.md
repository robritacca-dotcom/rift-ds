# Instructions

Step-by-step guidance with numbered badges, connecting lines, and horizontal layout.

Generated from the rift-ds registry and prop JSDoc, version 1.5.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Instructions } from 'rift-ds';`
- Deep import: `import { Instructions } from 'rift-ds/components/Instructions/Instructions';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/instructions

## Instructions props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | no |  | Instructions title |
| steps | `InstructionStep[]` | yes |  | Array of instruction steps |
| size | `"default" \| "compact"` | no | `default` | Component size |
| direction | `"horizontal" \| "vertical"` | no | `vertical` | Layout direction |
| numbered | `boolean` | no | `true` | Whether to show step numbers instead of icons |
| className | `string` | no | `` | Additional CSS classes |
