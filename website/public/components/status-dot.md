# Status dot

The bare status mark: a dot in the five status roles, with an optional label and a live pulse for recording and online-now states.

Generated from the rift-ds registry and prop JSDoc, version 1.6.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: feedback
- Import: `import { StatusDot } from 'rift-ds';`
- Deep import: `import { StatusDot } from 'rift-ds/components/StatusDot/StatusDot';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/status-dot

## StatusDot props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| variant | `"error" \| "info" \| "positive" \| "warning" \| "neutral"` | no | `neutral` | Status role the dot carries — coloured through the plain-surface `--color-status-*-icon` steps. |
| size | `"sm" \| "md" \| "lg" \| "xs"` | no | `md` | Dot diameter, derived from the icon scale (half of `--icon-size-500/600/800`); `xs` is the 8px list-row mark, sized on the gap scale. |
| outline | `boolean` | no | `false` | Draws the dot hollow: a ring in the role's colour around an empty centre, for a settled or empty state that still holds its seat beside filled dots. |
| pulse | `boolean` | no | `false` | Radiates a repeating ring from the dot for a live state — recording, online now, deploy in flight. The ring stills under reduced motion. |
| label | `string` | no |  | Visible text beside the dot. Omit it for a bare dot only when the meaning has another home — a row label, or an `aria-label` passed through — since a colour alone announces nothing. |
| decorative | `boolean` | no | `false` | Renders the dot as decoration: no `role="status"`, hidden from assistive technology. For a dot repeated down a list, where the host announces the state in the row's own text and a live region per row would be noise. |
| className | `string` | no | `` | Additional CSS classes |
