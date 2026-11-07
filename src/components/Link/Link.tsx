import React from 'react';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import { mirrorClass } from '../../behaviors/direction';
import '../../behaviors/visually-hidden.css';
import '../../fonts/material-symbols.css';
import './Link.css';

/** Props owned by Link itself; everything else falls through to the anchor. */
type LinkOwnProps = {
  /** Where the link goes. */
  href: string;
  /** The link text. */
  children: React.ReactNode;
  /** `inline` sits inside a sentence, underlined and in the sentence's colour; `standalone` stands on its own line or beside a control, in the tertiary action text colour and its own type face. Both are underlined. */
  variant?: 'inline' | 'standalone';
  /** The standalone link's type size: `default` the paragraph face, `compact` the small paragraph face. An inline link always takes the size of the text around it. Distinct from no native attribute of an anchor. */
  size?: 'default' | 'compact';
  /** The link leaves the app: it opens in a new tab with `rel="noopener noreferrer"`, carries an outward mark, and tells a screen reader it opens a new tab. */
  external?: boolean;
  /** Read after an external link's text, hidden from the eye. Defaults to "(opens in a new tab)". */
  externalLabel?: string;
  /** Hold the link inert: it renders as text with `aria-disabled`, at the library's disabled treatment, and goes nowhere. */
  disabled?: boolean;
  /** A Material Symbol name or a node before the text. A directional glyph mirrors in a right-to-left context. */
  iconLeft?: string | React.ReactNode;
  /** A Material Symbol name or a node after the text. A directional glyph mirrors in a right-to-left context. */
  iconRight?: string | React.ReactNode;
  /**
   * The component the link renders with, such as Next.js's `Link`, so it
   * navigates through the app's router; a plain `<a>` when unset. This
   * component can render on the server, so it never reads a LinkProvider:
   * pass the prop even under one. An external link always renders a plain
   * `<a>`.
   */
  linkComponent?: LinkComponent;
  /** Additional CSS classes. */
  className?: string;
};

export interface LinkProps
  extends LinkOwnProps,
    Omit<React.ComponentPropsWithRef<'a'>, keyof LinkOwnProps> {}

const renderIcon = (icon: string | React.ReactNode, side: 'start' | 'end') => {
  if (icon == null || icon === false) return null;
  if (typeof icon === 'string')
    return (
      <span className={`ds-link__icon ds-link__icon--${side} material-symbols-rounded ${mirrorClass(icon)}`} aria-hidden="true">
        {icon}
      </span>
    );
  return (
    <span className={`ds-link__icon ds-link__icon--${side}`} aria-hidden="true">
      {icon}
    </span>
  );
};

/**
 * A text link, inside a sentence or on its own. Renders through
 * `linkComponent` so it navigates through the app's router, opens an
 * external address in a new tab and says so, and holds still with
 * `disabled`. Server-renderable.
 */
export function Link({
  href,
  children,
  variant = 'inline',
  size = 'default',
  external = false,
  externalLabel = '(opens in a new tab)',
  disabled = false,
  iconLeft,
  iconRight,
  linkComponent,
  className = '',
  ref,
  ...rest
}: LinkProps) {
  const Anchor = external ? 'a' : (linkComponent ?? 'a');
  const classes = [
    'ds-link',
    `ds-link--${variant}`,
    variant === 'standalone' && `ds-link--${size}`,
    disabled && 'ds-link--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {renderIcon(iconLeft, 'start')}
      <span className="ds-link__text">{children}</span>
      {external && (
        <span className="ds-link__icon ds-link__icon--end ds-link__external material-symbols-rounded" aria-hidden="true">
          arrow_outward
        </span>
      )}
      {renderIcon(iconRight, 'end')}
      {external && <span className="ds-visually-hidden"> {externalLabel}</span>}
    </>
  );

  if (disabled) {
    const { target: _target, rel: _rel, download: _download, ...spanRest } = rest;
    return (
      <span
        {...(spanRest as React.ComponentPropsWithoutRef<'span'>)}
        ref={ref as React.Ref<HTMLSpanElement>}
        role="link"
        aria-disabled="true"
        className={classes}
      >
        {content}
      </span>
    );
  }

  return (
    <Anchor
      {...rest}
      ref={ref}
      href={href}
      className={classes}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </Anchor>
  );
}
