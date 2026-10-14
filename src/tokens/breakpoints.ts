/**
 * Viewport breakpoints — the one home of the widths the system's media
 * queries switch at.
 *
 * CSS custom properties cannot drive an `@media` condition, so stylesheets
 * still write these numbers as literals. This module is what those literals
 * are held to: `scripts/validate-breakpoints.mjs` fails the build on any
 * `@media` width, in the library or the site, that is not one of the values
 * below, unless the rule carries a `ds-allow(breakpoint): <reason>` directive
 * saying why it switches somewhere else. JavaScript that needs a query reads
 * it from here (`mediaBelow`, `mediaAbove`) rather than restating a number.
 *
 * Every value is the last width of the narrower side of its boundary:
 * `(max-width: N)` matches at and below it, and `(min-width: N + 1)` is the
 * same boundary seen from above.
 *
 * `BREAKPOINTS` describes each step: what changes there, and which side of
 * the boundary its rules sit on. It is what /foundations/layout renders,
 * and the validator holds it to the constants in both directions, so a new
 * step cannot ship undocumented.
 */

/** The modal sheet step. */
export const BREAKPOINT_SHEET_PX = 480;

/** The phone step. */
export const BREAKPOINT_PHONE_PX = 600;

/** The mobile step, the token layer's only breakpoint. */
export const BREAKPOINT_MOBILE_PX = 768;

/** The tablet step. */
export const BREAKPOINT_TABLET_PX = 959;

/** The site's rail-stacking step. */
export const BREAKPOINT_STACK_PX = 1151;

/** The mid step. */
export const BREAKPOINT_MID_PX = 1279;

/** The chat widget's takeover step. */
export const BREAKPOINT_CHAT_TAKEOVER_PX = 719;

/** The chat widget's dock step (the panel docks above it). */
export const BREAKPOINT_CHAT_DOCK_PX = 1439;

/** The chat widget's short-viewport step. A height, not a width. */
export const BREAKPOINT_CHAT_SHORT_HEIGHT_PX = 619;

/** One documented step of the breakpoint set. */
export interface Breakpoint {
  /** The step's name, in sentence case. */
  label: string;
  /** The last width (or height) of the narrower side, in px. */
  px: number;
  /** The viewport dimension the step measures. */
  axis: 'width' | 'height';
  /** Which side its rules sit on: `below` for max-width rules, `above` for min-width ones. */
  side: 'below' | 'above';
  /** What changes at the step. */
  role: string;
}

/** Every library breakpoint, with what changes at each. */
export const BREAKPOINTS: readonly Breakpoint[] = [
  {
    label: 'Sheet',
    px: BREAKPOINT_SHEET_PX,
    axis: 'width',
    side: 'below',
    role: 'Modal overlays drop their floating margin and run near edge to edge.',
  },
  {
    label: 'Phone',
    px: BREAKPOINT_PHONE_PX,
    axis: 'width',
    side: 'below',
    role: 'Body gutters tighten, and dense grids scroll inside their own blocks.',
  },
  {
    label: 'Chat takeover',
    px: BREAKPOINT_CHAT_TAKEOVER_PX,
    axis: 'width',
    side: 'below',
    role: 'The chat panel fills the viewport.',
  },
  {
    label: 'Mobile',
    px: BREAKPOINT_MOBILE_PX,
    axis: 'width',
    side: 'below',
    role: 'The token layer’s only step: display type and section spacing collapse, and app shells fold into a drawer.',
  },
  {
    label: 'Tablet',
    px: BREAKPOINT_TABLET_PX,
    axis: 'width',
    side: 'below',
    role: 'The site’s left nav moves into the header drawer, and pages fall to one column.',
  },
  {
    label: 'Stack',
    px: BREAKPOINT_STACK_PX,
    axis: 'width',
    side: 'below',
    role: 'The site’s right details rail stacks below the main content.',
  },
  {
    label: 'Mid',
    px: BREAKPOINT_MID_PX,
    axis: 'width',
    side: 'below',
    role: 'The site’s rails narrow and the column gap tightens, keeping the centre column at a readable measure.',
  },
  {
    label: 'Chat dock',
    px: BREAKPOINT_CHAT_DOCK_PX,
    axis: 'width',
    side: 'above',
    role: 'The chat panel docks beside the page instead of covering it.',
  },
  {
    label: 'Chat short height',
    px: BREAKPOINT_CHAT_SHORT_HEIGHT_PX,
    axis: 'height',
    side: 'below',
    role: 'The chat panel gives up its vertical insets on a short viewport.',
  },
];

/** A query matching viewports at or below `px` wide. */
export const mediaBelow = (px: number): string => `(max-width: ${px}px)`;

/** A query matching viewports wider than `px`, the same boundary as `mediaBelow(px)` seen from above. */
export const mediaAbove = (px: number): string => `(min-width: ${px + 1}px)`;

/** The query a documented step's rules use, on the side and axis it names. */
export const mediaFor = ({ px, axis, side }: Breakpoint): string =>
  side === 'below' ? `(max-${axis}: ${px}px)` : `(min-${axis}: ${px + 1}px)`;
