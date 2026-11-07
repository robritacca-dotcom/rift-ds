'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from '../../behaviors/LocaleProvider';
import { isEnglish, rotateWeek, weekStartOf, weekdayNamesIn, type Weekday } from '../../behaviors/locale';
import { MonthGrid } from '../DatePicker/MonthGrid';
import {
  EN_DAYS,
  addMonths,
  daysBetween,
  formatDate,
  fullDateIn,
  isSameDay,
  keyMove,
  monthLabelIn,
  parseDate,
  visuallyHidden,
  weekdaysOr,
  type MonthCell,
} from '../DatePicker/calendar';
import { Chip } from '../Chip/Chip';
import '../DatePicker/DatePicker.css';
import '../../fonts/material-symbols.css';
import './DateRangePicker.css';

/** A range as two `YYYY-MM-DD` strings; `end` is null while the second day is still to be chosen. */
export type DateRange = { start: string | null; end: string | null };

/** A ready-made range the reader can pick in one press. */
export type DateRangePreset = {
  /** What the preset is called: "Last 7 days", "This month". */
  label: string;
  /** The range it sets. */
  range: { start: string; end: string };
};

/** Where a day sits in the range, for its spoken name. */
export type DateRangePosition = 'start' | 'end' | 'start-end' | 'inside' | 'outside';

/** Props owned by DateRangePicker itself; everything else falls through to the wrapper. */
type DateRangePickerOwnProps = {
  /** The chosen range (controlled). Pair with `onValueChange`. */
  value?: DateRange;
  /** The range it starts with (uncontrolled). */
  defaultValue?: DateRange;
  /** Called with the range as the reader chooses it: once with only `start` after the first day, then with both. */
  onValueChange?: (range: DateRange) => void;
  /** How many months show side by side, 1 or 2. Two stack when the picker is narrow. Defaults to 2. */
  months?: 1 | 2;
  /** The first day that can be chosen (YYYY-MM-DD). */
  min?: string;
  /** The last day that can be chosen (YYYY-MM-DD). */
  max?: string;
  /** Mark further days unavailable: weekends, holidays, booked nights. Given each day as a `YYYY-MM-DD` string. A range may not span one. */
  isDateDisabled?: (date: string) => boolean;
  /** The fewest days a range may hold, counting both ends. */
  minLength?: number;
  /** The most days a range may hold, counting both ends. */
  maxLength?: number;
  /** Ranges the reader can pick in one press, shown above the calendar: "Last 7 days", "This quarter". */
  presets?: DateRangePreset[];
  /** Accessible name of the presets. Defaults to "Presets". */
  presetsLabel?: string;
  /** Component size */
  size?: 'default' | 'compact';
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** The form field name: the form receives `<name>[start]` and `<name>[end]` as `YYYY-MM-DD` through hidden inputs. */
  name?: string;
  /** Accessible name of the previous-month button. */
  previousLabel?: string;
  /** Accessible name of the next-month button. */
  nextLabel?: string;
  /** The month heading, given the first day of a month in view. Defaults to the month name and the year in `locale`. */
  monthLabel?: (month: Date) => string;
  /** A day button's accessible name, given its date and where it sits in the range. Defaults to the full date in `locale`, followed by the matching position label. */
  dayLabel?: (date: Date, position: DateRangePosition) => string;
  /** Said after the first day of the range. Defaults to "start of range". */
  rangeStartLabel?: string;
  /** Said after the last day of the range. Defaults to "end of range". */
  rangeEndLabel?: string;
  /** Said after a day inside the range. Defaults to "in range". */
  inRangeLabel?: string;
  /** The visible weekday headers: seven entries, Sunday first. Defaults as in DatePicker. */
  weekdayLabels?: string[];
  /** The weekday headers' spoken names: seven entries, Sunday first. Defaults to the weekday names in `locale`. */
  weekdayNames?: string[];
  /** The BCP 47 locale the calendar is written and laid out in. Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** The first column of the grid, 0 (Sunday) to 6 (Saturday). Defaults to the first day of the week in `locale`. */
  weekStartsOn?: Weekday;
  /** Additional CSS classes */
  className?: string;
};

export interface DateRangePickerProps
  extends DateRangePickerOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof DateRangePickerOwnProps> {}

const EMPTY: DateRange = { start: null, end: null };

/**
 * An inline calendar for choosing a range of days: a billing period, a
 * report's window, a booking, a leave request. The first press sets the
 * start, the second the end, with the days between previewed as the pointer
 * or the focus moves; presets set a range in one press. Keyboard as
 * DatePicker: arrows, Home and End, Page Up and Page Down move, Enter or
 * Space chooses.
 */
export function DateRangePicker({
  value: valueProp,
  defaultValue = EMPTY,
  onValueChange,
  months = 2,
  min,
  max,
  isDateDisabled: isDateDisabledProp,
  minLength,
  maxLength,
  presets,
  presetsLabel = 'Presets',
  size = 'default',
  disabled = false,
  name,
  previousLabel = 'Previous month',
  nextLabel = 'Next month',
  monthLabel: monthLabelProp,
  dayLabel: dayLabelProp,
  rangeStartLabel = 'start of range',
  rangeEndLabel = 'end of range',
  inRangeLabel = 'in range',
  weekdayLabels,
  weekdayNames,
  locale: localeProp,
  weekStartsOn,
  className = '',
  onPointerLeave,
  ref,
  ...rest
}: DateRangePickerProps) {
  const locale = useLocale(localeProp);
  const weekStart = weekStartsOn ?? weekStartOf(locale);
  const controlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState<DateRange>(defaultValue);
  const range = controlled ? valueProp : uncontrolled;
  const start = parseDate(range.start);
  const end = parseDate(range.end);
  const minDate = parseDate(min);
  const maxDate = parseDate(max);

  const dayNumber = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const monthLabel = useMemo(() => monthLabelProp ?? monthLabelIn(locale), [monthLabelProp, locale]);
  const fullDate = useMemo(() => fullDateIn(locale), [locale]);
  const weekdays = rotateWeek(
    weekdaysOr(weekdayLabels, isEnglish(locale) ? EN_DAYS : weekdayNamesIn(locale, 'short')),
    weekStart,
  );
  const weekdayFullNames = rotateWeek(weekdaysOr(weekdayNames, weekdayNamesIn(locale, 'long')), weekStart);

  const today = useMemo(() => new Date(), []);
  const initial = start ?? today;
  const [view, setView] = useState({ year: initial.getFullYear(), month: initial.getMonth() });
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const pendingFocus = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const setRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    if (!pendingFocus.current || !focusedDate) return;
    pendingFocus.current = false;
    rootRef.current?.querySelector<HTMLButtonElement>(`[data-date="${formatDate(focusedDate)}"]`)?.focus();
  }, [focusedDate, view]);

  const shown = Array.from({ length: months }, (_, i) => {
    const first = new Date(view.year, view.month + i, 1);
    return { year: first.getFullYear(), month: first.getMonth() };
  });
  const firstShown = new Date(shown[0].year, shown[0].month, 1);
  const lastShown = new Date(shown[months - 1].year, shown[months - 1].month + 1, 0);
  const isInView = (date: Date) => date >= firstShown && date <= lastShown;
  const titles = shown.map(({ year, month }) => monthLabel(new Date(year, month, 1)));

  /** Choosing the end: a start is set and the end is not. */
  const choosingEnd = Boolean(start && !end);

  const blocked = (date: Date) =>
    disabled ||
    (minDate !== null && date < minDate) ||
    (maxDate !== null && date > maxDate) ||
    Boolean(isDateDisabledProp?.(formatDate(date)));

  /** Whether a range from `a` to `b` (in order) breaks a length rule or spans an unavailable day. */
  const rangeRefused = (a: Date, b: Date) => {
    const length = daysBetween(a, b) + 1;
    if (minLength !== undefined && length < minLength) return true;
    if (maxLength !== undefined && length > maxLength) return true;
    if (isDateDisabledProp) {
      for (let d = new Date(a); d <= b; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))
        if (isDateDisabledProp(formatDate(d))) return true;
    }
    return false;
  };

  /** While choosing the end, a day after the start that would make a refused range cannot be pressed. */
  const isDayDisabled = (date: Date) => {
    if (blocked(date)) return true;
    if (choosingEnd && start && date >= start) return rangeRefused(start, date);
    return false;
  };

  const commit = (next: DateRange) => {
    if (!controlled) setUncontrolled(next);
    onValueChange?.(next);
  };

  const choose = (date: Date) => {
    if (isDayDisabled(date)) return;
    if (!choosingEnd || !start || date < start) {
      commit({ start: formatDate(date), end: null });
      return;
    }
    commit({ start: formatDate(start), end: formatDate(date) });
    setHoverDate(null);
  };

  const moveFocusTo = (date: Date) => {
    if (!isInView(date)) {
      const offset = date < firstShown ? 0 : months - 1;
      const first = new Date(date.getFullYear(), date.getMonth() - offset, 1);
      setView({ year: first.getFullYear(), month: first.getMonth() });
    }
    setFocusedDate(date);
    if (choosingEnd) setHoverDate(date);
    pendingFocus.current = true;
  };

  const clampToRange = (date: Date): Date => {
    if (minDate && date < minDate) return minDate;
    if (maxDate && date > maxDate) return maxDate;
    return date;
  };

  const handleDayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, date: Date) => {
    let next = keyMove(event, date, weekStart);
    if (!next) return;
    event.preventDefault();
    next = clampToRange(next);
    if (isSameDay(next, date)) return;
    moveFocusTo(next);
  };

  const handleSelect = (cell: MonthCell) => {
    if (!cell.inMonth) moveFocusTo(cell.date);
    choose(cell.date);
  };

  // The span drawn: the chosen range, or while choosing the end, the start to
  // the day under the pointer or the focus.
  const previewEnd = choosingEnd && hoverDate && start && hoverDate >= start ? hoverDate : null;
  const spanEnd = end ?? previewEnd;

  const positionOf = (date: Date): DateRangePosition => {
    if (!start) return 'outside';
    const isStart = isSameDay(date, start);
    const isEnd = end ? isSameDay(date, end) : false;
    if (isStart && (isEnd || !end)) return end ? 'start-end' : 'start';
    if (isStart) return 'start';
    if (isEnd) return 'end';
    if (end && date > start && date < end) return 'inside';
    return 'outside';
  };

  const dayLabel =
    dayLabelProp ??
    ((date: Date, position: DateRangePosition) => {
      const where =
        position === 'start'
          ? rangeStartLabel
          : position === 'end'
            ? rangeEndLabel
            : position === 'start-end'
              ? `${rangeStartLabel}, ${rangeEndLabel}`
              : position === 'inside'
                ? inRangeLabel
                : '';
      return where ? `${fullDate(date)}, ${where}` : fullDate(date);
    });

  // One tab stop across every month shown: the day last focused, else the
  // start, else today, else the first enabled day in view.
  let tabStop: Date | null =
    [focusedDate, start, today].find(
      (date): date is Date => date !== null && isInView(date) && !isDayDisabled(date),
    ) ?? null;
  for (let d = new Date(firstShown); !tabStop && d <= lastShown; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    if (!isDayDisabled(d)) tabStop = d;
  }

  const activePreset = presets?.findIndex((p) => p.range.start === range.start && p.range.end === range.end) ?? -1;
  const applyPreset = (index: number) => {
    const preset = presets?.[index];
    if (!preset) return;
    commit({ start: preset.range.start, end: preset.range.end });
    const first = parseDate(preset.range.start);
    if (first) setView({ year: first.getFullYear(), month: first.getMonth() });
  };

  const baseClass = 'ds-date-picker';
  const classes = [
    'ds-date-range-picker',
    `ds-date-range-picker--months-${months}`,
    baseClass,
    `${baseClass}--${size}`,
    disabled ? `${baseClass}--disabled` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const turn = (by: number) => {
    const first = addMonths(new Date(view.year, view.month, 1), by);
    setView({ year: first.getFullYear(), month: first.getMonth() });
  };

  return (
    <div
      {...rest}
      ref={setRef}
      className={classes}
      onPointerLeave={(event) => {
        setHoverDate(null);
        onPointerLeave?.(event);
      }}
    >
      {presets && presets.length > 0 && (
        <div className="ds-date-range-picker__presets" role="group" aria-label={presetsLabel}>
          {presets.map((preset, index) => (
            <Chip
              key={preset.label}
              label={preset.label}
              tone="neutral"
              selected={index === activePreset}
              disabled={disabled}
              onClick={() => applyPreset(index)}
            />
          ))}
        </div>
      )}

      <div className="ds-date-range-picker__months">
        {shown.map(({ year, month }, index) => (
          <div key={`${year}-${month}`} className="ds-date-range-picker__month">
            <div className={`${baseClass}__header`}>
              {index === 0 ? (
                <button
                  type="button"
                  className={`${baseClass}__nav-btn material-symbols-rounded ds-mirror-rtl`}
                  onClick={() => turn(-1)}
                  disabled={disabled}
                  aria-label={previousLabel}
                >
                  chevron_left
                </button>
              ) : (
                <span className="ds-date-range-picker__nav-space" aria-hidden="true" />
              )}
              <span className={`${baseClass}__month-year`}>{titles[index]}</span>
              {index === months - 1 ? (
                <button
                  type="button"
                  className={`${baseClass}__nav-btn material-symbols-rounded ds-mirror-rtl`}
                  onClick={() => turn(1)}
                  disabled={disabled}
                  aria-label={nextLabel}
                >
                  chevron_right
                </button>
              ) : (
                <span className="ds-date-range-picker__nav-space" aria-hidden="true" />
              )}
            </div>
            <MonthGrid
              baseClass={baseClass}
              year={year}
              month={month}
              weekStart={weekStart}
              weekdays={weekdays}
              weekdayFullNames={weekdayFullNames}
              label={titles[index]}
              dayNumber={dayNumber}
              today={today}
              hideOutside={months > 1}
              dayState={(cell) => {
                const position = positionOf(cell.date);
                const chosenEnd = position === 'start' || position === 'end' || position === 'start-end';
                const inSpan = Boolean(start && spanEnd && cell.date > start && cell.date < spanEnd);
                const isToday = isSameDay(cell.date, today);
                const dayDisabled = isDayDisabled(cell.date);
                return {
                  className: [
                    !cell.inMonth ? `${baseClass}__cell--outside` : '',
                    chosenEnd ? `${baseClass}__cell--selected` : '',
                    inSpan ? 'ds-date-range-picker__cell--in-range' : '',
                    inSpan && !end ? 'ds-date-range-picker__cell--preview' : '',
                    position === 'start' && spanEnd ? 'ds-date-range-picker__cell--start' : '',
                    position === 'end' ? 'ds-date-range-picker__cell--end' : '',
                    previewEnd && isSameDay(cell.date, previewEnd) && !chosenEnd
                      ? 'ds-date-range-picker__cell--preview-end'
                      : '',
                    isToday && !chosenEnd ? `${baseClass}__cell--today` : '',
                    dayDisabled ? `${baseClass}__cell--disabled` : '',
                  ]
                    .filter(Boolean)
                    .join(' '),
                  disabled: dayDisabled,
                  label: dayLabel(cell.date, position),
                  tabStop: tabStop !== null && isSameDay(cell.date, tabStop),
                  selected: position !== 'outside',
                };
              }}
              onSelect={handleSelect}
              onDayKeyDown={handleDayKeyDown}
              onDayFocus={(date) => {
                if (!focusedDate || !isSameDay(focusedDate, date)) setFocusedDate(date);
                if (choosingEnd) setHoverDate(date);
              }}
              onDayPointerEnter={(date) => {
                if (choosingEnd) setHoverDate(date);
              }}
            />
          </div>
        ))}
      </div>

      {/* Announces month navigation, as DatePicker does. */}
      <span aria-live="polite" style={visuallyHidden}>
        {titles.join(', ')}
      </span>

      {name && (
        <>
          <input type="hidden" name={`${name}[start]`} value={range.start ?? ''} disabled={disabled} />
          <input type="hidden" name={`${name}[end]`} value={range.end ?? ''} disabled={disabled} />
        </>
      )}
    </div>
  );
}
