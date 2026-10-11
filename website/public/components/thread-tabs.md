# Thread tabs

The strip of open chat sessions: pill tabs with status dots and hover-revealed close buttons, a new-tab action, and animated enter and exit.

Generated from the rift-ds registry and prop JSDoc, version 1.7.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ThreadTabs } from 'rift-ds';`
- Deep import: `import { ThreadTabs } from 'rift-ds/components/ThreadTabs/ThreadTabs';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/thread-tabs

## ThreadTabs props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| tabs | `ThreadTab[]` | yes |  | The open tabs, in display order. A tab added between renders glides open in place; a removed one folds away while its neighbours slide over. |
| activeId | `string` | no |  | Id of the tab on stage. Its pill renders filled and carries `aria-current`. |
| onTabSelect | `((id: string) => void)` | no |  | Fires with the clicked tab's id. |
| onTabClose | `((id: string) => void)` | no |  | Fires with the tab's id when its close button is pressed, or Delete lands on the focused tab. The close affordance renders only when this is given. |
| statusLabels | `Partial<Record<ThreadTabStatus, string>>` | no |  | Spoken text for each tab status, read after the tab's label; the dot itself is decorative. Merged over the English defaults (Working, Unread, Needs input, Failed). |
| closeLabel | `string` | no | `Close thread` | Accessible name for a tab's close button; the tab's label is appended after it. |
| onAdd | `(() => void)` | no |  | Fires when the trailing new-tab button is pressed. The button renders only when this is given. |
| addLabel | `string` | no | `New thread` | Accessible name for the new-tab button. |
| ariaLabel | `string` | no | `Open threads` | Accessible name for the tab strip. |
| className | `string` | no | `` | Additional CSS classes |
