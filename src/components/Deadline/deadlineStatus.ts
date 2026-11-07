/**
 * Where a deadline stands against now, without React: Deadline reads it, and
 * a host can call it to sort or filter by the same rule.
 */

/** How close a deadline must be for each warning, in milliseconds. */
export type DeadlineThresholds = {
  /** Under this long to go, the deadline turns to the warning role. Defaults to three days. */
  warning?: number;
  /** Under this long to go, the deadline turns to the error role. Defaults to one day. */
  critical?: number;
};

/** Where a deadline stands against now. */
export type DeadlineStatus = 'neutral' | 'warning' | 'error' | 'overdue';

/** Calendar units for reading a distance, not timings. */
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Where `due` stands against `now`, given the thresholds. */
export function deadlineStatus(due: Date, now: Date, thresholds: DeadlineThresholds = {}): DeadlineStatus {
  const { warning = 3 * DAY, critical = DAY } = thresholds;
  const left = due.getTime() - now.getTime();
  if (left < 0) return 'overdue';
  if (left < critical) return 'error';
  if (left < warning) return 'warning';
  return 'neutral';
}

