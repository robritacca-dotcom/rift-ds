'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '../../behaviors/LocaleProvider';
import { MOTION_DEADLINE_TICK_MS } from '../../tokens/motion';
import { formatInTimeZone, formatRelative, toDate, type DateInput } from '../../format/relative';
import { deadlineStatus, type DeadlineStatus, type DeadlineThresholds } from './deadlineStatus';
import './Deadline.css';

/** Props owned by Deadline itself; everything else falls through to the root `<span>`. */
type DeadlineOwnProps = {
  /** The moment it falls due: a Date, an ISO 8601 string or milliseconds since the epoch. */
  date: DateInput;
  /** The IANA zone the time is shown in, named after it ("4:00 PM PST"), such as `America/Los_Angeles`. Without it the time shows in the reader's own zone. */
  timeZone?: string;
  /** `relative` writes the distance ("in 2 days"), `absolute` the date and time, `both` the two together. Defaults to `relative`. */
  display?: 'relative' | 'absolute' | 'both';
  /** How close the deadline must be before it turns to the warning and then the error role. */
  thresholds?: DeadlineThresholds;
  /** The word before the distance: "Due", "Closes", "Expires". Defaults to "Due". */
  prefixLabel?: string;
  /** What a deadline that has passed says in place of the distance. Defaults to "Overdue". */
  overdueLabel?: string;
  /** `badge` draws the Badge family's tinted pill; `text` writes it inline in the status text colour, for a sentence or a table cell. */
  variant?: 'badge' | 'text';
  /** Component size */
  size?: 'default' | 'compact';
  /** Rewrite the distance as time passes, pausing while the page is hidden. Defaults to true; off when `now` is set. */
  tick?: boolean;
  /** The moment to measure from, in place of the clock: for a server render that must match, a test, or a screenshot. */
  now?: DateInput;
  /** Called when the deadline moves to a new status as time passes, so a host can react (sort, notify). */
  onStatusChange?: (status: DeadlineStatus) => void;
  /** The BCP 47 locale the distance and the date are written in. Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface DeadlineProps
  extends DeadlineOwnProps,
    Omit<React.ComponentPropsWithRef<'span'>, keyof DeadlineOwnProps | 'children'> {}

/** The clock, rewritten every tick while the page shows, still while it is hidden or when `fixed`. */
function useNow(fixed: Date | null, tick: boolean): Date {
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    if (fixed || !tick) return;
    let timer: number | undefined;
    const start = () => {
      window.clearInterval(timer);
      setClock(new Date());
      timer = window.setInterval(() => setClock(new Date()), MOTION_DEADLINE_TICK_MS);
    };
    const onVisibility = () => {
      if (document.hidden) window.clearInterval(timer);
      else start();
    };
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fixed, tick]);
  return fixed ?? clock;
}

/**
 * A deadline against now: "Due in 2 days", turning to the warning role as it
 * nears and the error role on its last day, then "Overdue". Submission
 * cutoffs, invoice due dates, trial expiry, ticket service levels. The full
 * date sits in a `<time>` element, and the distance rewrites itself every
 * half minute while the page shows.
 */
export function Deadline({
  date,
  timeZone,
  display = 'relative',
  thresholds,
  prefixLabel = 'Due',
  overdueLabel = 'Overdue',
  variant = 'badge',
  size = 'default',
  tick = true,
  now: nowProp,
  onStatusChange,
  locale: localeProp,
  className = '',
  ref,
  ...rest
}: DeadlineProps) {
  const locale = useLocale(localeProp);
  const due = toDate(date);
  const fixed = nowProp !== undefined ? toDate(nowProp) : null;
  const now = useNow(fixed, tick);
  const status = due ? deadlineStatus(due, now, thresholds) : 'neutral';

  const [reported, setReported] = useState(status);
  if (reported !== status) {
    setReported(status);
    onStatusChange?.(status);
  }

  if (!due) return null;

  // The reader's own zone when none is named, asked of Intl in the resolved locale.
  const zone = timeZone ?? new Intl.DateTimeFormat(locale).resolvedOptions().timeZone;

  const absolute = formatInTimeZone(due, {
    locale,
    timeZone: zone,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    ...(timeZone ? { timeZoneName: 'short' } : {}),
  });
  const full = formatInTimeZone(due, {
    locale,
    timeZone: zone,
    dateStyle: 'full',
    timeStyle: 'long',
  });
  const relative = formatRelative(due, { now, locale });
  const overdue = status === 'overdue';
  const lead = overdue ? overdueLabel : prefixLabel;
  const text =
    display === 'absolute'
      ? `${lead} ${absolute}`
      : display === 'both'
        ? `${overdue ? lead : `${lead} ${relative}`} · ${absolute}`
        : overdue
          ? lead
          : `${lead} ${relative}`;

  const classes = [
    'ds-deadline',
    `ds-deadline--${variant}`,
    `ds-deadline--${size}`,
    `ds-deadline--${overdue ? 'error' : status}`,
    overdue && 'ds-deadline--overdue',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span {...rest} ref={ref} className={classes}>
      {/* The distance depends on the clock, which the server and the browser
          read a moment apart; the browser's reading wins without a warning. */}
      <time dateTime={due.toISOString()} title={full} suppressHydrationWarning>
        {text}
      </time>
    </span>
  );
}

// deadlineStatus is a plain function beside the component, not a component,
// so the Fast Refresh rule that wants a component module to export only
// components does not apply to it.
// eslint-disable-next-line react-refresh/only-export-components
export { deadlineStatus } from './deadlineStatus';
export type { DeadlineStatus, DeadlineThresholds } from './deadlineStatus';
