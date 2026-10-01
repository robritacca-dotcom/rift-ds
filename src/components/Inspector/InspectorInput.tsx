'use client';

import React from 'react';
import './Inspector.css';

/** Props owned by InspectorInput itself — everything else falls through to the <input>. */
type InspectorInputOwnProps = {
  /** The setting's name, drawn inside the bar on the left, as the field's real <label>. */
  label: string;
  /** Current value. */
  value?: string;
  /** Input type: a curated subset of the single-line text types. */
  type?: 'text' | 'email' | 'url' | 'search' | 'tel';
  /** Component size, matching Button: `default` is 40px tall, `compact` 32px (not the native character-width `size` attribute). */
  size?: 'default' | 'compact';
  /**
   * Convenience callback receiving the value directly.
   * Fires alongside `onChange`, which keeps the standard React event signature
   * so form libraries work unmodified.
   */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes, applied to the bar rather than the <input>. */
  className?: string;
};

export interface InspectorInputProps
  extends InspectorInputOwnProps,
    Omit<React.ComponentPropsWithoutRef<'input'>, keyof InspectorInputOwnProps> {}

/**
 * A one-row text field for inspector panels: the name on the left, the
 * typed value right-aligned in the rest of the bar. The form counterpart,
 * with a label above and helper text below, is Input.
 *
 * Forwards a ref to the underlying <input> and spreads unrecognised props
 * onto it, so `autoComplete`, `maxLength` and form registration all work.
 */
export const InspectorInput = React.forwardRef<HTMLInputElement, InspectorInputProps>(
  (
    {
      label,
      value,
      type = 'text',
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

    const classes = [
      'ds-inspector-bar',
      'ds-inspector-input',
      size === 'compact' ? 'ds-inspector-bar--compact' : '',
      disabled ? 'ds-inspector-bar--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    return (
      <div className={classes}>
        <label htmlFor={inputId} className="ds-inspector-bar__label">
          {label}
        </label>
        <input
          {...rest}
          ref={ref}
          id={inputId}
          className="ds-inspector-input__field"
          type={type}
          value={value}
          disabled={disabled}
          onChange={handleChange}
        />
      </div>
    );
  },
);

InspectorInput.displayName = 'InspectorInput';
