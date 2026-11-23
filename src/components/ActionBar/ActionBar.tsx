import React from 'react';
import { ProgressiveBlur } from '../ProgressiveBlur/ProgressiveBlur';
import './ActionBar.css';

/** Props owned by ActionBar itself; everything else falls through to the root `<div>`. */
type ActionBarOwnProps = {
  /**
   * The summary line at the bar's start, such as "23 students still to
   * mark". It is a polite live region, so a count that changes while the
   * reader works is announced once it settles.
   */
  summary?: React.ReactNode;
  /**
   * The actions at the bar's end, typically one or two Buttons with the
   * primary action last. On a narrow bar they wrap below the summary and
   * hold the end edge.
   */
  actions?: React.ReactNode;
  /**
   * Whether the bar holds to the bottom of its scroll container while the
   * content scrolls under it. Off, it sits in flow after the content.
   */
  sticky?: boolean;
  /**
   * Whether the content fades under a progressive blur that reaches above
   * the bar. Off, the bar is a solid surface with a hairline at its top
   * edge.
   */
  blur?: boolean;
  /** Additional CSS classes on the root. */
  className?: string;
};

export interface ActionBarProps
  extends ActionBarOwnProps,
    Omit<React.ComponentPropsWithRef<'div'>, keyof ActionBarOwnProps> {}

/**
 * A bar docked to the bottom of a long list or form, holding a summary
 * line and the primary actions, with the content fading under a
 * progressive blur rather than being cut off at the bar's edge. The
 * forwarded ref and any unrecognised props target the root `<div>`, so a
 * host that wants a landmark passes `role="region"` with an `aria-label`.
 */
export function ActionBar({
  summary,
  actions,
  sticky = true,
  blur = true,
  className = '',
  ref,
  ...rest
}: ActionBarProps) {
  const baseClass = 'ds-action-bar';
  const classes = [
    baseClass,
    sticky && `${baseClass}--sticky`,
    blur ? `${baseClass}--blur` : `${baseClass}--solid`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div {...rest} ref={ref} className={classes}>
      {blur && <ProgressiveBlur side="bottom" tinted className={`${baseClass}__blur`} />}
      {/* Always rendered, even empty, so a summary that arrives later is
          announced: a live region inserted with its text already in it is
          not. */}
      <div className={`${baseClass}__summary`} aria-live="polite" aria-atomic="true">
        {summary}
      </div>
      {actions != null && actions !== false && <div className={`${baseClass}__actions`}>{actions}</div>}
    </div>
  );
}
