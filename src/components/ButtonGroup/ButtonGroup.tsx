import React from 'react';
import { Button, type ButtonProps } from '../Button/Button';
import './ButtonGroup.css';

/** Props owned by ButtonGroup itself — everything else falls through to the group `<div>`. */
type ButtonGroupOwnProps = {
  /** Orientation of the button group */
  orientation?: 'horizontal' | 'vertical';
  /** Array of button configurations */
  buttons: Array<ButtonProps>;
  /**
   * Legacy accessible-name prop for the group.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
  /** Additional CSS class */
  className?: string;
};

export interface ButtonGroupProps
  extends ButtonGroupOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ButtonGroupOwnProps | 'role' | 'children'> {}

/**
 * ButtonGroup — a row or column of Buttons in a `role="group"` container.
 *
 * The forwarded ref and any unrecognised props target the group `<div>`;
 * name the group with the native `aria-label` (or `aria-labelledby`).
 */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ orientation = 'horizontal', buttons, ariaLabel, className = '', ...rest }, ref) => {
    return (
      <div
        {...rest}
        ref={ref}
        className={`ds-button-group ds-button-group--${orientation} ${className}`}
        role="group"
        aria-label={rest['aria-label'] ?? ariaLabel}
      >
        {/* Spread the whole config so every ButtonProps field (target, rel,
            disabled, …) reaches the Button — enumerating silently dropped them.
            Entries default to tertiary; the deprecated priority spelling still
            counts as an explicit choice. */}
        {buttons.map((button, index) => (
          <Button
            key={index}
            {...button}
            variant={button.variant ?? button.priority ?? 'tertiary'}
          />
        ))}
      </div>
    );
  },
);

ButtonGroup.displayName = 'ButtonGroup';
