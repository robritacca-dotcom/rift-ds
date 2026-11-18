import React from 'react';
import './Stack.css';

/** A step on the gap scale, as the `--gap-*` token it names. */
export type StackGap = '050' | '100' | '200' | '300' | '400' | '500' | '1000' | '1500' | '2000' | '3000';

/** Props owned by Stack itself; everything else falls through to the root element. */
type StackOwnProps = {
  /** `column` lays the children top to bottom; `row` lays them in the reading direction. */
  direction?: 'column' | 'row';
  /** The space between children, as a step on the gap scale (`--gap-400` by default). */
  gap?: StackGap;
  /**
   * How children line up across the stack: `stretch` fills it, which keeps
   * cards in a row the same height. A column stretches and a row centres
   * unless it is set.
   * @default 'stretch' in a column, 'center' in a row
   */
  align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
  /** How children spread along the stack. `between` pushes the first and last to the ends. */
  justify?: 'start' | 'center' | 'end' | 'between';
  /** Lets a row wrap onto more lines when it runs out of room, keeping the gap between lines. */
  wrap?: boolean;
  /** The element the stack renders as, so it can be a list, a section or a form. */
  as?: 'div' | 'section' | 'ul' | 'ol' | 'li' | 'form' | 'fieldset' | 'header' | 'footer' | 'nav' | 'span';
  /** The stack's children. */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};

export interface StackProps extends StackOwnProps, Omit<React.ComponentPropsWithRef<'div'>, keyof StackOwnProps> {}

/**
 * Lays children out in one direction with a gap from the scale: the column
 * every page, panel and form is made of, or a row of controls or cards.
 * Presentational and server-renderable; it adds no semantics, so `as` picks
 * the element when the stack is a list or a section.
 */
export function Stack({
  direction = 'column',
  gap = '400',
  align,
  justify = 'start',
  wrap = false,
  as = 'div',
  className = '',
  style,
  children,
  ref,
  ...rest
}: StackProps) {
  // `as` picks among elements that all take a div's props, so the root is typed loosely.
  const Element = as as unknown as React.ElementType<React.ComponentPropsWithRef<'div'>>;
  const classes = [
    'ds-stack',
    `ds-stack--${direction}`,
    `ds-stack--align-${align ?? (direction === 'row' ? 'center' : 'stretch')}`,
    `ds-stack--justify-${justify}`,
    wrap ? 'ds-stack--wrap' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Element
      {...rest}
      ref={ref}
      className={classes}
      style={{ ...style, '--ds-stack-gap': `var(--gap-${gap})` } as React.CSSProperties}
    >
      {children}
    </Element>
  );
}
