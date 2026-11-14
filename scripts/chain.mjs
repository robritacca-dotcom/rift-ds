/**
 * chain.mjs
 *
 * The build chain: every generator and validator that runs before a build,
 * in the order it runs. This list is the one home of that order.
 * scripts/run-chain.mjs runs it, and three npm scripts are only ways in:
 *
 *   npm run validate-registry   (root)      the whole chain
 *   website prebuild                        the steps marked 'dev' or 'build'
 *   website predev                          the steps marked 'dev'
 *
 * scripts/generate-quality-gate.mjs reads it for the list on
 * /skills/super-ship, so a step added here needs its one line in
 * website/src/data/quality-gate.json, and the build fails without it.
 *
 * A row is [id, site]. The id is the script's basename under scripts/.
 * The site mark says which of the website's own chains the step joins:
 *
 *   'dev'    a generator the website needs fresh before `next dev` and
 *            before a build. Validators never take it: one in predev would
 *            fail `next dev` on exactly the stale state the generators are
 *            about to fix.
 *   'build'  also runs before the website build (and so before every
 *            deploy), and not before dev.
 *   absent   library-only: the root chain runs it and the website does not.
 *
 * Generators come first, validators after, so every validator reads fresh
 * data. Keep a generator ahead of everything that imports it. A check that
 * needs the finished build, or the repository's tags, does not belong here:
 * the new-validator skill says where it goes.
 *
 * A manifest, not a chain script: it runs nothing by itself.
 */
export const CHAIN = [
  ['generate-skills-content', 'dev'],
  ['generate-brand-module', 'dev'],
  ['generate-readme-content', 'build'],
  ['generate-token-registry', 'dev'],
  ['generate-preset-stylesheets', 'dev'],
  ['generate-token-values', 'dev'],
  ['generate-theme-design-md', 'dev'],
  ['generate-library-barrel'],
  ['sync-blueprints', 'dev'],
  ['generate-site-corpus', 'dev'],
  ['generate-site-search', 'dev'],
  ['generate-component-api', 'dev'],
  ['generate-component-md', 'dev'],
  ['generate-component-schema', 'dev'],
  ['generate-shadcn-registry', 'dev'],
  ['generate-agent-skill', 'dev'],
  ['generate-dependency-graph', 'dev'],
  ['generate-google-font-index', 'dev'],
  ['generate-brand-marks', 'dev'],
  ['generate-a11y-coverage', 'dev'],
  ['generate-quality-gate', 'dev'],
  ['validate-google-font-index', 'build'],
  ['validate-brand-marks', 'build'],
  ['validate-brand-module', 'build'],
  ['validate-component-registry', 'build'],
  ['validate-website-surfaces', 'build'],
  ['validate-page-titles', 'build'],
  ['validate-prop-docs', 'build'],
  ['validate-component-contract'],
  ['validate-overlay-listeners'],
  ['validate-accessible-names'],
  ['validate-visible-text'],
  ['validate-locale-formatting'],
  ['validate-prop-vocabulary', 'build'],
  ['validate-skills-registry', 'build'],
  ['validate-doc-refs', 'build'],
  ['validate-quality-gate', 'build'],
  ['validate-release-log', 'build'],
  ['validate-loops', 'build'],
  ['validate-template-thumbnails', 'build'],
  ['validate-nav-panels', 'build'],
  ['validate-site-corpus', 'build'],
  ['validate-site-search', 'build'],
  ['validate-component-api', 'build'],
  ['validate-component-md', 'build'],
  ['validate-component-schema', 'build'],
  ['validate-json-schemas', 'build'],
  ['validate-shadcn-registry', 'build'],
  ['validate-agent-skill', 'build'],
  ['validate-dependency-graph', 'build'],
  ['validate-a11y-coverage', 'build'],
  ['validate-mcp-tools', 'build'],
  ['validate-chat-coverage', 'build'],
  ['validate-chat-starters', 'build'],
  ['validate-page-summaries', 'build'],
  ['validate-shipped-prose', 'build'],
  ['validate-token-registry', 'build'],
  ['validate-token-values', 'build'],
  ['validate-shader-background', 'build'],
  ['validate-site-backgrounds'],
  ['validate-single-background-mount', 'build'],
  ['validate-analytics-events'],
  ['validate-token-references'],
  ['validate-token-layers'],
  ['validate-theme-mirrors', 'build'],
  ['validate-foundation-mirrors', 'build'],
  ['validate-preset-stylesheets', 'build'],
  ['validate-theme-design-md', 'build'],
  ['validate-theme-export', 'build'],
  ['validate-design-md-import', 'build'],
  ['validate-theme-presets', 'build'],
  ['validate-token-usage'],
  ['validate-action-colour'],
  ['validate-css-directives'],
  ['validate-raw-values'],
  ['validate-logical-properties'],
  ['validate-design-counts'],
  ['validate-class-names'],
  ['validate-js-timings'],
  ['validate-page-prose-width'],
  ['validate-breakpoints', 'build'],
  ['validate-stacking', 'build'],
  ['validate-tier-colours', 'build'],
  ['validate-table-styles'],
  ['validate-backdrop-layers'],
  ['validate-chat-widget'],
  ['validate-blocks'],
  ['validate-figma-nodes'],
  ['validate-shared-primitives'],
  ['validate-chat-cards'],
  ['validate-shell-recipe'],
  ['validate-package-exports'],
  ['validate-local-labs'],
];

/** The steps of one way in: 'all', 'site-build' or 'site-dev'. */
export function chainSteps(set = 'all') {
  const keep = {
    all: () => true,
    'site-build': (site) => site === 'dev' || site === 'build',
    'site-dev': (site) => site === 'dev',
  }[set];
  if (!keep) throw new Error(`unknown chain set "${set}": use all, site-build or site-dev`);
  return CHAIN.filter(([, site]) => keep(site)).map(([id]) => id);
}
