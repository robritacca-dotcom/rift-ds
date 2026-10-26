import React from 'react';
import './Instructions.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

export interface InstructionStep {
  /** Step label/title */
  label: string;
  /** Optional step description */
  description?: string;
  /** Optional custom icon — Material Symbol name (string) or custom element (ReactNode); defaults to step number */
  icon?: string | React.ReactNode;
}

/** Props owned by Instructions itself — everything else falls through to the root div. */
type InstructionsOwnProps = {
  /**
   * Instructions title, rendered as a heading above the steps.
   * Note: this shadows the native `title` tooltip attribute, which Instructions does not expose.
   */
  title?: string;
  /** Array of instruction steps */
  steps: InstructionStep[];
  /** Component size */
  size?: 'default' | 'compact';
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
  /**
   * What a step without an `icon` shows in its badge: its number when true
   * (the default), a small dot when false. A step's own `icon` always wins.
   */
  numbered?: boolean;
  /** Additional CSS classes */
  className?: string;
};

export interface InstructionsProps
  extends InstructionsOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof InstructionsOwnProps | 'children'> {}

/**
 * Instructions component for step-by-step guidance.
 * Displays an ordered list of steps with optional icons,
 * descriptions, and connecting lines. Forwards a ref to the root div and
 * spreads native attributes onto it.
 */
export const Instructions = React.forwardRef<HTMLDivElement, InstructionsProps>(
  (
    {
      title,
      steps,
      size = 'default',
      direction = 'vertical',
      numbered = true,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-instructions';
    const sizeClass = `${baseClass}--${size}`;
    const dirClass = `${baseClass}--${direction}`;

    const classes = [baseClass, sizeClass, dirClass, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        {title && <h3 className={`${baseClass}__title`}>{title}</h3>}

        <ol className={`${baseClass}__list`}>
          {steps.map((step, idx) => (
            <li key={idx} className={`${baseClass}__step`}>
              <div className={`${baseClass}__indicator`}>
                <div className={`${baseClass}__badge`}>
                  {step.icon ? (
                    typeof step.icon === 'string' ? (
                      <span className={`material-symbols-rounded ${mirrorClass(step.icon)}`} aria-hidden="true">
                        {step.icon}
                      </span>
                    ) : (
                      <span aria-hidden="true">{step.icon}</span>
                    )
                  ) : numbered ? (
                    <span className={`${baseClass}__number`}>{idx + 1}</span>
                  ) : (
                    <span className={`${baseClass}__dot`} />
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`${baseClass}__connector`} />
                )}
              </div>

              <div className={`${baseClass}__content`}>
                <p className={`${baseClass}__label`}>{step.label}</p>
                {step.description && (
                  <p className={`${baseClass}__description`}>{step.description}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  },
);

Instructions.displayName = 'Instructions';
