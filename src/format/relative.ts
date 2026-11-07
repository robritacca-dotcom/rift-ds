/**
 * Dates against now, and dates in a named time zone. Server-safe: no React
 * and no browser API. Pass `now` wherever the output must match between the
 * server and the browser (a deadline rendered on the server and ticked on
 * the client), since two clocks a few hundred milliseconds apart can round
 * to different words.
 */

import { DEFAULT_LOCALE } from '../behaviors/locale';

/** A date, an ISO 8601 string, or milliseconds since the epoch. A bare `YYYY-MM-DD` is read as midnight UTC, so it never shifts a day. */
export type DateInput = Date | string | number;

/** A date input as a `Date`, or `null` when it does not name one. */
export function toDate(value: DateInput): Date | null {
  const date =
    value instanceof Date
      ? value
      : new Date(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Options for {@link formatRelative}. */
export type FormatRelativeOptions = {
  /** The moment the date is measured from. Defaults to the current time. */
  now?: DateInput;
  /** The locale the phrase is written in. Defaults to `en-US`. */
  locale?: string;
  /** `auto` writes "tomorrow" and "yesterday" where the language has them; `always` writes "in 1 day". Defaults to `auto`. */
  numeric?: 'auto' | 'always';
  /** How long the unit names are: "in 3 months", "in 3 mo.", "in 3mo". Defaults to `long`. */
  style?: 'long' | 'short' | 'narrow';
  /**
   * The smallest unit the phrase uses. `day` compares calendar days in UTC,
   * so a date-only value reads "today" all day, never "in 5 hours". Defaults
   * to `second`.
   */
  minUnit?: 'second' | 'day';
};

/** Calendar units for reading a distance, not timings. */
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * A date against now, in the largest unit that keeps it whole: "in 45
 * seconds", "5 minutes ago", "tomorrow", "in 3 weeks", "2 months ago", "in
 * 1 year". A week is 7 days, a month 30 and a year 365, which is a reading
 * of distance, not calendar arithmetic.
 */
export function formatRelative(date: DateInput, options: FormatRelativeOptions = {}): string {
  const { locale = DEFAULT_LOCALE, numeric = 'auto', style = 'long', minUnit = 'second' } = options;
  const target = toDate(date);
  const now = toDate(options.now ?? Date.now());
  if (!target || !now) throw new RangeError(`Not a date: ${JSON.stringify(target ? options.now : date)}`);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric, style });

  let days: number;
  if (minUnit === 'day') {
    const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const day = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
    days = Math.round((day - today) / DAY);
  } else {
    const diff = target.getTime() - now.getTime();
    const abs = Math.abs(diff);
    if (abs < MINUTE) return rtf.format(Math.round(diff / SECOND), 'second');
    if (abs < HOUR) return rtf.format(Math.round(diff / MINUTE), 'minute');
    if (abs < DAY) return rtf.format(Math.round(diff / HOUR), 'hour');
    days = Math.round(diff / DAY);
  }
  if (Math.abs(days) < 7) return rtf.format(days, 'day');
  if (Math.abs(days) < 30) return rtf.format(Math.round(days / 7), 'week');
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), 'month');
  return rtf.format(Math.round(days / 365), 'year');
}

/** Options for {@link formatInTimeZone}: any `Intl.DateTimeFormat` option, with the zone required. */
export type FormatInTimeZoneOptions = Omit<Intl.DateTimeFormatOptions, 'timeZone'> & {
  /** The IANA zone the date is shown in, such as `America/Los_Angeles` or `UTC`. */
  timeZone: string;
  /** The locale the date is written in. Defaults to `en-US`. */
  locale?: string;
};

/**
 * A date as a wall clock in a named zone reads it, whatever the runtime's
 * own zone: `formatInTimeZone(due, { timeZone: 'America/Los_Angeles',
 * timeStyle: 'short' })` is `4:00 PM`. With no style or field options it
 * writes the date and time at medium length.
 */
export function formatInTimeZone(date: DateInput, options: FormatInTimeZoneOptions): string {
  const { locale = DEFAULT_LOCALE, timeZone, ...rest } = options;
  const target = toDate(date);
  if (!target) throw new RangeError(`Not a date: ${JSON.stringify(date)}`);
  const hasFields = Object.keys(rest).some((key) => key !== 'hour12' && key !== 'hourCycle' && key !== 'timeZoneName');
  const format = new Intl.DateTimeFormat(locale, {
    ...(hasFields ? {} : { dateStyle: 'medium', timeStyle: 'short' }),
    ...rest,
    timeZone,
  });
  return format.format(target);
}
