'use client';

import React from 'react';
import './Card.css';
import '../../fonts/material-symbols.css';

/** Props owned by Card itself — everything else falls through to the DOM node. */
type CardOwnProps = {
  /** Card variant */
  variant?: 'default' | 'case-study';
  /**
   * Card title displayed below the preview.
   * Note: this shadows the native `title` tooltip attribute, which Card does not expose.
   */
  title: string;
  /** Preview content rendered inside the card (default variant only) */
  children?: React.ReactNode;
  /** Whether the card is interactive (hoverable) */
  interactive?: boolean;
  /** Additional CSS classes */
  className?: string;

  // ── Case-study variant props ──────────────────────────────────────────────
  /** Navigation href — renders the card as an <a> tag */
  href?: string;
  /** Cover image src */
  coverSrc?: string;
  /**
   * Cover content rendered in place of the image — for a cover that is drawn
   * rather than photographed (an SVG, a chart, a live preview). Takes
   * precedence over `coverSrc`, and fills the same fixed-ratio slot.
   */
  cover?: React.ReactNode;
  /** Cover image alt text */
  coverAlt?: string;
  /** Path to the company logo shown in the eyebrow */
  companyLogo?: string;
  /** Company name shown in the eyebrow */
  companyName?: string;
  /** Subtitle / dek line below the title */
  dek?: string;
  /** Render as a disabled placeholder (no href, dimmed, not interactive) */
  placeholder?: boolean;
};

export interface CardProps
  extends CardOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof CardOwnProps> {}

/**
 * Card renders a preview tile, or a case-study tile when `variant="case-study"`.
 *
 * Renders a `<div>`, or an `<a>` in the case-study variant when `href` is
 * supplied. Forwards a ref to whichever element it renders and spreads
 * unrecognised props onto it.
 */
export const Card = React.forwardRef<HTMLDivElement | HTMLAnchorElement, CardProps>(
  (
    {
      variant = 'default',
      title,
      children,
      interactive = false,
      onClick,
      onKeyDown,
      className = '',
      href,
      coverSrc,
      cover,
      coverAlt,
      companyLogo,
      companyName,
      dek,
      placeholder = false,
      ...rest
    },
    ref,
  ) => {
    // ── Case-study variant ────────────────────────────────────────────────────
    if (variant === 'case-study') {
      const inner = (
        <>
          <div className="ds-card--case-study__cover-wrap">
            {cover ? (
              <div className="ds-card--case-study__cover-slot">{cover}</div>
            ) : coverSrc ? (
              <img
                src={coverSrc}
                alt={coverAlt ?? `${title} cover`}
                className="ds-card--case-study__cover-image"
              />
            ) : (
              <div className="ds-card--case-study__cover-placeholder">
                {companyLogo && (
                  <img
                    src={companyLogo}
                    alt=""
                    className="ds-card--case-study__cover-placeholder-logo"
                  />
                )}
              </div>
            )}
          </div>
          <div className="ds-card--case-study__body">
            {(companyLogo || companyName) && (
              <div className="ds-card--case-study__eyebrow">
                {companyLogo && (
                  <img src={companyLogo} alt="" className="ds-card--case-study__company-logo" />
                )}
                {companyName && (
                  <span className="ds-card--case-study__company-name">{companyName}</span>
                )}
              </div>
            )}
            <h3 className="ds-card--case-study__title">{title}</h3>
            {dek && <p className="ds-card--case-study__dek">{dek}</p>}
          </div>
        </>
      );

      const classes = [
        'ds-card',
        'ds-card--case-study',
        placeholder ? 'ds-card--case-study--placeholder' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ');

      if (placeholder || !href) {
        return (
          <div
            {...rest}
            ref={ref as React.Ref<HTMLDivElement>}
            className={classes}
            aria-disabled="true"
          >
            {inner}
          </div>
        );
      }

      return (
        <a
          {...(rest as React.ComponentPropsWithoutRef<'a'>)}
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={classes}
          onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        >
          {inner}
        </a>
      );
    }

    // ── Default variant ───────────────────────────────────────────────────────
    const baseClass = 'ds-card';
    const classes = [baseClass, interactive ? `${baseClass}--interactive` : '', className]
      .filter(Boolean)
      .join(' ');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (!interactive) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
    };

    return (
      <div
        {...rest}
        ref={ref as React.Ref<HTMLDivElement>}
        className={classes}
        onClick={interactive ? onClick : undefined}
        onKeyDown={handleKeyDown}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? title : undefined}
      >
        <div className={`${baseClass}__preview`}>{children}</div>
        <h3 className={`${baseClass}__title`}>{title}</h3>
      </div>
    );
  },
);

Card.displayName = 'Card';
