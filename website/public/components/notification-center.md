# Notification centre

A persistent notification inbox with unread count, filter tabs, and per-item actions.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: feedback
- Import: `import { NotificationCenter } from '@robr0/design-system';`
- Deep import: `import { NotificationCenter } from '@robr0/design-system/components/NotificationCenter/NotificationCenter';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/notification-center

## NotificationCenter props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | no | `Notifications` | Heading shown in the header. |
| unreadCount | `number` | no |  | How many notifications are unread, shown under the heading. Omit to hide the line. |
| onMarkAllRead | `(() => void)` | no |  | Fires when "Mark all read" is pressed; the control only renders when this is set. |
| markAllLabel | `string` | no | `Mark all read` | Text of the mark-all-read control. |
| tabs | `NotificationCenterTab[]` | no |  | Filter tabs under the header, each with an optional count. |
| activeTab | `string` | no |  | Active tab value for controlled use. Pair with `onTabChange`. |
| defaultTab | `string` | no |  | Initially active tab value for uncontrolled use. Defaults to the first tab. |
| onTabChange | `((value: string) => void)` | no |  | Fires with the newly selected tab's value. |
| emptyState | `ReactNode` | no |  | What to render when there are no children — defaults to a built-in empty state. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | The notifications, newest first — typically NotificationItems. |

## NotificationItem props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | no | `Notifications` | One-line headline, e.g. who did what. |
| time | `string` | no |  | When it happened, as already-formatted text like "2m" or "Mon". |
| unread | `boolean` | no | `false` | Marks the notification as not yet read: a dot beside the time and emphasised title. |
| media | `ReactNode` | no |  | Leading visual — a Material Symbol name (string) or a custom element (e.g. an Avatar). |
| actions | `ReactNode` | no |  | Action row under the body — typically compact Buttons like "Reply" or "Retry". |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | Supporting copy under the title. |
