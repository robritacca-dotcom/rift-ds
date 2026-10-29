#!/usr/bin/env node
/**
 * check-responsive-layout.mjs
 *
 * Sweeps every static page of the served website across the width ladder
 * and reports the layout breaks a script can measure: content running off
 * the viewport, text cut off by a box that hides its overflow, text
 * spilling out of its box, and controls drawn on top of each other. The
 * served-site checks in `verify` (hydration, axe, gestures) render at one
 * desktop width, apart from the hydration smoke's phone pass, which fails
 * only a page that scrolls sideways on its few routes, so an element that
 * breaks at a phone or tablet width reached no check; this is the check
 * that loads those widths and measures each element.
 * It is the instrument of the responsive-sweep skill
 * (`.claude/skills/responsive-sweep`), which judges what it reports.
 *
 * The routes are `staticSiteRoutes()` from site-routes.mjs, so a new page
 * is swept the day it exists. The widths are derived from the two
 * breakpoint modules: every width-axis step from `src/tokens/breakpoints.ts`
 * and `website/src/config/breakpoints.ts`, at its last px and the px after,
 * plus a small phone, a common phone and a wide desktop. Each page loads
 * once at the narrowest width and is resized up the ladder, in light
 * theme with reduced motion: geometry does not change with the theme, and
 * reduced motion settles entry animations before anything is measured.
 *
 * What each kind means:
 *   offscreen  an element reaches past the viewport's edge with nothing
 *              between it and the page that scrolls or clips it.
 *   clipped    text crosses the edge of an ancestor that hides overflow,
 *              with no ellipsis, so part of it is simply gone.
 *   truncated  the same, ended by an ellipsis or a line clamp. Often
 *              deliberate, so it is reported for review, never as an error.
 *   spill      text runs out of its own box while nothing clips it, so it
 *              draws over whatever sits beside it.
 *   overlap    two controls, neither inside the other, cover the same area.
 *   error      the page failed to load or threw during the sweep, so
 *              nothing on it was measured. Reported first.
 *
 * Deliberately NOT part of `verify` or CI yet: it is a judgement aid, and a
 * finding is a lead until the skill has looked at its screenshot. Findings
 * the owner has accepted live in ACCEPTED below, each with its reason, so
 * later runs stop reporting them. Exit 1 when any finding other than
 * `truncated` survives ACCEPTED.
 *
 * Usage:
 *   node scripts/check-responsive-layout.mjs [options]
 *     --origin <url>        sweep a running site instead of booting the build
 *     --routes <a,b,...>    sweep only these routes (prefix match: /templates)
 *     --widths <a,b,...>    override the width ladder
 *     --quick               a five-step ladder instead of every breakpoint
 *     --concurrency <n>     pages swept in parallel (default 4)
 *     --shots <dir>         save a marked screenshot of each finding there
 *     --json <file>         write the grouped findings as JSON
 */
/* global document, getComputedStyle, NodeFilter -- inspect() runs in the browser */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { repoRoot, startServer } from './served-site.mjs';
import { staticSiteRoutes } from './site-routes.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const list = (value) => value?.split(',').map((s) => s.trim()).filter(Boolean);

/** Width-axis steps of one breakpoint module, read from its documented list. */
function breakpointWidths(rel) {
  const source = readFileSync(join(repoRoot, rel), 'utf8');
  const values = new Map(
    [...source.matchAll(/export const BREAKPOINT_([A-Z0-9_]+)_PX\s*=\s*(\d+)\s*;/g)].map((m) => [m[1], Number(m[2])]),
  );
  return [...source.matchAll(/px:\s*BREAKPOINT_([A-Z0-9_]+)_PX,\s*axis:\s*['"](\w+)['"]/g)]
    .filter((m) => m[2] === 'width')
    .map((m) => values.get(m[1]));
}

const SMALL_PHONE = 320;
const PHONE = 375;
const WIDE = 1920;
const QUICK_WIDTHS = [SMALL_PHONE, PHONE, 768, 1024, 1440];
const VIEWPORT_HEIGHT = 900;

function ladder() {
  if (option('widths')) return list(option('widths')).map(Number).sort((a, b) => a - b);
  if (flag('quick')) return QUICK_WIDTHS;
  const steps = [...breakpointWidths('src/tokens/breakpoints.ts'), ...breakpointWidths('website/src/config/breakpoints.ts')];
  return [...new Set([SMALL_PHONE, PHONE, WIDE, ...steps.flatMap((px) => [px, px + 1])])].sort((a, b) => a - b);
}

/**
 * Findings the owner has accepted. `kind` and `selector` match a finding
 * (selector as a substring of its label); `routes` optionally narrows it to
 * route prefixes. Every entry carries the reason it is not a defect.
 */
const ACCEPTED = [
  {
    kind: 'clipped',
    selector: '_collage > div.',
    routes: ['/'],
    reason: 'The home collage is a fixed-height window onto escalator columns (page.module.css); cropping the cards is the design.',
  },
  {
    kind: 'spill',
    selector: 'ds-contribution-graph__month-label',
    reason: 'A month label sits in its first week column and runs across the next ones by design, like every contribution calendar.',
  },
];

const accepted = (f) =>
  ACCEPTED.some(
    (a) =>
      a.kind === f.kind &&
      f.label.includes(a.selector) &&
      (!a.routes || a.routes.some((prefix) => f.route.startsWith(prefix))),
  );

/** Runs in the page: measures the current layout and returns its findings. */
function inspect() {
  const vw = document.documentElement.clientWidth;
  const out = [];

  const label = (el) => {
    const parts = [];
    for (let n = el; n && n !== document.body && parts.length < 3; n = n.parentElement) {
      // A CSS module class carries a per-file hash prefix (`T0sJXq_pageHeader`);
      // dropping it lets one break in a shared page shell group as one finding.
      const cls = [...n.classList]
        .filter((c) => !c.startsWith('animate'))
        .slice(0, 2)
        .map((c) => c.replace(/^_?[A-Za-z0-9-]{6}_(?=[a-z])/, ''));
      parts.unshift(n.tagName.toLowerCase() + (n.id ? `#${n.id}` : '') + (cls.length ? `.${cls.join('.')}` : ''));
    }
    return parts.join(' > ');
  };
  const path = (el) => {
    const parts = [];
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const parent = n.parentElement;
      const index = parent ? [...parent.children].filter((c) => c.tagName === n.tagName).indexOf(n) + 1 : 1;
      parts.unshift(`${n.tagName.toLowerCase()}:nth-of-type(${index})`);
    }
    return `html > ${parts.join(' > ')}`;
  };
  const record = (kind, el, detail) => out.push({ kind, label: label(el), path: path(el), detail });

  const shown = (el) =>
    el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
    !el.closest('[inert], .ds-visually-hidden');
  const isIcon = (el) => /Material Symbols/i.test(getComputedStyle(el).fontFamily);
  const tiny = (r) => r.width <= 2 || r.height <= 2;
  const isRoot = (el) => el === document.documentElement || el === document.body;
  /* Hidden whole by an ancestor that clips: a closed accordion's zero
     height, or a clip region the element sits entirely outside. Nothing of
     it is on screen, so nothing of it can be cut. */
  const clippedAway = (el) => {
    const r = el.getBoundingClientRect();
    for (let n = el.parentElement; n && !isRoot(n); n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (!['hidden', 'clip'].includes(cs.overflowX) && !['hidden', 'clip'].includes(cs.overflowY)) continue;
      const c = n.getBoundingClientRect();
      if (tiny(c) || r.right <= c.left || r.left >= c.right || r.bottom <= c.top || r.top >= c.bottom) return true;
    }
    return false;
  };

  /* offscreen: the outermost visible element past either viewport edge,
     with no scroller or clipper of its own between it and the page. */
  const past = (r) => r.right > vw + 1 || r.left < -1;
  const unclipped = (el) => {
    for (let n = el.parentElement; n && !isRoot(n); n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.overflowX !== 'visible') return false;
      if (cs.position === 'fixed') return false;
    }
    return true;
  };
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (tiny(r) || !past(r)) continue;
    if (getComputedStyle(el).position === 'fixed') continue;
    if (!shown(el) || !unclipped(el)) continue;
    const parent = el.parentElement;
    if (parent && !isRoot(parent) && past(parent.getBoundingClientRect())) continue;
    record('offscreen', el, `${Math.round(r.left)}..${Math.round(r.right)} of ${vw}`);
  }

  /* clipped, truncated, spill: judged per text node, against its own block
     box and then each ancestor up to the page. */
  const blockOf = (node) => {
    for (let n = node.parentElement; n; n = n.parentElement) {
      const d = getComputedStyle(n).display;
      if (d !== 'inline' && d !== 'contents') return n;
    }
    return document.body;
  };
  const seen = new Set();
  const cutBy = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const quote = (node) => `"${node.textContent.trim().slice(0, 40)}"`;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent.trim()) continue;
    const host = node.parentElement;
    if (!host || seen.has(host) || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'OPTION'].includes(host.tagName)) continue;
    if (!shown(host) || isIcon(host) || clippedAway(host)) continue;
    range.selectNodeContents(node);
    const t = range.getBoundingClientRect();
    if (tiny(t)) continue;
    const box = blockOf(node);
    // A glyph box is taller than a tight line box, so a vertical overrun
    // under this much of the font size is leading, not lost text.
    const slopY = Math.max(2, parseFloat(getComputedStyle(host).fontSize) * 0.35);
    for (let n = box; n && !isRoot(n); n = n.parentElement) {
      const cs = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      if (tiny(r)) break;
      const padL = r.left + parseFloat(cs.borderLeftWidth);
      const padR = r.right - parseFloat(cs.borderRightWidth);
      const padT = r.top + parseFloat(cs.borderTopWidth);
      const padB = r.bottom - parseFloat(cs.borderBottomWidth);
      const overX = t.right > padR + 1 || t.left < padL - 1;
      const overY = t.bottom > padB + slopY || t.top < padT - slopY;
      const clipsX = ['hidden', 'clip'].includes(cs.overflowX);
      const clipsY = ['hidden', 'clip'].includes(cs.overflowY);
      const scrollsX = ['auto', 'scroll'].includes(cs.overflowX);
      const scrollsY = ['auto', 'scroll'].includes(cs.overflowY);
      if ((overX && scrollsX) || (overY && scrollsY)) break;
      if ((overX && clipsX) || (overY && clipsY)) {
        seen.add(host);
        if (n === box || n === host) {
          const hostCs = getComputedStyle(host);
          const ellipsis = cs.textOverflow === 'ellipsis' || hostCs.textOverflow === 'ellipsis';
          const clamp = cs.webkitLineClamp !== 'none' || hostCs.webkitLineClamp !== 'none';
          record(ellipsis || clamp ? 'truncated' : 'clipped', host, `${quote(node)} cut by its own box`);
        } else {
          // Text cut by a container further out is one finding about the
          // container, however many texts it cuts.
          if (!cutBy.has(n)) cutBy.set(n, []);
          cutBy.get(n).push(quote(node));
        }
        break;
      }
      if (n === box && (overX || overY) && !clipsX && !clipsY) {
        seen.add(host);
        const by = overX ? `${Math.round(Math.max(t.right - padR, padL - t.left))}px wide` : `${Math.round(t.bottom - padB)}px low`;
        record('spill', host, `${quote(node)} runs ${by} out of its box`);
        break;
      }
    }
  }
  for (const [el, texts] of cutBy) {
    record('clipped', el, `cuts ${texts.length} text(s) inside it, e.g. ${texts.slice(0, 3).join(', ')}`);
  }

  /* overlap: controls, neither inside the other, covering the same area.
     Each is measured by the part of it left visible after every clipping
     ancestor, and anything under a fixed layer (the chat button, a
     drawer) is left out, since floating over the page is its job. */
  const visibleRect = (el) => {
    let { left, top, right, bottom } = el.getBoundingClientRect();
    for (let n = el.parentElement; n && !isRoot(n); n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.position === 'fixed') return null;
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const r = n.getBoundingClientRect();
      left = Math.max(left, r.left);
      top = Math.max(top, r.top);
      right = Math.min(right, r.right);
      bottom = Math.min(bottom, r.bottom);
    }
    return right - left > 2 && bottom - top > 2 ? { left, top, right, bottom } : null;
  };
  const controls = [
    ...document.body.querySelectorAll(
      'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="tab"], [role="link"], [role="checkbox"], [role="switch"], [role="menuitem"], [role="option"]',
    ),
  ]
    // An inline link that wraps has a bounding box spanning both lines, so
    // links in running prose are left out rather than reported as stacked.
    .filter((el) => {
      const cs = getComputedStyle(el);
      return shown(el) && !el.disabled && cs.position !== 'fixed' && cs.display !== 'inline';
    })
    .map((el) => ({ el, r: visibleRect(el) }))
    .filter(({ r }) => r);
  const area = (r) => (r.right - r.left) * (r.bottom - r.top);
  for (let i = 0; i < controls.length; i++) {
    for (let j = i + 1; j < controls.length; j++) {
      const a = controls[i];
      const b = controls[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w <= 0 || h <= 0) continue;
      const share = (w * h) / Math.min(area(a.r), area(b.r));
      if (share < 0.3) continue;
      record('overlap', a.el, `covers ${label(b.el)} (${Math.round(share * 100)}%)`);
    }
  }

  return out;
}

const SETTLE_MS = 250;

async function sweepRoute(context, origin, route, widths) {
  const page = await context.newPage();
  const found = [];
  try {
    await page.setViewportSize({ width: widths[0], height: VIEWPORT_HEIGHT });
    await page.goto(origin + route, { waitUntil: 'load', timeout: 45_000 });
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('data-theme-setting', 'light');
      return document.fonts.ready;
    });
    await page.waitForTimeout(SETTLE_MS * 2);
    for (const width of widths) {
      await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
      await page.waitForTimeout(SETTLE_MS);
      for (const f of await page.evaluate(inspect)) found.push({ ...f, route, width });
    }
  } catch (err) {
    found.push({ kind: 'error', label: 'page', path: '', detail: err.message.split('\n')[0], route, width: 0 });
  } finally {
    await page.close();
  }
  return found;
}

/**
 * Groups raw findings by kind and label, so one defect in shared chrome
 * reads as one line with the routes and widths it shows at, not hundreds.
 */
function group(findings) {
  const groups = new Map();
  for (const f of findings) {
    const key = `${f.kind}|${f.label}`;
    if (!groups.has(key)) groups.set(key, { kind: f.kind, label: f.label, detail: f.detail, routes: new Map(), first: f });
    const g = groups.get(key);
    if (!g.routes.has(f.route)) g.routes.set(f.route, new Set());
    g.routes.get(f.route).add(f.width);
    if (f.width < g.first.width) g.first = f;
  }
  const order = ['error', 'offscreen', 'clipped', 'spill', 'overlap', 'truncated'];
  return [...groups.values()]
    .map((g) => ({
      kind: g.kind,
      label: g.label,
      detail: g.detail,
      routes: [...g.routes].map(([route, ws]) => ({ route, widths: [...ws].sort((a, b) => a - b) })),
      example: { route: g.first.route, width: g.first.width, path: g.first.path },
    }))
    .sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || b.routes.length - a.routes.length);
}

async function shoot(browser, origin, groups, dir) {
  mkdirSync(dir, { recursive: true });
  const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'light' });
  const page = await context.newPage();
  let n = 0;
  for (const g of groups) {
    if (!g.example.path) continue;
    n += 1;
    const file = join(dir, `${String(n).padStart(3, '0')}-${g.kind}.png`);
    try {
      await page.setViewportSize({ width: g.example.width, height: VIEWPORT_HEIGHT });
      await page.goto(origin + g.example.route, { waitUntil: 'load', timeout: 45_000 });
      await page.waitForTimeout(SETTLE_MS * 2);
      const handle = await page.$(g.example.path);
      if (!handle) continue;
      await handle.evaluate((el) => {
        el.scrollIntoView({ block: 'center', inline: 'nearest' });
        el.style.outline = '2px solid red';
        el.style.outlineOffset = '1px';
      });
      await page.waitForTimeout(SETTLE_MS);
      await page.screenshot({ path: file });
      g.screenshot = file;
    } catch {
      /* the finding stands without its picture */
    }
  }
  await context.close();
}

async function main() {
  const widths = ladder();
  const only = list(option('routes'));
  const routes = staticSiteRoutes().filter((r) => !only || only.some((p) => r === p || r.startsWith(`${p}/`)));
  const concurrency = Number(option('concurrency') ?? 4);
  const server = option('origin') ? { origin: option('origin').replace(/\/$/, ''), stop: () => {} } : await startServer();
  const browser = await chromium.launch();
  const started = Date.now();
  console.log(`Sweeping ${routes.length} route(s) at ${widths.length} width(s): ${widths.join(', ')}`);
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: 'light' });
    const queue = [...routes];
    const findings = [];
    let done = 0;
    await Promise.all(
      Array.from({ length: concurrency }, async () => {
        for (let route = queue.shift(); route; route = queue.shift()) {
          findings.push(...(await sweepRoute(context, server.origin, route, widths)));
          done += 1;
          if (done % 20 === 0) console.log(`  ${done}/${routes.length}`);
        }
      }),
    );
    await context.close();

    const kept = findings.filter((f) => !accepted(f));
    const groups = group(kept);
    if (option('shots')) await shoot(browser, server.origin, groups, option('shots'));
    if (option('json')) writeFileSync(option('json'), JSON.stringify({ widths, routes: routes.length, groups }, null, 2));

    for (const g of groups) {
      const where = g.routes.length === 1 ? g.routes[0].route : `${g.routes.length} routes, e.g. ${g.routes[0].route}`;
      const ws = [...new Set(g.routes.flatMap((r) => r.widths))].sort((a, b) => a - b);
      console.log(`\n[${g.kind}] ${g.label}\n  ${g.detail}\n  ${where} at ${ws.join(', ')}${g.screenshot ? `\n  ${g.screenshot}` : ''}`);
    }
    const errors = groups.filter((g) => g.kind !== 'truncated');
    const accepts = findings.length - kept.length;
    console.log(
      `\n${errors.length} layout finding(s), ${groups.length - errors.length} truncation(s) to review${accepts ? `, ${accepts} accepted occurrence(s) skipped` : ''}, in ${Math.round((Date.now() - started) / 1000)}s.`,
    );
    process.exitCode = errors.length ? 1 : 0;
  } finally {
    await browser.close();
    server.stop();
  }
}

await main();
