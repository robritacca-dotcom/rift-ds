import React from 'react';
import './Prose.css';

/** Props owned by Prose itself — everything else falls through to the root element. */
type ProseOwnProps = {
  /** Body scale. `sm` maps paragraphs, lists and code to the small paragraph tokens for dense chat contexts. */
  size?: 'default' | 'sm';
  /** Additional CSS classes */
  className?: string;
  /** The rendered markup to style — the output of whatever markdown renderer the consumer uses. */
  children?: React.ReactNode;
};

export interface ProseProps
  extends ProseOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof ProseOwnProps> {}

/**
 * Prose is the typography kit for rendered markdown and rich agent output.
 * The package ships no markdown renderer: consumers render markdown with
 * whatever library they already use and wrap the result in Prose, which
 * styles the descendant elements — headings, paragraphs, lists, links,
 * code, quotes, tables — with the token scale.
 */
export const Prose = React.forwardRef<HTMLDivElement, ProseProps>(
  ({ size = 'default', className = '', children, ...rest }, ref) => {
    const baseClass = 'ds-prose';

    const classes = [baseClass, size === 'sm' ? `${baseClass}--sm` : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div {...rest} ref={ref} className={classes}>
        {children}
      </div>
    );
  },
);

Prose.displayName = 'Prose';
