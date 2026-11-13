# Date range picker

An inline calendar for choosing a range of days, one or two months wide, with presets.

Generated from the rift-ds registry and prop JSDoc, version 1.27.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { DateRangePicker } from 'rift-ds';`
- Deep import: `import { DateRangePicker } from 'rift-ds/components/DateRangePicker/DateRangePicker';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/date-range-picker
- Schema: https://rift-ds.com/schema/components/date-range-picker.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## DateRangePicker props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | `DateRange` | no |  | The chosen range (controlled). Pair with `onValueChange`. |
| defaultValue | `DateRange` | no | `{ start: null, end: null }` | The range it starts with (uncontrolled). |
| onValueChange | `((range: DateRange) => void)` | no |  | Called with the range as the reader chooses it: once with only `start` after the first day, then with both. |
| months | `1 \| 2` | no | `2` | How many months show side by side, 1 or 2. Two stack when the picker is narrow. Defaults to 2. |
| min | `string` | no |  | The first day that can be chosen (YYYY-MM-DD). |
| max | `string` | no |  | The last day that can be chosen (YYYY-MM-DD). |
| isDateDisabled | `((date: string) => boolean)` | no |  | Mark further days unavailable: weekends, holidays, booked nights. Given each day as a `YYYY-MM-DD` string. A range may not span one. |
| minLength | `number` | no |  | The fewest days a range may hold, counting both ends. |
| maxLength | `number` | no |  | The most days a range may hold, counting both ends. |
| presets | `DateRangePreset[]` | no |  | Ranges the reader can pick in one press, shown above the calendar: "Last 7 days", "This quarter". |
| presetsLabel | `string` | no | `'Presets'` | Accessible name of the presets. Defaults to "Presets". |
| size | `"default" \| "compact"` | no | `'default'` | Component size |
| disabled | `boolean` | no | `false` | Whether the picker is disabled |
| name | `string` | no |  | The form field name: the form receives `<name>[start]` and `<name>[end]` as `YYYY-MM-DD` through hidden inputs. |
| previousLabel | `string` | no | `'Previous month'` | Accessible name of the previous-month button. |
| nextLabel | `string` | no | `'Next month'` | Accessible name of the next-month button. |
| monthLabel | `((month: Date) => string)` | no |  | The month heading, given the first day of a month in view. Defaults to the month name and the year in `locale`. |
| dayLabel | `((date: Date, position: DateRangePosition) => string)` | no |  | A day button's accessible name, given its date and where it sits in the range. Defaults to the full date in `locale`, followed by the matching position label. |
| rangeStartLabel | `string` | no | `'start of range'` | Said after the first day of the range. Defaults to "start of range". |
| rangeEndLabel | `string` | no | `'end of range'` | Said after the last day of the range. Defaults to "end of range". |
| inRangeLabel | `string` | no | `'in range'` | Said after a day inside the range. Defaults to "in range". |
| weekdayLabels | `string[]` | no |  | The visible weekday headers: seven entries, Sunday first. Defaults as in DatePicker. |
| weekdayNames | `string[]` | no |  | The weekday headers' spoken names: seven entries, Sunday first. Defaults to the weekday names in `locale`. |
| locale | `string` | no |  | The BCP 47 locale the calendar is written and laid out in. Defaults to the nearest LocaleProvider's, else `en-US`. |
| weekStartsOn | `Weekday` | no |  | The first column of the grid, 0 (Sunday) to 6 (Saturday). Defaults to the first day of the week in `locale`. |
| className | `string` | no | `''` | Additional CSS classes |

## Types

### DateRange

A range as two `YYYY-MM-DD` strings; `end` is null while the second day is still to be chosen.

```ts
type DateRange = { start: string | null; end: string | null };
```

### DateRangePosition

Where a day sits in the range, for its spoken name.

```ts
type DateRangePosition = 'start' | 'end' | 'start-end' | 'inside' | 'outside';
```

### DateRangePreset

A ready-made range the reader can pick in one press.

```ts
type DateRangePreset = {
  /** What the preset is called: "Last 7 days", "This month". */
  label: string;
  /** The range it sets. */
  range: { start: string; end: string };
};
```

### Weekday

A day of the week as `Date.getDay()` numbers it: 0 is Sunday, 6 is Saturday.

```ts
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
```

Types from other packages: `Date` (typescript).
