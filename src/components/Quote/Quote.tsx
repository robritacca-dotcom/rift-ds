import React from 'react';
import './Quote.css';

/** Props owned by Quote itself — everything else falls through to the root figure. */
type QuoteOwnProps = {
  /** The quote text */
  children: React.ReactNode;
  /** Who said it, e.g. "Jordan Reyes" */
  attribution?: string;
  /** Context under the attribution, e.g. "Design Lead, Northlight" */
  detail?: string;
  /** `default` is an inline blockquote; `pull` is a large display pull-quote */
  variant?: 'default' | 'pull';
  /** Additional CSS classes */
  className?: string;
};

export interface QuoteProps
  extends QuoteOwnProps,
    Omit<React.ComponentPropsWithoutRef<'figure'>, keyof QuoteOwnProps> {}

/**
 * Quote component — an inline blockquote or a large pull-quote,
 * with optional attribution. Forwards a ref to the root `<figure>` and
 * spreads native attributes onto it.
 */
export const Quote = React.forwardRef<HTMLElement, QuoteProps>(
  ({ children, attribution, detail, variant = 'default', className = '', ...rest }, ref) => {
    const baseClass = 'ds-quote';

    const classes = [baseClass, `${baseClass}--${variant}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <figure {...rest} ref={ref} className={classes}>
        <blockquote className={`${baseClass}__text`}>{children}</blockquote>
        {(attribution || detail) && (
          <figcaption className={`${baseClass}__caption`}>
            {attribution && (
              <span className={`${baseClass}__attribution`}>&mdash; {attribution}</span>
            )}
            {detail && <span className={`${baseClass}__detail`}>{detail}</span>}
          </figcaption>
        )}
      </figure>
    );
  },
);

Quote.displayName = 'Quote';
