# Card stack

A deck of cards showing one at a time, flipped through with a lift-and-settle animation.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { CardStack } from '@robr0/design-system';`
- Deep import: `import { CardStack } from '@robr0/design-system/components/CardStack/CardStack';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/card-stack

## CardStack props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | no |  | The cards, in order. The first child starts on top. |
| index | `number` | no |  | Controlled top card, as an index into `children`. Pair with `onIndexChange`. Omit to let the stack own its position. |
| defaultIndex | `number` | no | `0` | Initial top card when uncontrolled. |
| onIndexChange | `((index: number) => void)` | no |  | Fires when the top card changes, with the new index. |
| peek | `number` | no | `2` | How many card edges peek out behind the top card. |
| loop | `boolean` | no | `true` | Wrap from the last card back to the first. Off, the stack stops at both ends. |
| advanceOnClick | `boolean` | no | `true` | Clicking the top card flips to the next. Clicks that land on a link or control inside the card are left alone, so a card can still carry its own actions. |
| label | `string` | no |  | Accessible name for the stack, e.g. "Open roles". |
| className | `string` | no | `` | Additional CSS classes |
