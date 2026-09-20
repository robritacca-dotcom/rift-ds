'use client';

import React, { useMemo, useState } from 'react';
import './EventCalendar.css';
import '../../fonts/material-symbols.css';

export type EventCalendarColor =
  | 'neutral'
  | 'coral'
  | 'violet'
  | 'cobalt'
  | 'amber'
  | 'gold'
  | 'mint';

export interface EventCalendarEvent {
  /** Unique event identifier. */
  id: string;
  /** The day the event falls on (YYYY-MM-DD). */
  date: string;
  /** Short label shown in the event pill. */
  title: string;
  /** Start time as already-formatted text like "09:30". Untimed events sort first. */
  time?: string;
  /** Accent for the pill's dot, from the core accent roles. Defaults to `neutral`. */
  color?: EventCalendarColor;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Parse "YYYY-MM" into [year, monthIndex]. */
function parseMonth(str: string): [number, number] {
  const [y, m] = str.split('-').map(Number);
  return [y, m - 1];
}

function formatMonth(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Props owned by EventCalendar itself — everything else falls through to the root element. */
type EventCalendarOwnProps = {
  /** The events to place on the grid, including any that fall on the visible leading and trailing days of the neighbouring months. */
  events?: EventCalendarEvent[];
  /** Shown month (YYYY-MM) for controlled use. Pair with `onMonthChange`. */
  month?: string;
  /** Initially shown month (YYYY-MM) for uncontrolled use. Defaults to the current month. */
  defaultMonth?: string;
  /** Fires with the newly shown month (YYYY-MM) after prev/next navigation. */
  onMonthChange?: (month: string) => void;
  /** Event pills shown per day before the rest collapse into "+N more". */
  maxEventsPerDay?: number;
  /** Fires with the clicked event. Pills only render as buttons when this is set. */
  onEventClick?: (event: EventCalendarEvent) => void;
  /**
   * Fires with the clicked day (YYYY-MM-DD) — from anywhere on the cell, the
   * day number, and the "+N more" overflow row. The number and overflow row
   * only become buttons when this is set, and cells only take their pointer
   * cursor and hover feedback with it.
   */
  onDateClick?: (date: string) => void;
  /**
   * Marks this day (YYYY-MM-DD) as the selected one — the action-colour chip
   * on its number, taking precedence over the today chip. Controlled by the
   * consumer; pair with `onDateClick` to move it.
   */
  selectedDate?: string;
  /** Trailing header slot, e.g. a "New event" Button. */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface EventCalendarProps
  extends EventCalendarOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof EventCalendarOwnProps> {}

/**
 * EventCalendar is the month-at-a-glance view: a full month grid with event
 * pills on their days, an overflow row once a day is full, and prev/next
 * month navigation. DatePicker selects a date; this one shows a schedule.
 *
 * The calendar owns no event data semantics — it places what it is given.
 * Filtering, fetching, and what clicking an event means stay with the
 * consumer.
 */
export const EventCalendar = React.forwardRef<HTMLDivElement, EventCalendarProps>(
  (
    {
      events = [],
      month,
      defaultMonth,
      onMonthChange,
      maxEventsPerDay = 3,
      onEventClick,
      onDateClick,
      selectedDate,
      actions,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-event-calendar';
    const today = useMemo(() => new Date(), []);

    const isControlled = month !== undefined;
    const [uncontrolledMonth, setUncontrolledMonth] = useState(
      defaultMonth ?? formatMonth(today.getFullYear(), today.getMonth()),
    );
    const currentMonth = isControlled ? month : uncontrolledMonth;
    const [viewYear, viewMonth] = parseMonth(currentMonth);

    const navigate = (offset: number) => {
      const next = new Date(viewYear, viewMonth + offset, 1);
      const value = formatMonth(next.getFullYear(), next.getMonth());
      if (!isControlled) setUncontrolledMonth(value);
      onMonthChange?.(value);
    };

    // Group events by date, untimed first then by time text
    const eventsByDate = useMemo(() => {
      const map = new Map<string, EventCalendarEvent[]>();
      for (const event of events) {
        const list = map.get(event.date) ?? [];
        list.push(event);
        map.set(event.date, list);
      }
      for (const list of map.values()) {
        list.sort((a, b) => {
          if (!a.time && !b.time) return 0;
          if (!a.time) return -1;
          if (!b.time) return 1;
          return a.time.localeCompare(b.time);
        });
      }
      return map;
    }, [events]);

    // Build the grid — whole weeks only, trimmed to the month's span
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const weekCount = Math.ceil((firstDay + daysInMonth) / 7);

    const cells: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < weekCount * 7; i++) {
      const date = new Date(viewYear, viewMonth, i - firstDay + 1);
      cells.push({ date, inMonth: date.getMonth() === viewMonth });
    }

    const classes = [baseClass, className].filter(Boolean).join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        <div className={`${baseClass}__header`}>
          <span className={`${baseClass}__month`}>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <div className={`${baseClass}__nav`}>
            <button
              type="button"
              className={`${baseClass}__nav-btn material-symbols-rounded`}
              onClick={() => navigate(-1)}
              aria-label="Previous month"
            >
              chevron_left
            </button>
            <button
              type="button"
              className={`${baseClass}__nav-btn material-symbols-rounded`}
              onClick={() => navigate(1)}
              aria-label="Next month"
            >
              chevron_right
            </button>
          </div>
          {actions && <div className={`${baseClass}__actions`}>{actions}</div>}
        </div>

        <div className={`${baseClass}__weekdays`} aria-hidden="true">
          {DAYS.map((day) => (
            <div key={day} className={`${baseClass}__weekday`}>
              {day}
            </div>
          ))}
        </div>

        {/* Like DatePicker, deliberately NOT role="grid": there is no 2D
            arrow-key model here, so claiming the role would be a lie. */}
        <div
          className={`${baseClass}__grid`}
          role="group"
          aria-label={`${MONTHS[viewMonth]} ${viewYear}`}
        >
          {cells.map(({ date, inMonth }) => {
            const dateStr = formatDate(date);
            const dayEvents = eventsByDate.get(dateStr) ?? [];
            const visible = dayEvents.slice(0, maxEventsPerDay);
            const overflow = dayEvents.length - visible.length;
            const isToday =
              date.getFullYear() === today.getFullYear() &&
              date.getMonth() === today.getMonth() &&
              date.getDate() === today.getDate();

            const dayLabel = date.toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            const isSelected = dateStr === selectedDate;

            const cellClasses = [
              `${baseClass}__cell`,
              !inMonth ? `${baseClass}__cell--outside` : '',
              isToday ? `${baseClass}__cell--today` : '',
              isSelected ? `${baseClass}__cell--selected` : '',
              onDateClick ? `${baseClass}__cell--clickable` : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div
                key={dateStr}
                className={cellClasses}
                // The whole cell is a pointer target when days are clickable;
                // the day-number button stays the accessible control, and
                // clicks that land on any button inside (the number, a pill,
                // the overflow row) are left to that button's own handler.
                onClick={
                  onDateClick
                    ? (e) => {
                        if ((e.target as HTMLElement).closest('button')) return;
                        onDateClick(dateStr);
                      }
                    : undefined
                }
              >
                {onDateClick ? (
                  <button
                    type="button"
                    className={`${baseClass}__day`}
                    onClick={() => onDateClick(dateStr)}
                    aria-label={dayLabel}
                    aria-current={isToday ? 'date' : undefined}
                    aria-pressed={selectedDate !== undefined ? isSelected : undefined}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <span
                    className={`${baseClass}__day`}
                    aria-label={dayLabel}
                    aria-current={isToday ? 'date' : undefined}
                  >
                    {date.getDate()}
                  </span>
                )}

                <div className={`${baseClass}__events`}>
                  {visible.map((event) => {
                    const pillClasses = [
                      `${baseClass}__event`,
                      `${baseClass}__event--${event.color ?? 'neutral'}`,
                    ].join(' ');
                    const pillContent = (
                      <>
                        <span className={`${baseClass}__event-dot`} aria-hidden="true" />
                        <span className={`${baseClass}__event-title`}>{event.title}</span>
                        {event.time && (
                          <span className={`${baseClass}__event-time`}>{event.time}</span>
                        )}
                      </>
                    );
                    return onEventClick ? (
                      <button
                        key={event.id}
                        type="button"
                        className={pillClasses}
                        onClick={() => onEventClick(event)}
                        aria-label={`${event.title}${event.time ? `, ${event.time}` : ''}, ${dayLabel}`}
                      >
                        {pillContent}
                      </button>
                    ) : (
                      <span key={event.id} className={pillClasses}>
                        {pillContent}
                      </span>
                    );
                  })}

                  {overflow > 0 &&
                    (onDateClick ? (
                      <button
                        type="button"
                        className={`${baseClass}__more`}
                        onClick={() => onDateClick(dateStr)}
                        aria-label={`${overflow} more event${overflow === 1 ? '' : 's'}, ${dayLabel}`}
                      >
                        +{overflow} more
                      </button>
                    ) : (
                      <span className={`${baseClass}__more`}>+{overflow} more</span>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

EventCalendar.displayName = 'EventCalendar';
