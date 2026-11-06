import React from 'react';
import { Button } from '../Button/Button';
import './InterruptCard.css';
import '../../behaviors/chat-card.css';
import '../../behaviors/visually-hidden.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

/** The status an answered card records: an approval, a refusal, or neither. */
export type InterruptCardAnsweredVariant = 'positive' | 'error' | 'neutral';

/** One choice the card offers, rendered as a Button in the options footer. */
export interface InterruptCardOption {
  /** Value passed to `onValueChange` when this option is chosen. */
  value: string;
  /** Button text, e.g. "Allow once". */
  label: string;
  /**
   * Visual weight: `primary` for the recommended choice, `secondary` (the
   * default) for the rest. `danger` is the legacy value from before colour
   * moved onto `tone`, and renders as `variant="secondary" tone="destructive"`.
   */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Colour, passed to the option's Button: `destructive` for dangerous approvals. */
  tone?: 'default' | 'destructive';
  /**
   * The status the answered card's read-out takes once this option is chosen.
   * Defaults to `positive` for a `primary` option, `error` for a destructive
   * one and `neutral` for the rest; set `error` on a refusal such as "Deny".
   */
  answeredVariant?: InterruptCardAnsweredVariant;
  /**
   * What the answered card's read-out says once this option is chosen,
   * written as the decision made rather than the button pressed, e.g.
   * "Denied" for "Deny". Defaults to `label`.
   */
  answeredLabel?: string;
}

/** The status an answered option records, from its own or its emphasis. */
function answeredVariantOf(option: InterruptCardOption | undefined): InterruptCardAnsweredVariant {
  if (!option) return 'neutral';
  if (option.answeredVariant) return option.answeredVariant;
  if (option.variant === 'danger' || option.tone === 'destructive') return 'error';
  return option.variant === 'primary' ? 'positive' : 'neutral';
}

/**
 * The Button emphasis and tone an option renders with, legacy `danger`
 * included. In a row of three or more, the last option is the way out and
 * takes ActionCard's Dismiss treatment, secondary in the neutral tone,
 * unless it names a tone of its own.
 */
function optionButtonProps(option: InterruptCardOption, wayOut = false) {
  if (option.variant === 'danger') {
    return { variant: 'secondary', tone: option.tone ?? 'destructive' } as const;
  }
  const variant = option.variant ?? 'secondary';
  const tone = option.tone ?? (wayOut && variant === 'secondary' ? 'neutral' : 'default');
  return { variant, tone } as const;
}

/** Props owned by InterruptCard itself — everything else falls through to the root element. */
type InterruptCardOwnProps = {
  /**
   * The question, e.g. "Allow file edit?".
   * Note: this shadows the native `title` tooltip attribute, which InterruptCard does not expose.
   */
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
   * the options give way to the chosen one's read-out, worded as the
   * decision made, in the status that choice records.
   */
  value?: string;
  /** Override the answered read-out's text (default: the chosen option's `answeredLabel`, then its label). */
  answeredLabel?: string;
  /** Visually hidden status announced while the card waits for a decision. Defaults to "Waiting for your decision". */
  waitingLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /**
   * Detail slot between the description and the options — typically a
   * `<ToolCall status="pending">` showing what wants to run.
   */
  children?: React.ReactNode;
  /** Strip the card chrome (fill, border, radius) when the card sits inside another panel that supplies the surface, such as AiButton's request panel. */
  bare?: boolean;
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
 * decision is made: the buttons give way to the chosen one's read-out, a
 * compact button's size and shape in the status the option records
 * (`answeredVariant`); a visually hidden
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
      waitingLabel = 'Waiting for your decision',
      className = '',
      children,
      bare = false,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-interrupt-card';
    const answered = value !== undefined;

    const classes = [
      baseClass,
      answered ? `${baseClass}--answered` : '',
      bare ? `${baseClass}--bare` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const chosen = answered ? options?.find((option) => option.value === value) : undefined;
    const echoedLabel = answeredLabel ?? chosen?.answeredLabel ?? chosen?.label ?? value;

    return (
      <div {...rest} ref={ref} role="group" aria-label={title} className={classes}>
        <div className={`${baseClass}__header`}>
          {icon && (
            <span className={`${baseClass}__icon`} aria-hidden="true">
              {typeof icon === 'string' ? (
                <span className={`material-symbols-rounded ${mirrorClass(icon)}`}>{icon}</span>
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
            <span className="ds-visually-hidden" role="status">
              {waitingLabel}
            </span>
          )}
        </div>

        {children && <div className={`${baseClass}__detail`}>{children}</div>}

        {answered ? (
          /* The decision is made: the buttons give way to the chosen one's
             read-out, a compact button's size and shape in the status that
             choice records, behind a check (a cross for a refusal). */
          <div className={`${baseClass}__answer`}>
            <span className={`${baseClass}__readout ${baseClass}__readout--${answeredVariantOf(chosen)}`}>
              <span className={`${baseClass}__readout-icon material-symbols-rounded`} aria-hidden="true">
                {answeredVariantOf(chosen) === 'error' ? 'close' : 'check'}
              </span>
              {echoedLabel}
            </span>
          </div>
        ) : (
          options &&
          options.length > 0 && (
            <div className={`${baseClass}__options`}>
              {options.map((option, index) => (
                <Button
                  key={option.value}
                  {...optionButtonProps(option, index === options.length - 1 && options.length >= 3)}
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
