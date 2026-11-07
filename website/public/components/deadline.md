# Deadline

A due date against now that turns from neutral to warning to error as it nears.

Generated from the rift-ds registry and prop JSDoc, version 1.24.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Deadline } from 'rift-ds';`
- Deep import: `import { Deadline } from 'rift-ds/components/Deadline/Deadline';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/deadline
- Schema: https://rift-ds.com/schema/components/deadline.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Deadline props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| date | `DateInput` | yes |  | The moment it falls due: a Date, an ISO 8601 string or milliseconds since the epoch. |
| timeZone | `string` | no |  | The IANA zone the time is shown in, named after it ("4:00 PM PST"), such as `America/Los_Angeles`. Without it the time shows in the reader's own zone. |
| display | `"both" \| "relative" \| "absolute"` | no | `relative` | `relative` writes the distance ("in 2 days"), `absolute` the date and time, `both` the two together. Defaults to `relative`. |
| thresholds | `DeadlineThresholds` | no |  | How close the deadline must be before it turns to the warning and then the error role. |
| prefixLabel | `string` | no | `Due` | The word before the distance: "Due", "Closes", "Expires". Defaults to "Due". |
| overdueLabel | `string` | no | `Overdue` | What a deadline that has passed says in place of the distance. Defaults to "Overdue". |
| variant | `"text" \| "badge"` | no | `badge` | `badge` draws the Badge family's tinted pill; `text` writes it inline in the status text colour, for a sentence or a table cell. |
| size | `"default" \| "compact"` | no | `default` | Component size |
| tick | `boolean` | no | `true` | Rewrite the distance as time passes, pausing while the page is hidden. Defaults to true; off when `now` is set. |
| now | `DateInput` | no |  | The moment to measure from, in place of the clock: for a server render that must match, a test, or a screenshot. |
| onStatusChange | `((status: DeadlineStatus) => void)` | no |  | Called when the deadline moves to a new status as time passes, so a host can react (sort, notify). |
| locale | `string` | no |  | The BCP 47 locale the distance and the date are written in. Defaults to the nearest LocaleProvider's, else `en-US`. |
| className | `string` | no | `` | Additional CSS classes |
