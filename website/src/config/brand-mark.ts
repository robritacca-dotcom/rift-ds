/**
 * The brand mark's geometry and colours — one home, consumed by the
 * BrandMark component, the favicon routes, and the static /mark.svg.
 *
 * The mark is the codename made visible: three chevrons stacked into a
 * spine. Deliberately simple, deliberately replaceable — rename day swaps
 * these constants (and the static file) and every surface follows.
 */

/** Chevron paths on a 24×24 viewBox, drawn top to bottom. */
export const BRAND_MARK_PATHS = [
  "M5 5.5 L12 9 L19 5.5",
  "M5 11 L12 14.5 L19 11",
  "M5 16.5 L12 20 L19 16.5",
];

export const BRAND_MARK_STROKE_WIDTH = 2.4;

/**
 * Gradient stops for the FAVICON ROUTES ONLY (ImageResponse renders
 * server-side and cannot resolve CSS variables) — the shipped action
 * teals, frozen. The in-page BrandMark component reads the live action
 * tokens instead, so the mark re-themes with every data-brand swap;
 * browser-chrome icons stay the brand's home colours by nature.
 */
export const BRAND_MARK_COLOR_TOP = "#3CA5C6";
export const BRAND_MARK_COLOR_BOTTOM = "#0E6E8F";
