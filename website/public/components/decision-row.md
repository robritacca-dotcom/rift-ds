# Decision row

One item waiting on a yes or a no, as a list row that settles to the decision taken, with Undo while it can be reversed.

Generated from the rift-ds registry and prop JSDoc, version 1.30.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { DecisionRow } from 'rift-ds';`
- Deep import: `import { DecisionRow } from 'rift-ds/components/DecisionRow/DecisionRow';`
- Rendering: client component (declares 'use client')
- Size: 3.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/decision-row
- Schema: https://rift-ds.com/schema/components/decision-row.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Action card](https://rift-ds.com/components/action-card.md) instead when an assistant proposes the change in a chat reply.
- Use [Widget](https://rift-ds.com/components/widget.md) instead when the rows only report or link, with no decision to take.

## DecisionRow props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | What is waiting on a decision: who asked and for what. Collides with the native `title` tooltip attribute on purpose: the row shows it. |
| description | `string` | no |  | A quiet second line: the dates, the amount, the reason given. |
| leading | `ReactNode` | no |  | A leading mark: an Avatar, a StatusDot, an icon. Decorative unless the element names itself. |
| meta | `ReactNode` | no |  | A trailing fact before the decision: when it was asked, how long it has waited. |
| status | `DecisionRowStatus` | no | `"pending"` | Where the decision stands, for controlled use. Pair with `onStatusChange`. Unset, the row keeps its own, starting at `defaultStatus`. |
| defaultStatus | `DecisionRowStatus` | no | `'pending'` | Where it stands to begin with, for uncontrolled use. |
| onStatusChange | `((status: DecisionRowStatus) => void)` | no |  | Fires with the new status when the reader accepts, declines or undoes. |
| onAccept | `(() => void)` | no |  | Fires when the reader accepts. |
| onDecline | `(() => void)` | no |  | Fires when the reader declines. |
| onUndo | `(() => void)` | no |  | Offers Undo on a settled row, which returns it to pending and fires this. Leave it unset where a decision cannot be reversed. |
| tone | `"default" \| "destructive"` | no | `'default'` | The accept button's colour: `destructive` for a decision whose yes takes something away (remove a member, delete a draft), as ActionCard's `tone` does for a change. |
| acceptLabel | `string` | no | `'Accept'` | The accept button's words. |
| declineLabel | `string` | no | `'Decline'` | The decline button's words. |
| acceptedLabel | `string` | no | `'Accepted'` | The settled mark's words once accepted. |
| declinedLabel | `string` | no | `'Declined'` | The settled mark's words once declined. |
| undoLabel | `string` | no | `'Undo'` | The undo button's words. |
| settledAnnouncement | `((title: string, outcome: string) => string)` | no | `` (rowTitle, outcome) => `${outcome}: ${rowTitle}` `` | What is announced when the row settles, given its title and the settled mark's words: "Accepted: Room booking". |
| className | `string` | no | `''` | Additional CSS classes |
| ref | `Ref<HTMLDivElement>` | no |  | A ref onto the row's root `<div>`. |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The buttons follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |

## Types

### DecisionRowStatus

Where a decision stands: waiting on the reader, or settled one way or the other.

```ts
type DecisionRowStatus = 'pending' | 'accepted' | 'declined';
```

Types from other packages: `HTMLDivElement` (typescript), `ReactNode` (react), `Ref` (react).
