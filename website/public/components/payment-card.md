# Payment card

The face of a payment card at a card’s aspect ratio, with the brand, last four digits, holder, expiry and a frozen state.

Generated from the rift-ds registry and prop JSDoc, version 1.39.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { PaymentCard } from 'rift-ds';`
- Deep import: `import { PaymentCard } from 'rift-ds/components/PaymentCard/PaymentCard';`
- Rendering: server-renderable (no 'use client')
- Size: 0.9 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/payment-card
- Schema: https://rift-ds.com/schema/components/payment-card.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alternatives

- Use [Card](https://rift-ds.com/components/card.md) instead when the tile previews any other content, or links to a page.

## PaymentCard props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| brand | `ReactNode` | yes |  | The issuer's wordmark or logo, at the top start of the face. Text, or a node such as an `<img>` with its own alt text. When it is text it also opens the card's accessible name. |
| holderName | `string` | yes |  | The name printed on the card, at the bottom start. |
| last4 | `string` | yes |  | The last four digits of the card number, drawn as `•• 5555`. |
| expiry | `PaymentCardExpiry` | no |  | When the card expires, written in `locale` as a two-digit month and year. |
| network | `ReactNode` | no |  | The card network's mark at the bottom end, such as a logo `<img>` with its alt text. |
| label | `string` | no |  | A tier or kind printed at the top end, such as "Plus" or "Virtual". |
| tone | `"default" \| "neutral"` | no | `'default'` | The face's colour: `default` is the solid inverse face a card reads as in a wallet, `neutral` a quieter face on the container ramp. |
| frozen | `boolean` | no | `false` | Draws the card frozen: the face dimmed under a lock and the frozen label. |
| size | `"default" \| "compact"` | no | `'default'` | The face's width step; the height follows from the card's aspect ratio. |
| locale | `string` | no | `'en-US'` | The BCP 47 locale the expiry is written in, such as `ar-EG`. Defaults to `en-US`. This component can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. |
| endingInLabel | `string` | no | `'ending in'` | Read before the last four digits, out of sight. Default "ending in". |
| expiresLabel | `string` | no | `'Expires'` | Read before the expiry, out of sight. Default "Expires". |
| frozenLabel | `string` | no | `'Frozen'` | Shown over a frozen face. Default "Frozen". |
| cardLabel | `((parts: PaymentCardLabelParts) => string)` | no | `` ({ brand, holderName, last4 }: PaymentCardLabelParts) => `${brand ? `${brand} card` : 'Card'} ending in ${last4}, ${holderName}` `` | The card's accessible name, written from its parts. Default: the brand when it is text, then "card ending in 5555, Jordan Reyes". |
| className | `string` | no | `''` | Additional CSS classes on the face |

## Keyboard

Nothing here takes focus, so there are no keys. A test holds that.

## Types

### PaymentCardExpiry

A card's expiry: the month (1 to 12) and the full year.

```ts
type PaymentCardExpiry = { month: number; year: number };
```

### PaymentCardLabelParts

What the default accessible name is written from.

```ts
type PaymentCardLabelParts = {
  /** The brand, when `brand` is text; otherwise undefined. */
  brand?: string;
  /** The holder's name. */
  holderName: string;
  /** The last four digits. */
  last4: string;
  /** The tier, when `label` is given. */
  label?: string;
};
```

Types from other packages: `ReactNode` (react).
