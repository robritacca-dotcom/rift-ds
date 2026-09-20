'use client';

import React, { useState, useMemo } from 'react';
import './DatePicker.css';
import '../../fonts/material-symbols.css';

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
  /** Additional CSS classes */
  className?: string;
};

export interface DatePickerProps
  extends DatePickerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof DatePickerOwnProps> {}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
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

function parseDate(str?: string): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
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
const visuallyHidden: React.CSSProperties = {
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

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Inline date picker calendar component.
 * Displays a full month grid with navigation,
 * day headers, and selectable date cells.
 *
 * Forwards a ref to the wrapping element and spreads unrecognised props onto it.
 */
export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ value, size = 'default', disabled = false, min, max, onDateSelect, className = '', ...rest }, ref) => {
    const selectedDate = parseDate(value);
    const minDate = parseDate(min);
    const maxDate = parseDate(max);

    const today = useMemo(() => new Date(), []);
    const [viewMonth, setViewMonth] = useState(
      selectedDate ? selectedDate.getMonth() : today.getMonth(),
    );
    const [viewYear, setViewYear] = useState(
      selectedDate ? selectedDate.getFullYear() : today.getFullYear(),
    );

    const baseClass = 'ds-date-picker';
    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Build grid of days
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; inMonth: boolean; date: Date }[] = [];

    // Leading days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      cells.push({ day: d, inMonth: false, date: new Date(viewYear, viewMonth - 1, d) });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, inMonth: true, date: new Date(viewYear, viewMonth, d) });
    }
    // Trailing days to fill grid (up to 42 cells = 6 rows)
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, inMonth: false, date: new Date(viewYear, viewMonth + 1, d) });
    }

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
      return false;
    };

    const handleSelect = (cell: { date: Date; inMonth: boolean }) => {
      if (isDateDisabled(cell.date)) return;
      if (!cell.inMonth) {
        // Navigate to the month of the out-of-range day
        setViewMonth(cell.date.getMonth());
        setViewYear(cell.date.getFullYear());
      }
      onDateSelect?.(formatDate(cell.date));
    };

    return (
      <div {...rest} ref={ref} className={classes}>
        {/* Header */}
        <div className={`${baseClass}__header`}>
          <button
            type="button"
            className={`${baseClass}__nav-btn material-symbols-rounded`}
            onClick={goToPrevMonth}
            disabled={disabled}
            aria-label="Previous month"
          >
            chevron_left
          </button>
          <span className={`${baseClass}__month-year`}>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            className={`${baseClass}__nav-btn material-symbols-rounded`}
            onClick={goToNextMonth}
            disabled={disabled}
            aria-label="Next month"
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
          {MONTHS[viewMonth]} {viewYear}
        </span>

        {/*
          Deliberately NOT role="grid". A grid promises 2D arrow-key navigation
          with a roving tabindex, and this component implements none of it —
          claiming the role tells assistive technology a lie. gridcell and
          columnheader also require a row parent, which the CSS-grid layout has
          no element for. A labelled group of buttons is honest and, without
          the keyboard model, more usable.
        */}
        <div
          className={`${baseClass}__grid`}
          role="group"
          aria-label={`${MONTHS[viewMonth]} ${viewYear}`}
        >
          {DAYS.map((day) => (
            // Each cell's aria-label already carries the full weekday name, so
            // the visual column headers are redundant noise for a screen reader.
            <div key={day} className={`${baseClass}__day-header`} aria-hidden="true">
              {day}
            </div>
          ))}

          {/* Day cells */}
          {cells.map((cell, idx) => {
            const isSelected = selectedDate && isSameDay(cell.date, selectedDate);
            const isToday = isSameDay(cell.date, today);
            const isCellDisabled = isDateDisabled(cell.date);

            const cellClasses = [
              `${baseClass}__cell`,
              !cell.inMonth ? `${baseClass}__cell--outside` : '',
              isSelected ? `${baseClass}__cell--selected` : '',
              isToday && !isSelected ? `${baseClass}__cell--today` : '',
              isCellDisabled ? `${baseClass}__cell--disabled` : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={idx}
                type="button"
                className={cellClasses}
                onClick={() => handleSelect(cell)}
                disabled={isCellDisabled}
                // Selection is spoken as part of the name rather than via
                // aria-selected, which is not permitted on role="button".
                aria-label={`${cell.date.toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}${isSelected ? ', selected' : ''}`}
                // "the current date within a collection of dates" — this is
                // exactly what aria-current="date" is for.
                aria-current={isToday ? 'date' : undefined}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';
