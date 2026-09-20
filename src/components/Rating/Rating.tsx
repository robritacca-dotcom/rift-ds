'use client';

import React, { useState } from 'react';
import './Rating.css';
import '../../fonts/material-symbols.css';

/** Props owned by Rating itself — everything else falls through to the root node. */
type RatingOwnProps = {
  /** Current rating (controlled). 0 means no rating. */
  value?: number;
  /** Initial rating for uncontrolled use. 0 means no rating. */
  defaultValue?: number;
  /** Number of steps on the scale */
  max?: number;
  /**
   * Convenience callback receiving the new rating directly.
   * Fires on every selection, including a clear back to 0 via `allowClear`.
   */
  onValueChange?: (value: number) => void;
  /** Display-only mode — renders the current rating with no interaction */
  readOnly?: boolean;
  /** Whether the control is disabled */
  disabled?: boolean;
  /** Selecting the already-selected step clears the rating back to 0 */
  allowClear?: boolean;
  /** Material Symbol drawn for each step */
  icon?: string;
  /** Component size */
  size?: 'default' | 'compact';
  /** Accessible name for the group, and the base of each step's label */
  label?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface RatingProps
  extends RatingOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof RatingOwnProps> {}

/**
 * Star-scale rating control. Behaves as a radio group: each step is a
 * `role="radio"` button, arrow keys move the selection, and the current
 * step holds the roving tab stop. `readOnly` renders the same row as a
 * static image with a spoken "N out of M" label.
 *
 * Forwards a ref to the root element and spreads unrecognised props onto it.
 */
export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value,
      defaultValue = 0,
      max = 5,
      onValueChange,
      readOnly = false,
      disabled = false,
      allowClear = false,
      icon = 'star',
      size = 'default',
      label = 'Rating',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [hoverValue, setHoverValue] = useState(0);

    const baseClass = 'ds-rating';
    const currentValue = value ?? internalValue;
    // Hover previews the would-be selection; keyboard and touch see the real value.
    const displayValue = !readOnly && !disabled && hoverValue > 0 ? hoverValue : currentValue;

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      readOnly ? `${baseClass}--read-only` : '',
      disabled ? `${baseClass}--disabled` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const setValue = (next: number) => {
      const resolved = allowClear && next === currentValue ? 0 : next;
      if (value === undefined) setInternalValue(resolved);
      onValueChange?.(resolved);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      let next: number | null = null;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          next = Math.min(max, currentValue + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          next = Math.max(1, currentValue - 1);
          break;
        case 'Home':
          next = 1;
          break;
        case 'End':
          next = max;
          break;
      }
      if (next !== null) {
        event.preventDefault();
        if (value === undefined) setInternalValue(next);
        onValueChange?.(next);
        // Keep focus on the newly selected step so the roving tab stop follows.
        const steps = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]');
        steps[next - 1]?.focus();
      }
    };

    const steps = Array.from({ length: max }, (_, i) => i + 1);

    if (readOnly) {
      return (
        <div
          {...rest}
          ref={ref}
          className={classes}
          role="img"
          aria-label={rest['aria-label'] ?? `${label}: ${currentValue} out of ${max}`}
        >
          {steps.map((step) => (
            <span
              key={step}
              className={`${baseClass}__step ${step <= displayValue ? `${baseClass}__step--filled` : ''}`}
              aria-hidden="true"
            >
              <span className={`${baseClass}__icon material-symbols-rounded`}>{icon}</span>
            </span>
          ))}
        </div>
      );
    }

    return (
      <div
        {...rest}
        ref={ref}
        className={classes}
        role="radiogroup"
        aria-label={rest['aria-label'] ?? label}
        aria-disabled={disabled || undefined}
        onKeyDown={disabled ? undefined : handleKeyDown}
        onMouseLeave={() => setHoverValue(0)}
      >
        {steps.map((step) => {
          const checked = step === currentValue;
          // The checked step holds the tab stop; with no rating yet, the first does.
          const tabStop = checked || (currentValue === 0 && step === 1);
          return (
            <button
              key={step}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={label ? `${label}: ${step} out of ${max}` : `${step} out of ${max}`}
              tabIndex={tabStop ? 0 : -1}
              disabled={disabled}
              className={`${baseClass}__step ${step <= displayValue ? `${baseClass}__step--filled` : ''}`}
              onClick={() => setValue(step)}
              onMouseEnter={() => setHoverValue(step)}
            >
              <span className={`${baseClass}__icon material-symbols-rounded`} aria-hidden="true">
                {icon}
              </span>
            </button>
          );
        })}
      </div>
    );
  },
);

Rating.displayName = 'Rating';
