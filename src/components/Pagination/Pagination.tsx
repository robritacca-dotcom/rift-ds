'use client';

import './Pagination.css';
import '../../fonts/material-symbols.css';

export interface PaginationProps {
  /** Current page (1-based) */
  page: number;
  /** Total number of pages */
  pageCount: number;
  /** Callback with the requested page */
  onPageChange: (page: number) => void;
  /** Pages shown on each side of the current page */
  siblingCount?: number;
  /** Component size — compact swaps the numbers for a "Page X of Y" readout */
  size?: 'default' | 'compact';
  /** Accessible label for the nav landmark */
  ariaLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

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
 * prev/next readout. Pairs with Table.
 */
export const Pagination = ({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  size = 'default',
  ariaLabel = 'Pagination',
  className = '',
}: PaginationProps) => {
  const baseClass = 'ds-pagination';
  const compact = size === 'compact';

  const clampedPage = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
  const isFirst = clampedPage <= 1;
  const isLast = clampedPage >= pageCount;

  const goTo = (target: number) => {
    const next = Math.min(Math.max(target, 1), pageCount);
    if (next !== clampedPage) onPageChange(next);
  };

  const classes = [baseClass, compact ? `${baseClass}--compact` : '', className]
    .filter(Boolean)
    .join(' ');

  const arrowButton = (direction: 'previous' | 'next') => {
    const disabled = direction === 'previous' ? isFirst : isLast;
    return (
      <button
        type="button"
        className={`${baseClass}__arrow`}
        onClick={() => goTo(direction === 'previous' ? clampedPage - 1 : clampedPage + 1)}
        disabled={disabled}
        aria-label={direction === 'previous' ? 'Previous page' : 'Next page'}
      >
        <span className={`${baseClass}__icon material-symbols-rounded`} aria-hidden="true">
          {direction === 'previous' ? 'chevron_left' : 'chevron_right'}
        </span>
      </button>
    );
  };

  return (
    <nav className={classes} aria-label={ariaLabel}>
      {arrowButton('previous')}

      {compact ? (
        <span className={`${baseClass}__readout`} aria-live="polite">
          Page {clampedPage} of {pageCount}
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
                  aria-label={`Page ${item}`}
                >
                  {item}
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
};
