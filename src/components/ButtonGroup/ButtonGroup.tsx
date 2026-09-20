import React from 'react';
import { Button, type ButtonProps } from '../Button/Button';
import './ButtonGroup.css';

export interface ButtonGroupProps {
  /** Orientation of the button group */
  orientation?: 'horizontal' | 'vertical';
  /** Array of button configurations */
  buttons: Array<ButtonProps>;
  /** Accessible label for the group */
  ariaLabel?: string;
  /** Additional CSS class */
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  orientation = 'horizontal',
  buttons,
  ariaLabel,
  className = '',
}) => {
  return (
    <div
      className={`ds-button-group ds-button-group--${orientation} ${className}`}
      role="group"
      aria-label={ariaLabel}
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
};
