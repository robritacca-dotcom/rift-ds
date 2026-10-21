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
   * Accessible label for the overflow counter. Defaults to "N more" (for
   * example "4 more"), with N the number of hidden avatars. Pass a function
   * given that count to localise or add context, e.g.
   * `(count) => \`${count} more reviewers\``; a plain string replaces the
   * label outright, whatever the count.
   */
  overflowLabel?: string | ((count: number) => string);
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

    // Children.toArray keeps a Fragment as one child, so `<>…</>` used to land
    // every avatar in a single slot, miss the cloned size and miscount the
    // overflow. Flatten Fragments first: each avatar is one member.
    const flatten = (nodes: React.ReactNode): React.ReactNode[] =>
      React.Children.toArray(nodes).flatMap((node) =>
        React.isValidElement(node) && node.type === React.Fragment
          ? flatten((node.props as { children?: React.ReactNode }).children)
          : [node],
      );
    const allChildren = flatten(children);
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
            aria-label={
              typeof overflowLabel === 'function'
                ? overflowLabel(overflow)
                : (overflowLabel ?? `${overflow} more`)
            }
          >
            <span aria-hidden="true">+{overflow}</span>
          </span>
        )}
      </div>
    );
  },
);

AvatarGroup.displayName = 'AvatarGroup';
