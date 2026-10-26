'use client';

import React from 'react';
import { useLinkComponent, type LinkComponent } from '../../behaviors/LinkProvider';
import './ContactCard.css';
import '../../fonts/material-symbols.css';
import { mirrorClass } from '../../behaviors/direction';

/** Props owned by ContactCard itself — everything else falls through to the root node. */
type ContactCardOwnProps = {
  /** Primary label — e.g. "Email" */
  label: string;
  /** Visible value or description — e.g. "hello@example.com" */
  value: string;
  /** Link destination */
  href: string;
  /** Icon used when no logo is set — Material Symbol name (string) or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** Path to a logo image — preferred over icon when both are provided */
  logo?: string;
  /** Opens link in a new tab and shows open_in_new indicator */
  external?: boolean;
  /**
   * Renders a copy button beside the trailing icon. Pressing it calls
   * `onCopy(value)`; ContactCard never writes to the clipboard itself.
   */
  copyable?: boolean;
  /**
   * Called with the card's value when the copy control is pressed: the copy
   * button, or the whole card when `copyOnClick` is set. ContactCard does not
   * touch the clipboard, so write the value there in this handler.
   * Note: this replaces the native `onCopy` clipboard-event handler, which
   * ContactCard does not expose.
   */
  onCopy?: (value: string) => void;
  /**
   * Renders the whole card as a button that calls `onCopy(value)` on click,
   * with no navigation. The copying itself is the `onCopy` handler's job.
   */
  copyOnClick?: boolean;
  /**
   * Accessible name for the copy control: the copy button, or the whole card
   * when `copyOnClick` is set. Defaults to "Copy <value>", and to
   * "Copy <value> to clipboard" on a `copyOnClick` card; both defaults assume
   * your `onCopy` writes the value to the clipboard.
   */
  copyLabel?: string;
  /** Additional CSS classes */
  className?: string;
  /**
   * The component its links render with, such as Next.js's `Link`, so they
   * navigate through the app's router. Wins over a LinkProvider's; a plain
   * `<a>` when neither is set.
   */
  linkComponent?: LinkComponent;
};

export interface ContactCardProps
  extends ContactCardOwnProps,
    Omit<React.ComponentPropsWithoutRef<'a'>, keyof ContactCardOwnProps | 'children'> {}

/**
 * ContactCard — a contact row (email, phone, profile) rendered as a link,
 * with an optional copy button, or as a button that hands its value to
 * `onCopy` when `copyOnClick` is set (the host does the copying). Forwards a ref to whichever element it renders
 * (`<a>` or `<button>`) and spreads native attributes onto it.
 */
export const ContactCard = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, ContactCardProps>(
  (
    {
      label,
      value,
      href,
      icon,
      logo,
      external = false,
      copyable = false,
      onCopy,
      copyOnClick = false,
      copyLabel,
      className = '',
      linkComponent,
      ...rest
    },
    ref,
  ) => {
    const classes = ['ds-contact-card', className].filter(Boolean).join(' ');
    const Link = useLinkComponent(linkComponent);

    // Protocol links (mailto:, tel:) hand off to the OS default client. Opening
    // them in a new tab leaves an empty blank tab behind, so never set _blank for
    // them — even when `external` is true (it still drives the open_in_new icon).
    const isProtocolLink = /^(mailto:|tel:)/i.test(href);
    const openInNewTab = external && !isProtocolLink;

    const trailingIcon = copyOnClick
      ? 'content_copy'
      : external
        ? 'open_in_new'
        : 'arrow_forward';

    const content = (
      <>
        <span className="ds-contact-card__icon-wrap" aria-hidden="true">
          {logo ? (
            <img
              src={logo}
              alt=""
              width={24}
              height={24}
              className="ds-contact-card__logo"
            />
          ) : typeof icon === 'string' || icon == null ? (
            <span className={`material-symbols-rounded ds-contact-card__icon ${mirrorClass(icon)}`}>
              {icon ?? 'link'}
            </span>
          ) : (
            <span className="ds-contact-card__icon">{icon}</span>
          )}
        </span>

        <div className="ds-contact-card__text">
          <span className="ds-contact-card__label">{label}</span>
          <span className="ds-contact-card__value">{value}</span>
        </div>

        <div className="ds-contact-card__actions">
          {copyable && !copyOnClick && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCopy?.(value);
              }}
              className="ds-contact-card__copy-btn"
              aria-label={copyLabel ?? `Copy ${value}`}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                content_copy
              </span>
            </button>
          )}
          <span className={`material-symbols-rounded ds-contact-card__chevron ${mirrorClass(trailingIcon)}`} aria-hidden="true">
            {trailingIcon}
          </span>
        </div>
      </>
    );

    // Copy-only card: the whole card is a button that hands `value` to
    // `onCopy`, which does the copying. No navigation at all, so it can't silently fail the way a
    // mailto: link does when there's no registered mail handler. The
    // anchor-only attributes in `rest` (target, rel, download…) are inert on
    // a button; a consumer `onClick` still fires before the copy.
    if (copyOnClick) {
      const { onClick, ...buttonRest } = rest as React.ComponentPropsWithoutRef<'button'>;
      return (
        <button
          aria-label={copyLabel ?? `Copy ${value} to clipboard`}
          {...buttonRest}
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={classes}
          onClick={(e) => {
            onClick?.(e);
            onCopy?.(value);
          }}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        {...rest}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={openInNewTab ? '_blank' : undefined}
        rel={openInNewTab ? 'noopener noreferrer' : undefined}
        className={classes}
      >
        {content}
      </Link>
    );
  },
);

ContactCard.displayName = 'ContactCard';
