/**
 * The site's own breakpoints — widths shared by a family of site surfaces
 * that the library has no reason to ship. The library's set lives in
 * `rift-ds/tokens/breakpoints` (src/tokens/breakpoints.ts), which states
 * the conventions: each value is the last width of the narrower side, and
 * `mediaBelow` / `mediaAbove` build the queries. Site stylesheets are held
 * to both sets by scripts/validate-breakpoints.mjs; library stylesheets
 * to the library's alone. `SITE_BREAKPOINTS` documents each step for
 * /foundations/layout, held to the constants the same way.
 */
import type { Breakpoint } from "rift-ds/tokens/breakpoints";

/** The template screens' compact step. */
export const BREAKPOINT_TEMPLATE_COMPACT_PX = 1080;

/** The template screens' narrow step. */
export const BREAKPOINT_TEMPLATE_NARROW_PX = 760;

/** The immersive stages' compact step. */
export const BREAKPOINT_STAGE_COMPACT_PX = 1099;

/** Every site-only breakpoint, with what changes at each. */
export const SITE_BREAKPOINTS: readonly Breakpoint[] = [
  {
    label: "Template narrow",
    px: BREAKPOINT_TEMPLATE_NARROW_PX,
    axis: "width",
    side: "below",
    role: "Template screens hand their app sidebar to its mobile drawer.",
  },
  {
    label: "Template compact",
    px: BREAKPOINT_TEMPLATE_COMPACT_PX,
    axis: "width",
    side: "below",
    role: "Template screens tighten their content padding, and multi-column boards fall to one column.",
  },
  {
    label: "Stage compact",
    px: BREAKPOINT_STAGE_COMPACT_PX,
    axis: "width",
    side: "below",
    role: "The playground’s floating control panel gives way to a bottom drawer, and inspect mode stands down.",
  },
];
