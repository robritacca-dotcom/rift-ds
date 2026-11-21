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
  /**
   * Give the heading an id and a "#" link to itself, shown on hover and
   * focus, so a reader can link straight to the section. `true` makes the
   * id from the heading's text ("Getting started" becomes
   * `getting-started`); a string sets it. An `id` passed directly wins.
   */
  anchor?: boolean | string;
  /** Accessible name of the anchor link, given the heading's text. Defaults to "Link to <text>". */
  anchorLabel?: (text: string) => string;
  /** The heading's text. */
  children?: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
};

export interface HeadingProps
  extends HeadingOwnProps,
    Omit<React.ComponentPropsWithRef<'h2'>, keyof HeadingOwnProps> {}

/** The plain text of a heading's children, for its anchor's id and name. */
const textOf = (node: React.ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (React.isValidElement(node)) return textOf((node.props as { children?: React.ReactNode }).children);
  return '';
};

// A helper beside the component that writes its ids, so a host can make
// the same id for a link to the section. Heading is a server component, so
// Fast Refresh has nothing to lose here.
/** A URL fragment from a heading's text: lower case, words joined by hyphens, punctuation dropped. */
// eslint-disable-next-line react-refresh/only-export-components
export const headingSlug = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

/**
 * A heading in the type scale. `level` sets the element and `tier` the
 * look, chosen apart, so the outline stays correct whatever size a design
 * calls for. `anchor` adds an id and a "#" link to the section.
 * Server-renderable.
 */
export function Heading({
  level = 2,
  tier,
  tone = 'default',
  truncate = false,
  balance = false,
  align,
  anchor,
  anchorLabel = (text) => `Link to ${text}`,
  className = '',
  children,
  id: idProp,
  ref,
  ...rest
}: HeadingProps) {
  const text = anchor ? textOf(children) : '';
  const id = idProp ?? (typeof anchor === 'string' ? anchor : anchor ? headingSlug(text) || undefined : undefined);
  const Tag = `h${level}` as const;
  const resolvedTier = tier ?? LEVEL_TIER[level];
  const classes = [
    'ds-heading',
    `ds-heading--${resolvedTier}`,
    tone !== 'default' && `ds-heading--tone-${tone}`,
    truncate && 'ds-heading--truncate',
    balance && 'ds-heading--balance',
    align && `ds-heading--align-${align}`,
    anchor && 'ds-heading--anchored',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag {...rest} id={id} ref={ref} className={classes}>
      {children}
      {anchor && id && (
        <a className="ds-heading__anchor" href={`#${id}`} aria-label={anchorLabel(text)}>
          #
        </a>
      )}
    </Tag>
  );
}
