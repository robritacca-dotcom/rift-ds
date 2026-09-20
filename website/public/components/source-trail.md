# Source trail

The sources an agent opened while answering, as a collapsible list with per-item status.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { SourceTrail } from '@robr0/design-system';`
- Deep import: `import { SourceTrail } from '@robr0/design-system/components/SourceTrail/SourceTrail';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/source-trail

## SourceTrail props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `SourceTrailItem[]` | yes |  | The sources, in the order the agent opened them. |
| title | `string` | no |  | Header text. Left unset, it is computed from the items — "Reading 3 sources" while any is still pending or active, "Read 3 sources" once every visit has settled. |
| streaming | `boolean` | no | `false` | Still researching: newly appended rows animate in. |
| open | `boolean` | no |  | Open state for controlled use. Pair with `onOpenChange`. |
| defaultOpen | `boolean` | no | `true` | Open state for uncontrolled use. |
| onOpenChange | `((open: boolean) => void)` | no |  | Fires whenever the panel opens or closes. |
| className | `string` | no | `` | Additional CSS classes |
