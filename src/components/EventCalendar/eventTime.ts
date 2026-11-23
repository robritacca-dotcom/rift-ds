/**
 * EventCalendar's reading of an event's `time`, which is text the consumer
 * has already formatted ("08:50", "1:40 PM", "13 h 40"). Sorting that text
 * as text puts "12:50" before "8:50", so the calendar reads it as a clock
 * time where it can and sorts by minutes after midnight.
 */

/**
 * `time` as minutes after midnight, or null when it does not read as a
 * clock time. Takes 24-hour and 12-hour forms, with `:`, `.` or `h` between
 * hour and minutes and an English day period in any case or spacing
 * ("pm", "P.M.").
 */
export function minutesOf(time: string): number | null {
  const match = /^\s*(\d{1,2})(?:\s*[:.h]\s*(\d{2}))?\s*(?:([ap])\.?\s*m\.?)?\s*$/i.exec(time.normalize('NFKC'));
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = match[2] === undefined ? 0 : Number(match[2]);
  const period = match[3]?.toLowerCase();
  if (minute > 59) return null;
  if (period) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (period === 'p' ? 12 : 0);
  } else if (hour > 23) {
    return null;
  }
  return hour * 60 + minute;
}

/**
 * Orders two events' `time`s: clock times by the clock, ahead of any time
 * that does not read as one, and those by their text in `locale`.
 */
export function compareTimes(a: string, b: string, locale: string): number {
  const ma = minutesOf(a);
  const mb = minutesOf(b);
  if (ma !== null && mb !== null && ma !== mb) return ma - mb;
  if ((ma === null) !== (mb === null)) return ma === null ? 1 : -1;
  return a.localeCompare(b, locale);
}

/**
 * An event's `start` or `end`, a 24-hour `HH:mm` string ("08:50", "13:40"),
 * as minutes after midnight, or null when it is not one. Stricter than
 * `minutesOf`: these are data, not display text.
 */
export function clockMinutes(value: string | undefined): number | null {
  const match = value ? /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value) : null;
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

/**
 * Where the day view's now marker sits in a day's sorted schedule, given each
 * event's start in minutes (null for an untimed event) and the time now:
 * before the first event that starts later, else after the last timed one.
 * Null when the day has no timed event to place it against.
 */
export function nowMarkerIndex(starts: (number | null)[], now: number): number | null {
  let lastTimed = -1;
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    if (start === null) continue;
    if (start > now) return i;
    lastTimed = i;
  }
  return lastTimed === -1 ? null : lastTimed + 1;
}
