import React from 'react';
import './Quote.css';

export interface QuoteProps {
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
}

/**
 * Quote component — an inline blockquote or a large pull-quote,
 * with optional attribution.
 */
export const Quote = ({
  children,
  attribution,
  detail,
  variant = 'default',
  className = '',
}: QuoteProps) => {
  const baseClass = 'ds-quote';

  const classes = [baseClass, `${baseClass}--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <figure className={classes}>
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
};
