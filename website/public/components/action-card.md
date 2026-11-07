# Action card

A change an assistant proposes and the reader confirms, then the record of what happened, with Undo while it can be reversed.

Generated from the rift-ds registry and prop JSDoc, version 1.25.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: ai
- Import: `import { ActionCard } from 'rift-ds';`
- Deep import: `import { ActionCard } from 'rift-ds/components/ActionCard/ActionCard';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/action-card
- Schema: https://rift-ds.com/schema/components/action-card.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## ActionCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `ReactNode` | yes |  | What the change is, with how much it touches: "Cancel orders: 69 orders". Collides with the native `title` tooltip attribute on purpose: the card shows it. |
| detail | `ReactNode` | no |  | A quiet line under the title: what the change leaves alone, and why ("Left as they are: 2 already shipped"). |
| facts | `ActionReadoutFact[]` | no |  | What the change will do, a line each, as ActionReadout lists what one did: shown over Confirm, then kept, under the receipt, by the confirmed record. A dismissed or undone card is one row and shows none. Write them for the state the card is in. |
| icon | `ReactNode` | no |  | The leading mark: a Material Symbol name, or your own element. |
| status | `ActionCardStatus` | no | `proposed` | Where the change stands. Fully controlled by design: the host makes the change, so it owns whether it was made. `proposed` offers Confirm and Dismiss; the others are the card's record. Defaults to `proposed`. |
| receipt | `ReactNode` | no |  | What the confirmed card says was done: "69 orders cancelled". Defaults to the title. |
| tone | `"default" \| "destructive"` | no | `default` | The colour of Confirm: `destructive` for a change that takes something away (a cancellation, a refund). Defaults to `default`. |
| onConfirm | `(() => void)` | no |  | Called by Confirm. The host makes the change, then sets `status` to `confirmed`. |
| onDismiss | `(() => void)` | no |  | Called by Dismiss. The host sets `status` to `dismissed`; nothing changed. |
| onUndo | `(() => void)` | no |  | Called by Undo on a confirmed card, shown only when this is set. The host reverses the change and sets `status` to `undone`. |
| confirmLabel | `string` | no | `Confirm` | The Confirm button's words. Defaults to "Confirm". |
| dismissLabel | `string` | no | `Dismiss` | The Dismiss button's words. Not "Cancel", which beside a cancellation reads as the action itself. Defaults to "Dismiss". |
| undoLabel | `string` | no | `Undo` | The Undo button's words. Defaults to "Undo". |
| confirmedLabel | `string` | no | `Confirmed` | The read-out where Confirm stood, on a confirmed card that keeps its `facts`. Defaults to "Confirmed". |
| dismissedLabel | `string` | no | `Not changed` | What a dismissed card says after its title. Defaults to "Not changed". |
| undoneLabel | `string` | no | `Undone` | What an undone card says after its title. Defaults to "Undone". |
| className | `string` | no | `` | Additional CSS classes |
