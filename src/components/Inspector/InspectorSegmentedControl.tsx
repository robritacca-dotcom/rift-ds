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
 * left, the options as chips on the right. The selection is
 * SegmentedControl's: an action-colour pill that slides between the chips.
 * The form-and-toolbar counterpart, a free-standing pill strip, is
 * SegmentedControl.
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

    // The pill is placed from the selected chip, so the selection is mirrored
    // here: the prop when controlled, the last change when not.
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const selected = value ?? uncontrolledValue;

    const segmentsRef = React.useRef<HTMLSpanElement>(null);
    const [pill, setPill] = React.useState<{ x: number; w: number } | null>(null);
    // Ready a frame after the first measurement, so the pill appears in place
    // rather than sliding in from the strip's start.
    const [pillReady, setPillReady] = React.useState(false);

    const measure = React.useCallback(() => {
      const strip = segmentsRef.current;
      const index = options.findIndex((option) => option.value === selected);
      const chip = index >= 0 ? (strip?.children[index + 1] as HTMLElement | undefined) : undefined;
      setPill(chip ? { x: chip.offsetLeft, w: chip.offsetWidth } : null);
    }, [options, selected]);

    React.useLayoutEffect(measure, [measure]);

    // A form reset moves the radios without a change event, so the mirror
    // re-reads the checked one once the reset has landed.
    React.useEffect(() => {
      const form = segmentsRef.current?.querySelector('input')?.form;
      if (!form) return;
      const onReset = () =>
        setTimeout(() =>
          setUncontrolledValue(
            segmentsRef.current?.querySelector<HTMLInputElement>('input:checked')?.value,
          ),
        );
      form.addEventListener('reset', onReset);
      return () => form.removeEventListener('reset', onReset);
    }, []);

    // A web font landing or the panel resizing moves the chips under the pill.
    React.useEffect(() => {
      const strip = segmentsRef.current;
      if (!strip || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(measure);
      observer.observe(strip);
      return () => observer.disconnect();
    }, [measure]);

    React.useEffect(() => {
      if (!pill || pillReady) return;
      const frame = requestAnimationFrame(() => setPillReady(true));
      return () => cancelAnimationFrame(frame);
    }, [pill, pillReady]);

    const classes = [
      'ds-inspector-bar',
      'ds-inspector-segmented-control',
      size === 'compact' ? 'ds-inspector-bar--compact' : '',
      disabled ? 'ds-inspector-bar--disabled' : '',
      pill && pillReady ? 'ds-inspector-segmented-control--pill-ready' : '',
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
        <span ref={segmentsRef} className="ds-inspector-segmented-control__segments">
          <span
            className="ds-inspector-segmented-control__pill"
            aria-hidden="true"
            style={
              pill
                ? ({
                    '--ds-inspector-pill-x': `${pill.x}px`,
                    '--ds-inspector-pill-w': `${pill.w}px`,
                  } as React.CSSProperties)
                : undefined
            }
          />
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
                onChange={() => {
                  setUncontrolledValue(option.value);
                  onValueChange?.(option.value);
                }}
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
