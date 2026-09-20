/**
 * smoke-hydration.mjs
 *
 * Loads a handful of routes in a real browser and fails if the site does not
 * actually render: hydration must succeed, the theme guard's ready mark must
 * land, and the page must be visible with real content. HTTP 200 proves none
 * of that — on 2026-09-06 the whole site served 200 while every JS browser
 * showed a black page, because a hydration mismatch (server HTML built from a
 * pathname the client never sees) made React redo <html> and drop the theme
 * guard, leaving visibility:hidden everywhere. This script is the check that
 * outage was missing, in both places it was missing:
 *
 *   node scripts/smoke-hydration.mjs
 *     Self-serving: boots `next start` on a free port against the existing
 *     website build and checks it. Runs at the end of `verify` and in CI's
 *     website job, after the build — it catches the reproducible class of
 *     mismatch (time-, random-, and environment-dependent renders).
 *
 *   node scripts/smoke-hydration.mjs https://robertritacca.com
 *     Checks a live origin. The `ship` skill runs this against production
 *     after every deploy, because the outage's trigger (Vercel's internal
 *     pathname during the root route's ISR regeneration) exists only there —
 *     no local run can reproduce it, so the live site must be looked at.
 *
 * Routes come from the registries (first case study, first component) plus
 * the fixed pages, so the list cannot rot as content moves. Each route is
 * checked at a desktop and a phone viewport: the FAB summary panel and the
 * chat takeover render differently per pointer capability, and a mismatch
 * gated on either would only show on one of the two.
 */
/* global document, window -- page.evaluate() callbacks execute in the browser */
import { chromium } from 'playwright';
import { SMOKE_ROUTES as ROUTES, startServer } from './served-site.mjs';

const VIEWPORTS = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  { name: 'phone', viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
];

/** Errors that mean hydration itself failed. #418/#419/#425 are React's
 *  minified mismatch codes; the prose forms cover unminified builds. */
const HYDRATION_PATTERNS = [
  /minified react error #4(18|19|25)/i,
  /hydration/i,
  /did not match/i,
];

/** Errors that mean a browser feature was denied, not that the page failed to
 *  render. A Permissions-Policy violation is the browser refusing an API probe
 *  — the document is already up and painting when it fires. Seen 2026-09-06:
 *  the YouTube embed on the first case study probed ComputePressureObserver
 *  without `compute-pressure` in its allow list, and the violation surfaced
 *  only when the player's JS got that far inside the settle window — a flake
 *  that failed one run and passed the identical build on the next. */
const BENIGN_PATTERNS = [/permissions policy violation/i];

/** Hydration needs a beat after load before its errors surface. */
const SETTLE_MS = 1500;
/** The page must show real prose, not a shell — the threshold only has to
 *  reject emptiness, so it stays far below any real page's content. */
const MIN_MAIN_TEXT = 80;

async function checkPage(browser, origin, route, profile) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    isMobile: profile.isMobile,
    hasTouch: profile.hasTouch,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(String(err?.message ?? err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  const failures = [];
  try {
    const response = await page.goto(origin + route, { waitUntil: 'load', timeout: 30_000 });
    if (!response || !response.ok()) {
      failures.push(`HTTP ${response ? response.status() : 'no response'}`);
    }
    await page.waitForTimeout(SETTLE_MS);

    const state = await page.evaluate(() => {
      const main = document.querySelector('main');
      return {
        themeReady: document.documentElement.hasAttribute('data-theme-ready'),
        rootVisibility: window.getComputedStyle(document.documentElement).visibility,
        mainVisibility: main ? window.getComputedStyle(main).visibility : 'missing',
        mainTextLength: main ? main.innerText.trim().length : 0,
      };
    });

    if (!state.themeReady) failures.push('data-theme-ready never landed on <html>');
    if (state.rootVisibility !== 'visible') failures.push(`<html> visibility is ${state.rootVisibility}`);
    if (state.mainVisibility !== 'visible') failures.push(`<main> visibility is ${state.mainVisibility}`);
    if (state.mainTextLength < MIN_MAIN_TEXT) {
      failures.push(`<main> has ${state.mainTextLength} chars of text (needs ${MIN_MAIN_TEXT})`);
    }

    const hydrationErrors = errors.filter((e) => HYDRATION_PATTERNS.some((p) => p.test(e)));
    for (const e of hydrationErrors) failures.push(`hydration error: ${e.slice(0, 200)}`);
    const pageErrors = errors.filter(
      (e) =>
        !hydrationErrors.includes(e) &&
        !e.startsWith('Failed to load resource') &&
        !BENIGN_PATTERNS.some((p) => p.test(e)),
    );
    for (const e of pageErrors) failures.push(`uncaught page error: ${e.slice(0, 200)}`);
  } catch (err) {
    failures.push(`load failed: ${err.message}`);
  } finally {
    await context.close();
  }
  return failures;
}

async function main() {
  const liveOrigin = process.argv[2] ?? null;
  let server = null;
  let origin = liveOrigin;
  if (!origin) {
    server = await startServer();
    origin = server.origin;
  }

  const browser = await chromium.launch();
  const problems = [];
  try {
    for (const route of ROUTES) {
      for (const profile of VIEWPORTS) {
        const failures = await checkPage(browser, origin, route, profile);
        const label = `${route} [${profile.name}]`;
        if (failures.length > 0) {
          problems.push(`${label}\n${failures.map((f) => `    - ${f}`).join('\n')}`);
          console.error(`✗ ${label}`);
        } else {
          console.log(`✓ ${label}`);
        }
      }
    }
  } finally {
    await browser.close();
    server?.stop();
  }

  if (problems.length > 0) {
    console.error(
      `\nsmoke-hydration: ${problems.length} of ${ROUTES.length * VIEWPORTS.length} page loads failed on ${origin}:\n\n${problems.join('\n')}\n`,
    );
    process.exit(1);
  }
  console.log(`smoke-hydration: all ${ROUTES.length * VIEWPORTS.length} page loads render on ${origin}`);
}

main().catch((err) => {
  console.error(`smoke-hydration: ${err.message}`);
  process.exit(1);
});
