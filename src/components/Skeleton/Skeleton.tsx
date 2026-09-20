import './Skeleton.css';

export interface SkeletonProps {
  /** Shape of the skeleton */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width (CSS value, e.g. '100%', '200px') */
  width?: string;
  /** Height (CSS value, e.g. '20px', '100px') */
  height?: string;
  /** Number of text lines to render (only for text variant) */
  lines?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Skeleton displays a placeholder while content is loading.
 */
export const Skeleton = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
}: SkeletonProps) => {
  const baseClass = 'ds-skeleton';
  const classes = [baseClass, `${baseClass}--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`${baseClass}__group`} role="status" aria-label="Loading" aria-busy="true" style={{ width }}>
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

  return <div className={classes} role="status" aria-label="Loading" aria-busy="true" style={{ width, height }} />;
};
