/**
 * Locale data every formatting component shares. Server-safe: no React and
 * no browser API, so a component that renders from a Server Component can
 * import it too. The client half (the provider and the hook) is
 * LocaleProvider.tsx.
 *
 * The rule it carries: a component never formats in the runtime's default
 * locale. The server and the browser can disagree on it, which prints
 * `1,234` on one and `1.234` on the other and breaks hydration, and a
 * consumer could not choose it. Every number, date and calendar convention
 * a component prints is resolved from a locale the consumer can set, which
 * falls back to DEFAULT_LOCALE. scripts/validate-locale-formatting.mjs
 * enforces it.
 */

/** The locale a component formats in when neither its `locale` prop nor a LocaleProvider sets one. */
export const DEFAULT_LOCALE = 'en-US';

/** A day of the week as `Date.getDay()` numbers it: 0 is Sunday, 6 is Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/*
 * The regions whose week does not start on Monday, from CLDR's
 * `weekData.firstDay` (the data `Intl.Locale`'s week info reads). Used only
 * where the runtime cannot answer itself; every other region starts on
 * Monday, which is CLDR's world default.
 */
const SUNDAY_FIRST = new Set(
  'AG AS BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW'.split(' '),
);
const SATURDAY_FIRST = new Set('AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'.split(' '));

type WeekInfoLocale = Intl.Locale & {
  getWeekInfo?: () => { firstDay: number };
  weekInfo?: { firstDay: number };
};

const weekStartCache = new Map<string, Weekday>();

/**
 * The first day of the week in `locale`, as a `Date.getDay()` number:
 * Sunday (0) in en-US, Monday (1) in de-DE, Saturday (6) in ar-EG. Read
 * from the runtime's CLDR week data where it has it, else from the region.
 */
export function weekStartOf(locale: string): Weekday {
  const cached = weekStartCache.get(locale);
  if (cached !== undefined) return cached;
  let start: Weekday = 1;
  try {
    const intlLocale = new Intl.Locale(locale) as WeekInfoLocale;
    const info = intlLocale.getWeekInfo?.() ?? intlLocale.weekInfo;
    if (info) {
      // Intl numbers the days 1 (Monday) to 7 (Sunday).
      start = (info.firstDay % 7) as Weekday;
    } else {
      const region = intlLocale.maximize().region ?? '';
      start = SUNDAY_FIRST.has(region) ? 0 : SATURDAY_FIRST.has(region) ? 6 : 1;
    }
  } catch {
    start = 1;
  }
  weekStartCache.set(locale, start);
  return start;
}

/** A Sunday-first list of seven, reordered to start on `start`. */
export function rotateWeek<T>(sundayFirst: readonly T[], start: Weekday): T[] {
  return [...sundayFirst.slice(start), ...sundayFirst.slice(0, start)];
}

/** How many days `day` sits after the week's first day: 0 for the first column, 6 for the last. */
export const weekdayOffset = (day: number, start: Weekday): number => (day - start + 7) % 7;

/** The seven weekday names in `locale`, Sunday first, at the given width. */
export function weekdayNamesIn(locale: string, width: 'long' | 'short' | 'narrow'): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: width, timeZone: 'UTC' });
  // 2023-01-01 was a Sunday.
  return Array.from({ length: 7 }, (_, day) => format.format(Date.UTC(2023, 0, 1 + day)));
}

/** Whether `locale` is written in English, the language every built-in label defaults to. */
export function isEnglish(locale: string): boolean {
  try {
    return new Intl.Locale(locale).language === 'en';
  } catch {
    return false;
  }
}

/** Whether `locale` writes times on a 12-hour clock (en-US) rather than a 24-hour one (en-GB, de-DE). */
export function uses12HourClock(locale: string): boolean {
  const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
  return cycle === 'h11' || cycle === 'h12';
}

const numberFormats = new Map<string, Intl.NumberFormat>();

/**
 * A number as `locale` writes it, grouped and with its own decimal mark:
 * `1,234.5` in en-US, `1.234,5` in de-DE. Formats are cached per locale.
 */
export function formatNumber(value: number, locale: string): string {
  let format = numberFormats.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
    numberFormats.set(locale, format);
  }
  return format.format(value);
}

const axisFormats = new Map<string, Intl.NumberFormat>();

/**
 * A number on a chart's value axis as `locale` writes it, grouped only from
 * five digits up (`12,000` but `2024`), so a tick that happens to be a year
 * never reads as a quantity.
 */
export function formatAxisNumber(value: number, locale: string): string {
  let format = axisFormats.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 3,
      // 'min2' is CLDR's grouping for short numbers; the type lags the spec.
      useGrouping: 'min2' as unknown as boolean,
    });
    axisFormats.set(locale, format);
  }
  return format.format(value);
}

const percentFormats = new Map<string, Intl.NumberFormat>();

/** A whole percentage, given as 0 to 100, as `locale` writes it: `64%` in en-US, `٦٤٪` in ar-EG, `64 %` in de-DE. */
export function formatPercent(percent: number, locale: string): string {
  let format = percentFormats.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 });
    percentFormats.set(locale, format);
  }
  return format.format(percent / 100);
}
