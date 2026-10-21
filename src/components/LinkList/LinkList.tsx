import React from 'react';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import './LinkList.css';
import '../../fonts/material-symbols.css';

export interface LinkListItem {
  /** Link destination */
  href: string;
  /** Primary label — shown with the open_in_new icon */
  label: string;
  /** One or more subtitle lines shown below the label */
  sub?: string | string[];
  /** Path to a logo image (preferred over icon when both are set) */
  logo?: string;
  /** Alt text for the logo — defaults to empty string (decorative) */
  logoAlt?: string;
  /** Icon used when no logo is provided — Material Symbol name (string, e.g. "emoji_events") or custom element (ReactNode) */
  icon?: string | React.ReactNode;
  /** Open in a new tab. Defaults to true; set false for links inside the same site, which swaps the open_in_new indicator for arrow_forward. */
  newTab?: boolean;
}

/** Props owned by LinkList itself — everything else falls through to the root div. */
type LinkListOwnProps = {
  /** Links to render, in display order */
  items: LinkListItem[];
  /** Additional CSS classes */
  className?: string;
  /**
   * The component its links render with, such as Next.js's `Link`, so they
   * navigate through the app's router; a plain `<a>` when unset. This
   * component can render on the server, so it never reads a LinkProvider:
   * pass the prop even under one.
   */
  linkComponent?: LinkComponent;
};

export interface LinkListProps
  extends LinkListOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof LinkListOwnProps | 'children'> {}

/**
 * LinkList — a stacked list of link rows, each with a logo or icon, a label,
 * optional subtitle lines and an open-in-new-tab or forward indicator.
 * Forwards a ref to the root div and spreads native attributes onto it.
 */
export const LinkList = React.forwardRef<HTMLDivElement, LinkListProps>(
  ({ items, className = '', linkComponent, ...rest }, ref) => {
    const classes = ['ds-link-list', className].filter(Boolean).join(' ');
    const Link = linkComponent ?? 'a';
    return (
      <div {...rest} ref={ref} className={classes}>
        {items.map((item) => {
          const subs = item.sub
            ? Array.isArray(item.sub)
              ? item.sub
              : [item.sub]
            : [];

          const newTab = item.newTab ?? true;

          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              target={newTab ? '_blank' : undefined}
              rel={newTab ? 'noopener noreferrer' : undefined}
              className="ds-link-list__item"
            >
              <span className="ds-link-list__icon-wrap" aria-hidden="true">
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={item.logoAlt ?? ''}
                    className="ds-link-list__logo"
                    width={28}
                    height={28}
                  />
                ) : typeof item.icon === 'string' || item.icon == null ? (
                  <span className="material-symbols-rounded ds-link-list__symbol">
                    {item.icon ?? 'link'}
                  </span>
                ) : (
                  <span className="ds-link-list__symbol">{item.icon}</span>
                )}
              </span>

              <div className="ds-link-list__content">
                <div className="ds-link-list__title">
                  <span>{item.label}</span>
                  <span className="material-symbols-rounded ds-link-list__open-icon" aria-hidden="true">
                    {newTab ? 'open_in_new' : 'arrow_forward'}
                  </span>
                </div>
                {subs.map((s, i) => (
                  <span key={i} className="ds-link-list__sub">{s}</span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    );
  },
);

LinkList.displayName = 'LinkList';
