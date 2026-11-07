import React from 'react';
import { CheckIcon } from '../Checkbox/Checkbox';
import { mirrorClass } from '../../behaviors/direction';
import '../../fonts/material-symbols.css';
import './List.css';

/** Props owned by List itself; everything else falls through to the list element. */
type ListOwnProps = {
  /** `unordered` is a `ul`, `ordered` an `ol` whose order means something (steps), `plain` a `ul` with no markers and no indent. */
  variant?: 'unordered' | 'ordered' | 'plain';
  /** The mark before each item: a disc, the item's number, the form controls' check, nothing, or a Material Symbol name (`star`, `bolt`). Defaults to the variant's own: disc, number, none. */
  marker?: 'disc' | 'number' | 'check' | 'none' | (string & {});
  /** The room between items: `compact` for dense lists, `relaxed` for items with descriptions. */
  spacing?: 'compact' | 'default' | 'relaxed';
  /** The items' type size: `default` the paragraph face, `compact` the small paragraph face. */
  size?: 'default' | 'compact';
  /** The number an ordered list counts from. */
  start?: number;
  /** Count an ordered list down instead of up. */
  reversed?: boolean;
  /** The items, each a `ListItem`. */
  children?: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
};

export interface ListProps
  extends ListOwnProps,
    Omit<React.ComponentPropsWithRef<'ul'>, keyof ListOwnProps> {}

const NATIVE_MARKERS = new Set(['disc', 'number', 'check', 'none']);

/**
 * A list of items, ordered or not, marked with a disc, a number, a check or
 * an icon, each item optionally carrying a description under it: features,
 * steps, requirements. Server-renderable.
 */
export function List({
  variant = 'unordered',
  marker,
  spacing = 'default',
  size = 'default',
  start,
  reversed,
  className = '',
  style,
  children,
  ref,
  ...rest
}: ListProps) {
  const resolvedMarker = marker ?? (variant === 'ordered' ? 'number' : variant === 'plain' ? 'none' : 'disc');
  const iconMarker = !NATIVE_MARKERS.has(resolvedMarker);
  const classes = [
    'ds-list',
    `ds-list--${variant}`,
    `ds-list--marker-${iconMarker ? 'icon' : resolvedMarker}`,
    `ds-list--spacing-${spacing}`,
    `ds-list--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const resolvedStyle = iconMarker
    ? ({ ...style, '--ds-list-marker': JSON.stringify(resolvedMarker) } as React.CSSProperties)
    : style;

  if (variant === 'ordered') {
    return (
      <ol
        {...(rest as React.ComponentPropsWithoutRef<'ol'>)}
        ref={ref as React.Ref<HTMLOListElement>}
        start={start}
        reversed={reversed}
        className={classes}
        style={resolvedStyle}
      >
        {children}
      </ol>
    );
  }
  return (
    <ul {...rest} ref={ref} className={classes} style={resolvedStyle}>
      {children}
    </ul>
  );
}

/** Props owned by ListItem itself; everything else falls through to the `li`. */
type ListItemOwnProps = {
  /** The item's text. */
  children?: React.ReactNode;
  /** A line of quieter text under the item. */
  description?: React.ReactNode;
  /** A Material Symbol name or a node that replaces this item's marker. A directional glyph mirrors in a right-to-left context. */
  icon?: string | React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
};

export interface ListItemProps
  extends ListItemOwnProps,
    Omit<React.ComponentPropsWithRef<'li'>, keyof ListItemOwnProps> {}

/** One item of a List, with an optional description and an icon of its own. Server-renderable. */
export function ListItem({ children, description, icon, className = '', ref, ...rest }: ListItemProps) {
  const hasIcon = icon != null && icon !== false;
  const classes = ['ds-list__item', hasIcon && 'ds-list__item--icon', className].filter(Boolean).join(' ');
  return (
    <li {...rest} ref={ref} className={classes}>
      {hasIcon ? (
        typeof icon === 'string' ? (
          <span className={`ds-list__marker material-symbols-rounded ${mirrorClass(icon)}`} aria-hidden="true">
            {icon}
          </span>
        ) : (
          <span className="ds-list__marker" aria-hidden="true">
            {icon}
          </span>
        )
      ) : (
        <span className="ds-list__marker ds-list__tick" aria-hidden="true">
          <CheckIcon className="ds-list__tick-glyph" />
        </span>
      )}
      <span className="ds-list__label">{children}</span>
      {description != null && description !== false && <span className="ds-list__description">{description}</span>}
    </li>
  );
}
