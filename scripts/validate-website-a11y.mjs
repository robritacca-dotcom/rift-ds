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
 *
 * It also renders the table bench under forced colors (Windows high
 * contrast), the one mode axe cannot judge: the browser flattens every
 * fill to the page, so a state carried by a fill alone vanishes with no
 * error. src/tokens/tokens-forced-colors.css re-points the state-bearing
 * roles at system colours, the one fill the mode keeps; FORCED_CHECKS
 * proves each of them still stands apart from the page, and that a
 * floating panel keeps its edge and a focused control its ring.
 */
/* global window, document, getComputedStyle -- page.evaluate() callbacks execute in the browser */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
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

/**
 * The right-to-left bench: the library laid out in Arabic with dir="rtl" on
 * <html>, so a component that breaks right to left fails here as well as in
 * the right-to-left story pass.
 */
const RTL_ROUTE = '/labs/rtl';

/** The page forced colors are judged on: the bench carries every table control. */
const FORCED_ROUTE = '/labs/tables';

/**
 * Each check reads one element under forced colors and says what is wrong
 * with it, or nothing. `fill` must differ from the page's, the only way a
 * state carried by a fill survives the mode.
 */
const FORCED_CHECKS = [
  { name: 'the primary action', selector: '#bench-toolbar .ds-split-button .ds-button--primary', fill: true },
  // The selected segment's fill rides a pill that slides beneath the segments.
  { name: 'the selected density segment', selector: '#bench-toolbar .ds-table-toolbar .ds-segmented-control__pill', fill: true },
  { name: 'a ticked row checkbox', selector: '#bench-paged tbody .ds-checkbox__box--checked', fill: true },
  // The count rides an icon only once the bar folds, so it is read at the station's phone width.
  { name: 'the filter count', selector: '#bench-toolbar .ds-table-toolbar__badge', fill: true, phone: true },
];

export async function checkForcedColors(browser, origin) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, forcedColors: 'active' });
  const page = await context.newPage();
  const problems = [];
  try {
    await page.goto(origin + FORCED_ROUTE, { waitUntil: 'load', timeout: 30_000 });
    await page.waitForTimeout(800);
    // Tick a row, so a checked checkbox exists to judge.
    await page.locator('#bench-paged tbody [role="checkbox"]').first().click();
    await page.waitForTimeout(200);
    for (const check of FORCED_CHECKS) {
      if (check.phone) {
        await page.locator('#bench-toolbar [role="tab"]', { hasText: 'Phone' }).first().click();
        await page.waitForTimeout(600);
      }
      const result = await page.evaluate((selector) => {
        const el = document.querySelector(selector);
        if (!el) return { missing: true };
        const page = getComputedStyle(document.body).backgroundColor;
        return { fill: getComputedStyle(el).backgroundColor, page };
      }, check.selector);
      if (result.missing) problems.push(`${check.name}: nothing matches ${check.selector}`);
      else if (check.fill && (result.fill === result.page || /rgba\(.*, 0\)$/.test(result.fill)))
        problems.push(`${check.name} draws no fill of its own (${result.fill} on ${result.page}), so its state is lost`);
    }
    await page.locator('#bench-toolbar [role="tab"]', { hasText: 'Desktop' }).first().click();
    await page.waitForTimeout(600);
    // A floating panel keeps its edge: forced colors drop its shadow.
    await page.locator('#bench-toolbar button[aria-label="Columns"]').click();
    await page.waitForTimeout(300);
    const edge = await page.evaluate(() => {
      // Popovers are fixed, so offsetParent is no test of being shown.
      const panel = [...document.querySelectorAll('.ds-popover__panel')].find(
        (el) => el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== 'hidden',
      );
      return panel ? getComputedStyle(panel).borderTopWidth : null;
    });
    if (edge === null) problems.push('the Columns panel did not open');
    else if (parseFloat(edge) === 0) problems.push('an open panel has no border, so it has no edge once its shadow is dropped');
    await page.keyboard.press('Escape');
    // A focused control keeps its ring.
    await page.locator('#bench-toolbar button[aria-label="Columns"]').focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const ring = await page.evaluate(() => {
      const el = document.activeElement;
      const style = el ? getComputedStyle(el) : null;
      return style ? `${style.outlineStyle} ${style.outlineWidth}` : null;
    });
    if (!ring || ring.startsWith('none') || ring.endsWith(' 0px')) problems.push(`a focused control shows no ring (${ring})`);
  } catch (err) {
    problems.push(`forced colors run failed: ${err.message}`);
  } finally {
    await context.close();
  }
  return problems;
}

async function main() {
  const server = await startServer();
  const browser = await chromium.launch();
  const problems = [];
  try {
    for (const route of [...SMOKE_ROUTES, RTL_ROUTE]) {
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
    const forced = await checkForcedColors(browser, server.origin);
    if (forced.length > 0) {
      problems.push(`${FORCED_ROUTE} [forced colors]\n${forced.map((v) => `    - ${v}`).join('\n')}`);
      console.error(`✗ ${FORCED_ROUTE} [forced colors]`);
    } else {
      console.log(`✓ ${FORCED_ROUTE} [forced colors]: ${FORCED_CHECKS.length} states, a panel edge and a focus ring hold`);
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

// Run when invoked directly; imported, it hands out the forced colors pass alone.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(`validate-website-a11y: ${err.message}`);
    process.exit(1);
  });
}
