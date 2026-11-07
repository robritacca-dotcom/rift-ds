/**
 * The calendar the date pickers share: the date helpers and the keyboard
 * move through a WAI-ARIA date grid. Internal: DatePicker and DateRangePicker
 * each compose these and MonthGrid (beside it) with their own header,
 * selection and class names, so a change to how a month lays out or how its
 * keys move happens once. No React at runtime.
 */

import type React from 'react';
import { weekdayOffset, type Weekday } from '../../behaviors/locale';
import { logicalArrowKey } from '../../behaviors/direction';

/** The two-letter English headers, which Intl has no width for. */
export const EN_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** A consumer's weekday list when it has the seven entries the grid needs, else the default. */
export const weekdaysOr = (labels: string[] | undefined, fallback: string[]): string[] =>
  labels && labels.length === 7 ? labels : fallback;

/** A `YYYY-MM-DD` string as a local date, or null. */
export function parseDate(str?: string | null): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** A local date as `YYYY-MM-DD`. */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Standard sr-only clip pattern, inline so no stylesheet change is needed.
 * position: absolute takes the element out of flow, so it cannot affect
 * layout; the 1px box + clip keep it invisible but still announced.
 */
export const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/** The month heading's default: the month and the year in `locale`. */
export const monthLabelIn = (locale: string) => {
  const format = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
  return (month: Date): string => format.format(month);
};

/** A day's spoken name: the full date in `locale`. */
export const fullDateIn = (locale: string) => {
  const format = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (date: Date): string => format.format(date);
};

/** DatePicker's day label default: the full date, with ", selected" when it is. */
export const dayLabelIn = (locale: string) => {
  const full = fullDateIn(locale);
  return (date: Date, selected: boolean): string => `${full(date)}${selected ? ', selected' : ''}`;
};

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** The same day of the month `months` away, pulled back to that month's last day when it is shorter. */
export const addMonths = (date: Date, months: number): Date => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + months + 1, 0).getDate();
  return new Date(date.getFullYear(), date.getMonth() + months, Math.min(date.getDate(), lastDay));
};

/** Whole days from `a` to `b`, counting calendar days so a clock change never shifts it. */
export const daysBetween = (a: Date, b: Date): number =>
  Math.round(
    (Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) /
      86_400_000,
  );

/** One square of a month grid: the day, whether it belongs to the month in view, and its date. */
export type MonthCell = { day: number; inMonth: boolean; date: Date };

/** A month as six weeks of seven, starting on `weekStart`, with the neighbouring months' days filling the edges. */
export function monthWeeks(year: number, month: number, weekStart: Weekday): MonthCell[][] {
  const firstDay = weekdayOffset(new Date(year, month, 1).getDay(), weekStart);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: MonthCell[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    cells.push({ day: d, inMonth: false, date: new Date(year, month - 1, d) });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, inMonth: true, date: new Date(year, month, d) });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, inMonth: false, date: new Date(year, month + 1, d) });
  const weeks: MonthCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/**
 * Where a key moves focus from `date` in a date grid: arrows a day or a
 * week (along the reading direction), Home and End the ends of the week,
 * Page Up and Page Down a month (a year with Shift). Null for any other key.
 */
export function keyMove(event: React.KeyboardEvent<HTMLElement>, date: Date, weekStart: Weekday): Date | null {
  switch (logicalArrowKey(event.key, event.currentTarget)) {
    case 'ArrowLeft':
      return addDays(date, -1);
    case 'ArrowRight':
      return addDays(date, 1);
    case 'ArrowUp':
      return addDays(date, -7);
    case 'ArrowDown':
      return addDays(date, 7);
    case 'Home':
      return addDays(date, -weekdayOffset(date.getDay(), weekStart));
    case 'End':
      return addDays(date, 6 - weekdayOffset(date.getDay(), weekStart));
    case 'PageUp':
      return addMonths(date, event.shiftKey ? -12 : -1);
    case 'PageDown':
      return addMonths(date, event.shiftKey ? 12 : 1);
    default:
      return null;
  }
}
