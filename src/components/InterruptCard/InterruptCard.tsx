import React from 'react';
import { Button } from '../Button/Button';
import './InterruptCard.css';
import '../../fonts/material-symbols.css';

/** One choice the card offers, rendered as a Button in the options footer. */
export interface InterruptCardOption {
  /** Value passed to `onValueChange` when this option is chosen. */
  value: string;
  /** Button text, e.g. "Allow once". */
  label: string;
  /** Visual weight. `primary` for the recommended choice, `danger` for destructive approvals. */
  variant?: 'primary' | 'secondary' | 'danger';
}

/** Maps an option's weight onto the Button variant that renders it. */
const OPTION_VARIANTS: Record<
  NonNullable<InterruptCardOption['variant']>,
  'primary' | 'secondary' | 'destructive'
> = {
  primary: 'primary',
  secondary: 'secondary',
  danger: 'destructive',
};

/** Props owned by InterruptCard itself — everything else falls through to the root element. */
type InterruptCardOwnProps = {
  /** The question, e.g. "Allow file edit?". */
  title: string;
  /** One line of context under the title. */
  description?: string;
  /** Leading Material Symbol name, or any custom element. No icon by default. */
  icon?: string | React.ReactNode;
  /** The choices, rendered as buttons left to right. */
  options?: InterruptCardOption[];
  /** Fires with the chosen option's value. */
  onValueChange?: (value: string) => void;
  /**
   * The already-chosen value. When set, the card renders its answered state:
   * the options are replaced by a quiet echo of the chosen label.
   */
  value?: string;
  /** Override the echoed text in the answered state (default: the chosen option's label). */
  answeredLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /**
   * Detail slot between the description and the options — typically a
   * `<ToolCall status="pending">` showing what wants to run.
   */
  children?: React.ReactNode;
};

export interface InterruptCardProps
  extends InterruptCardOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof InterruptCardOwnProps> {}

/**
 * InterruptCard is a human-in-the-loop checkpoint: a question from the agent
 * with option buttons for the person to decide. "Allow this file edit?" —
 * allow once, always allow, deny.
 *
 * The card stays quiet in both states: one tone, the standard container
 * border, options in a footer outside the content. Once `value` is set the
 * decision is made and the footer echoes the chosen label; a visually hidden
 * status announcement carries the waiting state for screen readers.
 *
 * Fully controlled: the card never stores the answer itself — `onValueChange`
 * reports the choice and `value` renders it.
 */
export const InterruptCard = React.forwardRef<HTMLDivElement, InterruptCardProps>(
  (
    {
      title,
      description,
      icon,
      options,
      onValueChange,
      value,
      answeredLabel,
      className = '',
      children,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-interrupt-card';
    const answered = value !== undefined;

    const classes = [baseClass, answered ? `${baseClass}--answered` : '', className]
      .filter(Boolean)
      .join(' ');

    const echoedLabel =
      answeredLabel ?? options?.find((option) => option.value === value)?.label ?? value;

    return (
      <div {...rest} ref={ref} role="group" aria-label={title} className={classes}>
        <div className={`${baseClass}__header`}>
          {icon && (
            <span className={`${baseClass}__icon`} aria-hidden="true">
              {typeof icon === 'string' ? (
                <span className="material-symbols-rounded">{icon}</span>
              ) : (
                icon
              )}
            </span>
          )}
          <div className={`${baseClass}__heading`}>
            <span className={`${baseClass}__title`}>{title}</span>
            {description && <p className={`${baseClass}__description`}>{description}</p>}
          </div>
          {!answered && (
            <span className={`${baseClass}__sr-only`} role="status">
              Waiting for your decision
            </span>
          )}
        </div>

        {children && <div className={`${baseClass}__detail`}>{children}</div>}

        {answered ? (
          <div className={`${baseClass}__answer`}>
            <span className={`${baseClass}__answer-icon material-symbols-rounded`} aria-hidden="true">
              check
            </span>
            {echoedLabel}
          </div>
        ) : (
          options &&
          options.length > 0 && (
            <div className={`${baseClass}__options`}>
              {options.map((option) => (
                <Button
                  key={option.value}
                  variant={OPTION_VARIANTS[option.variant ?? 'secondary']}
                  size="compact"
                  label={option.label}
                  onClick={() => onValueChange?.(option.value)}
                />
              ))}
            </div>
          )
        )}
      </div>
    );
  },
);

InterruptCard.displayName = 'InterruptCard';
