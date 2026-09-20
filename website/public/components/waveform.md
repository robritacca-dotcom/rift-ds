# Waveform

Voice made visible: a row of bars dancing on the shared twelve-slot cycle, or tracking a live analyser level by level.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: ai
- Import: `import { Waveform } from '@robr0/design-system';`
- Deep import: `import { Waveform } from '@robr0/design-system/components/Waveform/Waveform';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/waveform

## Waveform props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| state | `"idle" \| "listening" \| "speaking"` | no | `idle` | What the audio channel is doing: `idle` parks the bars low and still, `listening` runs a gentle half-height wave, `speaking` runs the full one. Ignored while `levels` drives the bars. |
| bars | `number` | no | `5` | How many bars the wave has. |
| levels | `number[]` | no |  | Live amplitudes from a real audio analyser, one 0–1 value per bar. Providing them switches the component to controlled mode: the CSS wave stops and each bar tracks its level, easing between updates. |
| size | `"default" \| "compact"` | no | `default` | Bar height scale — `default` sits on the md icon size, `compact` on sm. |
| label | `string` | no |  | What a screen reader hears the indicator say. Defaults per state ("Listening", "Speaking", "Microphone idle"). |
| className | `string` | no | `` | Additional CSS classes |
