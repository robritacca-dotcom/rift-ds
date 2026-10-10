# Agent rail

The companion rail of an agent product: the agent's portrait over tabbed panes for activity, approvals, automations, and personalization.

Generated from the rift-ds registry and prop JSDoc, version 1.6.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { AgentRail } from 'rift-ds';`
- Deep import: `import { AgentRail } from 'rift-ds/components/AgentRail/AgentRail';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/agent-rail

## AgentRail props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| profile | `AgentRailProfile` | no |  | The agent this rail belongs to, rendered as the header's portrait block. |
| tabs | `AgentRailTab[]` | yes |  | The rail's tabs, in display order. Each carries its own pane. |
| activeTab | `string` | yes |  | Id of the tab on stage. The rail is controlled, so the host owns the state. |
| onTabChange | `((id: string) => void)` | no |  | Fires with the chosen tab's id. |
| tabsLabel | `string` | no | `Agent views` | Accessible name for the tab strip. |
| ariaLabel | `string` | no |  | Accessible name for the rail itself. |
| onCollapse | `(() => void)` | no |  | Fires when the rail's collapse affordance is pressed. The button renders only when this is given, pinned to the rail's top trailing corner. It is a chevron rather than a cross on purpose: the host's own close control is usually a cross a few pixels away, and two of them side by side read as two ways to dismiss the same thing. |
| collapseLabel | `string` | no | `Collapse the agent panel` | Accessible name for the collapse affordance. |
| footer | `ReactNode` | no |  | Rendered under the pane, outside its scroll — a sign-out row, a quiet hint. |
| className | `string` | no | `` | Additional CSS classes |
