import React from 'react';
import './SourceChip.css';
import '../../fonts/material-symbols.css';

/** Props owned by SourceChip itself — everything else falls through to the root element. */
type SourceChipOwnProps = {
  /** The source name, e.g. "Design tokens quarterly". Truncates with an ellipsis when long. */
  title: string;
  /** Citation number, rendered as a leading numeral in its own small badge circle. */
  index?: number;
  /**
   * Leading icon — a Material Symbol name (string) or custom element (ReactNode).
   * The icon and the index share the leading slot: when both are passed, `index` wins
   * and the icon is not rendered.
   */
  icon?: string | React.ReactNode;
  /** Optional href — renders as an `<a>` instead of a `<span>`. */
  href?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface SourceChipProps
  extends SourceChipOwnProps,
    Omit<React.ComponentPropsWithoutRef<'a'>, keyof SourceChipOwnProps> {}

/**
 * SourceChip is the numbered citation pill linking a claim to its source.
 * It renders inline after a sentence or in a sources row under an assistant
 * chat message: a leading citation number (or icon) beside a truncating
 * source title.
 *
 * Renders an `<a>` when `href` is supplied, a plain `<span>` otherwise.
 * Forwards a ref to whichever element it renders, and spreads unrecognised
 * props onto it — `target` and `rel` pass through as native anchor attributes.
 */
export const SourceChip = React.forwardRef<HTMLAnchorElement | HTMLSpanElement, SourceChipProps>(
  ({ title, index, icon, href, className = '', ...rest }, ref) => {
    const baseClass = 'ds-source-chip';

    const classes = [baseClass, href ? `${baseClass}--link` : '', className]
      .filter(Boolean)
      .join(' ');

    // The leading slot: the citation number wins over the icon when both are set.
    const leading =
      index !== undefined ? (
        <span className={`${baseClass}__index`}>{index}</span>
      ) : icon ? (
        <span className={`${baseClass}__icon`} aria-hidden="true">
          {typeof icon === 'string' ? (
            <span className="material-symbols-rounded">{icon}</span>
          ) : (
            icon
          )}
        </span>
      ) : null;

    const content = (
      <>
        {leading}
        <span className={`${baseClass}__title`}>{title}</span>
      </>
    );

    if (href) {
      return (
        <a {...rest} ref={ref as React.Ref<HTMLAnchorElement>} className={classes} href={href}>
          {content}
        </a>
      );
    }

    return (
      <span
        {...(rest as React.ComponentPropsWithoutRef<'span'>)}
        ref={ref as React.Ref<HTMLSpanElement>}
        className={classes}
      >
        {content}
      </span>
    );
  },
);

SourceChip.displayName = 'SourceChip';
