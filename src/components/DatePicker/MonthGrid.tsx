'use client';

import React from 'react';
import type { Weekday } from '../../behaviors/locale';
import { formatDate, isSameDay, monthWeeks, visuallyHidden, type MonthCell } from './calendar';

/** What a host tells the grid about one day. */
export type DayState = {
  /** Extra classes on the day's button. */
  className: string;
  /** Whether the day can be chosen. */
  disabled: boolean;
  /** The day button's accessible name. */
  label: string;
  /** Whether the day is the grid's one tab stop. */
  tabStop: boolean;
  /** `aria-selected` for the gridcell, when the host marks selection there. */
  selected?: boolean;
};

/** Props for MonthGrid. */
export type MonthGridProps = {
  /** The host's class prefix (`ds-date-picker`), so the grid draws in its family's classes. */
  baseClass: string;
  /** The grid element, for moving focus to a day. */
  gridRef?: React.Ref<HTMLDivElement>;
  /** The month and year in view. */
  year: number;
  month: number;
  /** The first column. */
  weekStart: Weekday;
  /** The seven visible headers and their spoken names, already in the grid's order. */
  weekdays: string[];
  weekdayFullNames: string[];
  /** The grid's accessible name: the month heading. */
  label: string;
  /** The day numbers' format. */
  dayNumber: Intl.NumberFormat;
  /** Today, for `aria-current="date"` and its ring. */
  today: Date;
  /** The state of each day. */
  dayState: (cell: MonthCell) => DayState;
  /** A day was pressed. */
  onSelect: (cell: MonthCell) => void;
  /** A key was pressed on a day. */
  onDayKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>, date: Date) => void;
  /** A day took focus. */
  onDayFocus: (date: Date) => void;
  /** The pointer moved onto a day, for a range preview. */
  onDayPointerEnter?: (date: Date) => void;
  /** Hide the days that belong to the neighbouring months (a second month beside the first). */
  hideOutside?: boolean;
};

/**
 * A WAI-ARIA date grid: a header row of column headers, then one row per
 * week. The rows are subgrids of the one CSS grid, so the layout is seven
 * columns. Each gridcell holds a real button; only the roving tab stop is in
 * the tab order, and the host's key handler moves it.
 */
export function MonthGrid({
  baseClass,
  gridRef,
  year,
  month,
  weekStart,
  weekdays,
  weekdayFullNames,
  label,
  dayNumber,
  today,
  dayState,
  onSelect,
  onDayKeyDown,
  onDayFocus,
  onDayPointerEnter,
  hideOutside = false,
}: MonthGridProps) {
  const weeks = monthWeeks(year, month, weekStart);
  return (
    <div ref={gridRef} className={`${baseClass}__grid`} role="grid" aria-label={label}>
      <div className={`${baseClass}__row`} role="row">
        {weekdays.map((day, index) => (
          <div key={index} className={`${baseClass}__day-header`} role="columnheader">
            {/* The abbreviation is what the eye reads; the full name is
                what a screen reader announces as the column's header. */}
            <span aria-hidden="true">{day}</span>
            <span style={visuallyHidden}>{weekdayFullNames[index]}</span>
          </div>
        ))}
      </div>

      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className={`${baseClass}__row`} role="row">
          {week.map((cell) => {
            if (hideOutside && !cell.inMonth)
              return <div key={formatDate(cell.date)} className={`${baseClass}__gridcell`} role="gridcell" />;
            const state = dayState(cell);
            const isToday = isSameDay(cell.date, today);
            return (
              <div
                key={formatDate(cell.date)}
                className={`${baseClass}__gridcell`}
                role="gridcell"
                aria-selected={state.selected}
              >
                <button
                  type="button"
                  className={[`${baseClass}__cell`, state.className].filter(Boolean).join(' ')}
                  onClick={() => onSelect(cell)}
                  onKeyDown={(event) => onDayKeyDown(event, cell.date)}
                  onFocus={() => onDayFocus(cell.date)}
                  onPointerEnter={onDayPointerEnter ? () => onDayPointerEnter(cell.date) : undefined}
                  disabled={state.disabled}
                  tabIndex={state.tabStop ? 0 : -1}
                  data-date={formatDate(cell.date)}
                  aria-label={state.label}
                  // "the current date within a collection of dates": exactly
                  // what aria-current="date" is for.
                  aria-current={isToday ? 'date' : undefined}
                >
                  {dayNumber.format(cell.day)}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
