'use client';

import React, { useState } from 'react';
import './Inspector.css';

/** Props owned by InspectorSlider itself — everything else falls through to the <input type="range">. */
type InspectorSliderOwnProps = {
  /** The setting's name, drawn inside the bar on the left. Also the range's accessible name. */
  label: string;
  /** Current value (controlled). Leave unset and use `defaultValue` for an uncontrolled slider. */
  value?: number;
  /** Starting value for an uncontrolled slider. Defaults to `min`. */
  defaultValue?: number;
  /** Minimum value. */
  min?: number;
  /** Maximum value. */
  max?: number;
  /** Step increment. Also sets how many decimals the reading shows (0.02 reads "0.50"). */
  step?: number;
  /** Formats the reading on the right, and the value a screen reader announces. Defaults to the step's precision. */
  format?: (value: number) => string;
  /** Component size, matching Button: `default` is 40px tall, `compact` 32px (not the native character-width `size` attribute). */
  size?: 'default' | 'compact';
  /**
   * Convenience callback receiving the numeric value directly.
   * Fires alongside `onChange`, which keeps the standard React event signature.
   */
  onValueChange?: (value: number) => void;
  /** Additional CSS classes, applied to the bar rather than the <input>. */
  className?: string;
};

export interface InspectorSliderProps
  extends InspectorSliderOwnProps,
    Omit<React.ComponentPropsWithoutRef<'input'>, keyof InspectorSliderOwnProps | 'type'> {}

/** Decimal places a step implies: 0.02 reads as "0.50", 5 reads as "50". */
const decimalsOf = (step: number) => {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot < 0 ? 0 : text.length - dot - 1;
};

/**
 * A one-row slider for inspector panels: the whole bar is the control, its
 * fill is the value, and the name and reading sit inside it. The form
 * counterpart, with a label above and a track, is Slider.
 *
 * A native range input covers the bar invisibly, so dragging anywhere,
 * clicking to jump, the keyboard and the screen-reader semantics are the
 * platform's. Forwards a ref to that input and spreads unrecognised props
 * onto it.
 */
export const InspectorSlider = React.forwardRef<HTMLInputElement, InspectorSliderProps>(
  (
    {
      label,
      value,
      defaultValue,
      min = 0,
      max = 100,
      step = 1,
      format,
      size = 'default',
      disabled = false,
      onChange,
      onValueChange,
      className = '',
      id,
      ...rest
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const [uncontrolled, setUncontrolled] = useState(defaultValue ?? min);
    const current = value ?? uncontrolled;
    const pct = max === min ? 0 : ((current - min) / (max - min)) * 100;
    const reading = format ? format(current) : current.toFixed(decimalsOf(step));

    const classes = [
      'ds-inspector-bar',
      'ds-inspector-slider',
      size === 'compact' ? 'ds-inspector-bar--compact' : '',
      disabled ? 'ds-inspector-bar--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(e.target.value);
      if (value === undefined) setUncontrolled(next);
      onChange?.(e);
      onValueChange?.(next);
    };

    return (
      <div
        className={classes}
        style={{ '--ds-inspector-pct': `${pct}%` } as React.CSSProperties}
      >
        <span className="ds-inspector-slider__fill" aria-hidden="true" />
        <span className="ds-inspector-slider__grip" aria-hidden="true" />
        <label htmlFor={inputId} className="ds-inspector-bar__label">
          {label}
        </label>
        <span className="ds-inspector-bar__value" aria-hidden="true">
          {reading}
        </span>
        <input
          aria-valuetext={reading}
          {...rest}
          ref={ref}
          id={inputId}
          className="ds-inspector-bar__native"
          type="range"
          min={min}
          max={max}
          step={step}
          value={current}
          disabled={disabled}
          onChange={handleChange}
        />
      </div>
    );
  },
);

InspectorSlider.displayName = 'InspectorSlider';
