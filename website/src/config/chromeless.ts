/**
 * Routes that render none of the shared site chrome (footer, chat panel,
 * command palette):
 * the playground is an immersive tool — a floating toolbar pill and glass
 * panels over a dotted stage — whose Chat view hosts its own copy of the widget
 * (two live widgets would double-bill and confuse QA); and the labs pages
 * are full-viewport rebuilds of reference products, where the shared
 * chrome would sit inside the app shell being tested — as are the template
 * screens under /templates, which render the same full-viewport app shells
 * as their labs origins; and the graph page is the dependency-graph
 * instrument, a full-width tracing surface with its own top bar, where the
 * shared chrome would crowd the columns it exists to show.
 *
 * Matching is exact, so a nested route needs its own entry.
 */
export const CHROMELESS_ROUTES = new Set([
  "/playground",
  "/graph",
  "/labs/marketing",
  "/labs/payroll",
  "/templates/marketing-dashboard",
  "/templates/chat-home",
  "/templates/mobile-dashboard",
  "/templates/relay-console",
  "/templates/team-calendar",
  "/templates/agent-workbench",
  "/templates/roadmap-planner",
  "/templates/sales-pipeline",
  "/templates/payroll-console",
  "/templates/sign-in",
]);
