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
  /** Material Symbol name used when no logo is provided (e.g. "emoji_events") */
  icon?: string;
  /** Open in a new tab. Defaults to true; set false for links inside the same site, which swaps the open_in_new indicator for arrow_forward. */
  newTab?: boolean;
}

export interface LinkListProps {
  /** Links to render, in display order */
  items: LinkListItem[];
  /** Additional CSS classes */
  className?: string;
}

export const LinkList = ({ items, className = '' }: LinkListProps) => {
  const classes = ['ds-link-list', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {items.map((item) => {
        const subs = item.sub
          ? Array.isArray(item.sub)
            ? item.sub
            : [item.sub]
          : [];

        const newTab = item.newTab ?? true;

        return (
          <a
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
              ) : (
                <span className="material-symbols-rounded ds-link-list__symbol">
                  {item.icon ?? 'link'}
                </span>
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
          </a>
        );
      })}
    </div>
  );
};
