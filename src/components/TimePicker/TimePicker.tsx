'use client';

import React, { useState, useRef, useEffect, useCallback, useId, useMemo } from 'react';
import { Field } from '../Field/Field';
import './TimePicker.css';
import '../../fonts/material-symbols.css';

/** A single selectable time in the listbox. */
interface TimeOption {
  /** 24-hour "HH:MM" value */
  value: string;
  /** Display label formatted per `hourFormat` */
  label: string;
}

/** Props owned by TimePicker itself — everything else falls through to the trigger button. */
type TimePickerOwnProps = {
  /** Label text rendered above the trigger */
  label?: string;
  /** Placeholder shown when no time is selected */
  placeholder?: string;
  /** Currently selected time as a 24-hour "HH:MM" string (controlled) */
  value?: string;
  /** Initially selected time as a 24-hour "HH:MM" string (uncontrolled) */
  defaultValue?: string;
  /** Earliest generated option, as a 24-hour "HH:MM" string */
  minTime?: string;
  /** Latest generated option, as a 24-hour "HH:MM" string */
  maxTime?: string;
  /** Minutes between generated options */
  stepMinutes?: number;
  /** Display format for the trigger and options — the value stays a 24-hour "HH:MM" string either way */
  hourFormat?: '12' | '24';
  /** Component size */
  size?: 'default' | 'compact';
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Helper or error message */
  helperText?: string;
  /** Called with the newly selected 24-hour "HH:MM" value */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes */
  className?: string;
};

export interface TimePickerProps
  extends TimePickerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof TimePickerOwnProps | 'type'> {}

/** Parse a 24-hour "HH:MM" string into minutes since midnight. */
function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Convert minutes since midnight back into a 24-hour "HH:MM" string. */
function toTimeValue(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Format a 24-hour "HH:MM" value for display ("2:30 PM" or "14:30"). */
function formatTime(time: string, hourFormat: '12' | '24'): string {
  if (hourFormat === '24') return time;
  const [h, m] = time.split(':').map(Number);
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/**
 * Time-of-day form field. A button-shaped trigger opens a scrollable
 * `role="listbox"` of times generated from `minTime`/`maxTime`/`stepMinutes`,
 * with full keyboard navigation. The value is always a 24-hour "HH:MM"
 * string; `hourFormat` only changes the display.
 *
 * Forwards a ref to the trigger button and spreads unrecognised props onto it.
 */
export const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    {
      label,
      placeholder = 'Select time',
      value,
      defaultValue,
      minTime = '00:00',
      maxTime = '23:30',
      stepMinutes = 30,
      hourFormat = '12',
      size = 'default',
      disabled = false,
      required = false,
      error = false,
      helperText,
      onValueChange,
      className = '',
      id,
      ...rest
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const isControlled = value !== undefined;
    const selectedValue = isControlled ? value : internalValue;

    /** Keep the internal trigger ref while honouring a forwarded one. */
    const setTriggerRef = (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const generatedId = useId();
    const inputId = id || generatedId;

    const baseClass = 'ds-timepicker';
    const classes = [
      baseClass,
      size === 'compact' ? `${baseClass}--compact` : '',
      isOpen ? `${baseClass}--open` : '',
      error ? `${baseClass}--error` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const timeOptions = useMemo<TimeOption[]>(() => {
      const step = Math.max(1, Math.floor(stepMinutes));
      const start = parseMinutes(minTime);
      const end = parseMinutes(maxTime);
      const opts: TimeOption[] = [];
      for (let mins = start; mins <= end; mins += step) {
        const v = toTimeValue(mins);
        opts.push({ value: v, label: formatTime(v, hourFormat) });
      }
      return opts;
    }, [minTime, maxTime, stepMinutes, hourFormat]);

    const selectedIndex = timeOptions.findIndex((opt) => opt.value === selectedValue);
    const selectedOption = selectedIndex >= 0 ? timeOptions[selectedIndex] : undefined;

    const openMenu = () => {
      setIsOpen(true);
      // Land on the selected option, or the first one, so the list opens in view.
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : timeOptions.length > 0 ? 0 : -1);
    };

    const closeMenu = () => {
      setIsOpen(false);
      setFocusedIndex(-1);
    };

    const handleToggle = () => {
      if (disabled) return;
      if (isOpen) closeMenu();
      else openMenu();
    };

    const handleSelect = (optionValue: string) => {
      if (!isControlled) setInternalValue(optionValue);
      onValueChange?.(optionValue);
      closeMenu();
    };

    const handleClickOutside = useCallback((e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }, []);

    useEffect(() => {
      if (!isOpen) return;
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, handleClickOutside]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          // preventDefault stops the button's native activation from firing
          // onClick a second time.
          e.preventDefault();
          if (isOpen && focusedIndex >= 0 && timeOptions[focusedIndex]) {
            handleSelect(timeOptions[focusedIndex].value);
          } else {
            handleToggle();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            openMenu();
          } else {
            setFocusedIndex((prev) => Math.min(prev + 1, timeOptions.length - 1));
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            openMenu();
          } else {
            setFocusedIndex((prev) => Math.max(prev - 1, 0));
          }
          break;
        case 'Home':
          if (isOpen) {
            e.preventDefault();
            setFocusedIndex(0);
          }
          break;
        case 'End':
          if (isOpen) {
            e.preventDefault();
            setFocusedIndex(timeOptions.length - 1);
          }
          break;
        case 'Escape':
          closeMenu();
          break;
        case 'Tab':
          closeMenu();
          break;
      }
    };

    useEffect(() => {
      if (isOpen && focusedIndex >= 0 && listRef.current) {
        const focusedEl = listRef.current.children[focusedIndex] as HTMLElement;
        focusedEl?.scrollIntoView({ block: 'nearest' });
      }
    }, [focusedIndex, isOpen]);

    const activeOptionId =
      isOpen && focusedIndex >= 0 && timeOptions[focusedIndex]
        ? `${inputId}-option-${focusedIndex}`
        : undefined;

    return (
      <Field
        ref={rootRef}
        className={classes}
        label={label}
        helperText={helperText}
        error={error}
        required={required}
        disabled={disabled}
        size={size}
        id={inputId}
      >
        <button
          {...rest}
          type="button"
          id={inputId}
          ref={setTriggerRef}
          className={`${baseClass}__trigger`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? `${inputId}-listbox` : undefined}
          aria-activedescendant={activeOptionId}
          aria-describedby={helperText ? `${inputId}-helper` : rest['aria-describedby']}
          aria-invalid={error || undefined}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
        >
          <span className={`${baseClass}__icon material-symbols-rounded`} aria-hidden="true">
            schedule
          </span>
          <span
            className={`${baseClass}__value ${!selectedOption ? `${baseClass}__value--placeholder` : ''}`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className={`${baseClass}__chevron material-symbols-rounded`} aria-hidden="true">
            expand_more
          </span>
        </button>
        {isOpen && (
          <ul
            className={`${baseClass}__menu`}
            role="listbox"
            id={`${inputId}-listbox`}
            ref={listRef}
            aria-labelledby={label ? `${inputId}-label` : undefined}
          >
            {timeOptions.map((option, index) => (
              <li
                key={option.value}
                id={`${inputId}-option-${index}`}
                className={[
                  `${baseClass}__option`,
                  option.value === selectedValue ? `${baseClass}__option--selected` : '',
                  index === focusedIndex ? `${baseClass}__option--focused` : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="option"
                aria-selected={option.value === selectedValue}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
                {option.value === selectedValue && (
                  <span
                    className={`${baseClass}__check material-symbols-rounded`}
                    aria-hidden="true"
                  >
                    check
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Field>
    );
  },
);

TimePicker.displayName = 'TimePicker';
