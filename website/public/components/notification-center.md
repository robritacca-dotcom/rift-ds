# Notification centre

A persistent notification inbox with unread count, filter tabs, and per-item actions.

Generated from the rift-ds registry and prop JSDoc, version 1.11.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: feedback
- Import: `import { NotificationCenter } from 'rift-ds';`
- Deep import: `import { NotificationCenter } from 'rift-ds/components/NotificationCenter/NotificationCenter';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/notification-center

## NotificationCenter props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | no | `Notifications` | Heading shown in the header. Note: this shadows the native `title` tooltip attribute, which NotificationCenter does not expose. |
| unreadCount | `number` | no |  | How many notifications are unread, shown under the heading. Omit to hide the line. |
| unreadCountLabel | `((count: number) => string)` | no | `(count) => `${count} unread`` | Text of the unread line under the heading, given the count. Defaults to "<count> unread". |
| tabsLabel | `string` | no |  | Accessible name of the filter tablist. Defaults to "<title> filters". |
| onMarkAllRead | `(() => void)` | no |  | Fires when "Mark all read" is pressed; the control only renders when this is set. |
| markAllLabel | `string` | no | `Mark all read` | Text of the mark-all-read control. |
| tabs | `NotificationCenterTab[]` | no |  | Filter tabs under the header, each with an optional count. |
| value | `string` | no |  | Value of the active filter tab, for controlled use. Leave it undefined to let the component keep its own selection, seeded from `defaultValue`. |
| defaultValue | `string` | no |  | Value of the tab active on first render when the tabs are uncontrolled. Falls back to the first tab. |
| onValueChange | `((value: string) => void)` | no |  | Fires with the newly selected tab's value. |
| activeTab | `string` | no |  | Legacy name for `value`; `value` wins when both are set. Deprecated: Use `value` instead. |
| defaultTab | `string` | no |  | Legacy name for `defaultValue`; `defaultValue` wins when both are set. Deprecated: Use `defaultValue` instead. |
| onTabChange | `((value: string) => void)` | no |  | Legacy change callback; fires alongside `onValueChange`. Deprecated: Use `onValueChange` instead. |
| emptyState | `ReactNode` | no |  | What to render when there are no children — defaults to a built-in empty state. |
| emptyStateLabels | `Partial<Pick<EmptyStateProps, "title" \| "description">>` | no |  | The built-in empty state's copy, merged over the English defaults: title "Nothing new", description "Notifications will collect here as they arrive." Ignored when `emptyState` is set. |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | The notifications, newest first — typically NotificationItems. |

## NotificationItem props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | One-line headline, e.g. who did what. Note: this shadows the native `title` tooltip attribute, which NotificationItem does not expose. |
| time | `string` | no |  | When it happened, as already-formatted text like "2m" or "Mon". |
| unread | `boolean` | no | `false` | Marks the notification as not yet read: a dot beside the time and emphasised title. |
| unreadLabel | `string` | no | `Unread` | Visually hidden text announcing the unread dot. Defaults to "Unread". |
| media | `ReactNode` | no |  | Leading visual — a Material Symbol name (string) or a custom element (e.g. an Avatar). |
| actions | `ReactNode` | no |  | Action row under the body — typically compact Buttons like "Reply" or "Retry". |
| className | `string` | no | `` | Additional CSS classes |
| children | `ReactNode` | no |  | Supporting copy under the title. |
