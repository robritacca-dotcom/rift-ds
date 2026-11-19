'use client';

import React, { useMemo, useState } from 'react';
import { Chip } from '../Chip/Chip';
import './EventCalendar.css';
import '../../behaviors/visually-hidden.css';
import '../../fonts/material-symbols.css';
import { useLocale } from '../../behaviors/LocaleProvider';
import {
  rotateWeek,
  weekStartOf,
  weekdayHeadersIn,
  weekdayOffset,
  type Weekday,
} from '../../behaviors/locale';

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
  /** The day the event falls on (YYYY-MM-DD), or its first day when it runs over several. */
  date: string;
  /** The last day of an event that runs over several days (YYYY-MM-DD, inclusive): it shows on every day from `date` to this one, its pills joined across the days and its dot on the first. */
  endDate?: string;
  /** Short label shown in the event pill. */
  title: string;
  /** Start time as already-formatted text like "09:30". Untimed events sort first. */
  time?: string;
  /** Accent for the pill's dot, from the core accent roles. Defaults to `neutral`. */
  color?: EventCalendarColor;
}

/** A colour the calendar's events use, and what it means, for the legend. */
export interface EventCalendarLegendItem {
  /** The accent, as an event's `color` names it. */
  color: EventCalendarColor;
  /** What events in this colour are ("Offsites", "Deadlines"). */
  label: string;
}

/** A `YYYY-MM-DD` string as a local date, or null when it is not one. */
function parseDay(str: string | undefined): Date | null {
  const match = str ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(str) : null;
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

/** The longest span an event is drawn across, so a typo in `endDate` cannot loop for years. */
const MAX_SPAN_DAYS = 366;

/** A consumer's weekday list when it has the seven entries the grid needs, else the locale's. */
const weekdaysOr = (labels: string[] | undefined, locale: string): string[] =>
  labels && labels.length === 7 ? labels : weekdayHeadersIn(locale);
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

/** A day's full date in `locale`, the spoken half of every day-level name. */
const dayLabelIn = (locale: string) => {
  const format = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (date: Date): string => format.format(date);
};

const monthLabelIn = (locale: string) => {
  const format = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
  return (month: Date): string => format.format(month);
};

const defaultMoreLabel = (count: number): string => `+${count} more`;

const overflowLabelIn = (formatDayLabel: (date: Date) => string) =>
  (count: number, date: Date): string =>
    `${count} more event${count === 1 ? '' : 's'}, ${formatDayLabel(date)}`;

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
  /** The date the calendar treats as today (`YYYY-MM-DD`): it carries the today chip and picks the month shown first. Defaults to the device's date; pin it for a demo, a test or a time zone the device is not in. */
  today?: string;
  /** What each event colour means, shown as a row of dots and labels under the grid. With `legendToggles`, each entry also shows and hides its colour's events. */
  legend?: EventCalendarLegendItem[];
  /** Makes each legend entry a selectable Chip that shows or hides the events of its colour, so a reader can narrow a busy calendar by kind. */
  legendToggles?: boolean;
  /** The colours whose events are hidden, for controlled use. Pair with `onHiddenColorsChange`. */
  hiddenColors?: EventCalendarColor[];
  /** The colours hidden to begin with, for uncontrolled use. */
  defaultHiddenColors?: EventCalendarColor[];
  /** Fires with the hidden colours after a legend entry is switched. */
  onHiddenColorsChange?: (colors: EventCalendarColor[]) => void;
  /** The name of the legend's set of toggles, when `legendToggles` is on. */
  legendLabel?: string;
  /**
   * Draws a panel for the selected day under the grid, in every view: handed
   * the day (YYYY-MM-DD) and its events as shown, it returns what the panel
   * holds (a list of the day's events, a form to add one). Shown only while
   * `selectedDate` is set.
   */
  renderSelectedDay?: (date: string, events: EventCalendarEvent[]) => React.ReactNode;
  /** Trailing header slot, e.g. a "New event" Button. */
  actions?: React.ReactNode;
  /** `month` shows the whole month, a day's overflow folded behind "+N more"; `week` shows one week in tall cells with every event, stepping a week at a time from the selected day's week (else today's), which it keeps as its own state after mount; `day` shows that one day the same way, stepping a day at a time. */
  view?: 'month' | 'week' | 'day';
  /** Accessible name of the previous-month button. */
  previousLabel?: string;
  /** Accessible name of the next-month button. */
  nextLabel?: string;
  /** Accessible name of the previous-week button, in the week view. */
  previousWeekLabel?: string;
  /** Accessible name of the next-week button, in the week view. */
  nextWeekLabel?: string;
  /** Accessible name of the previous-day button, in the day view. */
  previousDayLabel?: string;
  /** Accessible name of the next-day button, in the day view. */
  nextDayLabel?: string;
  /** The visible text of the control that folds an expanded day back, when a day's "+N more" opens it in place (with no `onDateClick`). */
  showLessLabel?: string;
  /**
   * The month heading, given the first day of the month in view: the visible
   * title and the name of the day grid. Defaults to the month name and the
   * year in `locale` ("January 2026" in `en-US`). Month view only; the week
   * view's heading is the week's range in `locale`.
   */
  monthLabel?: (month: Date) => string;
  /**
   * Accessible name of a day's "+N more" overflow button, given the number of
   * hidden events and the day. Defaults to "N more events" followed by the
   * full date in `locale`.
   */
  overflowLabel?: (count: number, date: Date) => string;
  /**
   * The visible text of a day's overflow row, given the number of hidden
   * events. Defaults to "+N more". The row's accessible name is
   * `overflowLabel` when it is a button.
   */
  moreLabel?: (count: number) => string;
  /**
   * The weekday headers above the grid: seven entries, Sunday first, laid
   * out from `weekStartsOn`. Defaults to the short weekday names in `locale`
   * ("Sun" to "Sat" in `en-US`), or its narrow names where the short ones
   * are whole words (Arabic); a list of any other length falls back to the
   * default.
   */
  weekdayLabels?: string[];
  /**
   * The BCP 47 locale the calendar is written and laid out in, such as
   * `de-DE`: the month heading, the weekday names, the spoken dates and the
   * first day of the week. Defaults to the nearest LocaleProvider's, else
   * `en-US`.
   */
  locale?: string;
  /**
   * The first column of the grid, 0 (Sunday) to 6 (Saturday). Defaults to
   * the first day of the week in `locale`: Sunday in `en-US`, Monday in
   * `de-DE`.
   */
  weekStartsOn?: Weekday;
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
      today: todayProp,
      legend,
      legendToggles = false,
      hiddenColors: hiddenColorsProp,
      defaultHiddenColors = [],
      onHiddenColorsChange,
      legendLabel = 'Show events by kind',
      renderSelectedDay,
      actions,
      view = 'month',
      previousLabel = 'Previous month',
      nextLabel = 'Next month',
      previousWeekLabel = 'Previous week',
      nextWeekLabel = 'Next week',
      previousDayLabel = 'Previous day',
      nextDayLabel = 'Next day',
      showLessLabel = 'Show less',
      monthLabel: monthLabelProp,
      overflowLabel: overflowLabelProp,
      moreLabel = defaultMoreLabel,
      weekdayLabels,
      locale: localeProp,
      weekStartsOn,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-event-calendar';
    const today = useMemo(() => parseDay(todayProp) ?? new Date(), [todayProp]);
    const locale = useLocale(localeProp);
    const weekStart = weekStartsOn ?? weekStartOf(locale);
    const dayNumber = useMemo(() => new Intl.NumberFormat(locale), [locale]);
    const formatDayLabel = useMemo(() => dayLabelIn(locale), [locale]);
    const monthLabel = useMemo(() => monthLabelProp ?? monthLabelIn(locale), [monthLabelProp, locale]);
    const overflowLabel = useMemo(
      () => overflowLabelProp ?? overflowLabelIn(formatDayLabel),
      [overflowLabelProp, formatDayLabel],
    );

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

    /* The week view keeps its own place: the week holding the selected day,
       else today, stepping seven days at a time. A step that crosses into
       another month reports it, as the month view's arrows do. */
    /* The day view is the week view's cell alone: the same anchor, one day
       at a time. */
    const isDay = view === 'day';
    const isWeek = view === 'week' || isDay;
    const [weekAnchor, setWeekAnchor] = useState(() => parseDay(selectedDate) ?? today);
    const weekStartDate = isDay
      ? weekAnchor
      : new Date(
          weekAnchor.getFullYear(),
          weekAnchor.getMonth(),
          weekAnchor.getDate() - weekdayOffset(weekAnchor.getDay(), weekStart),
        );
    const stepWeek = (offset: number) => {
      const next = new Date(weekAnchor.getFullYear(), weekAnchor.getMonth(), weekAnchor.getDate() + offset * (isDay ? 1 : 7));
      setWeekAnchor(next);
      const value = formatMonth(next.getFullYear(), next.getMonth());
      if (value !== formatMonth(weekAnchor.getFullYear(), weekAnchor.getMonth())) {
        if (!isControlled) setUncontrolledMonth(value);
        onMonthChange?.(value);
      }
    };

    /* With no onDateClick, a day's "+N more" opens that day in place. */
    const [expandedDays, setExpandedDays] = useState<string[]>([]);
    const toggleDay = (day: string) =>
      setExpandedDays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]));
    const weekRangeLabel = useMemo(() => {
      const format = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' });
      return (start: Date) => format.formatRange(start, new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6));
    }, [locale]);

    /* The colours the legend has switched off. Applied here, so every view
       and the selected day's panel show the same events. */
    const [ownHidden, setOwnHidden] = useState<EventCalendarColor[]>(defaultHiddenColors);
    const hiddenColors = hiddenColorsProp ?? ownHidden;
    const toggleColor = (color: EventCalendarColor) => {
      const next = hiddenColors.includes(color) ? hiddenColors.filter((c) => c !== color) : [...hiddenColors, color];
      if (hiddenColorsProp === undefined) setOwnHidden(next);
      onHiddenColorsChange?.(next);
    };

    // Group events by date, untimed first then by time text
    const eventsByDate = useMemo(() => {
      const map = new Map<string, EventCalendarEvent[]>();
      const add = (day: string, event: EventCalendarEvent) => {
        const list = map.get(day) ?? [];
        list.push(event);
        map.set(day, list);
      };
      for (const event of events) {
        if (hiddenColors.includes(event.color ?? 'neutral')) continue;
        const start = parseDay(event.date);
        const end = parseDay(event.endDate);
        if (!start || !end || end <= start) {
          add(event.date, event);
          continue;
        }
        const day = new Date(start);
        for (let i = 0; i < MAX_SPAN_DAYS && day <= end; i++) {
          add(formatDate(day), event);
          day.setDate(day.getDate() + 1);
        }
      }
      const spans = (event: EventCalendarEvent) => Boolean(event.endDate && event.endDate > event.date);
      for (const list of map.values()) {
        list.sort((a, b) => {
          // Events that run over several days lead each day, so their pills line up across it.
          if (spans(a) !== spans(b)) return spans(a) ? -1 : 1;
          if (!a.time && !b.time) return 0;
          if (!a.time) return -1;
          if (!b.time) return 1;
          return a.time.localeCompare(b.time, locale);
        });
      }
      return map;
    }, [events, locale, hiddenColors]);
    const formatSpan = useMemo(() => {
      const format = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' });
      return (event: EventCalendarEvent) => {
        const start = parseDay(event.date);
        const end = parseDay(event.endDate);
        return start && end && end > start ? format.formatRange(start, end) : null;
      };
    }, [locale]);

    // Build the grid — whole weeks only, trimmed to the month's span
    const firstDay = weekdayOffset(new Date(viewYear, viewMonth, 1).getDay(), weekStart);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const weekCount = Math.ceil((firstDay + daysInMonth) / 7);

    const cells: { date: Date; inMonth: boolean }[] = [];
    if (isWeek) {
      for (let i = 0; i < (isDay ? 1 : 7); i++) {
        cells.push({
          date: new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate() + i),
          inMonth: true,
        });
      }
    } else {
      for (let i = 0; i < weekCount * 7; i++) {
        const date = new Date(viewYear, viewMonth, i - firstDay + 1);
        cells.push({ date, inMonth: date.getMonth() === viewMonth });
      }
    }

    const classes = [baseClass, isWeek ? `${baseClass}--week` : '', isDay ? `${baseClass}--day` : '', className]
      .filter(Boolean)
      .join(' ');
    const monthTitle = isDay
      ? formatDayLabel(weekStartDate)
      : isWeek
        ? weekRangeLabel(weekStartDate)
        : monthLabel(new Date(viewYear, viewMonth, 1));
    const previousName = isDay ? previousDayLabel : isWeek ? previousWeekLabel : previousLabel;
    const nextName = isDay ? nextDayLabel : isWeek ? nextWeekLabel : nextLabel;

    return (
      <div {...rest} ref={ref} className={classes}>
        <div className={`${baseClass}__header`}>
          <span className={`${baseClass}__month`}>{monthTitle}</span>
          <div className={`${baseClass}__nav`}>
            <button
              type="button"
              className={`${baseClass}__nav-btn material-symbols-rounded ds-mirror-rtl`}
              onClick={() => (isWeek ? stepWeek(-1) : navigate(-1))}
              aria-label={previousName}
            >
              chevron_left
            </button>
            <button
              type="button"
              className={`${baseClass}__nav-btn material-symbols-rounded ds-mirror-rtl`}
              onClick={() => (isWeek ? stepWeek(1) : navigate(1))}
              aria-label={nextName}
            >
              chevron_right
            </button>
          </div>
          {actions && <div className={`${baseClass}__actions`}>{actions}</div>}
        </div>

        {/* The day view's heading already names its weekday. */}
        {!isDay && (
          <div className={`${baseClass}__weekdays`} aria-hidden="true">
            {rotateWeek(weekdaysOr(weekdayLabels, locale), weekStart).map((day, index) => (
              <div key={index} className={`${baseClass}__weekday`}>
                {day}
              </div>
            ))}
          </div>
        )}

        {/* Deliberately NOT role="grid": unlike DatePicker's day grid there
            is no 2D arrow-key model here, so claiming the role would be a lie. */}
        <div
          className={`${baseClass}__grid`}
          role="group"
          aria-label={monthTitle}
        >
          {cells.map(({ date, inMonth }) => {
            const dateStr = formatDate(date);
            const dayEvents = eventsByDate.get(dateStr) ?? [];
            const expanded = isWeek || expandedDays.includes(dateStr);
            const visible = expanded ? dayEvents : dayEvents.slice(0, maxEventsPerDay);
            const overflow = dayEvents.length - visible.length;
            const isToday =
              date.getFullYear() === today.getFullYear() &&
              date.getMonth() === today.getMonth() &&
              date.getDate() === today.getDate();

            const dayLabel = formatDayLabel(date);

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
                    {dayNumber.format(date.getDate())}
                  </button>
                ) : (
                  <span
                    className={`${baseClass}__day`}
                    aria-label={dayLabel}
                    aria-current={isToday ? 'date' : undefined}
                  >
                    {dayNumber.format(date.getDate())}
                  </span>
                )}

                <div className={`${baseClass}__events`}>
                  {visible.map((event) => {
                    const span = formatSpan(event);
                    const pillClasses = [
                      `${baseClass}__event`,
                      `${baseClass}__event--${event.color ?? 'neutral'}`,
                      span ? `${baseClass}__event--span` : '',
                      span && dateStr !== event.date ? `${baseClass}__event--continued` : '',
                      span && dateStr !== event.endDate ? `${baseClass}__event--continues` : '',
                    ]
                      .filter(Boolean)
                      .join(' ');
                    /* The visible title and time are hidden from assistive
                       technology and said once instead (the button's name, or
                       hidden text on a plain pill), because a phone's month
                       grid draws each event as its dot alone. */
                    const pillContent = (
                      <>
                        <span className={`${baseClass}__event-dot`} aria-hidden="true" />
                        <span className={`${baseClass}__event-title`} aria-hidden="true">
                          {event.title}
                        </span>
                        {event.time && (
                          <span className={`${baseClass}__event-time`} aria-hidden="true">
                            {event.time}
                          </span>
                        )}
                        {!onEventClick && (
                          <span className="ds-visually-hidden">
                            {event.time ? `${event.title}, ${event.time}` : event.title}
                          </span>
                        )}
                      </>
                    );
                    return onEventClick ? (
                      <button
                        key={event.id}
                        type="button"
                        className={pillClasses}
                        onClick={() => onEventClick(event)}
                        aria-label={
                          span
                            ? `${event.title}, ${span}`
                            : `${event.title}${event.time ? `, ${event.time}` : ''}, ${dayLabel}`
                        }
                      >
                        {pillContent}
                      </button>
                    ) : (
                      <span key={event.id} className={pillClasses}>
                        {pillContent}
                      </span>
                    );
                  })}

                  {!isWeek && expandedDays.includes(dateStr) && dayEvents.length > maxEventsPerDay && (
                    <button type="button" className={`${baseClass}__more`} onClick={() => toggleDay(dateStr)} aria-expanded="true">
                      {showLessLabel}
                    </button>
                  )}
                  {overflow > 0 &&
                    (onDateClick ? (
                      <button
                        type="button"
                        className={`${baseClass}__more`}
                        onClick={() => onDateClick(dateStr)}
                        aria-label={overflowLabel(overflow, date)}
                      >
                        {moreLabel(overflow)}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`${baseClass}__more`}
                        onClick={() => toggleDay(dateStr)}
                        aria-expanded="false"
                        aria-label={overflowLabel(overflow, date)}
                      >
                        {moreLabel(overflow)}
                      </button>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
        {selectedDate && renderSelectedDay && (
          <div className={`${baseClass}__selected-day`}>{renderSelectedDay(selectedDate, eventsByDate.get(selectedDate) ?? [])}</div>
        )}
        {legend && legend.length > 0 && legendToggles && (
          <div className={`${baseClass}__legend`} role="group" aria-label={legendLabel}>
            {legend.map((item) => (
              <Chip
                key={`${item.color}-${item.label}`}
                size="compact"
                className={`${baseClass}__event--${item.color}`}
                icon={<span className={`${baseClass}__event-dot`} aria-hidden="true" />}
                label={item.label}
                selected={!hiddenColors.includes(item.color)}
                onClick={() => toggleColor(item.color)}
              />
            ))}
          </div>
        )}
        {legend && legend.length > 0 && !legendToggles && (
          <ul className={`${baseClass}__legend`}>
            {legend.map((item) => (
              <li key={`${item.color}-${item.label}`} className={`${baseClass}__legend-item ${baseClass}__event--${item.color}`}>
                <span className={`${baseClass}__event-dot`} aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

EventCalendar.displayName = 'EventCalendar';
