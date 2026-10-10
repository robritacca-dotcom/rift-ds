import React from 'react';
import { hashName, pixelAvatarInk } from './pixelInks';
import type { PixelInk } from './pixelInks';
import './PixelAvatar.css';

/* Re-exported so the ink helpers reach the package root through the barrel,
   which only walks .tsx modules (ShaderField and AttachmentGroup do the
   same for their hooks). Fast-refresh granularity is the price, and not one
   a published library pays. */
/* eslint-disable react-refresh/only-export-components */
export { distinctPixelInks, pixelAvatarInk } from './pixelInks';
export type { PixelInk } from './pixelInks';

/** Props owned by PixelAvatar itself — everything else falls through to the root span. */
type PixelAvatarOwnProps = {
  /**
   * The seed. The same name always draws the same character in the same
   * ink, so a project, workspace or thread has its mark the moment it has a
   * name, with nothing designed or stored for it.
   */
  name: string;
  /** Rendered size, on the icon scale (`--icon-size-500/600/800/1200` — 20, 24, 32 and 48px), so the character seats wherever an icon does. */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Overrides the ink the name picks (1 to 6, the `--color-pixel-ink-*`
   * tokens). A name's own ink is one of six, so two neighbours can land on
   * the same one; a host drawing a list passes each row's entry from
   * `distinctPixelInks` here to keep them apart. The character's shape still
   * comes from the name.
   */
  ink?: PixelInk;
  /** `plain` draws the character alone; `tile` seats it on a rounded wash of its own ink, for a larger standalone mark. */
  variant?: 'plain' | 'tile';
  /**
   * Accessible name. Omit it when the mark sits beside the name it was
   * drawn from, which is the usual case: the character is then decorative
   * and hidden from assistive technology. Given, the root becomes an image
   * with this label.
   */
  label?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface PixelAvatarProps
  extends PixelAvatarOwnProps,
    Omit<React.ComponentPropsWithoutRef<'span'>, keyof PixelAvatarOwnProps> {}

/* The sprite is an 8x8 grid, mirrored left to right so it reads as a face
   rather than as noise, with one empty cell around it: a Material icon's ink
   sits inside its box by about that much, so a sprite drawn edge to edge
   would read a size larger than the icons it shares a column with. */
const GRID = 8;
const MARGIN = 1;
/* Fill chance per row for the left half, outer column first. Each row has a
   job, and its chances follow from it: the centre columns are near certain
   through the head and body, so every character has a solid core, and the
   edges and the last rows are where one differs from the next. */
const ROW_CHANCES: readonly (readonly number[])[] = [
  [0, 0.3, 0.25, 0.15], // antennae
  [0.1, 0.75, 1, 1], // crown
  [0.55, 1, 1, 1], // head
  [0.75, 1, 1, 1], // eyes (one cell is carved out below)
  [0.7, 1, 1, 1], // cheeks
  [0.35, 0.85, 0.9, 0.7], // jaw
  [0.45, 0.5, 0.45, 0.35], // legs
  [0.35, 0.3, 0.25, 0.1], // feet
];
const EYE_ROW = 3;

/** mulberry32: a seeded generator, so one hash yields a whole sprite. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The filled cells of the sprite for a name, as [column, row] pairs. */
function spriteCells(name: string): [number, number][] {
  const next = seeded(hashName(name));
  /* Eyes sit one or two columns in from the centre line: close-set or
     wide-set is most of a character's expression. */
  const eyeColumn = next() < 0.6 ? 2 : 1;
  const cells: [number, number][] = [];
  ROW_CHANCES.forEach((chances, row) => {
    chances.forEach((chance, column) => {
      if (next() >= chance) return;
      if (row === EYE_ROW && column === eyeColumn) return;
      cells.push([column, row], [GRID - 1 - column, row]);
    });
  });
  return cells;
}

/**
 * PixelAvatar — a generated character mark. The name is the seed: a small
 * pixel creature and one of six inks are drawn from it, deterministically,
 * so the same name is always the same character and nothing has to be
 * designed, uploaded or stored. For the things that have a name before they
 * have a logo — projects, workspaces, repositories, agents.
 *
 * Pure: no hooks, no random source and no browser API, so the server and the
 * client draw the same sprite and it renders from a Server Component.
 */
export const PixelAvatar = React.forwardRef<HTMLSpanElement, PixelAvatarProps>(
  ({ name, size = 'md', variant = 'plain', ink: inkOverride, label, className = '', ...rest }, ref) => {
    const baseClass = 'ds-pixel-avatar';
    const ink = inkOverride ?? pixelAvatarInk(name);

    const classes = [
      baseClass,
      `${baseClass}--${size}`,
      `${baseClass}--${variant}`,
      `${baseClass}--ink-${ink}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const viewBox = `${-MARGIN} ${-MARGIN} ${GRID + MARGIN * 2} ${GRID + MARGIN * 2}`;

    return (
      <span
        {...rest}
        ref={ref}
        className={classes}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        <svg
          className={`${baseClass}__sprite`}
          viewBox={viewBox}
          shapeRendering="crispEdges"
          focusable="false"
          aria-hidden="true"
        >
          {spriteCells(name).map(([column, row]) => (
            <rect key={`${column}-${row}`} x={column} y={row} width={1} height={1} />
          ))}
        </svg>
      </span>
    );
  },
);

PixelAvatar.displayName = 'PixelAvatar';
