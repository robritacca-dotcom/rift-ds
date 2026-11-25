# Checklist

Tasks with a done state each, an owner and an action, under a count done and a progress bar.

Generated from the rift-ds registry and prop JSDoc, version 1.37.1. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Checklist } from 'rift-ds';`
- Deep import: `import { Checklist } from 'rift-ds/components/Checklist/Checklist';`
- Rendering: client component (declares 'use client')
- Size: 4.0 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/checklist
- Schema: https://rift-ds.com/schema/components/checklist.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Agent plan](https://rift-ds.com/components/agent-plan.md) instead when the list is an agent’s plan that it works through itself, with live step states.

## Checklist props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `ChecklistItem[]` | yes |  | The tasks, in the order they are best done. |
| title | `string` | no |  | The checklist's heading, which names its section. Note: this shadows the native `title` tooltip attribute, which Checklist does not expose. |
| values | `string[]` | no |  | The ids of the done tasks, for a controlled list. Leave undefined to let the list keep its own, seeded from `defaultValues`. |
| defaultValues | `string[]` | no |  | The ids done on first render when the list is uncontrolled. |
| onValuesChange | `((values: string[]) => void)` | no |  | Fires with every done id after a task is ticked or unticked. |
| readOnly | `boolean` | no | `false` | Shows the done marks without letting them change, for a list that reports what the host already knows (a setup's steps, a review's checks). |
| showProgress | `boolean` | no | `true` | Shows how many tasks are done, as a count and a bar, under the heading. Defaults to true. |
| progressLabel | `((done: string, total: string) => string)` | no | `` (done: string, total: string) => `${done} of ${total} done` `` | The progress count, given the done and total tasks already written in the resolved locale. Defaults to "3 of 5 done". |
| ownerLabel | `((name: string) => string)` | no | `` (name: string) => `Owner: ${name}` `` | The owner avatar's accessible name, given the owner's name. Defaults to "Owner: <name>". |
| doneLabel | `string` | no | `'Done'` | A read-only row's state, read after its label. Defaults to "Done". |
| notDoneLabel | `string` | no | `'Not done'` | A read-only row's state when it is not done. Defaults to "Not done". |
| locale | `string` | no |  | The BCP 47 locale the counts are written in, such as `ar-EG`. Defaults to the nearest LocaleProvider's, else `en-US`. |
| size | `"default" \| "compact"` | no | `'default'` | Row density: `compact` for a checklist in a side panel. |
| headingLevel | `2 \| 4 \| 3` | no | `3` | The title's place in the outline. Defaults to 3, a part of a section. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The tasks follows the WAI-ARIA checkbox pattern (https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/).

| Key | What it does |
| --- | --- |
| Space | Ticks the box, or clears it when it is ticked. |

## Types

### ChecklistItem

One task on a checklist.

```ts
interface ChecklistItem {
  /** A stable id, which `values` holds while the task is done. */
  id: string;
  /** What the task is ("Invite your team"). */
  label: string;
  /** A line under the label on what doing it involves. */
  description?: string;
  /** Who the task is with: a name, and an image for their avatar. */
  owner?: { name: string; src?: string };
  /** A control at the end of the row that does the task or opens it, such as a compact Button or a Link. */
  action?: React.ReactNode;
  /** Holds the task as it is: it cannot be ticked or unticked. */
  disabled?: boolean;
}
```

Types from other packages: `ReactNode` (react).
