# Date picker

Inline calendar with month navigation, day selection, and today indicator.

Generated from the rift-ds registry and prop JSDoc, version 1.14.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { DatePicker } from 'rift-ds';`
- Deep import: `import { DatePicker } from 'rift-ds/components/DatePicker/DatePicker';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/date-picker

## DatePicker props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `string` | no |  | Currently selected date (YYYY-MM-DD) |
| size | `"default" \| "compact"` | no | `default` | Component size |
| disabled | `boolean` | no | `false` | Whether the picker is disabled |
| min | `string` | no |  | Minimum selectable date (YYYY-MM-DD) |
| max | `string` | no |  | Maximum selectable date (YYYY-MM-DD) |
| onDateSelect | `((date: string) => void)` | no |  | Callback when a date is selected |
| previousLabel | `string` | no | `Previous month` | Accessible name of the previous-month button. |
| nextLabel | `string` | no | `Next month` | Accessible name of the next-month button. |
| monthLabel | `((month: Date) => string)` | no | `(month: Date): string =>   `${MONTHS[month.getMonth()]} ${month.getFullYear()}`` | The month heading, given the first day of the month in view: the visible title, the name of the day grid, and the text announced on navigation. Defaults to the English month name and the year. |
| dayLabel | `((date: Date, selected: boolean) => string)` | no | `(date: Date, selected: boolean): string =>   `${date.toLocaleDateString(undefined, {     weekday: 'long',     year: 'numeric',     month: 'long',     day: 'numeric',   })}${selected ? ', selected' : ''}`` | Accessible name of a day button, given its date and whether it is selected. Defaults to the full date in the user's locale, with ", selected" appended when selected. |
| weekdayLabels | `string[]` | no |  | The visible weekday column headers: seven entries, Sunday first. Defaults to the English two-letter abbreviations ("Su" to "Sa"); a list of any other length falls back to the default. |
| weekdayNames | `string[]` | no |  | The weekday column headers' accessible names, read in full where the visible header is abbreviated: seven entries, Sunday first. Defaults to the English weekday names ("Sunday" to "Saturday"); a list of any other length falls back to the default. |
| className | `string` | no | `` | Additional CSS classes |
