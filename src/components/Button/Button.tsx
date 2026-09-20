'use client';

import React from 'react';
import { Spinner } from '../Spinner/Spinner';
import './Button.css';
import '../../fonts/material-symbols.css';

/** Props owned by Button itself — everything else falls through to the DOM node. */
type ButtonOwnProps = {
  /** Button text content */
  label?: string;
  /** Icon for left side — Material Symbol name (string) or custom element (ReactNode) */
  iconLeft?: string | React.ReactNode;
  /** Icon for right side — Material Symbol name (string) or custom element (ReactNode) */
  iconRight?: string | React.ReactNode;
  /** Visual treatment */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'destructive';
  /** Button size */
  size?: 'default' | 'compact';
  /** Whether the button is disabled */
  disabled?: boolean;
  /**
   * Shows a spinner in the left icon slot and blocks interaction while an
   * async action runs. Keeps the variant's full-colour appearance (unlike
   * `disabled`) and sets `aria-busy` on the rendered element.
   */
  loading?: boolean;
  /** Optional href — renders as <a> instead of <button> */
  href?: string;
  /** Optional target attribute for links */
  target?: string;
  /** Optional rel attribute for links */
  rel?: string;
  /** Marks this link as the current page (adds aria-current="page") */
  ariaCurrent?: boolean;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy alias for `variant`.
   *
   * @deprecated Use `variant` instead.
   */
  priority?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  /**
   * Documentation-only interaction state.
   *
   * @deprecated Use `disabled` for the disabled state.
   *
   * Documentation-only affordance for rendering a *static* interaction state in
   * Storybook and the showcase site. Real hover/active styling comes from CSS
   * pseudo-classes and needs no prop — for docs, prefer `className="ds-button--hover"`.
   */
  state?: 'default' | 'hover' | 'active' | 'disabled';
  /**
   * Legacy alias for `iconLeft`.
   *
   * @deprecated Use `iconLeft` instead.
   */
  icon?: string;
  /**
   * Legacy toggle for showing the text label.
   *
   * @deprecated Will be removed once `label` loses its default in the next major;
   * an icon-only button will simply omit `label`.
   */
  text?: boolean;
};

export interface ButtonProps
  extends ButtonOwnProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof ButtonOwnProps | 'type'> {}

/**
 * Button component from Figma design system.
 * Supports primary, secondary, tertiary, neutral and destructive variants.
 * Icons can be placed on the left and/or right side of the text.
 *
 * Renders a `<button>`, or an `<a>` when `href` is supplied. Forwards a ref to
 * whichever element it renders, and spreads unrecognised props onto it.
 */
export const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      label = 'Button',
      iconLeft,
      iconRight,
      variant,
      size = 'default',
      disabled,
      loading,
      href,
      target,
      rel,
      ariaCurrent,
      className = '',
      priority,
      state,
      icon,
      text = true,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-button';

    // `priority` is the deprecated spelling of `variant`; `variant` wins when both are set.
    const resolvedVariant = variant ?? priority ?? 'primary';
    // `disabled` is the real prop; `state="disabled"` is the deprecated path.
    const isDisabled = disabled ?? state === 'disabled';
    // Keep the state modifier class so the disabled styling applies either way.
    const resolvedState = state ?? (isDisabled ? 'disabled' : 'default');
    const isLoading = Boolean(loading);

    const classes = [
      baseClass,
      `${baseClass}--${resolvedVariant}`,
      `${baseClass}--${resolvedState}`,
      `${baseClass}--${size}`,
      isLoading && `${baseClass}--loading`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Material Symbols — rounded only
    const iconClass = 'material-symbols-rounded';

    // Backwards compatibility: icon prop maps to iconLeft.
    // While loading, the spinner takes over the left icon slot so the label
    // keeps its position and the button doesn't change width.
    const spinnerSize = size === 'compact' ? 'sm' : 'md';
    const leftIcon = isLoading ? (
      <Spinner size={spinnerSize} variant="inherit" />
    ) : (
      iconLeft || icon
    );

    /** Render an icon slot — string → Material Symbol, ReactNode → custom element */
    const renderIcon = (iconProp: string | React.ReactNode, position?: 'right') => {
      const positionClass = position === 'right' ? ` ${baseClass}__icon--right` : '';
      if (typeof iconProp === 'string') {
        return (
          <span className={`${baseClass}__icon${positionClass} ${iconClass}`} aria-hidden="true">
            {iconProp}
          </span>
        );
      }
      return (
        <span className={`${baseClass}__icon${positionClass}`} aria-hidden="true">
          {iconProp}
        </span>
      );
    };

    // An icon-only button (text={false}, or no label) renders nothing a screen
    // reader can announce. Fall back to the label as the accessible name
    // unless the consumer supplied one explicitly.
    const needsAccessibleName = !text || !label;
    const fallbackAriaLabel =
      needsAccessibleName && label && !rest['aria-label'] ? label : undefined;

    const content = (
      <>
        {leftIcon && renderIcon(leftIcon)}
        {text && <span className={`${baseClass}__text`}>{label}</span>}
        {iconRight && renderIcon(iconRight, 'right')}
      </>
    );

    // A loading link renders the button branch so interaction is truly blocked.
    if (href && !isDisabled && !isLoading) {
      return (
        <a
          {...(rest as React.ComponentPropsWithoutRef<'a'>)}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          href={href}
          target={target}
          rel={rel}
          aria-current={ariaCurrent ? 'page' : undefined}
          aria-label={fallbackAriaLabel ?? rest['aria-label']}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        {...rest}
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        disabled={isDisabled || isLoading}
        aria-busy={isLoading || undefined}
        aria-label={fallbackAriaLabel ?? rest['aria-label']}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = 'Button';
