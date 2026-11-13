# Thread tabs

The strip of open chat sessions: pill tabs with status dots and hover-revealed close buttons, a new-tab action, and animated enter and exit.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ThreadTabs } from 'rift-ds';`
- Deep import: `import { ThreadTabs } from 'rift-ds/components/ThreadTabs/ThreadTabs';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/thread-tabs
- Schema: https://rift-ds.com/schema/components/thread-tabs.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ThreadTabs props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| tabs | `ThreadTab[]` | yes |  | The open tabs, in display order. A tab added between renders glides open in place; a removed one folds away while its neighbours slide over. |
| activeId | `string` | no |  | Id of the tab on stage. Its pill renders filled and carries `aria-current`. |
| onTabSelect | `((id: string) => void)` | no |  | Fires with the clicked tab's id. |
| onTabClose | `((id: string) => void)` | no |  | Fires with the tab's id when its close button is pressed, or Delete lands on the focused tab. The close affordance renders only when this is given. |
| statusLabels | `Partial<Record<ThreadTabStatus, string>>` | no |  | Spoken text for each tab status, read after the tab's label; the dot itself is decorative. Merged over the English defaults (Working, Unread, Needs input, Failed). |
| closeLabel | `string \| ((title: string) => string)` | no | `'Close thread'` | Accessible name for a tab's close button. A string is followed by a colon and the tab's label ("Close thread: Q3 plan"); a function is given the label and returns the whole name, so a translation can put the label where its grammar needs it. |
| onAdd | `(() => void)` | no |  | Fires when the trailing new-tab button is pressed. The button renders only when this is given. |
| addLabel | `string` | no | `'New thread'` | Accessible name for the new-tab button. |
| ariaLabel | `string` | no | `'Open threads'` | Accessible name for the tab strip. |
| className | `string` | no | `''` | Additional CSS classes |

## Types

### ThreadTab

```ts
interface ThreadTab {
  /** Stable identifier: `activeId` matches against it and the callbacks report it. */
  id: string;
  /** The tab's one-line label. Overflow fades out under a trailing mask rather than clipping; the full text stays readable in the tab's native tooltip. */
  label: string;
  /** The tab's leading icon — Material Symbol name (string) or custom element (ReactNode). */
  icon?: string | React.ReactNode;
  /** The thread's state, drawn as a dot leading the label: `working` pulses in neutral, `unread`, `waiting` and `error` are solid in the info, warning and error roles. An `idle` tab draws no dot: a strip has no left edge to keep, so only a state worth a glance takes the room. The dot is decorative; the state is also read aloud through `statusLabels`. */
  status?: ThreadTabStatus;
  /** Legacy boolean for `status: 'unread'`, ignored when `status` is set. @deprecated Use `status: 'unread'` instead. */
  unread?: boolean;
}
```

### ThreadTabStatus

What a tab's leading dot reports — ThreadPanel's thread statuses, so a session reads the same in the rail and in the strip.

```ts
type ThreadTabStatus = 'idle' | 'working' | 'unread' | 'waiting' | 'error';
```

Types from other packages: `Partial` (typescript), `ReactNode` (react), `Record` (typescript).
