# Notification centre

A persistent notification inbox with unread count, filter tabs, and per-item actions.

Generated from the rift-ds registry and prop JSDoc, version 1.39.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: feedback
- Import: `import { NotificationCenter } from 'rift-ds';`
- Deep import: `import { NotificationCenter } from 'rift-ds/components/NotificationCenter/NotificationCenter';`
- Rendering: client component (declares 'use client')
- Size: 13.4 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/notification-center
- Schema: https://rift-ds.com/schema/components/notification-center.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## NotificationCenter props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | no | `'Notifications'` | Heading shown in the header. Note: this shadows the native `title` tooltip attribute, which NotificationCenter does not expose. |
| unreadCount | `number` | no |  | How many notifications are unread, shown as a badge beside the title (only announced when filter tabs carry the count). Omit to hide it. |
| unreadCountLabel | `((count: number) => string)` | no | `` (count) => `${count} unread` `` | The unread count's text, given the count. Defaults to "<count> unread". |
| tabsLabel | `string` | no |  | Accessible name of the filter tablist. Defaults to "<title> filters". |
| onMarkAllRead | `(() => void)` | no |  | Fires when Mark all as read is chosen from the header's options menu. The item is disabled while `unreadCount` is zero. |
| markAllLabel | `string` | no | `'Mark all as read'` | The options menu's mark-all-read item. Default "Mark all as read". |
| onClearAll | `(() => void)` | no |  | Fires when Clear all is chosen from the header's options menu, a destructive item that empties the inbox. |
| clearAllLabel | `string` | no | `'Clear all'` | The options menu's clear-all item. Default "Clear all". |
| menuItems | `DropdownMenuEntry[]` | no | `[]` | More items for the header's options menu, after Mark all as read and before Clear all, such as notification settings or a link to the full page. |
| optionsLabel | `string` | no | `'Notification options'` | The options button's accessible name and tooltip. Default "Notification options". |
| tabs | `NotificationCenterTab[]` | no |  | Filter tabs under the header, each with an optional count. |
| value | `string` | no |  | Value of the active filter tab, for controlled use. Leave it undefined to let the component keep its own selection, seeded from `defaultValue`. |
| defaultValue | `string` | no |  | Value of the tab active on first render when the tabs are uncontrolled. Falls back to the first tab. |
| onValueChange | `((value: string) => void)` | no |  | Fires with the newly selected tab's value. |
| activeTab | `string` | no |  | Legacy name for `value`; `value` wins when both are set. Deprecated: Use `value` instead. |
| defaultTab | `string` | no |  | Legacy name for `defaultValue`; `defaultValue` wins when both are set. Deprecated: Use `defaultValue` instead. |
| onTabChange | `((value: string) => void)` | no |  | Legacy change callback; fires alongside `onValueChange`. Deprecated: Use `onValueChange` instead. |
| onSeeAll | `(() => void)` | no |  | Opens the full list of notifications. When given (or `seeAllHref`), a footer under the list carries a See all button. |
| seeAllHref | `string` | no |  | Opens the full list at this address instead: the See all button becomes a link. |
| seeAllLabel | `string` | no | `'See all'` | The See all button's label. Default "See all". |
| linkComponent | `LinkComponent` | no |  | The component the See all link renders with, such as Next.js's `Link`. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
| emptyState | `ReactNode` | no |  | What to render when there are no children — defaults to a built-in empty state. |
| emptyStateLabels | `Partial<Pick<EmptyStateProps, "title" \| "description">>` | no |  | The built-in empty state's copy, merged over the English defaults: title "Nothing new", description "Notifications will collect here as they arrive." Ignored when `emptyState` is set. |
| locale | `string` | no |  | The BCP 47 locale the tab counts are written in, such as `ar-EG`. Defaults to the nearest LocaleProvider's, else `en-US`. |
| className | `string` | no | `''` | Additional CSS classes |
| children | `ReactNode` | no |  | The notifications, newest first — typically NotificationItems. |

## NotificationItem props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| title | `string` | yes |  | One-line headline, e.g. who did what. Note: this shadows the native `title` tooltip attribute, which NotificationItem does not expose. |
| time | `string` | no |  | When it happened, as already-formatted text like "2m" or "Mon". |
| unread | `boolean` | no | `false` | Marks the notification as not yet read: a dot beside the time and emphasised title. |
| unreadLabel | `string` | no | `'Unread'` | Visually hidden text announcing the unread dot. Defaults to "Unread". |
| media | `string \| ReactNode` | no |  | Leading visual — a Material Symbol name (string) or a custom element (e.g. an Avatar). |
| actions | `ReactNode` | no |  | Action row under the body — typically compact Buttons like "Reply" or "Retry". |
| onSelect | `(() => void)` | no |  | Opens the notification. The title becomes a button whose hit area covers the whole row, so the row hovers and clicks as one; the action row stays clickable on its own. Replaces the native `onSelect` attribute, which fires on text selection inside an input. |
| href | `string` | no |  | Opens the notification at this address instead: the title becomes a link covering the row. |
| onDismiss | `(() => void)` | no |  | Clears this one notification. A compact close button sits at the row's end, shown on hover and focus (and always on a touch screen), above the row's own click. |
| dismissLabel | `((title: string) => string)` | no | `` (itemTitle: string) => `Dismiss ${itemTitle}` `` | The dismiss button's accessible name, from the title. Default "Dismiss <title>". |
| linkComponent | `LinkComponent` | no |  | The component the row's link renders with, such as Next.js's `Link`, so it navigates through the app's router. Wins over a LinkProvider's; a plain `<a>` when neither is set. |
| className | `string` | no | `''` | Additional CSS classes |
| children | `ReactNode` | no |  | Supporting copy under the title. |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

Follows the WAI-ARIA tabs pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

| Key | What it does |
| --- | --- |
| Tab | Moves focus into the list at the selected tab, and out of the list on the next press. |
| Arrow Right | Moves to the next tab and selects it. The opposite arrow in a right-to-left layout. |
| Arrow Left | Moves to the previous tab and selects it. The opposite arrow in a right-to-left layout. |
| End | Moves to the last tab and selects it. |
| Home | Moves to the first tab and selects it. |

## Types

### DropdownMenuEntry

```ts
type DropdownMenuEntry =
  | DropdownMenuItem
  | DropdownMenuSeparator
  | DropdownMenuGroup;
```

### DropdownMenuGroup

The props of DropdownMenu: `get_component("DropdownMenu")`.

### DropdownMenuItem

The props of DropdownMenu: `get_component("DropdownMenu")`.

### DropdownMenuSeparator

The props of DropdownMenu: `get_component("DropdownMenu")`.

### EmptyStateProps

The props of EmptyState: `get_component("EmptyState")`.

### LinkComponent

A component that renders a link in place of a plain `<a>`, such as a router's.

```ts
type LinkComponent = React.ElementType<LinkComponentProps>;
```

### LinkComponentProps

The props a link component receives: every anchor attribute, the ref, and
an `href` that is always a string. Next.js's `Link` takes these as they
are; a router whose link takes `to` instead needs a one-line adapter:
`({ href, ...props }) => <RouterLink to={href} {...props} />`.

```ts
type LinkComponentProps = React.ComponentPropsWithRef<'a'> & { href: string };
```

### NotificationCenterTab

```ts
interface NotificationCenterTab {
  /** Display label */
  label: string;
  /** Unique tab identifier */
  value: string;
  /** Count shown beside the label, e.g. the number of notifications in this filter. */
  count?: number;
}
```

Types from other packages: `ComponentPropsWithRef` (react), `ElementType` (react), `Partial` (typescript), `Pick` (typescript), `ReactNode` (react).
