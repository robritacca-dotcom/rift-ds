import React from 'react';
import type { LinkComponent } from '../../behaviors/LinkProvider';
import './Breadcrumb.css';
import '../../fonts/material-symbols.css';

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Link href — omit for the current / last item */
  href?: string;
}

/** Props owned by Breadcrumb itself — everything else falls through to the nav landmark. */
type BreadcrumbOwnProps = {
  /** Ordered list of breadcrumb items */
  items: BreadcrumbItem[];
  /** Maximum visible items before collapsing (min 2: first + last) */
  maxItems?: number;
  /** Additional CSS classes */
  className?: string;
  /**
   * Legacy accessible-name prop for the nav landmark.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
  /**
   * The component its links render with, such as Next.js's `Link`, so they
   * navigate through the app's router; a plain `<a>` when unset. This
   * component can render on the server, so it never reads a LinkProvider:
   * pass the prop even under one.
   */
  linkComponent?: LinkComponent;
};

export interface BreadcrumbProps
  extends BreadcrumbOwnProps,
    Omit<React.ComponentPropsWithoutRef<'nav'>, keyof BreadcrumbOwnProps | 'children'> {}

/**
 * Breadcrumb shows the user's location within a page hierarchy.
 * Supports automatic collapsing of middle items when the list exceeds maxItems.
 *
 * Forwards a ref to the `<nav>` landmark and spreads unrecognised props onto
 * it. The landmark is named "Breadcrumb" unless a native `aria-label` or
 * `aria-labelledby` says otherwise; pass one when more than one Breadcrumb
 * can appear on a page, since identically named landmarks are
 * indistinguishable to assistive technology.
 */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, maxItems, className = '', ariaLabel, linkComponent, ...rest }, ref) => {
    const baseClass = 'ds-breadcrumb';
    const Link = linkComponent ?? 'a';
    const classes = [baseClass, className].filter(Boolean).join(' ');

    const shouldCollapse = maxItems !== undefined && maxItems >= 2 && items.length > maxItems;

    let visibleItems: (BreadcrumbItem | 'ellipsis')[];

    if (shouldCollapse) {
      /* Show first item, ellipsis, then last (maxItems - 1) items */
      const tailCount = maxItems - 1;
      visibleItems = [
        items[0],
        'ellipsis' as const,
        ...items.slice(-tailCount),
      ];
    } else {
      visibleItems = [...items];
    }

    return (
      <nav aria-label={ariaLabel || 'Breadcrumb'} {...rest} ref={ref} className={classes}>
        <ol className={`${baseClass}__list`}>
          {visibleItems.map((item, index) => {
            const isLast = index === visibleItems.length - 1;

            if (item === 'ellipsis') {
              return (
                <li key="ellipsis" className={`${baseClass}__item`} aria-hidden="true">
                  <span className={`${baseClass}__separator material-symbols-rounded ds-mirror-rtl`}>chevron_right</span>
                  <span className={`${baseClass}__ellipsis`}>&hellip;</span>
                </li>
              );
            }

            return (
              <li key={index} className={`${baseClass}__item`}>
                {index > 0 && (
                  <span className={`${baseClass}__separator material-symbols-rounded ds-mirror-rtl`} aria-hidden="true">
                    chevron_right
                  </span>
                )}
                {isLast || !item.href ? (
                  <span className={`${baseClass}__current`} aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className={`${baseClass}__link`}>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  },
);

Breadcrumb.displayName = 'Breadcrumb';
