'use client';

import React from 'react';
import './Inspector.css';

/** One choice in an InspectorSegmentedControl. */
export interface InspectorSegment {
  /** The value reported when this segment is chosen. */
  value: string;
  /** Visible text. */
  label: string;
  /** Takes this one choice out of the set. */
  disabled?: boolean;
}

/** Props owned by InspectorSegmentedControl itself — everything else falls through to the radiogroup. */
type InspectorSegmentedControlOwnProps = {
  /** The setting's name, drawn inside the bar on the left. Names the radiogroup. */
  label: string;
  /** The choices, drawn left to right in the bar's end. */
  options: InspectorSegment[];
  /** The selected value (controlled). Leave unset and use `defaultValue` for an uncontrolled set. */
  value?: string;
  /** The starting selection for an uncontrolled set. */
  defaultValue?: string;
  /** The radios' shared `name`, for native form submission. Generated when unset. */
  name?: string;
  /** Takes the whole set out of use. */
  disabled?: boolean;
  /** Component size, matching Button: `default` is 40px tall, `compact` 32px. */
  size?: 'default' | 'compact';
  /** Called with the newly chosen value. */
  onValueChange?: (value: string) => void;
  /** Additional CSS classes, applied to the bar. */
  className?: string;
};

export interface InspectorSegmentedControlProps
  extends InspectorSegmentedControlOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof InspectorSegmentedControlOwnProps> {}

/**
 * A one-row choice of a few options for inspector panels: the name on the
 * left, the options as chips on the right. The selected chip takes a
 * neutral fill, never the action colour. The form-and-toolbar counterpart,
 * a free-standing pill strip, is SegmentedControl.
 *
 * Each option is a native radio, so arrow keys move the selection, the set
 * announces as one radiogroup, and it submits with a form. A native
 * `onChange` on the root receives each radio's bubbled change event.
 * Forwards a ref to the root and spreads unrecognised props onto it.
 */
export const InspectorSegmentedControl = React.forwardRef<
  HTMLDivElement,
  InspectorSegmentedControlProps
>(
  (
    {
      label,
      options,
      value,
      defaultValue,
      name,
      disabled = false,
      size = 'default',
      onValueChange,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const groupName = name ?? generatedId;
    const labelId = `${generatedId}-label`;

    const classes = [
      'ds-inspector-bar',
      'ds-inspector-segmented-control',
      size === 'compact' ? 'ds-inspector-bar--compact' : '',
      disabled ? 'ds-inspector-bar--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        aria-labelledby={labelId}
        {...rest}
        ref={ref}
        className={classes}
        role="radiogroup"
        aria-disabled={disabled || undefined}
      >
        <span id={labelId} className="ds-inspector-bar__label">
          {label}
        </span>
        <span className="ds-inspector-segmented-control__segments">
          {options.map((option) => (
            <label key={option.value} className="ds-inspector-segmented-control__segment">
              <input
                className="ds-inspector-segmented-control__radio"
                type="radio"
                name={groupName}
                value={option.value}
                disabled={disabled || option.disabled}
                {...(value !== undefined
                  ? { checked: option.value === value }
                  : { defaultChecked: option.value === defaultValue })}
                onChange={() => onValueChange?.(option.value)}
              />
              {option.label}
            </label>
          ))}
        </span>
      </div>
    );
  },
);

InspectorSegmentedControl.displayName = 'InspectorSegmentedControl';
