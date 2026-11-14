# Alert

Contextual feedback with status variants, optional dismiss, and compact sizing.

Generated from the rift-ds registry and prop JSDoc, version 1.28.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: feedback
- Import: `import { Alert } from 'rift-ds';`
- Deep import: `import { Alert } from 'rift-ds/components/Alert/Alert';`
- Rendering: server-renderable (no 'use client')
- Size: 0.5 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/alert
- Schema: https://rift-ds.com/schema/components/alert.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Alert props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | no |  | Alert title text. Note: this shadows the native `title` tooltip attribute, which Alert does not expose. |
| description | `string` | no |  | Alert description / body text |
| variant | `"error" \| "info" \| "positive" \| "warning" \| "neutral"` | no | `'info'` | Alert variant determines colour and icon |
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| dismissible | `boolean` | no | `false` | Whether the alert can be dismissed |
| icon | `string \| ReactNode` | no |  | Custom icon override — Material Symbol name (string) or custom element (ReactNode) |
| onDismiss | `(() => void)` | no |  | Callback when dismiss button is clicked |
| dismissLabel | `string` | no | `'Dismiss alert'` | Accessible name for the dismiss button |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The dismiss button follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |

Types from other packages: `ReactNode` (react).
