# Status dot

The bare status mark: a dot in the five status roles, with an optional label and a live pulse for recording and online-now states.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: feedback
- Import: `import { StatusDot } from '@robr0/design-system';`
- Deep import: `import { StatusDot } from '@robr0/design-system/components/StatusDot/StatusDot';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/status-dot

## StatusDot props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| variant | `"error" \| "info" \| "positive" \| "warning" \| "neutral"` | no | `neutral` | Status role the dot carries — coloured through the plain-surface `--color-status-*-icon` steps. |
| size | `"sm" \| "md" \| "lg"` | no | `md` | Dot diameter, derived from the icon scale (half of `--icon-size-sm/md/lg`). |
| pulse | `boolean` | no | `false` | Radiates a repeating ring from the dot for a live state — recording, online now, deploy in flight. The ring stills under reduced motion. |
| label | `string` | no |  | Visible text beside the dot. Omit it for a bare dot only when the meaning has another home — a row label, or an `aria-label` passed through — since a colour alone announces nothing. |
| className | `string` | no | `` | Additional CSS classes |
