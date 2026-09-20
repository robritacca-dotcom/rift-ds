import React from 'react';
import './AvatarGroup.css';

/** Props owned by AvatarGroup itself — everything else falls through to the root div. */
type AvatarGroupOwnProps = {
  /** The avatars to stack, in display order — normally `Avatar` elements. */
  children: React.ReactNode;
  /** Avatars shown before the rest collapse into a "+N" counter. */
  max?: number;
  /**
   * Size applied to every avatar in the stack and to the overflow counter.
   * Cloned onto the children so the group cannot render mixed sizes.
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Accessible label for the overflow counter. Defaults to "N more" —
   * override it to localise or add context, e.g. "4 more reviewers".
   */
  overflowLabel?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface AvatarGroupProps
  extends AvatarGroupOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof AvatarGroupOwnProps> {}

/**
 * AvatarGroup — an overlapping stack of avatars with a "+N" counter for the
 * overflow, the "who's here" affordance in collaboration UIs. Purely
 * presentational: it lays out the `Avatar` children it is given (forcing a
 * uniform size onto them) and counts the rest, so it renders from a Server
 * Component. Each avatar carries a page-coloured ring so the overlaps stay
 * legible on any surface.
 */
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 5, size = 'md', overflowLabel, className = '', ...rest }, ref) => {
    const baseClass = 'ds-avatar-group';

    const classes = [baseClass, `${baseClass}--${size}`, className]
      .filter(Boolean)
      .join(' ');

    const allChildren = React.Children.toArray(children);
    const visible = allChildren.slice(0, Math.max(max, 0));
    const overflow = allChildren.length - visible.length;

    return (
      <div {...rest} ref={ref} className={classes} role="group">
        {visible.map((child, index) => (
          <span key={index} className={`${baseClass}__item`}>
            {React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<{ size?: string }>, { size })
              : child}
          </span>
        ))}
        {overflow > 0 && (
          <span
            className={`${baseClass}__item ${baseClass}__overflow`}
            role="img"
            aria-label={overflowLabel ?? `${overflow} more`}
          >
            <span aria-hidden="true">+{overflow}</span>
          </span>
        )}
      </div>
    );
  },
);

AvatarGroup.displayName = 'AvatarGroup';
