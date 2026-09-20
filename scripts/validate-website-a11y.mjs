/**
 * validate-website-a11y.mjs
 *
 * Runs axe against the served website, in both themes. The story tests
 * already hold every component to WCAG 2.1 AA, but they see components in
 * isolation: page-level composition — landmark structure, heading order,
 * duplicate ids across sections, the chrome the layout mounts around every
 * page — is exactly what a per-component gate cannot see, and it never got
 * scanned before this check. Same served-build slot as the hydration smoke,
 * and the same registry-derived routes (SMOKE_ROUTES in served-site.mjs),
 * so the two checks describe the same sample of the site.
 *
 * The rule set deliberately mirrors `.storybook/preview.ts`: WCAG 2.1 AA
 * with `color-contrast` off. That exclusion is a settled decision of Rob's
 * and the comment in preview.ts is its authoritative record — do not
 * re-enable it here without asking him, and a contrast failure appearing
 * from this script means someone turned it back on.
 */
/* global window, document -- page.evaluate() callbacks execute in the browser */
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { SMOKE_ROUTES, startServer } from './served-site.mjs';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');

const THEMES = ['light', 'dark'];

/** Mirrors the gate in .storybook/preview.ts — AA tags, contrast off. */
const AXE_OPTIONS = {
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  rules: { 'color-contrast': { enabled: false } },
};

async function checkRoute(browser, origin, route, theme) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: theme,
  });
  const page = await context.newPage();
  const violations = [];
  try {
    await page.goto(origin + route, { waitUntil: 'load', timeout: 30_000 });
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      document.documentElement.setAttribute('data-theme-setting', t);
    }, theme);
    await page.waitForTimeout(500);
    await page.addScriptTag({ path: axePath });
    const results = await page.evaluate(
      (options) => window.axe.run(document, options),
      AXE_OPTIONS,
    );
    for (const v of results.violations) {
      violations.push(
        `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.target?.join(' ') ?? '?'}`,
      );
    }
  } catch (err) {
    violations.push(`axe run failed: ${err.message}`);
  } finally {
    await context.close();
  }
  return violations;
}

async function main() {
  const server = await startServer();
  const browser = await chromium.launch();
  const problems = [];
  try {
    for (const route of SMOKE_ROUTES) {
      for (const theme of THEMES) {
        const violations = await checkRoute(browser, server.origin, route, theme);
        const label = `${route} [${theme}]`;
        if (violations.length > 0) {
          problems.push(`${label}\n${violations.map((v) => `    - ${v}`).join('\n')}`);
          console.error(`✗ ${label}`);
        } else {
          console.log(`✓ ${label}`);
        }
      }
    }
  } finally {
    await browser.close();
    server.stop();
  }

  if (problems.length > 0) {
    console.error(
      `\nvalidate-website-a11y: axe violations on ${problems.length} of ${SMOKE_ROUTES.length * THEMES.length} page renders:\n\n${problems.join('\n')}\n`,
    );
    process.exit(1);
  }
  console.log(
    `validate-website-a11y: ${SMOKE_ROUTES.length} routes clean in both themes (AA, contrast excluded per .storybook/preview.ts).`,
  );
}

main().catch((err) => {
  console.error(`validate-website-a11y: ${err.message}`);
  process.exit(1);
});
