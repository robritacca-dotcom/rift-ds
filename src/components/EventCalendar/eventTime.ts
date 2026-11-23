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
