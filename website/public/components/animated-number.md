# Animated number

A number that counts to its value: count-up on mount, eased tweens on change, tabular digits that never jitter.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { AnimatedNumber } from '@robr0/design-system';`
- Deep import: `import { AnimatedNumber } from '@robr0/design-system/components/AnimatedNumber/AnimatedNumber';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/animated-number

## AnimatedNumber props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `number` | yes |  | The number to display. Changing it tweens the display from the previous value. |
| decimals | `number` | no | `0` | Decimal places shown throughout the tween and at rest. Ignored when `format` is set. |
| format | `((value: number) => string)` | no |  | Formats the displayed number — currency, units, compact notation. Called on every animation frame, so keep it pure and cheap. |
| duration | `number` | no | `800` | Tween length in ms. Defaults to the shared `MOTION_COUNT_UP_MS` constant; an animation pace, so the tween is skipped entirely under reduced motion. |
| animateOnMount | `boolean` | no | `true` | Counts up from zero on first render. Turn off to arrive settled and animate only on later changes. |
| className | `string` | no | `` | Additional CSS classes |
