# Empty state

The placeholder for a list, table, or search with nothing to show, or the result at the end of a flow: icon, headline, guidance, and a next action.

Generated from the rift-ds registry and prop JSDoc, version 1.29.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: feedback
- Import: `import { EmptyState } from 'rift-ds';`
- Deep import: `import { EmptyState } from 'rift-ds/components/EmptyState/EmptyState';`
- Rendering: server-renderable (no 'use client')
- Size: 0.7 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/empty-state
- Schema: https://rift-ds.com/schema/components/empty-state.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## EmptyState props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| icon | `string \| ReactNode` | no |  | Material Symbol icon name, or a custom element (e.g. an illustration) |
| title | `string` | yes |  | Short headline describing the empty condition. Note: this shadows the native `title` tooltip attribute, which EmptyState does not expose. |
| description | `string` | no |  | Supporting copy — say what to do next, not just what is missing |
| action | `ReactNode` | no |  | Action slot — typically one primary Button, optionally a secondary |
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| variant | `"plain" \| "bordered"` | no | `'plain'` | Visual treatment. `plain` sits directly on the page; `bordered` draws a dashed container, which reads better inside a card, table, or panel. |
| tone | `"default" \| "error" \| "positive"` | no | `'default'` | The icon tile's status colour. `default` is the quiet tile for nothing to show; `positive` is a result that worked (the end of a flow, with what happens next in the description and the action); `error` is a load or a step that failed. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

Types from other packages: `ReactNode` (react).
