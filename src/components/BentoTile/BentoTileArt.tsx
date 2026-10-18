import React from 'react';
import './BentoTile.css';

/** One pattern of the BentoTile art set, listed in the order tiles rotate through them. */
export type BentoTileArtPattern = 'dots' | 'lines' | 'rings' | 'grid' | 'waves' | 'rays';

/** Props owned by BentoTileArt itself; everything else falls through to the layer. */
type BentoTileArtOwnProps = {
  /** Which pattern to draw. Unset, it follows its tile's shader pair (pinned by `highlight`, or by position); outside a tile it draws `dots`. */
  pattern?: BentoTileArtPattern;
  /** Additional CSS classes on the layer. */
  className?: string;
};

export interface BentoTileArtProps
  extends BentoTileArtOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof BentoTileArtOwnProps> {}

/**
 * BentoTileArt — the texture half of a BentoTile's shader pair: one of a set
 * of six line patterns (dots, lines, rings, grid, waves, rays) that share one
 * vocabulary, so tiles in a grid read as a family told apart by pattern.
 *
 * Every pattern is drawn in 1px marks in the tile's highlight colour (the
 * same ambient slot its shader wash leads with), eases in and out around
 * the bottom-left corner, over the wash, so pattern and light read as one
 * texture, and drifts slowly (rings and rays hold still), standing still
 * under reduced motion. Pure CSS, so it renders on the server and
 * re-themes with the tokens. BentoTile renders it whenever its background is
 * `shader`; it is exported for a surface that wants the same texture outside
 * a tile.
 */
export const BentoTileArt = React.forwardRef<HTMLDivElement, BentoTileArtProps>(
  ({ pattern, className = '', ...rest }, ref) => (
    <div
      aria-hidden="true"
      {...rest}
      ref={ref}
      className={['ds-bento-tile-art', className].filter(Boolean).join(' ')}
      data-pattern={pattern}
    />
  ),
);

BentoTileArt.displayName = 'BentoTileArt';
