'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import './DatePicker.css';
import '../../fonts/material-symbols.css';
import { useLocale } from '../../behaviors/LocaleProvider';
import { isEnglish, rotateWeek, weekStartOf, weekdayNamesIn, type Weekday } from '../../behaviors/locale';
import { MonthGrid } from './MonthGrid';
import {
  EN_DAYS,
  dayLabelIn,
  formatDate,
  isSameDay,
  keyMove,
  monthLabelIn,
  parseDate,
  visuallyHidden,
  weekdaysOr,
  type MonthCell,
} from './calendar';

/** Props owned by DatePicker itself — everything else falls through to the wrapper. */
type DatePickerOwnProps = {
  /** Currently selected date (YYYY-MM-DD) */
  value?: string;
  /** Component size */
  size?: 'default' | 'compact';
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Minimum selectable date (YYYY-MM-DD) */
  min?: string;
  /** Maximum selectable date (YYYY-MM-DD) */
  max?: string;
  /** Callback when a date is selected */
  onDateSelect?: (date: string) => void;
  /** Mark further days unavailable, beyond `min` and `max`: weekends, holidays, booked days. Given each day as a `YYYY-MM-DD` string; focus skips past none of them, but none can be chosen. */
  isDateDisabled?: (date: string) => boolean;
  /** Accessible name of the previous-month button. */
  previousLabel?: string;
  /** Accessible name of the next-month button. */
  nextLabel?: string;
  /**
   * The month heading, given the first day of the month in view: the visible
   * title, the name of the day grid, and the text announced on navigation.
   * Defaults to the month name and the year in `locale` ("January 2026" in
   * `en-US`).
   */
  monthLabel?: (month: Date) => string;
  /** Accessible name of a day button, given its date and whether it is selected. Defaults to the full date in `locale`, with ", selected" appended when selected. */
  dayLabel?: (date: Date, selected: boolean) => string;
  /**
   * The visible weekday column headers: seven entries, Sunday first, laid
   * out from `weekStartsOn`. Defaults to the two-letter abbreviations ("Su"
   * to "Sa") in English and the short weekday names in `locale` otherwise; a
   * list of any other length falls back to the default.
   */
  weekdayLabels?: string[];
  /**
   * The weekday column headers' accessible names, read in full where the
   * visible header is abbreviated: seven entries, Sunday first. Defaults to
   * the weekday names in `locale` ("Sunday" to "Saturday" in `en-US`); a
   * list of any other length falls back to the default.
   */
  weekdayNames?: string[];
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

export interface DatePickerProps
  extends DatePickerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof DatePickerOwnProps> {}

/**
 * Inline date picker calendar component.
 * Displays a full month grid with navigation,
 * day headers, and selectable date cells.
 *
 * The days are a WAI-ARIA date grid with one roving tab stop: arrows move a
 * day or a week, Home and End go to the ends of the week, Page Up and Page
 * Down move a month (a year with Shift), and a move past the month in view
 * turns the page. Focus never lands on a day outside `min`/`max`: a move
 * that would is held at the nearest bound.
 *
 * Forwards a ref to the wrapping element and spreads unrecognised props onto it.
 */
export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      size = 'default',
      disabled = false,
      min,
      max,
      onDateSelect,
      isDateDisabled: isDateDisabledProp,
      previousLabel = 'Previous month',
      nextLabel = 'Next month',
      monthLabel: monthLabelProp,
      dayLabel: dayLabelProp,
      weekdayLabels,
      weekdayNames,
      locale: localeProp,
      weekStartsOn,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const selectedDate = parseDate(value);
    const minDate = parseDate(min);
    const maxDate = parseDate(max);
    const locale = useLocale(localeProp);
    const weekStart = weekStartsOn ?? weekStartOf(locale);
    const dayNumber = useMemo(() => new Intl.NumberFormat(locale), [locale]);
    const monthLabel = useMemo(() => monthLabelProp ?? monthLabelIn(locale), [monthLabelProp, locale]);
    const dayLabel = useMemo(() => dayLabelProp ?? dayLabelIn(locale), [dayLabelProp, locale]);
    const weekdays = rotateWeek(
      weekdaysOr(weekdayLabels, isEnglish(locale) ? EN_DAYS : weekdayNamesIn(locale, 'short')),
      weekStart,
    );
    const weekdayFullNames = rotateWeek(
      weekdaysOr(weekdayNames, weekdayNamesIn(locale, 'long')),
      weekStart,
    );

    const today = useMemo(() => new Date(), []);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const [viewMonth, setViewMonth] = useState(
      selectedDate ? selectedDate.getMonth() : today.getMonth(),
    );
    const [viewYear, setViewYear] = useState(
      selectedDate ? selectedDate.getFullYear() : today.getFullYear(),
    );
    // The day that last held focus in the grid: the roving tab stop returns
    // to it while its month is in view.
    const [focusedDate, setFocusedDate] = useState<Date | null>(null);
    // Set by a keyboard move (or a click that turns the page), so the effect
    // below moves focus to the new day once it has rendered.
    const pendingFocus = useRef(false);
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!pendingFocus.current || !focusedDate) return;
      pendingFocus.current = false;
      gridRef.current
        ?.querySelector<HTMLButtonElement>(`[data-date="${formatDate(focusedDate)}"]`)
        ?.focus();
    }, [focusedDate, viewMonth, viewYear]);

    const monthTitle = monthLabel(new Date(viewYear, viewMonth, 1));

    const baseClass = 'ds-date-picker';
    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const goToPrevMonth = () => {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    };

    const goToNextMonth = () => {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    };

    const isDateDisabled = (date: Date): boolean => {
      if (disabled) return true;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      if (isDateDisabledProp?.(formatDate(date))) return true;
      return false;
    };

    const isInView = (date: Date): boolean =>
      date.getMonth() === viewMonth && date.getFullYear() === viewYear;

    /** Moves focus to a day, turning the page first when it lies outside the month in view. */
    const moveFocusTo = (date: Date) => {
      if (!isInView(date)) {
        setViewMonth(date.getMonth());
        setViewYear(date.getFullYear());
      }
      setFocusedDate(date);
      pendingFocus.current = true;
    };

    const handleSelect = (cell: MonthCell) => {
      if (isDateDisabled(cell.date)) return;
      if (!cell.inMonth) {
        // Navigate to the month of the out-of-range day, and keep focus on
        // the day that was chosen rather than the button left in its place.
        moveFocusTo(cell.date);
      }
      onDateSelect?.(formatDate(cell.date));
    };

    /** Holds a keyboard move inside `min`/`max`, so focus never lands on a disabled day. */
    const clampToRange = (date: Date): Date => {
      if (minDate && date < minDate) return minDate;
      if (maxDate && date > maxDate) return maxDate;
      return date;
    };

    const handleDayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, date: Date) => {
      let next = keyMove(event, date, weekStart);
      // Enter and Space stay with the button's own click.
      if (!next) return;
      event.preventDefault();
      next = clampToRange(next);
      // Held at a bound: focus is already where the move would leave it.
      if (isSameDay(next, date)) return;
      moveFocusTo(next);
    };

    // The one day in the tab order: the day last focused, else the selected
    // day, else today, else the month's first enabled day, whichever is the
    // first to sit in the month in view and be enabled.
    let tabStop: Date | null =
      [focusedDate, selectedDate, todayStart].find(
        (date): date is Date => date !== null && isInView(date) && !isDateDisabled(date),
      ) ?? null;
    for (let d = 1; !tabStop && d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      if (!isDateDisabled(date)) tabStop = date;
    }

    return (
      <div {...rest} ref={ref} className={classes}>
        {/* Header */}
        <div className={`${baseClass}__header`}>
          <button
            type="button"
            className={`${baseClass}__nav-btn material-symbols-rounded ds-mirror-rtl`}
            onClick={goToPrevMonth}
            disabled={disabled}
            aria-label={previousLabel}
          >
            chevron_left
          </button>
          <span className={`${baseClass}__month-year`}>{monthTitle}</span>
          <button
            type="button"
            className={`${baseClass}__nav-btn material-symbols-rounded ds-mirror-rtl`}
            onClick={goToNextMonth}
            disabled={disabled}
            aria-label={nextLabel}
          >
            chevron_right
          </button>
        </div>

        {/*
          Announces month navigation: the region is mounted from the first
          render, so when prev/next replaces its text the change is spoken.
          The visible month-year span cannot do this job — it re-renders as
          part of the same header, and live regions that appear with their
          text are unreliable.
        */}
        <span aria-live="polite" style={visuallyHidden}>
          {monthTitle}
        </span>

        <MonthGrid
          baseClass={baseClass}
          gridRef={gridRef}
          year={viewYear}
          month={viewMonth}
          weekStart={weekStart}
          weekdays={weekdays}
          weekdayFullNames={weekdayFullNames}
          label={monthTitle}
          dayNumber={dayNumber}
          today={today}
          dayState={(cell) => {
            const isSelected = Boolean(selectedDate && isSameDay(cell.date, selectedDate));
            const isToday = isSameDay(cell.date, today);
            return {
              className: [
                !cell.inMonth ? `${baseClass}__cell--outside` : '',
                isSelected ? `${baseClass}__cell--selected` : '',
                isToday && !isSelected ? `${baseClass}__cell--today` : '',
                isDateDisabled(cell.date) ? `${baseClass}__cell--disabled` : '',
              ]
                .filter(Boolean)
                .join(' '),
              disabled: isDateDisabled(cell.date),
              // Selection is spoken as part of the name rather than via
              // aria-selected, which is not permitted on role="button".
              label: dayLabel(cell.date, isSelected),
              tabStop: tabStop !== null && isSameDay(cell.date, tabStop),
            };
          }}
          onSelect={handleSelect}
          onDayKeyDown={handleDayKeyDown}
          onDayFocus={(date) => {
            if (!focusedDate || !isSameDay(focusedDate, date)) setFocusedDate(date);
          }}
        />
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';
