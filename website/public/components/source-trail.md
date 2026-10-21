# Source trail

The sources an agent opened while answering, as a collapsible list with per-item status.

Generated from the rift-ds registry and prop JSDoc, version 1.11.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { SourceTrail } from 'rift-ds';`
- Deep import: `import { SourceTrail } from 'rift-ds/components/SourceTrail/SourceTrail';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/source-trail

## SourceTrail props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `SourceTrailItem[]` | yes |  | The sources, in the order the agent opened them. |
| title | `string` | no |  | Header text. Left unset, it is computed from the items — "Reading 3 sources" while any is still pending or active, "Read 3 sources" once every visit has settled. Note: this shadows the native `title` tooltip attribute, which SourceTrail does not expose. |
| readingLabel | `((count: number) => string)` | no | `(count: number) =>   `Reading ${count} source${count === 1 ? '' : 's'}`` | The computed header while any visit is pending or active, or while `streaming`, given the number of sources. Defaults to "Reading 1 source" or "Reading N sources". Ignored when `title` is set. |
| readLabel | `((count: number) => string)` | no | `(count: number) => `Read ${count} source${count === 1 ? '' : 's'}`` | The computed header once every visit has settled, given the number of sources. Defaults to "Read 1 source" or "Read N sources". Ignored when `title` is set. |
| statusLabels | `Partial<Record<SourceTrailStatus, string>>` | no |  | Visually hidden text announcing each row's status after its source. Merged over the English defaults (Not opened yet, Reading now, Read). |
| streaming | `boolean` | no | `false` | Still researching: newly appended rows animate in. |
| open | `boolean` | no |  | Open state for controlled use. Pair with `onOpenChange`. |
| defaultOpen | `boolean` | no | `true` | Open state for uncontrolled use. |
| onOpenChange | `((open: boolean) => void)` | no |  | Fires whenever the panel opens or closes. |
| linkComponent | `LinkComponent` | no |  | The component its links render with, such as Next.js's `Link`, so they navigate through the app's router; passed on to each source's SourceChip. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
| className | `string` | no | `` | Additional CSS classes |
