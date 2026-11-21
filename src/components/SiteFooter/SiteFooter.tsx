import React, { useId } from 'react';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import './SiteFooter.css';
import '../../behaviors/visually-hidden.css';
import '../../fonts/material-symbols.css';

/** One link in a footer column. */
export interface SiteFooterLink {
  /** Link text. */
  label: string;
  /** Where it goes. */
  href: string;
  /** The link leaves the site: it opens in a new tab and says so. */
  external?: boolean;
}

/** A titled column of footer links. */
export interface SiteFooterColumn {
  /** The column's heading, e.g. "Docs". */
  title: string;
  /** Its links, in order. */
  links: SiteFooterLink[];
}

/** Props owned by SiteFooter itself. */
type SiteFooterOwnProps = {
  /** The sitemap columns, in order along the row. Leave it out for a footer of small print alone. */
  columns?: SiteFooterColumn[];
  /** The brand at the start of the footer: a logo, a name, or both. */
  brand?: React.ReactNode;
  /** A line about the site under the brand. */
  description?: React.ReactNode;
  /** Social or utility controls for the bottom row's end, such as IconButtons. */
  social?: React.ReactNode;
  /** The bottom row's small print: a copyright, a licence, a privacy link. */
  legal?: React.ReactNode;
  /** Accessible name of the navigation landmark that holds the columns. */
  navigationLabel?: string;
  /** Text read after an external link's name, for a screen reader. */
  externalLabel?: string;
  /**
   * The component its links render with, such as Next.js's `Link`. A plain
   * `<a>` when unset. Server-renderable, so it reads no LinkProvider: pass
   * it here.
   */
  linkComponent?: LinkComponent;
  /** Additional CSS classes */
  className?: string;
};

export interface SiteFooterProps
  extends SiteFooterOwnProps,
    Omit<React.ComponentPropsWithRef<'footer'>, keyof SiteFooterOwnProps | 'children'> {}

/**
 * SiteFooter: the bottom of a site, the pair to SiteHeader. The brand and a
 * line about the site, then columns of links (a sitemap), then a row of
 * small print with social links at its end. The columns fold from a row to
 * a grid to a single stack as the footer narrows. Server-renderable.
 */
export function SiteFooter({
  columns = [],
  brand,
  description,
  social,
  legal,
  navigationLabel = 'Site',
  externalLabel = '(opens in a new tab)',
  linkComponent,
  className = '',
  ref,
  ...rest
}: SiteFooterProps) {
  const Anchor = linkComponent ?? 'a';
  const baseClass = 'ds-site-footer';
  const uid = useId();
  return (
    <footer {...rest} ref={ref} className={[baseClass, className].filter(Boolean).join(' ')}>
      {(brand || description || columns.length > 0) && (
        <div className={`${baseClass}__top`}>
          {(brand || description) && (
            <div className={`${baseClass}__about`}>
              {brand && <div className={`${baseClass}__brand`}>{brand}</div>}
              {description && <p className={`${baseClass}__description`}>{description}</p>}
            </div>
          )}
            {columns.length > 0 && (
            <nav className={`${baseClass}__columns`} aria-label={navigationLabel}>
              {columns.map((column, index) => (
                <div key={column.title} className={`${baseClass}__column`}>
                  <p className={`${baseClass}__title`} id={`${uid}-${index}`}>
                    {column.title}
                  </p>
                  <ul className={`${baseClass}__links`} aria-labelledby={`${uid}-${index}`}>
                    {column.links.map((link) => {
                      const ExternalOrRouted = link.external ? 'a' : Anchor;
                      return (
                        <li key={`${link.href}-${link.label}`}>
                          <ExternalOrRouted
                            className={`${baseClass}__link`}
                            href={link.href}
                            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          >
                            {link.label}
                            {link.external && (
                              <>
                                <span className={`${baseClass}__external material-symbols-rounded`} aria-hidden="true">
                                  arrow_outward
                                </span>
                                <span className="ds-visually-hidden"> {externalLabel}</span>
                              </>
                            )}
                          </ExternalOrRouted>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
            )}
        </div>
      )}
      {(legal || social) && (
        <div className={`${baseClass}__bottom`}>
          {legal && <div className={`${baseClass}__legal`}>{legal}</div>}
          {social && <div className={`${baseClass}__social`}>{social}</div>}
        </div>
      )}
    </footer>
  );
}
