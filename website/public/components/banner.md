# Banner

Full-width status strip for page-level announcements, with an action slot and optional dismissal.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: feedback
- Import: `import { Banner } from '@robr0/design-system';`
- Deep import: `import { Banner } from '@robr0/design-system/components/Banner/Banner';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/banner

## Banner props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| variant | `"error" \| "info" \| "positive" \| "warning" \| "neutral"` | no | `info` | Status variant determines colour and default icon |
| title | `string` | no |  | Short leading emphasis before the body text. Deliberately shadows the native `title` attribute — a banner never needs a hover tooltip. |
| children | `ReactNode` | no |  | Banner body content — a single line of text, rendered inside the banner's paragraph |
| icon | `string` | no |  | Custom icon override — Material Symbol name |
| action | `ReactNode` | no |  | Action slot on the trailing edge, for a compact Button or link |
| dismissible | `boolean` | no | `false` | Whether the banner shows a dismiss button |
| onDismiss | `(() => void)` | no |  | Callback when the dismiss button is clicked |
| align | `"center" \| "start"` | no | `start` | Horizontal alignment of the banner content |
| className | `string` | no | `` | Additional CSS classes |
