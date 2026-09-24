/**
 * The brand mark's geometry and colours — one home, consumed by the
 * BrandMark component, the favicon routes, and the static /mark.svg.
 *
 * The Rift mark: one full-height column and two shorter outer spikes
 * that run beside it, then break away at 45°. The outer legs sit at
 * x=6.5 and 17.5, deliberately wide of the column, so the three strokes
 * stay distinct at 16px; the first draft had them at x=9 and closed up
 * into a blob below 24px. Round caps throughout, matching the pill
 * buttons and the card radius. (Replaced the codename's chevron spine
 * on 2026-09-24; the geometry is still open to iteration.)
 *
 * Every renderer reads from here — the BrandMark component, both
 * favicon routes — but two copies are hand-mirrored and must move with
 * it: website/public/logos/mark.svg (the static file the showcase pages,
 * SiteChat and Storybook's Logos story load by URL) and the DefaultLogo
 * in the library's AppSidebar, which cannot import from the website.
 */

/** Stroke paths on a 24×24 viewBox: the column, then the left and right legs. */
export const BRAND_MARK_PATHS = [
  "M12 1.5 V22.5",
  "M6.5 7 V12 L2 16.5",
  "M17.5 7 V12 L22 16.5",
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
