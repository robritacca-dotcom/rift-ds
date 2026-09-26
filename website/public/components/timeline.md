# Timeline

Ordered sequences: histories and steppers.

Generated from the rift-ds registry and prop JSDoc, version 1.0.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Timeline } from 'rift-ds';`
- Deep import: `import { Timeline } from 'rift-ds/components/Timeline/Timeline';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/timeline

## Timeline props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| variant | `"default" \| "company"` | no |  | Selects the flat step/event layout — the default when omitted Selects the grouped layout: roles nested under a company logo |
| items | `TimelineItem[] \| TimelineCompany[]` | yes |  | Ordered list of steps/events Ordered list of company/tool entries |
| orientation | `"horizontal" \| "vertical"` | no |  | `vertical` timeline (default) or `horizontal` stepper |
| numbered | `boolean` | no |  | Number the markers 1..n instead of dots |
| className | `string` | no | `` | Additional CSS classes |
