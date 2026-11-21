'use client';

import React, { useState } from 'react';
import './Pagination.css';
import '../../fonts/material-symbols.css';
import { useLocale } from '../../behaviors/LocaleProvider';
import { formatNumber } from '../../behaviors/locale';
import { useLinkComponent, type LinkComponent } from '../../behaviors/LinkProvider';

/** A neighbouring page the `adjacent` form links to. */
export interface PaginationLink {
  /** Where the link goes. */
  href: string;
  /** The page's title, shown under the Previous or Next eyebrow. */
  label: string;
}

/** Props owned by Pagination itself — everything else falls through to the nav landmark. */
type PaginationOwnProps = {
  /**
   * The pager's form. `numbered` (the default) steps through numbered pages
   * of one list. `adjacent` links to the page before and after this one in
   * a sequence (a guide's chapters, a set of articles) as two cards naming
   * them, and takes `previous` and `next` instead of page numbers.
   */
  variant?: 'numbered' | 'adjacent';
  /** The page before this one, for the `adjacent` form. Leave it out on the first page. */
  previous?: PaginationLink;
  /** The page after this one, for the `adjacent` form. Leave it out on the last page. */
  next?: PaginationLink;
  /** The eyebrow over the previous page's title in the `adjacent` form. */
  previousText?: string;
  /** The eyebrow over the next page's title in the `adjacent` form. */
  nextText?: string;
  /** The component that renders the `adjacent` form's links, such as Next.js's `Link`. Defaults to the nearest LinkProvider's, else a plain `<a>`. */
  linkComponent?: LinkComponent;
  /**
   * Current page (1-based), for a controlled pager. Leave it undefined to let
   * the component keep its own page, seeded from `defaultPage`.
   */
  page?: number;
  /** Page shown on first render when the pager is uncontrolled (1-based) */
  defaultPage?: number;
  /** Total number of pages. Required for the `numbered` form; the `adjacent` form ignores it. */
  pageCount?: number;
  /** Called with the page the user requests */
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current page */
  siblingCount?: number;
  /** Component size — compact swaps the numbers for a "Page X of Y" readout */
  size?: 'default' | 'compact';
  /**
   * Legacy accessible-name prop for the nav landmark.
   *
   * @deprecated Pass the native `aria-label` attribute instead.
   */
  ariaLabel?: string;
  /** Accessible name of the previous-page arrow */
  previousLabel?: string;
  /** Accessible name of the next-page arrow */
  nextLabel?: string;
  /** Accessible name of a numbered page button, given its page number */
  pageLabel?: (page: number) => string;
  /** Text of the compact size's readout, given the current page and the page count */
  readoutLabel?: (page: number, pageCount: number) => string;
  /** The BCP 47 locale the page numbers is written in, such as `ar-EG`. Defaults to the nearest LocaleProvider's, else `en-US`. */
  locale?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface PaginationProps
  extends PaginationOwnProps,
    Omit<React.ComponentPropsWithoutRef<'nav'>, keyof PaginationOwnProps | 'children'> {}

const defaultPageLabel = (page: number) => `Page ${page}`;
const defaultReadoutLabel = (page: number, pageCount: number) => `Page ${page} of ${pageCount}`;

type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

/** Build the visible page list: first/last always shown, ellipses for gaps */
const getPageItems = (
  page: number,
  pageCount: number,
  siblingCount: number
): PageItem[] => {
  const totalNumbers = siblingCount * 2 + 5; // first + last + current + 2 ellipsis slots

  if (pageCount <= totalNumbers) {
    return range(1, pageCount);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, pageCount);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < pageCount - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, 3 + 2 * siblingCount), 'end-ellipsis', pageCount];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, 'start-ellipsis', ...range(pageCount - (2 + 2 * siblingCount), pageCount)];
  }

  return [1, 'start-ellipsis', ...range(leftSibling, rightSibling), 'end-ellipsis', pageCount];
};

/**
 * Pagination component — page navigation for long datasets.
 * Numbered pages with ellipses for large ranges, or a compact
 * prev/next readout. Pairs with Table. The `adjacent` form instead links
 * to the previous and next page of a sequence, as two titled cards.
 *
 * Forwards a ref to the `<nav>` landmark and spreads unrecognised props onto
 * it. The landmark is named "Pagination" unless a native `aria-label` or
 * `aria-labelledby` says otherwise.
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      variant = 'numbered',
      previous,
      next,
      previousText = 'Previous',
      nextText = 'Next',
      linkComponent,
      page,
      defaultPage = 1,
      pageCount = 1,
      onPageChange,
      siblingCount = 1,
      size = 'default',
      ariaLabel,
      previousLabel = 'Previous page',
      nextLabel = 'Next page',
      pageLabel = defaultPageLabel,
      readoutLabel = defaultReadoutLabel,
      locale: localeProp,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const locale = useLocale(localeProp);
    const Link = useLinkComponent(linkComponent);
    const baseClass = 'ds-pagination';
    const compact = size === 'compact';

    const isControlled = page !== undefined;
    const [internalPage, setInternalPage] = useState(defaultPage);
    const currentPage = isControlled ? page : internalPage;

    const clampedPage = Math.min(Math.max(currentPage, 1), Math.max(pageCount, 1));
    const isFirst = clampedPage <= 1;
    const isLast = clampedPage >= pageCount;

    const goTo = (target: number) => {
      const next = Math.min(Math.max(target, 1), pageCount);
      if (next === clampedPage) return;
      if (!isControlled) setInternalPage(next);
      onPageChange?.(next);
    };

    const classes = [baseClass, compact ? `${baseClass}--compact` : '', className]
      .filter(Boolean)
      .join(' ');

    if (variant === 'adjacent') {
      const card = (direction: 'previous' | 'next', link: PaginationLink) => (
        <Link
          href={link.href}
          className={`${baseClass}__adjacent ${baseClass}__adjacent--${direction}`}
          rel={direction === 'previous' ? 'prev' : 'next'}
        >
          <span className={`${baseClass}__adjacent-eyebrow`}>
            {direction === 'previous' && (
              <span className={`${baseClass}__icon material-symbols-rounded ds-mirror-rtl`} aria-hidden="true">
                chevron_left
              </span>
            )}
            {direction === 'previous' ? previousText : nextText}
            {direction === 'next' && (
              <span className={`${baseClass}__icon material-symbols-rounded ds-mirror-rtl`} aria-hidden="true">
                chevron_right
              </span>
            )}
          </span>
          <span className={`${baseClass}__adjacent-title`}>{link.label}</span>
        </Link>
      );
      return (
        <nav
          aria-label={ariaLabel ?? 'Pagination'}
          {...rest}
          ref={ref}
          className={[baseClass, `${baseClass}--adjacent`, className].filter(Boolean).join(' ')}
        >
          {previous ? card('previous', previous) : <span aria-hidden="true" />}
          {next ? card('next', next) : <span aria-hidden="true" />}
        </nav>
      );
    }

    const arrowButton = (direction: 'previous' | 'next') => {
      const disabled = direction === 'previous' ? isFirst : isLast;
      return (
        <button
          type="button"
          className={`${baseClass}__arrow`}
          onClick={() => goTo(direction === 'previous' ? clampedPage - 1 : clampedPage + 1)}
          disabled={disabled}
          aria-label={direction === 'previous' ? previousLabel : nextLabel}
        >
          <span className={`${baseClass}__icon material-symbols-rounded ds-mirror-rtl`} aria-hidden="true">
            {direction === 'previous' ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
      );
    };

    return (
      <nav aria-label={ariaLabel ?? 'Pagination'} {...rest} ref={ref} className={classes}>
        {arrowButton('previous')}

        {compact ? (
          <span className={`${baseClass}__readout`} aria-live="polite">
            {readoutLabel(clampedPage, pageCount)}
          </span>
        ) : (
          <ul className={`${baseClass}__list`}>
            {getPageItems(clampedPage, pageCount, siblingCount).map((item) =>
              typeof item === 'number' ? (
                <li key={item}>
                  <button
                    type="button"
                    className={[
                      `${baseClass}__page`,
                      item === clampedPage ? `${baseClass}__page--current` : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => goTo(item)}
                    aria-current={item === clampedPage ? 'page' : undefined}
                    aria-label={pageLabel(item)}
                  >
                    {formatNumber(item, locale)}
                  </button>
                </li>
              ) : (
                <li key={item}>
                  <span className={`${baseClass}__ellipsis`} aria-hidden="true">
                    &#8230;
                  </span>
                </li>
              )
            )}
          </ul>
        )}

        {arrowButton('next')}
      </nav>
    );
  },
);

Pagination.displayName = 'Pagination';
