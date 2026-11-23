/**
 * ContributionGraph's grid: days placed by their own dates. Each column is
 * one calendar week and each row one weekday, so a day lands on its
 * weekday's row whatever came before it. A date the list leaves out is an
 * empty cell, and a date listed twice keeps its last entry.
 */
import { weekdayOffset, type Weekday } from '../../behaviors/locale';

/** The most weeks the grid draws, so a stray year in one date cannot build a grid of thousands of columns. */
const MAX_WEEKS = 530;

/** A `YYYY-MM-DD` string as a whole-day count, free of time zones and daylight saving. */
const dayNumber = (date: string): number | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  // A day is 86,400,000 ms; UTC has no clock changes, so the division is exact.
  return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86_400_000 : null;
};

/**
 * Group days into calendar weeks, each column starting on `weekStart`, each
 * day at its weekday's row. The last week ends at the last day.
 */
export function buildWeeks<T extends { date: string }>(days: readonly T[], weekStart: Weekday): (T | null)[][] {
  const placed = days
    .map((day) => ({ day, n: dayNumber(day.date) }))
    .filter((entry): entry is { day: T; n: number } => entry.n !== null);
  if (placed.length === 0) return [];

  const first = Math.min(...placed.map((entry) => entry.n));
  // Day 0 of the Unix epoch was a Thursday (4).
  const gridStart = first - weekdayOffset((((first + 4) % 7) + 7) % 7, weekStart);
  const last = Math.min(Math.max(...placed.map((entry) => entry.n)), gridStart + MAX_WEEKS * 7 - 1);

  const weekCount = Math.floor((last - gridStart) / 7) + 1;
  const weeks: (T | null)[][] = Array.from({ length: weekCount }, () => Array<T | null>(7).fill(null));
  for (const { day, n } of placed) {
    if (n > last) continue;
    const offset = n - gridStart;
    weeks[Math.floor(offset / 7)][offset % 7] = day;
  }
  weeks[weekCount - 1].length = ((last - gridStart) % 7) + 1;
  return weeks;
}
