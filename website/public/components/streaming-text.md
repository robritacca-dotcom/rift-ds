# Streaming text

Progressive reveal for text arriving in chunks, with a blinking cursor while more is coming.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { StreamingText } from '@robr0/design-system';`
- Deep import: `import { StreamingText } from '@robr0/design-system/components/StreamingText/StreamingText';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/streaming-text

## StreamingText props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| text | `string` | yes |  | The text received so far. Grow it across renders as chunks arrive; the reveal animates through the appended part. A value that does not extend the previous one is treated as a new message and reveals from the start. |
| streaming | `boolean` | no | `false` | Whether the source is still producing text. Keeps the cursor visible between chunks, when the reveal has caught up but more may arrive. |
| floorCps | `number` | no |  | Slowest the reveal ever runs, in characters per second — the pace a thin trickle of chunks types at. Defaults to MOTION_STREAM_FLOOR_CPS. |
| drainMs | `number` | no |  | However much text is waiting, it is fully on screen within this long, in milliseconds — the rate rises with the backlog. Defaults to MOTION_STREAM_DRAIN_MS. |
| charIntervalMs | `number` | no |  | The retired interval between reveal steps; when set, its equivalent rate becomes the reveal's floor. Deprecated: The reveal is frame-driven now — pace it with `floorCps` and `drainMs` instead. |
| cursor | `boolean` | no | `true` | Shows the blinking cursor while streaming or revealing. |
| onRevealComplete | `(() => void)` | no |  | Fires once when the reveal catches up with `text` after `streaming` has ended — the moment the message is fully on screen. |
| className | `string` | no | `` | Additional CSS classes |

## createStreamReveal props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| onUpdate | `(visible: string) => void` | yes |  | Receives the visible slice each time the reveal moves it. |
| floorCps | `number` | no |  | Slowest the reveal ever runs, in characters per second. Defaults to MOTION_STREAM_FLOOR_CPS. |
| drainMs | `number` | no |  | However much text is waiting, it is fully on screen within this long, in milliseconds. Defaults to MOTION_STREAM_DRAIN_MS. |
| paced | `boolean \| (() => boolean)` | no |  | Whether appended text is paced at all. Pass false (or a function returning false — it is read on every append) to show each chunk whole: the reduced-motion path. |

## useStreamReveal props

No own props; native attributes pass through.
