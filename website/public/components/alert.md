# Alert

Contextual feedback with status variants, optional dismiss, and compact sizing.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: feedback
- Import: `import { Alert } from '@robr0/design-system';`
- Deep import: `import { Alert } from '@robr0/design-system/components/Alert/Alert';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://robertritacca.com/components/alert

## Alert props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | no |  | Alert title text |
| description | `string` | no |  | Alert description / body text |
| variant | `"error" \| "info" \| "positive" \| "warning" \| "neutral"` | no | `info` | Alert variant determines colour and icon |
| size | `"default" \| "compact"` | no | `default` | Component size |
| dismissible | `boolean` | no | `false` | Whether the alert can be dismissed |
| icon | `string` | no |  | Custom icon override — Material Symbol name |
| onDismiss | `(() => void)` | no |  | Callback when dismiss button is clicked |
| className | `string` | no | `` | Additional CSS classes |
