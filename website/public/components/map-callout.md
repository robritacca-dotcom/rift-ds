# Map callout

The annotation beside a map point: a name in capitals over monospace readout lines.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: maps
- Import: `import { MapCallout } from '@robr0/design-system';`
- Deep import: `import { MapCallout } from '@robr0/design-system/components/MapCallout/MapCallout';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/map-callout

## MapCallout props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | The place's name, set in capitals: "Santiago, CL". Intentionally shadows the native `title` tooltip attribute, which MapCallout does not expose. |
| lines | `ReactNode[]` | no | `[]` | Readout lines under the title, in order: a status, a reading, a route. |
| align | `"start" \| "end"` | no | `start` | Which way the text ranges. A callout sitting left of its marker ranges right so it hangs off the point; `start` is the ordinary reading order. |
| className | `string` | no | `` | Additional CSS classes |
