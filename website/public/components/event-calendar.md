# Event calendar

A month grid with event pills, overflow counts, and month navigation.

Generated from the rift-ds registry and prop JSDoc, version 1.10.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { EventCalendar } from 'rift-ds';`
- Deep import: `import { EventCalendar } from 'rift-ds/components/EventCalendar/EventCalendar';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/event-calendar

## EventCalendar props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| events | `EventCalendarEvent[]` | no | `[]` | The events to place on the grid, including any that fall on the visible leading and trailing days of the neighbouring months. |
| month | `string` | no |  | Shown month (YYYY-MM) for controlled use. Pair with `onMonthChange`. |
| defaultMonth | `string` | no |  | Initially shown month (YYYY-MM) for uncontrolled use. Defaults to the current month. |
| onMonthChange | `((month: string) => void)` | no |  | Fires with the newly shown month (YYYY-MM) after prev/next navigation. |
| maxEventsPerDay | `number` | no | `3` | Event pills shown per day before the rest collapse into "+N more". |
| onEventClick | `((event: EventCalendarEvent) => void)` | no |  | Fires with the clicked event. Pills only render as buttons when this is set. |
| onDateClick | `((date: string) => void)` | no |  | Fires with the clicked day (YYYY-MM-DD) — from anywhere on the cell, the day number, and the "+N more" overflow row. The number and overflow row only become buttons when this is set, and cells only take their pointer cursor and hover feedback with it. |
| selectedDate | `string` | no |  | Marks this day (YYYY-MM-DD) as the selected one — the action-colour chip on its number, taking precedence over the today chip. Controlled by the consumer; pair with `onDateClick` to move it. |
| actions | `ReactNode` | no |  | Trailing header slot, e.g. a "New event" Button. |
| previousLabel | `string` | no | `Previous month` | Accessible name of the previous-month button. |
| nextLabel | `string` | no | `Next month` | Accessible name of the next-month button. |
| monthLabel | `((month: Date) => string)` | no | `(month: Date): string =>   `${MONTHS[month.getMonth()]} ${month.getFullYear()}`` | The month heading, given the first day of the month in view: the visible title and the name of the day grid. Defaults to the English month name and the year. |
| overflowLabel | `((count: number, date: Date) => string)` | no | `(count: number, date: Date): string =>   `${count} more event${count === 1 ? '' : 's'}, ${formatDayLabel(date)}`` | Accessible name of a day's "+N more" overflow button, given the number of hidden events and the day. Defaults to "N more events" followed by the full date in the user's locale. |
| moreLabel | `((count: number) => string)` | no | `(count: number): string => `+${count} more`` | The visible text of a day's overflow row, given the number of hidden events. Defaults to "+N more". The row's accessible name is `overflowLabel` when it is a button. |
| weekdayLabels | `string[]` | no |  | The weekday headers above the grid: seven entries, Sunday first. Defaults to the English three-letter abbreviations ("Sun" to "Sat"); a list of any other length falls back to the default. |
| className | `string` | no | `` | Additional CSS classes |
