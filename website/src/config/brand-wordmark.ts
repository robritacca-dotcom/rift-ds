/**
 * The RIFT wordmark's geometry — one home, the way brand-mark.ts is the
 * one home for the mark. Consumed by the BrandWordmark component, which
 * renders these paths inline so they read live CSS variables.
 *
 * Traced from the supplied 2000px artwork at subpixel precision: straight
 * edges are least-squares fits with the corners recovered as line
 * intersections, so the flats are exactly flat and the sharp points are
 * the true apex rather than the raster's blur-rounded tip. Only the R's
 * bowl and its counter cap are curves; every other edge is a line,
 * because that is what the letterforms are. The rendered result differs
 * from the source artwork by 0.15% of ink pixels, all of it single-pixel
 * edge fringing.
 *
 * Three measured facts the geometry encodes, each confirmed by
 * independent edges agreeing to within 0.05 degrees:
 *   - the letters sit at 20.8 degrees of italic
 *   - the slash is deliberately steeper at 26.7 degrees; it is NOT the
 *     italic angle, so do not "correct" it to match
 *   - the underscore is an exact axis-aligned rectangle with vertical
 *     ends, despite the italic everywhere else
 *
 * Six subpaths in one string (R, its counter, I, F-plus-slash, T,
 * underscore), so the counter needs fill-rule="evenodd" to stay a hole.
 * The F and the slash are a single merged outline because they are fused
 * in the source artwork; splitting them is possible (the slash's angle
 * and width are well determined from the parts that clear the letters)
 * but would be a redraw, not a trace.
 */

/** The full mark on its own viewBox, sized to the artwork with no padding. */
export const BRAND_WORDMARK_VIEWBOX = "0 0 549.45 200";

export const BRAND_WORDMARK_PATH =
  "M0 149.55 L37.51 149.57 L47.97 121.85 L76.32 121.83 L98.68 149.56 L147.52 149.56 L120.23 121.43 C121.67 120.82 119.72 121.12 121.17 120.53 C123.43 119.61 126.37 119.67 128.76 119.08 C133.76 117.84 138.65 115.94 143.07 113.3 C159.45 103.5 173.96 76.09 155.51 61.01 C152.32 58.4 148.4 56.68 144.45 55.6 C143.15 55.25 139.31 55.13 138.4 54.29 C138.4 54.29 137.89 53.44 137.89 53.44 L9.93 53.36 L32.91 62.6 L0 149.55Z M57.52 95.58 L63.57 79.76 L119.73 79.81 C121.13 80.3 122.8 80.74 124.1 81.58 C127.54 83.8 126.47 89.03 123.93 91.53 C121.81 93.61 118.49 94.48 116 95.47 L57.52 95.58Z M167 149.57 L203.96 149.56 L240.72 53.37 L179.4 53.39 L200.23 62.58 L167 149.57Z M211.82 195.15 L215.42 193.89 L237.92 149.55 L273.44 149.58 L285.81 118.17 L342.48 118.18 L368.42 92.39 L295.36 92.44 L300.43 79.78 L383.26 79.79 L393.47 53.39 L286.18 53.4 L312.79 0.58 L310.01 0 L211.82 195.15Z M549.45 53.38 L412.24 53.4 L402.14 79.78 L453.4 79.8 L426.92 149.58 L463.79 149.56 L490.19 79.78 L539.54 79.81 L549.45 53.38Z M260.34 197.4 L292.94 197.4 L292.94 200 L260.34 200 L260.34 197.4Z";

/**
 * Cap height as a fraction of the viewBox height.
 *
 * This is load-bearing, not trivia. The slash clears the letters top and
 * bottom, so the box is more than twice as tall as the letters: sizing
 * the wordmark by its box height renders it at less than half the size
 * of the text beside it. Every caller sizes by cap height and lets the
 * overhang fall outside. Cap top sits at y=53.32, the baseline at
 * y=149.6, on the 200-unit box.
 */
export const BRAND_WORDMARK_CAP_RATIO = 0.4814;

/** Box width per unit of box height, for callers that need the footprint. */
export const BRAND_WORDMARK_ASPECT = 549.45 / 200;
