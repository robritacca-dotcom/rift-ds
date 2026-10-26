// No 'use client' directive: CircularButton defines no hooks or handlers of its
// own — consumers' event props fall through — so Server Components can render it.
// The default Tooltip wrapper is the client island; like MessageActions, the
// button itself stays server-renderable.
import React from 'react';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import { Spinner } from '../Spinner/Spinner';
import { Tooltip } from '../Tooltip/Tooltip';
import './CircularButton.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

/** Props owned by CircularButton itself — everything else falls through to the DOM node. */
type CircularButtonOwnProps = {
  /** The icon — Material Symbol name (string) or custom element (ReactNode) */
  icon: string | React.ReactNode;
  /**
   * Emphasis: `primary` (filled), `secondary` (outlined) or `tertiary`
   * (ghost). The colour is `tone`'s job. `neutral` is the legacy value from
   * before the split and renders as `variant="primary" tone="neutral"`.
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'neutral';
  /**
   * Colour, independent of emphasis: `default` carries the action colour,
   * `neutral` the greys, `destructive` the danger colour. Tertiary is
   * already grey, so `neutral` leaves it unchanged; a tertiary
   * `destructive` takes the outlined look, since a danger action needs a
   * visible edge.
   */
  tone?: 'default' | 'neutral' | 'destructive';
  /**
   * Legacy alias for `variant`.
   *
   * @deprecated Use `variant` instead.
   */
  priority?: 'primary' | 'secondary' | 'tertiary';
  /** Whether the button is disabled */
  disabled?: boolean;
  /**
   * Documentation-only interaction state.
   *
   * @deprecated Use `disabled` for the disabled state.
   *
   * Documentation-only affordance for rendering a *static* interaction state in
   * Storybook and the showcase site. Real hover/active styling comes from CSS
   * pseudo-classes and needs no prop — for docs, prefer
   * `className="ds-circular-button--hover"`.
   */
  state?: 'default' | 'hover' | 'active' | 'disabled';
  /** Button size */
  size?: 'default' | 'compact';
  /**
   * Shows a spinner in place of the icon and blocks interaction while an
   * async action runs. Keeps the variant's full-colour appearance (unlike
   * the disabled state) and sets `aria-busy` on the rendered element.
   */
  loading?: boolean;
  /** Accessible label — required, because the button has no visible text */
  ariaLabel: string;
  /**
   * The hover/focus tooltip. An icon-only control names itself: by default
   * the button wears a Tooltip carrying `ariaLabel`. Pass a string to show
   * different wording, or `false` to opt out — for a host that labels the
   * control another way, or one that owns the button's box directly
   * (SplitButton's trigger stretches to its sibling segment, which the
   * tooltip wrapper would block).
   */
  tooltip?: string | false;
  /** Which side the tooltip opens on. `start` and `end` follow the reading direction. */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';
  /** Optional href — renders as <a> instead of <button> */
  href?: string;
  /** Optional target attribute for links */
  target?: string;
  /** Optional rel attribute for links */
  rel?: string;
  /** Additional CSS classes */
  className?: string;
  /**
   * The component the link renders with, such as Next.js's `Link`, so it
   * navigates through the app's router; a plain `<a>` when unset. This
   * component can render on the server, so it never reads a LinkProvider:
   * pass the prop even under one.
   */
  linkComponent?: LinkComponent;
};

export interface CircularButtonProps
  extends CircularButtonOwnProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof CircularButtonOwnProps | 'type'> {}

/**
 * The emphasis × tone cell the button renders, as its modifier class, named
 * like Button's. Filled grey keeps its original `neutral` class, so styles
 * written against it still apply.
 */
function resolveCircularButtonCell(
  variant: NonNullable<CircularButtonOwnProps['variant']>,
  tone: CircularButtonOwnProps['tone'],
): string {
  const emphasis = variant === 'neutral' ? 'primary' : variant;
  const resolvedTone = tone ?? (variant === 'neutral' ? 'neutral' : 'default');
  if (resolvedTone === 'destructive') {
    return emphasis === 'primary' ? 'primary-destructive' : 'destructive';
  }
  if (resolvedTone === 'neutral' && emphasis !== 'tertiary') {
    return emphasis === 'primary' ? 'neutral' : 'secondary-neutral';
  }
  return emphasis;
}

/**
 * Circular icon button component.
 * A round button containing a single icon. `variant` sets the emphasis
 * (primary, secondary, tertiary) and `tone` the colour (default, neutral,
 * destructive),
 * in default and compact sizes.
 *
 * Renders a `<button>`, or an `<a>` when `href` is supplied. Forwards a ref to
 * whichever element it renders, and spreads unrecognised props onto it.
 */
export const CircularButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  CircularButtonProps
>(
  (
    {
      icon,
      variant,
      tone,
      priority,
      disabled,
      state,
      size = 'default',
      loading,
      ariaLabel,
      tooltip,
      tooltipPosition = 'top',
      href,
      target,
      rel,
      className = '',
      linkComponent,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-circular-button';
    const Link = linkComponent ?? 'a';

    // `priority` is the deprecated spelling of `variant`; `variant` wins when both are set.
    const resolvedVariant = resolveCircularButtonCell(variant ?? priority ?? 'primary', tone);
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

    const children = isLoading ? (
      <span className={`${baseClass}__icon`} aria-hidden="true">
        <Spinner size={size === 'compact' ? 'sm' : 'md'} tone="inherit" />
      </span>
    ) : (
      <span className={`${baseClass}__icon${typeof icon === 'string' ? ` material-symbols-rounded ${mirrorClass(icon)}` : ''}`} aria-hidden="true">
        {icon}
      </span>
    );

    // A loading link renders the button branch so interaction is truly blocked.
    const control =
      href && !isDisabled && !isLoading ? (
        <Link
          {...(rest as React.ComponentPropsWithoutRef<'a'>)}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          href={href}
          target={target}
          rel={rel}
          aria-label={ariaLabel}
        >
          {children}
        </Link>
      ) : (
        <button
          {...rest}
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={classes}
          disabled={isDisabled || isLoading}
          aria-busy={isLoading || undefined}
          aria-label={ariaLabel}
        >
          {children}
        </button>
      );

    // Self-labelling: the tooltip repeats the accessible name unless the
    // caller overrides the wording or opts out.
    const tooltipContent = tooltip === false ? null : (tooltip ?? ariaLabel);
    if (!tooltipContent) return control;
    return (
      <Tooltip content={tooltipContent} position={tooltipPosition}>
        {control}
      </Tooltip>
    );
  },
);

CircularButton.displayName = 'CircularButton';
