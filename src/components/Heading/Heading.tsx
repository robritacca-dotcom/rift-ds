import React from 'react';
import './Heading.css';

/** A heading type style, named as the type scale names it, from the largest. */
export type HeadingTier =
  | 'mega-1'
  | 'mega-2'
  | 'display-1'
  | 'display-2'
  | 'sub-display'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'title-body';

/** The tier each level wears when no `tier` is passed. */
const LEVEL_TIER: Record<1 | 2 | 3 | 4 | 5 | 6, HeadingTier> = {
  1: 'heading-1',
  2: 'heading-2',
  3: 'heading-3',
  4: 'title-body',
  5: 'title-body',
  6: 'title-body',
};

/** Props owned by Heading itself; everything else falls through to the heading element. */
type HeadingOwnProps = {
  /** The heading's place in the document outline, which sets the element (`h1` to `h6`). Choose it for the outline, never for the size. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** The type style it wears, apart from `level`, so a card's `h3` can look like a small title and a page's `h1` like a display line. Defaults to the level's own: heading-1 to heading-3 for levels 1 to 3, title-body below. */
  tier?: HeadingTier;
  /** The colour role: `default` takes the tier's own (the display or heading text colour a theme can tone), `neutral` the secondary text colour for a quieter title. */
  tone?: 'default' | 'neutral';
  /** Keep the heading on one line, ending in an ellipsis where it runs out of room. The full text stays in the accessible name. */
  truncate?: boolean;
  /** Balance the lines of a heading that wraps, so the last line is never a lone word. */
  balance?: boolean;
  /** Where the text sits on the line, along the reading direction. */
  align?: 'start' | 'center' | 'end';
  /** The heading's text. */
  children?: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
};

export interface HeadingProps
  extends HeadingOwnProps,
    Omit<React.ComponentPropsWithRef<'h2'>, keyof HeadingOwnProps> {}

/**
 * A heading in the type scale. `level` sets the element and `tier` the
 * look, chosen apart, so the outline stays correct whatever size a design
 * calls for. Server-renderable.
 */
export function Heading({
  level = 2,
  tier,
  tone = 'default',
  truncate = false,
  balance = false,
  align,
  className = '',
  children,
  ref,
  ...rest
}: HeadingProps) {
  const Tag = `h${level}` as const;
  const resolvedTier = tier ?? LEVEL_TIER[level];
  const classes = [
    'ds-heading',
    `ds-heading--${resolvedTier}`,
    tone !== 'default' && `ds-heading--tone-${tone}`,
    truncate && 'ds-heading--truncate',
    balance && 'ds-heading--balance',
    align && `ds-heading--align-${align}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag {...rest} ref={ref} className={classes}>
      {children}
    </Tag>
  );
}
