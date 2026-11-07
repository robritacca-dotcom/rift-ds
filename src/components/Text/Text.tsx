import React from 'react';
import './Text.css';

/** A running-text type style, named as the type scale names it. */
export type TextTier = 'paragraph' | 'paragraph-sm' | 'caption' | 'overline' | 'code';

/** Props owned by Text itself; everything else falls through to the rendered element. */
type TextOwnProps = {
  /** The type style: `paragraph` for body copy, `paragraph-sm` for helper copy and table cells, `caption` for the smallest notes, `overline` for an eyebrow above a title, `code` for an inline identifier in the code face. */
  tier?: TextTier;
  /** The element it renders as. Defaults to `p`; `span` sits inside a line, `label` names a control (pass `htmlFor`). */
  as?: 'p' | 'span' | 'div' | 'label' | 'strong' | 'em';
  /** The colour role: `default` the primary text, `neutral` the secondary for quieter copy, a status role for a message of that kind, `inherit` the surrounding colour. */
  tone?: 'default' | 'neutral' | 'positive' | 'warning' | 'error' | 'inherit';
  /** `emphasis` sets the tier's emphasis weight, the one heavier weight the type scale gives running text. */
  weight?: 'default' | 'emphasis';
  /** Keep the text on one line, ending in an ellipsis where it runs out of room. */
  truncate?: boolean;
  /** Clamp the text to this many lines, ending in an ellipsis. Overrides `truncate`. */
  lines?: number;
  /** Tabular figures, so digits line up in a column of amounts or times. */
  numeric?: boolean;
  /** Where the text sits on the line, along the reading direction. `end` lines up a column of amounts. */
  align?: 'start' | 'center' | 'end';
  /** The control this text names, when `as` is `label`. */
  htmlFor?: string;
  /** The text. */
  children?: React.ReactNode;
  /** Additional CSS classes. */
  className?: string;
};

export interface TextProps
  extends TextOwnProps,
    Omit<React.ComponentPropsWithRef<'p'>, keyof TextOwnProps> {}

/**
 * Running text in the type scale: body copy, helper copy, a caption, an
 * amount in a column. Server-renderable.
 */
export function Text({
  tier = 'paragraph',
  as = 'p',
  tone = 'default',
  weight = 'default',
  truncate = false,
  lines,
  numeric = false,
  align,
  className = '',
  style,
  children,
  ref,
  ...rest
}: TextProps) {
  // One element of six, chosen at runtime; the props are the shared HTML
  // attributes, which every one of them accepts.
  const Tag = as as React.ElementType;
  const clamped = lines !== undefined && lines > 0;
  const classes = [
    'ds-text',
    `ds-text--${tier}`,
    tone !== 'default' && `ds-text--tone-${tone}`,
    weight === 'emphasis' && 'ds-text--emphasis',
    clamped ? 'ds-text--clamp' : truncate && 'ds-text--truncate',
    numeric && 'ds-text--numeric',
    align && `ds-text--align-${align}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const resolvedStyle = clamped ? ({ ...style, '--ds-text-lines': lines } as React.CSSProperties) : style;
  return (
    <Tag {...rest} ref={ref} className={classes} style={resolvedStyle}>
      {children}
    </Tag>
  );
}
