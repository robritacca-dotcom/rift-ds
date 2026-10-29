# Toast

Temporary notification with status variants, auto-dismiss, and stacking via ToastProvider.

Generated from the rift-ds registry and prop JSDoc, version 1.18.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: feedback
- Import: `import { Toast } from 'rift-ds';`
- Deep import: `import { Toast } from 'rift-ds/components/Toast/Toast';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/toast

## Toast props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | no |  | Toast title text. Note: this shadows the native `title` tooltip attribute, which Toast does not expose. |
| description | `string` | no |  | Toast description / body text |
| variant | `"error" \| "info" \| "positive" \| "warning" \| "neutral"` | no | `info` | Toast variant |
| dismissible | `boolean` | no | `true` | Whether the toast can be manually dismissed. The dismiss button renders only when `onDismiss` is also given |
| icon | `ReactNode` | no |  | Custom icon override — Material Symbol name (string) or custom element (ReactNode) |
| onDismiss | `(() => void)` | no |  | Fires when the dismiss button is pressed. The button renders only when this is given (and `dismissible` is not false); the host owns removing the toast |
| dismissLabel | `string` | no | `Dismiss notification` | Accessible name of the dismiss button |
| className | `string` | no | `` | Additional CSS classes |

## ToastProvider props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | `ReactNode` | yes |  | Children that can access the toast context |
| position | `"top-right" \| "top-left" \| "bottom-right" \| "bottom-left" \| "top-center" \| "bottom-center"` | no | `bottom-right` | Position of the toast stack |
| maxToasts | `number` | no | `5` | Maximum number of visible toasts |
| regionLabel | `string` | no | `Notifications` | Accessible name of the toast stack's region landmark |
| dismissLabel | `string` | no | `Dismiss notification` | Accessible name of every toast's dismiss button |
