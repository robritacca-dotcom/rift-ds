import './Breadcrumb.css';
import '../../fonts/material-symbols.css';

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Link href — omit for the current / last item */
  href?: string;
}

export interface BreadcrumbProps {
  /** Ordered list of breadcrumb items */
  items: BreadcrumbItem[];
  /** Maximum visible items before collapsing (min 2: first + last) */
  maxItems?: number;
  /** Additional CSS classes */
  className?: string;
  /**
   * Accessible name for the nav landmark. Override when more than one
   * Breadcrumb can appear on a page — identically-named landmarks are
   * indistinguishable to assistive technology.
   */
  ariaLabel?: string;
}

/**
 * Breadcrumb shows the user's location within a page hierarchy.
 * Supports automatic collapsing of middle items when the list exceeds maxItems.
 */
export const Breadcrumb = ({
  items,
  maxItems,
  className = '',
  ariaLabel,
}: BreadcrumbProps) => {
  const baseClass = 'ds-breadcrumb';
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
    <nav className={classes} aria-label={ariaLabel || 'Breadcrumb'}>
      <ol className={`${baseClass}__list`}>
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;

          if (item === 'ellipsis') {
            return (
              <li key="ellipsis" className={`${baseClass}__item`} aria-hidden="true">
                <span className={`${baseClass}__separator material-symbols-rounded`}>chevron_right</span>
                <span className={`${baseClass}__ellipsis`}>&hellip;</span>
              </li>
            );
          }

          return (
            <li key={index} className={`${baseClass}__item`}>
              {index > 0 && (
                <span className={`${baseClass}__separator material-symbols-rounded`} aria-hidden="true">
                  chevron_right
                </span>
              )}
              {isLast || !item.href ? (
                <span className={`${baseClass}__current`} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className={`${baseClass}__link`}>
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
