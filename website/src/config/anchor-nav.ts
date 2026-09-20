/**
 * Routes for the site-wide floating anchor nav (SiteAnchorRail in the root
 * layout). Every page gets the rail automatically — it reads the page's h2
 * headings after render, so a new page needs no wiring — except:
 *
 * - ANCHOR_NAV_EXCLUDED_ROUTES: pages that should not carry one. The index
 *   and landing pages are doors, not documents — a reader is choosing a
 *   destination, not scanning sections — and the immersive surfaces
 *   (the playground, the graph) are chromeless anyway, listed here so the
 *   intent survives if their chrome status ever changes.
 * - ANCHOR_NAV_SELF_MANAGED_ROUTES: pages that mount FloatingAnchorNav
 *   themselves with server-derived items (markdown-extracted sections, or
 *   anchors whose labels are not headings). The global rail must skip them
 *   or the page would carry two.
 *
 * Chromeless routes (src/config/chromeless.ts) are skipped as well.
 * Matching is exact, so a nested route needs its own entry — which is what
 * lets an index be excluded while its children keep the rail.
 */
export const ANCHOR_NAV_EXCLUDED_ROUTES = new Set([
  "/",
  "/docs",
  "/foundations",
  "/templates",
  "/playground",
  "/graph",
]);

export const ANCHOR_NAV_SELF_MANAGED_ROUTES = new Set([
  "/skills",
  "/docs/get-started",
  "/blueprints/claude",
  "/blueprints/design",
  "/blueprints/content-design",
]);
