import React from 'react';
import type { StackGap } from '../Stack/Stack';
import './Grid.css';

/** Props owned by Grid itself; everything else falls through to the root element. */
type GridOwnProps = {
  /** How many equal columns the grid runs to at full width. It folds to fewer as its own width narrows, never below `minColumnWidth`. */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** The narrowest a column may get before the grid drops one, as a CSS length (`16rem`). Defaults to `12rem`. */
  minColumnWidth?: string;
  /** The space between cells, both ways, as a step on the gap scale (`--gap-500` by default). */
  gap?: StackGap;
  /** How cells sit in their row: `stretch`, the default, makes every card in a row the same height. */
  align?: 'stretch' | 'start' | 'center' | 'end';
  /** The element the grid renders as, so a grid of cards can be a list. */
  as?: 'div' | 'section' | 'ul' | 'ol';
  /** The cells, in reading order. */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface GridProps extends GridOwnProps, Omit<React.ComponentPropsWithRef<'div'>, keyof GridOwnProps> {}

/**
 * Equal columns that fold by the room the grid has: a row of stat cards, a
 * board of panels, a field grid in a form. Cells in a row share its height by
 * default. It measures its own width, never the viewport, so it folds the same
 * beside an open sidebar or inside a dialog. Presentational and
 * server-renderable.
 */
export function Grid({
  columns = 3,
  minColumnWidth = '12rem',
  gap = '500',
  align = 'stretch',
  as = 'div',
  className = '',
  style,
  children,
  ref,
  ...rest
}: GridProps) {
  // `as` picks among elements that all take a div's props, so the root is typed loosely.
  const Element = as as unknown as React.ElementType<React.ComponentPropsWithRef<'div'>>;
  const classes = ['ds-grid', align !== 'stretch' ? `ds-grid--align-${align}` : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <Element
      {...rest}
      ref={ref}
      className={classes}
      style={
        {
          ...style,
          '--ds-grid-columns': columns,
          '--ds-grid-min': minColumnWidth,
          '--ds-grid-gap': `var(--gap-${gap})`,
        } as React.CSSProperties
      }
    >
      {children}
    </Element>
  );
}
