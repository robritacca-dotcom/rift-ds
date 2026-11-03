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
 *   node scripts/smoke-hydration.mjs <production origin — SITE_URL in scripts/brand.mjs>
 *     Checks a live origin. The `ship` skill runs this against production
 *     after every deploy, because the outage's trigger (Vercel's internal
 *     pathname during the root route's ISR regeneration) exists only there —
 *     no local run can reproduce it, so the live site must be looked at.
 *
 * Routes come from the registries (first component) plus
 * the fixed pages, so the list cannot rot as content moves. Each route is
 * checked at a desktop and a phone viewport: the FAB summary panel and the
 * chat takeover render differently per pointer capability, and a mismatch
 * gated on either would only show on one of the two.
 *
 * And it loads each route once more with hydration made to fail, the way a
 * browser extension that edits the page before React arrives makes it fail:
 * an init script rewrites the skip link's text as the parser lays it down,
 * so React finds a mismatch at the root and client-renders <html>, which
 * strips every attribute on it. On 2026-11-03 two visitors (a Pixel 7 and a
 * MacBook, both Chrome) saw the home page go black with one line of hero
 * copy showing, because that strip took the ready mark with it; the clean
 * passes above could never see it, since nothing in a clean browser breaks
 * hydration. This pass asserts the page comes back visible, with the ready
 * mark and the visitor's stored colour mode, after a fallback it proves
 * really happened.
 *
 * It also fails a page that lays out wider than its viewport. On a phone,
 * Chrome widens the layout viewport to fit the overflow and every fixed
 * element stretches with it: on 2026-10-25 a Pixel 7 user reported the home
 * page scrolling sideways with the header's menu button off screen, because
 * the hero's theme-swatch tooltips sat in layout at opacity 0 and reached
 * 54px past a 412px screen. Nothing errored and every other check here
 * passed, so the width is checked directly.
 */
/* global document, window, MutationObserver -- page.evaluate() callbacks and the init script execute in the browser */
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
/** How many overflowing elements a width failure names. */
const OVERFLOW_REPORT_LIMIT = 3;

/** The forced-fallback pass: the visitor's stored mode, chosen to differ
 *  from what the layout renders (dark) under a dark system preference, so a
 *  page that lost the stored choice shows it. Desktop only: the fallback does
 *  not depend on the viewport. */
const FALLBACK_STORED_MODE = 'light';
const FALLBACK_PROFILE = {
  name: 'forced hydration fallback',
  viewport: { width: 1440, height: 900 },
  isMobile: false,
  hasTouch: false,
  colorScheme: 'dark',
  forceFallback: true,
};

/** Runs before any page script. Stores the visitor's mode, then rewrites the
 *  skip link's text the moment the parser adds it, before the hydration
 *  scripts (async, later in the document) can run. */
function forceFallbackInit(storedMode) {
  try {
    localStorage.setItem('theme', storedMode);
  } catch {
    /* no storage: the mode assertion below will say so */
  }
  const observer = new MutationObserver(() => {
    const link = document.querySelector('a.skip-link');
    if (!link || !link.firstChild) return;
    link.firstChild.textContent = 'Skip to content (edited before hydration)';
    observer.disconnect();
  });
  observer.observe(document, { childList: true, subtree: true });
}

async function checkPage(browser, origin, route, profile) {
  const context = await browser.newContext({
    viewport: profile.viewport,
    isMobile: profile.isMobile,
    hasTouch: profile.hasTouch,
    ...(profile.colorScheme ? { colorScheme: profile.colorScheme } : {}),
  });
  if (profile.forceFallback) await context.addInitScript(forceFallbackInit, FALLBACK_STORED_MODE);
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
        mode: document.documentElement.getAttribute('data-theme'),
      };
    });

    // The configured width, not documentElement.clientWidth: on a phone the
    // layout viewport widens to fit the overflow, so it would agree with it.
    const width = await page.evaluate(({ viewport, limit }) => {
      const scrollWidth = document.documentElement.scrollWidth;
      if (scrollWidth <= viewport) return { viewport, scrollWidth, culprits: [] };
      // Name the elements that reach past either edge with no ancestor
      // clipping them, outermost first, so the failure points at the cause.
      // A fixed element stretches with the widened layout viewport, and its
      // contents with it: a symptom of the overflow, never its cause. A
      // clipping ancestor contains whatever sits inside it.
      const excused = (el) => {
        if (window.getComputedStyle(el).position === 'fixed') return true;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const style = window.getComputedStyle(a);
          if (style.position === 'fixed' || style.overflowX !== 'visible') return true;
        }
        return false;
      };
      const culprits = [];
      for (const el of document.body.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || (r.right <= viewport + 1 && r.left >= -1)) continue;
        if (culprits.some((c) => c.el.contains(el)) || excused(el)) continue;
        culprits.push({ el, left: Math.round(r.left), right: Math.round(r.right) });
        if (culprits.length >= limit) break;
      }
      return {
        viewport,
        scrollWidth,
        culprits: culprits.map(({ el, left, right }) => {
          const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '';
          return `<${el.tagName.toLowerCase()}${cls ? ` class="${cls}"` : ''}> spans ${left} to ${right}px`;
        }),
      };
    }, { viewport: profile.viewport.width, limit: OVERFLOW_REPORT_LIMIT });

    if (!state.themeReady) failures.push('data-theme-ready never landed on <html>');
    if (state.rootVisibility !== 'visible') failures.push(`<html> visibility is ${state.rootVisibility}`);
    if (state.mainVisibility !== 'visible') failures.push(`<main> visibility is ${state.mainVisibility}`);
    if (state.mainTextLength < MIN_MAIN_TEXT) {
      failures.push(`<main> has ${state.mainTextLength} chars of text (needs ${MIN_MAIN_TEXT})`);
    }
    if (width.scrollWidth > width.viewport) {
      const named = width.culprits.length > 0 ? `: ${width.culprits.join('; ')}` : '';
      failures.push(
        `page lays out ${width.scrollWidth}px wide in a ${width.viewport}px viewport${named}`,
      );
    }

    const hydrationErrors = errors.filter((e) => HYDRATION_PATTERNS.some((p) => p.test(e)));
    if (profile.forceFallback) {
      // Here the mismatch is the point: without it the pass proves nothing.
      if (hydrationErrors.length === 0) {
        failures.push('the forced mismatch never reached React, so no fallback was tested (has the skip link moved?)');
      }
      if (state.mode !== FALLBACK_STORED_MODE) {
        failures.push(`the stored colour mode did not survive the fallback: data-theme is ${state.mode}, stored ${FALLBACK_STORED_MODE}`);
      }
    } else {
      for (const e of hydrationErrors) failures.push(`hydration error: ${e.slice(0, 200)}`);
    }
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
      for (const profile of [...VIEWPORTS, FALLBACK_PROFILE]) {
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
      `\nsmoke-hydration: ${problems.length} of ${ROUTES.length * (VIEWPORTS.length + 1)} page loads failed on ${origin}:\n\n${problems.join('\n')}\n`,
    );
    process.exit(1);
  }
  console.log(`smoke-hydration: all ${ROUTES.length * (VIEWPORTS.length + 1)} page loads render on ${origin}`);
}

main().catch((err) => {
  console.error(`smoke-hydration: ${err.message}`);
  process.exit(1);
});
