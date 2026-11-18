# Event calendar

A month or a week of events: pills on their days, overflow counts in the month, a legend, and navigation by month or week.

Generated from the rift-ds registry and prop JSDoc, version 1.30.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { EventCalendar } from 'rift-ds';`
- Deep import: `import { EventCalendar } from 'rift-ds/components/EventCalendar/EventCalendar';`
- Rendering: client component (declares 'use client')
- Size: 2.8 kB gzipped with everything it imports, peer dependencies not counted
- Live docs: https://rift-ds.com/components/event-calendar
- Schema: https://rift-ds.com/schema/components/event-calendar.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

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
| today | `string` | no |  | The date the calendar treats as today (`YYYY-MM-DD`): it carries the today chip and picks the month shown first. Defaults to the device's date; pin it for a demo, a test or a time zone the device is not in. |
| legend | `EventCalendarLegendItem[]` | no |  | What each event colour means, shown as a row of dots and labels under the grid. Filtering by kind stays with the host, which passes the events it wants shown. |
| actions | `ReactNode` | no |  | Trailing header slot, e.g. a "New event" Button. |
| view | `"month" \| "week"` | no | `'month'` | `month` shows the whole month, a day's overflow folded behind "+N more"; `week` shows one week in tall cells with every event, stepping a week at a time from the selected day's week (else today's), which it keeps as its own state after mount. |
| previousLabel | `string` | no | `'Previous month'` | Accessible name of the previous-month button. |
| nextLabel | `string` | no | `'Next month'` | Accessible name of the next-month button. |
| previousWeekLabel | `string` | no | `'Previous week'` | Accessible name of the previous-week button, in the week view. |
| nextWeekLabel | `string` | no | `'Next week'` | Accessible name of the next-week button, in the week view. |
| showLessLabel | `string` | no | `'Show less'` | The visible text of the control that folds an expanded day back, when a day's "+N more" opens it in place (with no `onDateClick`). |
| monthLabel | `((month: Date) => string)` | no |  | The month heading, given the first day of the month in view: the visible title and the name of the day grid. Defaults to the month name and the year in `locale` ("January 2026" in `en-US`). Month view only; the week view's heading is the week's range in `locale`. |
| overflowLabel | `((count: number, date: Date) => string)` | no |  | Accessible name of a day's "+N more" overflow button, given the number of hidden events and the day. Defaults to "N more events" followed by the full date in `locale`. |
| moreLabel | `((count: number) => string)` | no | `` (count: number): string => `+${count} more` `` | The visible text of a day's overflow row, given the number of hidden events. Defaults to "+N more". The row's accessible name is `overflowLabel` when it is a button. |
| weekdayLabels | `string[]` | no |  | The weekday headers above the grid: seven entries, Sunday first, laid out from `weekStartsOn`. Defaults to the short weekday names in `locale` ("Sun" to "Sat" in `en-US`); a list of any other length falls back to the default. |
| locale | `string` | no |  | The BCP 47 locale the calendar is written and laid out in, such as `de-DE`: the month heading, the weekday names, the spoken dates and the first day of the week. Defaults to the nearest LocaleProvider's, else `en-US`. |
| weekStartsOn | `Weekday` | no |  | The first column of the grid, 0 (Sunday) to 6 (Saturday). Defaults to the first day of the week in `locale`: Sunday in `en-US`, Monday in `de-DE`. |
| className | `string` | no | `''` | Additional CSS classes |

## Keyboard

Every row is pressed by an automated test, in a left-to-right and a right-to-left layout.

The navigation buttons follows the WAI-ARIA button pattern (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Key | What it does |
| --- | --- |
| Enter | Activates the button. |
| Space | Activates the button. |

## Types

### EventCalendarColor

```ts
type EventCalendarColor =
  | 'neutral'
  | 'coral'
  | 'violet'
  | 'cobalt'
  | 'amber'
  | 'gold'
  | 'mint';
```

### EventCalendarEvent

```ts
interface EventCalendarEvent {
  /** Unique event identifier. */
  id: string;
  /** The day the event falls on (YYYY-MM-DD), or its first day when it runs over several. */
  date: string;
  /** The last day of an event that runs over several days (YYYY-MM-DD, inclusive): it shows on every day from `date` to this one, its pills joined across the days and its dot on the first. */
  endDate?: string;
  /** Short label shown in the event pill. */
  title: string;
  /** Start time as already-formatted text like "09:30". Untimed events sort first. */
  time?: string;
  /** Accent for the pill's dot, from the core accent roles. Defaults to `neutral`. */
  color?: EventCalendarColor;
}
```

### EventCalendarLegendItem

A colour the calendar's events use, and what it means, for the legend.

```ts
interface EventCalendarLegendItem {
  /** The accent, as an event's `color` names it. */
  color: EventCalendarColor;
  /** What events in this colour are ("Offsites", "Deadlines"). */
  label: string;
}
```

### Weekday

A day of the week as `Date.getDay()` numbers it: 0 is Sunday, 6 is Saturday.

```ts
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
```

Types from other packages: `Date` (typescript), `ReactNode` (react).
