import React from 'react';
import './Skeleton.css';
import '../../behaviors/direction.css';

/** Props owned by Skeleton itself — everything else falls through to the root div. */
type SkeletonOwnProps = {
  /** Shape of the skeleton */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width (CSS value, e.g. '100%', '200px') */
  width?: string;
  /** Height (CSS value, e.g. '20px', '100px') */
  height?: string;
  /** Number of text lines to render (only for text variant) */
  lines?: number;
  /** Accessible name announced while the placeholder shows. A passed `aria-label` takes precedence. */
  loadingLabel?: string;
  /** Additional CSS classes. On a multi-line text skeleton they apply to each line, not the group. */
  className?: string;
};

export interface SkeletonProps
  extends SkeletonOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof SkeletonOwnProps | 'children'> {}

/**
 * Skeleton displays a placeholder while content is loading.
 * Forwards a ref to the root div (the line group when `lines` is above one)
 * and spreads native attributes onto it.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      lines = 1,
      loadingLabel = 'Loading',
      className = '',
      style,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-skeleton';
    const classes = [baseClass, `${baseClass}--${variant}`, className]
      .filter(Boolean)
      .join(' ');

    if (variant === 'text' && lines > 1) {
      return (
        <div
          role="status"
          aria-label={loadingLabel}
          {...rest}
          ref={ref}
          className={`${baseClass}__group`}
          aria-busy="true"
          style={{ ...style, ...(width !== undefined && { width }) }}
        >
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={classes}
              aria-hidden="true"
              style={{
                width: i === lines - 1 ? '75%' : '100%',
                height,
              }}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        role="status"
        aria-label={loadingLabel}
        {...rest}
        ref={ref}
        className={classes}
        aria-busy="true"
        style={{
          ...style,
          ...(width !== undefined && { width }),
          ...(height !== undefined && { height }),
        }}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';
