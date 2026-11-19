import { DEFAULT_LOCALE } from '../../behaviors/locale';
import type { DataTableColumn, DataTableRow, DataTableValue } from './DataTable';

/** The length of one period column. */
export type PeriodUnit = 'day' | 'week' | 'month';

export interface PeriodColumnsOptions<R extends DataTableRow = DataTableRow> {
  /** The first period's date, as `YYYY-MM-DD`. A week starts on this day; a month column is the month this day falls in. */
  start: string;
  /** How many periods, one column each. */
  count: number;
  /** How long each period is. */
  unit: PeriodUnit;
  /** The locale the headers are written in. */
  locale?: string;
  /** Prepended to each period's date to make its column key: `"d:2026-03-02"`. Defaults to `""`. */
  keyPrefix?: string;
  /** The header for a period, given its first day and its unit. Defaults to the weekday and day ("Mon 2") for a day, the first day ("Mar 2") for a week, and the month ("Mar") for a month, in `locale`. */
  header?: (date: Date, unit: PeriodUnit) => string;
  /** What every period column shares (its type, alignment, editability, aggregate), laid under the key and header. */
  column?: Omit<DataTableColumn<R>, 'key' | 'header'>;
}

/** One period: its column key and its first day, as `YYYY-MM-DD`. */
export interface Period {
  key: string;
  date: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (date: Date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

function parse(start: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(start);
  if (!match) throw new Error(`periodColumns: start must be YYYY-MM-DD, got ${JSON.stringify(start)}.`);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function step(date: Date, unit: PeriodUnit, n: number): Date {
  if (unit === 'month') return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + n, 1));
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + n * (unit === 'week' ? 7 : 1)));
}

/** The periods a run covers, first first: each one's column key and first day. Dates are calendar dates, never moved by a time zone. */
export function periodsOf({ start, count, unit, keyPrefix = '' }: Pick<PeriodColumnsOptions, 'start' | 'count' | 'unit' | 'keyPrefix'>): Period[] {
  const first = unit === 'month' ? step(parse(start), 'month', 0) : parse(start);
  return Array.from({ length: Math.max(0, Math.floor(count)) }, (_, i) => {
    const date = isoOf(step(first, unit, i));
    return { key: `${keyPrefix}${date}`, date };
  });
}

function defaultHeader(locale: string) {
  const day = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', timeZone: 'UTC' });
  const week = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const month = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
  return (date: Date, unit: PeriodUnit) => (unit === 'day' ? day : unit === 'week' ? week : month).format(date);
}

/**
 * Columns for a run of periods: one per day, week or month, for a table whose
 * rows are measured across time (hours by day, a budget by month, stock by
 * week). Each column's key is its first day, so a row's values are keyed the
 * same way, and every column takes what `column` shares, so the run is
 * edited, aggregated and aligned as one. Pair it with a computed total column
 * (`totalOf`) and the totals row for the sums across and down.
 */
export function periodColumns<R extends DataTableRow = DataTableRow>({
  locale = DEFAULT_LOCALE,
  header,
  column,
  ...run
}: PeriodColumnsOptions<R>): DataTableColumn<R>[] {
  const write = header ?? defaultHeader(locale);
  const first = run.unit === 'month' ? null : parse(run.start);
  return periodsOf(run).map(({ key, date }, i) => ({
    ...column,
    key,
    header: write(first ? step(first, run.unit, i) : parse(date), run.unit),
  }));
}

/** A computed column's `compute`: the sum of the number values under these keys, for a total across a row. A value that is not a number counts as nothing. */
export const totalOf =
  (keys: readonly string[]) =>
  (values: Record<string, DataTableValue>): number =>
    keys.reduce((sum, key) => {
      const value = values[key];
      return typeof value === 'number' && Number.isFinite(value) ? sum + value : sum;
    }, 0);
