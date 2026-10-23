'use client';

import React from 'react';
import { SwitchIndicator } from '../ToggleSwitch/ToggleSwitch';
import './Inspector.css';

/** Props owned by InspectorToggleSwitch itself — everything else falls through to the <input type="checkbox">. */
type InspectorToggleSwitchOwnProps = {
  /** The setting's name, drawn inside the bar on the left. Also the switch's accessible name. */
  label: string;
  /** Component size, matching Button: `default` is 40px tall, `compact` 32px (not the native character-width `size` attribute). */
  size?: 'default' | 'compact';
  /**
   * Convenience callback receiving the checked state directly.
   * Fires alongside `onChange`, which keeps the standard React event signature.
   */
  onCheckedChange?: (checked: boolean) => void;
  /** Additional CSS classes, applied to the bar rather than the <input>. */
  className?: string;
};

export interface InspectorToggleSwitchProps
  extends InspectorToggleSwitchOwnProps,
    Omit<React.ComponentPropsWithoutRef<'input'>, keyof InspectorToggleSwitchOwnProps | 'type'> {}

/**
 * A one-row switch for inspector panels: the whole bar is the switch, with
 * the name on the left and ToggleSwitch's own track on the right, so an
 * on switch in a panel looks exactly like one in a form. The form
 * counterpart, a standalone switch with its label beside it, is
 * ToggleSwitch.
 *
 * A native checkbox with `role="switch"` covers the bar; `checked` and
 * `defaultChecked` both work.
 * Forwards a ref to that input and spreads unrecognised props onto it.
 */
export const InspectorToggleSwitch = React.forwardRef<
  HTMLInputElement,
  InspectorToggleSwitchProps
>(
  (
    {
      label,
      size = 'default',
      disabled = false,
      checked,
      defaultChecked,
      onChange,
      onCheckedChange,
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
      'ds-inspector-toggle-switch',
      size === 'compact' ? 'ds-inspector-bar--compact' : '',
      disabled ? 'ds-inspector-bar--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // ToggleSwitch's paint keys off a class, not the checkbox, so the state
    // is mirrored here: the prop when controlled, the last change when not.
    const [uncontrolledOn, setUncontrolledOn] = React.useState(Boolean(defaultChecked));
    const on = checked ?? uncontrolledOn;

    // A form reset moves the checkbox without a change event, so the mirror
    // re-reads it once the reset has landed.
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const setRefs = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };
    React.useEffect(() => {
      const form = inputRef.current?.form;
      if (!form) return;
      const onReset = () =>
        setTimeout(() => setUncontrolledOn(Boolean(inputRef.current?.checked)));
      form.addEventListener('reset', onReset);
      return () => form.removeEventListener('reset', onReset);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUncontrolledOn(e.target.checked);
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className={classes}>
        <label htmlFor={inputId} className="ds-inspector-bar__label">
          {label}
        </label>
        {/* ToggleSwitch's own track and thumb, at the size that fits the bar:
            the full switch in a default bar, the compact one in a compact bar. */}
        <SwitchIndicator
          className="ds-inspector-toggle-switch__switch"
          checked={on}
          size={size}
        />
        <input
          {...rest}
          ref={setRefs}
          id={inputId}
          className="ds-inspector-bar__native"
          type="checkbox"
          role="switch"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={handleChange}
        />
      </div>
    );
  },
);

InspectorToggleSwitch.displayName = 'InspectorToggleSwitch';
