'use client';

import React from 'react';
import './Stepper.css';
import '../../fonts/material-symbols.css';

/** A single step in a Stepper flow. */
export type StepperStep = {
  /** Step label shown beside or below the indicator */
  label: string;
  /** Optional supporting line rendered under the label */
  description?: string;
};

/** Props owned by Stepper itself — everything else falls through to the `<ol>`. */
type StepperOwnProps = {
  /** Ordered list of steps in the flow */
  steps: StepperStep[];
  /**
   * Index of the active step. Steps before it render as complete (check
   * icon), steps after it as upcoming (step number). Pass `steps.length`
   * to mark the whole flow complete.
   */
  activeStep: number;
  /**
   * Callback with the clicked step's index. When provided, completed steps
   * and the active step become buttons so the reader can revisit an earlier
   * stage; upcoming steps stay non-interactive either way.
   */
  onStepClick?: (index: number) => void;
  /** Layout direction */
  orientation?: 'horizontal' | 'vertical';
  /** Additional CSS classes */
  className?: string;
};

export interface StepperProps
  extends StepperOwnProps,
    Omit<React.ComponentPropsWithoutRef<'ol'>, keyof StepperOwnProps> {}

/**
 * Stepper component — step-by-step progress indicator for wizards and
 * multi-stage flows. Renders an ordered list of steps with CSS-drawn
 * connectors: completed steps show a check, the active step carries
 * `aria-current="step"`, and upcoming steps show their number.
 *
 * Forwards a ref to the `<ol>` and spreads unrecognised props onto it.
 */
export const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
  (
    {
      steps,
      activeStep,
      onStepClick,
      orientation = 'horizontal',
      className = '',
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-stepper';

    const classes = [
      baseClass,
      orientation === 'vertical' && `${baseClass}--vertical`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <ol {...rest} ref={ref} className={classes}>
        {steps.map((step, index) => {
          const status =
            index < activeStep
              ? 'complete'
              : index === activeStep
                ? 'active'
                : 'upcoming';
          const interactive = Boolean(onStepClick) && status !== 'upcoming';

          // The indicator is decorative: the label is the step's accessible
          // name, so the number/check inside the circle is hidden from
          // assistive tech.
          const indicator = (
            <span className={`${baseClass}__indicator`} aria-hidden="true">
              {status === 'complete' ? (
                <span className="material-symbols-rounded">check</span>
              ) : (
                index + 1
              )}
            </span>
          );

          const text = (
            <span className={`${baseClass}__text`}>
              <span className={`${baseClass}__label`}>{step.label}</span>
              {step.description && (
                <span className={`${baseClass}__description`}>
                  {step.description}
                </span>
              )}
            </span>
          );

          return (
            <li
              key={index}
              className={`${baseClass}__step ${baseClass}__step--${status}`}
              aria-current={status === 'active' ? 'step' : undefined}
            >
              {interactive ? (
                <button
                  type="button"
                  className={`${baseClass}__content`}
                  onClick={() => onStepClick?.(index)}
                >
                  {indicator}
                  {text}
                </button>
              ) : (
                <span className={`${baseClass}__content`}>
                  {indicator}
                  {text}
                </span>
              )}
              {index < steps.length - 1 && (
                <span className={`${baseClass}__connector`} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    );
  },
);

Stepper.displayName = 'Stepper';
