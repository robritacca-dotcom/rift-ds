'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
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
  plainSpaces,
  type Weekday,
} from '../../behaviors/locale';
import { MOTION_DEADLINE_TICK_MS } from '../../tokens/motion';
import { clockMinutes, compareTimes, minutesOf, nowMarkerIndex } from './eventTime';

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
  /** When the event starts, as a 24-hour `HH:mm` string ("08:50", "13:40"). The calendar writes it in the resolved locale and sorts each day by it: untimed events first, then by the clock. */
  start?: string;
  /** When the event ends, as a 24-hour `HH:mm` string, later than `start`. With it, the event shows and is named with its range ("8:50 – 9:50 AM" in `en-US`). */
  end?: string;
  /**
   * Start time as already-formatted text like "09:30" or "1:40 PM", shown
   * as written in place of `start` and `end` when it is set. Without `start`
   * it sorts by the clock where it reads as a clock time, after untimed
   * events and ahead of any other text.
   * @deprecated Use `start` (and `end`), which the calendar formats in the resolved locale.
   */
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

const weekLabelIn = (locale: string) => {
  const format = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' });
  return (start: Date, end: Date): string => plainSpaces(format.formatRange(start, end));
};

/** A clock time in minutes after midnight as a Date to format, on a day with no clock change. */
const atMinutes = (minutes: number): Date => new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);

/** The text an event's time is shown and named with, in `locale`, or null when it has none. */
const eventTimesIn = (locale: string) => {
  const format = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' });
  const clock = (minutes: number) => plainSpaces(format.format(atMinutes(minutes)));
  return (event: EventCalendarEvent): { range: string; start: string; end: string | null } | null => {
    if (event.time) return { range: event.time, start: event.time, end: null };
    const start = clockMinutes(event.start);
    if (start === null) return null;
    const end = clockMinutes(event.end);
    if (end === null || end <= start) return { range: clock(start), start: clock(start), end: null };
    return {
      range: plainSpaces(format.formatRange(atMinutes(start), atMinutes(end))),
      start: clock(start),
      end: clock(end),
    };
  };
};

/** What an event sorts by within its day: `start` when it is a clock time, else `time`. */
const sortTimeOf = (event: EventCalendarEvent): string | undefined =>
  clockMinutes(event.start) !== null ? event.start : event.time;

/* The device's clock, read only in the browser. The server's snapshot is
   null, so a server render and the hydrating client agree, and the browser's
   date takes over straight after; a client-only render reads it at once. The
   snapshot is text at the precision a calendar needs, so the calendar
   renders again only when the day (or, for the now marker, the minute)
   turns, and the tick pauses while the page is hidden. */
const subscribeClock = (onChange: () => void) => {
  let timer: number | undefined;
  const start = () => {
    window.clearInterval(timer);
    onChange();
    timer = window.setInterval(onChange, MOTION_DEADLINE_TICK_MS);
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
};
const subscribeNothing = () => () => {};
const clockToDay = () => formatDate(new Date());
const clockToMinute = () => {
  const now = new Date();
  return `${formatDate(now)}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};
const noClock = () => null;

function useDeviceClock(precision: 'off' | 'day' | 'minute'): string | null {
  return useSyncExternalStore(
    precision === 'off' ? subscribeNothing : subscribeClock,
    precision === 'minute' ? clockToMinute : precision === 'day' ? clockToDay : noClock,
    noClock,
  );
}

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
  /**
   * The date the calendar treats as today (`YYYY-MM-DD`): it carries the
   * today chip and picks the month shown first. Defaults to the device's
   * date, read in the browser only: a server render draws no today chip and
   * the browser adds it once it hydrates, so a server in another time zone
   * can never put it on the wrong day, and it moves on at midnight. The month
   * shown first still falls back to the render-time clock, so a server-rendered
   * host passes `today` (or `defaultMonth`) when the first month must match.
   * Pin it for a demo, a test or a time zone the device is not in.
   */
  today?: string;
  /**
   * The time (24-hour `HH:mm`) the day view's now marker sits at, when the
   * day shown is `today`. Defaults to the device's clock, read in the browser
   * only and moved on every minute, so a server render draws no marker; pin
   * it for a demo, a test or a screenshot.
   */
  now?: string;
  /** The text of the day view's now marker. */
  nowLabel?: string;
  /** What the day view's schedule shows in place of a time for an event with none. */
  allDayLabel?: string;
  /** What the day view's schedule says on a day with no events. */
  emptyDayLabel?: string;
  /** Strips the calendar's own fill, border, radius and padding, for a Panel or Widget that already draws the surface. */
  bare?: boolean;
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
  /** `month` shows the whole month, a day's overflow folded behind "+N more"; `week` shows one week in tall cells with every event, stepping a week at a time from the selected day's week (else today's), which it keeps as its own state after mount; `day` shows that one day as a schedule, each event's start and end time first, with a now marker on today, stepping a day at a time. */
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
   * view's heading is `weekLabel`, the day view's `dayLabel`.
   */
  monthLabel?: (month: Date) => string;
  /**
   * The week view's heading, given the first and last day of the week in
   * view: the visible title and the name of the week's cells. Defaults to
   * the range in `locale` ("August 16 – 22, 2026" in `en-US`).
   */
  weekLabel?: (start: Date, end: Date) => string;
  /**
   * The full name of a day, given the day: the day view's heading and every
   * day's spoken name. Defaults to the weekday and the date in `locale`
   * ("Thursday, August 20, 2026" in `en-US`).
   */
  dayLabel?: (date: Date) => string;
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
      now: nowProp,
      nowLabel = 'Now',
      allDayLabel = 'All day',
      emptyDayLabel = 'No events',
      bare = false,
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
      weekLabel: weekLabelProp,
      dayLabel: dayLabelProp,
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
    const isDay = view === 'day';
    const isWeek = view === 'week' || isDay;
    const pinnedToday = useMemo(() => parseDay(todayProp), [todayProp]);
    const pinnedNow = clockMinutes(nowProp);
    const clock = useDeviceClock(isDay && pinnedNow === null ? 'minute' : pinnedToday ? 'off' : 'day');
    const [clockDay, clockTime] = clock?.split('T') ?? [];
    const deviceToday = useMemo(() => parseDay(clockDay), [clockDay]);
    /* Null until the browser has read its clock, when nothing pins it: no
       day carries the today chip yet. */
    const today = pinnedToday ?? deviceToday;
    const nowMinutes = pinnedNow ?? clockMinutes(clockTime);
    /* What picks the first month and week when today is not known yet. */
    const startingDay = today ?? new Date();
    const locale = useLocale(localeProp);
    const weekStart = weekStartsOn ?? weekStartOf(locale);
    const dayNumber = useMemo(() => new Intl.NumberFormat(locale), [locale]);
    const formatDayLabel = useMemo(() => dayLabelProp ?? dayLabelIn(locale), [dayLabelProp, locale]);
    const eventTimes = useMemo(() => eventTimesIn(locale), [locale]);
    const monthLabel = useMemo(() => monthLabelProp ?? monthLabelIn(locale), [monthLabelProp, locale]);
    const overflowLabel = useMemo(
      () => overflowLabelProp ?? overflowLabelIn(formatDayLabel),
      [overflowLabelProp, formatDayLabel],
    );

    const isControlled = month !== undefined;
    const [uncontrolledMonth, setUncontrolledMonth] = useState(
      defaultMonth ?? formatMonth(startingDay.getFullYear(), startingDay.getMonth()),
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
    const [weekAnchor, setWeekAnchor] = useState(() => parseDay(selectedDate) ?? startingDay);
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
    const weekLabel = useMemo(() => weekLabelProp ?? weekLabelIn(locale), [weekLabelProp, locale]);
    const weekRangeLabel = (start: Date) =>
      weekLabel(start, new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6));

    /* The colours the legend has switched off. Applied here, so every view
       and the selected day's panel show the same events. */
    const [ownHidden, setOwnHidden] = useState<EventCalendarColor[]>(defaultHiddenColors);
    const hiddenColors = hiddenColorsProp ?? ownHidden;
    const toggleColor = (color: EventCalendarColor) => {
      const next = hiddenColors.includes(color) ? hiddenColors.filter((c) => c !== color) : [...hiddenColors, color];
      if (hiddenColorsProp === undefined) setOwnHidden(next);
      onHiddenColorsChange?.(next);
    };

    // Group events by date, untimed first then by the clock
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
          const ta = sortTimeOf(a);
          const tb = sortTimeOf(b);
          if (!ta && !tb) return 0;
          if (!ta) return -1;
          if (!tb) return 1;
          return compareTimes(ta, tb, locale);
        });
      }
      return map;
    }, [events, locale, hiddenColors]);
    const formatSpan = useMemo(() => {
      const format = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric' });
      return (event: EventCalendarEvent) => {
        const start = parseDay(event.date);
        const end = parseDay(event.endDate);
        return start && end && end > start ? plainSpaces(format.formatRange(start, end)) : null;
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

    const classes = [
      baseClass,
      isWeek ? `${baseClass}--week` : '',
      isDay ? `${baseClass}--day` : '',
      bare ? `${baseClass}--bare` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');
    const monthTitle = isDay
      ? formatDayLabel(weekStartDate)
      : isWeek
        ? weekRangeLabel(weekStartDate)
        : monthLabel(new Date(viewYear, viewMonth, 1));
    const previousName = isDay ? previousDayLabel : isWeek ? previousWeekLabel : previousLabel;
    const nextName = isDay ? nextDayLabel : isWeek ? nextWeekLabel : nextLabel;
    const isTodayDate = (date: Date) =>
      today !== null &&
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    /* An event's name: its title with its range of days, else its time and
       its day. Shared by the pills and the day view's schedule. */
    const eventName = (event: EventCalendarEvent, dayLabel: string) => {
      const span = formatSpan(event);
      const times = eventTimes(event);
      return span ? `${event.title}, ${span}` : `${event.title}${times ? `, ${times.range}` : ''}, ${dayLabel}`;
    };

    /* The day view: the day's events as a schedule, the times first, and a
       now marker between them when the day is today. */
    const renderAgenda = (date: Date) => {
      const dateStr = formatDate(date);
      const dayEvents = eventsByDate.get(dateStr) ?? [];
      const dayLabel = formatDayLabel(date);
      const markerAt =
        isTodayDate(date) && nowMinutes !== null
          ? nowMarkerIndex(
              dayEvents.map((event) => {
                const time = sortTimeOf(event);
                return time ? minutesOf(time) : null;
              }),
              nowMinutes,
            )
          : null;
      if (dayEvents.length === 0) {
        return <p className={`${baseClass}__agenda-empty`}>{emptyDayLabel}</p>;
      }
      const marker = (
        <li key="now" className={`${baseClass}__now`}>
          <span className={`${baseClass}__now-label`}>{nowLabel}</span>
        </li>
      );
      return (
        <ul className={`${baseClass}__agenda`}>
          {dayEvents.map((event, index) => {
            const times = eventTimes(event);
            const itemClasses = `${baseClass}__agenda-event ${baseClass}__event--${event.color ?? 'neutral'}`;
            /* As on a pill, the visible parts are hidden and the event is
               said once, as the button's name or hidden text. */
            const content = (
              <>
                <span className={`${baseClass}__agenda-time`} aria-hidden="true">
                  <span className={`${baseClass}__agenda-start`}>{times ? times.start : allDayLabel}</span>
                  {times?.end && <span className={`${baseClass}__agenda-end`}>{times.end}</span>}
                </span>
                <span className={`${baseClass}__agenda-bar`} aria-hidden="true" />
                <span className={`${baseClass}__agenda-title`} aria-hidden="true">
                  {event.title}
                </span>
                {!onEventClick && (
                  <span className="ds-visually-hidden">
                    {times ? `${event.title}, ${times.range}` : `${event.title}, ${allDayLabel}`}
                  </span>
                )}
              </>
            );
            return (
              <React.Fragment key={event.id}>
                {markerAt === index && marker}
                <li className={`${baseClass}__agenda-item`}>
                  {onEventClick ? (
                    <button
                      type="button"
                      className={itemClasses}
                      onClick={() => onEventClick(event)}
                      aria-label={eventName(event, dayLabel)}
                    >
                      {content}
                    </button>
                  ) : (
                    <span className={itemClasses}>{content}</span>
                  )}
                </li>
              </React.Fragment>
            );
          })}
          {markerAt === dayEvents.length && marker}
        </ul>
      );
    };

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
          {isDay ? renderAgenda(weekStartDate) : cells.map(({ date, inMonth }) => {
            const dateStr = formatDate(date);
            const dayEvents = eventsByDate.get(dateStr) ?? [];
            const expanded = isWeek || expandedDays.includes(dateStr);
            const visible = expanded ? dayEvents : dayEvents.slice(0, maxEventsPerDay);
            const overflow = dayEvents.length - visible.length;
            const isToday = isTodayDate(date);

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
                    const timeText = eventTimes(event)?.range;
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
                        {timeText && (
                          <span className={`${baseClass}__event-time`} aria-hidden="true">
                            {timeText}
                          </span>
                        )}
                        {!onEventClick && (
                          <span className="ds-visually-hidden">
                            {timeText ? `${event.title}, ${timeText}` : event.title}
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
                        aria-label={eventName(event, dayLabel)}
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
