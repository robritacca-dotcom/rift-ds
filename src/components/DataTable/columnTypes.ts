/**
 * DataTable's column types: what a column's `type` sets when the column
 * does not say otherwise. Each type brings its alignment, its sort, its
 * filter kind, the editor an `editable` column of it opens, and how its
 * value reads as text (the cell's tooltip, and the cell itself for the
 * plain types). TypedCell draws the cell. Internal: the public names are
 * DataTableColumnType and DataTableColumnFormat, re-exported from DataTable.
 *
 * Formatting defaults to `en-US`, not the browser's locale, so the server's
 * HTML and the browser's first render agree; a column sets its own.
 */

import type { CellEditorKind, CellValue } from './editorKinds';
import type { FilterKind } from './filterModel';

/** The types a column can be. */
export type ColumnType =
  'text' | 'number' | 'currency' | 'date' | 'status' | 'person' | 'tags' | 'progress' | 'checkbox' | 'link';

/** How a typed column formats its values. */
export interface ColumnFormat {
  /** BCP 47 locale for numbers, money and dates. Defaults to `en-US`, so the server and the browser agree. */
  locale?: string;
  /** ISO 4217 code for a `currency` column. Defaults to `USD`. */
  currency?: string;
  /** Digits after the point for `number`, `currency` and `progress`. Defaults to none for money and progress, and up to two for a number. */
  fractionDigits?: number;
  /** How a `date` column reads: `short` (11/04/26), `medium` (Nov 4, 2026), `long` (November 4, 2026) or `relative` (in 3 days). Defaults to `medium`; the full date shows on hover either way. */
  date?: 'short' | 'medium' | 'long' | 'relative';
}

/** A status option's role, the Badge variant its cells take. */
export type StatusRole = 'info' | 'positive' | 'warning' | 'error' | 'neutral';

interface TypeDefaults {
  align: 'left' | 'center' | 'right';
  filter: FilterKind;
  editor: CellEditorKind;
}

/** What each type sets, before the column's own fields. */
export const TYPE_DEFAULTS: Record<ColumnType, TypeDefaults> = {
  text: { align: 'left', filter: 'text', editor: 'text' },
  number: { align: 'right', filter: 'number', editor: 'number' },
  currency: { align: 'right', filter: 'number', editor: 'number' },
  date: { align: 'left', filter: 'date', editor: 'date' },
  status: { align: 'left', filter: 'enum', editor: 'select' },
  person: { align: 'left', filter: 'enum', editor: 'combobox' },
  tags: { align: 'left', filter: 'tags', editor: 'tags' },
  progress: { align: 'right', filter: 'number', editor: 'number' },
  checkbox: { align: 'center', filter: 'boolean', editor: 'checkbox' },
  link: { align: 'left', filter: 'text', editor: 'text' },
};

const DEFAULT_LOCALE = 'en-US';

/** A list's first value, or the value itself. */
const first = (value: CellValue): CellValue => (Array.isArray(value) ? (value[0] ?? null) : value);

/** A `YYYY-MM-DD` (or full ISO) value as a date, read in UTC so it never shifts a day. */
export const parseDate = (value: CellValue): Date | null => {
  if (typeof value !== 'string' || value === '') return null;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** A date the way a column with this format reads it, `relative` aside. */
export const absoluteDate = (date: Date, format: ColumnFormat | undefined, style?: 'short' | 'medium' | 'long') =>
  new Intl.DateTimeFormat(format?.locale ?? DEFAULT_LOCALE, {
    dateStyle: style ?? (format?.date && format.date !== 'relative' ? format.date : 'medium'),
    timeZone: 'UTC',
  }).format(date);

/** A calendar unit for reading dates, not a timing. */
const MS_PER_DAY = 86_400_000;

/** A date against today, in the largest unit that keeps it whole: "today", "in 3 days", "2 months ago". */
export const relativeDate = (date: Date, format: ColumnFormat | undefined, now: Date) => {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.round((date.getTime() - today) / MS_PER_DAY);
  const rtf = new Intl.RelativeTimeFormat(format?.locale ?? DEFAULT_LOCALE, { numeric: 'auto' });
  if (Math.abs(days) < 7) return rtf.format(days, 'day');
  if (Math.abs(days) < 30) return rtf.format(Math.round(days / 7), 'week');
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), 'month');
  return rtf.format(Math.round(days / 365), 'year');
};

/** A number as its type reads it: grouped, as money, or as a percent of 100. */
export const formatNumber = (type: ColumnType, value: number, format: ColumnFormat | undefined) => {
  const locale = format?.locale ?? DEFAULT_LOCALE;
  const digits = format?.fractionDigits;
  if (type === 'currency')
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: format?.currency ?? 'USD',
      minimumFractionDigits: digits ?? 0,
      maximumFractionDigits: digits ?? 0,
    }).format(value);
  if (type === 'progress')
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: digits ?? 0,
      maximumFractionDigits: digits ?? 0,
    }).format(value / 100);
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits ?? 0,
    maximumFractionDigits: digits ?? 2,
  }).format(value);
};

/** A link's readable text: the address without its scheme, `www.` or a trailing slash. */
export const readableUrl = (url: string) =>
  url
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');

/** A typed value as plain text, for the cell's tooltip and its search: what the cell shows, in words. */
export const typedText = (
  type: ColumnType,
  value: CellValue,
  format: ColumnFormat | undefined,
  label: (value: string) => string,
  words: { checked: string; unchecked: string },
): string => {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return '';
  switch (type) {
    case 'number':
    case 'currency':
    case 'progress':
      return typeof value === 'number' ? formatNumber(type, value, format) : String(value);
    case 'date': {
      const date = parseDate(value);
      return date ? absoluteDate(date, format, format?.date === 'relative' ? 'long' : undefined) : String(value);
    }
    case 'checkbox':
      return value === true ? words.checked : words.unchecked;
    case 'link':
      return readableUrl(String(value));
    default:
      return Array.isArray(value) ? value.map(label).join(', ') : label(String(value));
  }
};

/**
 * The sort a type brings, over the column's raw values. Status sorts by its
 * options' order (a workflow reads Todo, Doing, Done, not alphabetically);
 * people and tags by their first name or tag; a checkbox puts the checked
 * first ascending. Every other type keeps the table's own comparison.
 */
export const typedComparator = (
  type: ColumnType | undefined,
  options: { value: string }[] | undefined,
  base: (a: CellValue, b: CellValue) => number,
): ((a: CellValue, b: CellValue) => number) => {
  if (type === 'status' && options?.length) {
    const rank = new Map(options.map((option, index) => [option.value, index]));
    return (a, b) => {
      if (a == null || b == null) return base(a, b);
      return (rank.get(String(a)) ?? options.length) - (rank.get(String(b)) ?? options.length);
    };
  }
  if (type === 'person' || type === 'tags') return (a, b) => base(first(a), first(b));
  if (type === 'checkbox') return (a, b) => Number(b === true) - Number(a === true);
  return base;
};
