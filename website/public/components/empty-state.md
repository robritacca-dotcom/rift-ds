# Empty state

The placeholder for a list, table, or search with nothing to show: icon, headline, guidance, and a next action.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: feedback
- Import: `import { EmptyState } from '@robr0/design-system';`
- Deep import: `import { EmptyState } from '@robr0/design-system/components/EmptyState/EmptyState';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/empty-state

## EmptyState props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| icon | `ReactNode` | no |  | Material Symbol icon name, or a custom element (e.g. an illustration) |
| title | `string` | yes |  | Short headline describing the empty condition |
| description | `string` | no |  | Supporting copy — say what to do next, not just what is missing |
| action | `ReactNode` | no |  | Action slot — typically one primary Button, optionally a secondary |
| size | `"default" \| "compact"` | no | `default` | Component size |
| variant | `"plain" \| "bordered"` | no | `plain` | Visual treatment. `plain` sits directly on the page; `bordered` draws a dashed container, which reads better inside a card, table, or panel. |
| className | `string` | no | `` | Additional CSS classes |
