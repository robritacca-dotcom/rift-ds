# Map callout

The annotation beside a map point: a name in capitals over monospace readout lines.

Generated from the rift-ds registry and prop JSDoc, version 1.38.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: maps
- Import: `import { MapCallout } from 'rift-ds';`
- Deep import: `import { MapCallout } from 'rift-ds/components/MapCallout/MapCallout';`
- Rendering: server-renderable (no 'use client')
- Size: 0.3 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/map-callout
- Schema: https://rift-ds.com/schema/components/map-callout.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## MapCallout props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The place's name, set in capitals: "Santiago, CL". Intentionally shadows the native `title` tooltip attribute, which MapCallout does not expose. |
| lines | `ReactNode[]` | no | `[]` | Readout lines under the title, in order: a status, a reading, a route. |
| align | `"start" \| "end"` | no | `'start'` | Which way the text ranges. A callout sitting left of its marker ranges right so it hangs off the point; `start` is the ordinary reading order. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

Types from other packages: `ReactNode` (react).
