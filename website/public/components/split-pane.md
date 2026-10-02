# Split pane

Two resizable regions with a draggable, keyboard-operable divider between them.

Generated from the rift-ds registry and prop JSDoc, version 1.3.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: layout
- Import: `import { SplitPane } from 'rift-ds';`
- Deep import: `import { SplitPane } from 'rift-ds/components/SplitPane/SplitPane';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/split-pane

## SplitPane props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | The two panes, in order. Children beyond the first two are ignored. |
| direction | `"horizontal" \| "vertical"` | no | `horizontal` | Which way the panes sit: side by side, or stacked. |
| split | `number` | no |  | First pane's share as a percentage (controlled). Pair with `onSplitChange`. |
| defaultSplit | `number` | no | `50` | First pane's share as a percentage (uncontrolled initial value). |
| minSplit | `number` | no | `10` | Smallest share the first pane can be dragged to, as a percentage. |
| maxSplit | `number` | no | `90` | Largest share the first pane can be dragged to, as a percentage. |
| onSplitChange | `((split: number) => void)` | no |  | Fires with the new percentage on every drag step or keyboard resize. |
| separatorLabel | `string` | no | `Resize panes` | Accessible name for the resize handle. |
| className | `string` | no | `` | Additional CSS classes |
