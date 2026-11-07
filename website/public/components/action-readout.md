# Action readout

What a confirmed change did: a title over a list of facts, worked out from the records as they were just before it.

Generated from the rift-ds registry and prop JSDoc, version 1.25.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ActionReadout } from 'rift-ds';`
- Deep import: `import { ActionReadout } from 'rift-ds/components/ActionReadout/ActionReadout';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/action-readout
- Schema: https://rift-ds.com/schema/components/action-readout.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ActionReadout props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `ReactNode` | yes |  | What was done, with how much: "69 orders cancelled". Collides with the native `title` tooltip attribute on purpose: the readout shows it. |
| facts | `ActionReadoutFact[]` | yes |  | What it did, a line each: the status it moved, the money it touched, who it reached. |
| icon | `ReactNode` | no |  | A leading mark beside the title: a Material Symbol name, or your own element. |
| className | `string` | no | `` | Additional CSS classes |
