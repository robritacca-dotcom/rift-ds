# Toast

Temporary notification with status variants, auto-dismiss, and stacking via ToastProvider.

Generated from the rift-ds registry and prop JSDoc, version 1.3.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: feedback
- Import: `import { Toast } from 'rift-ds';`
- Deep import: `import { Toast } from 'rift-ds/components/Toast/Toast';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/toast

## Toast props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | no |  | Toast title text |
| description | `string` | no |  | Toast description / body text |
| variant | `"error" \| "info" \| "positive" \| "warning" \| "neutral"` | no | `info` | Toast variant |
| dismissible | `boolean` | no | `true` | Whether the toast can be manually dismissed |
| icon | `ReactNode` | no |  | Custom icon override — Material Symbol name (string) or custom element (ReactNode) |
| className | `string` | no | `` | Additional CSS classes |

## ToastProvider props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | Children that can access the toast context |
| position | `"top-right" \| "top-left" \| "bottom-right" \| "bottom-left" \| "top-center" \| "bottom-center"` | no | `bottom-right` | Position of the toast stack |
| maxToasts | `number` | no | `5` | Maximum number of visible toasts |

## useToast props

No own props; native attributes pass through.
