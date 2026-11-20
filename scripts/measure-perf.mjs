#!/usr/bin/env node
/**
 * measure-perf.mjs
 *
 * Times a first visit to a fixed set of pages of the built website in a
 * real browser, so a performance change has a before and an after. The
 * route budget (validate-route-budget.mjs) holds bytes, which a build can
 * count exactly; this measures what those bytes cost a visitor, which only
 * a browser can say.
 *
 * Per route and profile, the median of several cold loads (a fresh
 * browser context each, so nothing is cached):
 *   fcp        first contentful paint, ms
 *   lcp        largest contentful paint, ms
 *   blocked    long-task time past 50 ms each, summed over load and the
 *              settle window: how long the page could not answer a press
 *   transfer   bytes over the wire, in total and by kind (script, style,
 *              font, image, document, other)
 *   requests   how many responses that took
 *
 * Two profiles: `desktop` (no throttling) and `phone` (a phone viewport,
 * the CPU slowed four times and a fast-4G link), since most of what this
 * work targets only shows on the second.
 *
 * A measuring tool, never a gate: timings move with the machine and its
 * load, so nothing here fails a build, and it is in neither `verify` nor
 * CI. Compare runs taken on the same machine, close together. The
 * `perf-audit` skill is its caller.
 *
 * Usage:
 *   node scripts/measure-perf.mjs [options]
 *     --origin <url>      measure a running site instead of booting the build
 *     --routes <a,b,...>  measure only these routes
 *     --runs <n>          cold loads per route and profile (default 3)
 *     --json <file>       write the medians as JSON
 *     --compare <file>    print each figure beside the one in an earlier --json file
 */
/* global window -- the init script runs in the browser */
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { SMOKE_ROUTES, startServer } from './served-site.mjs';

const args = process.argv.slice(2);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};

const ROUTES = option('routes')?.split(',').map((s) => s.trim()).filter(Boolean) ?? [
  ...new Set([...SMOKE_ROUTES, '/components', '/playground', '/skills', '/graph', '/privacy']),
];
const RUNS = Number(option('runs') ?? 3);
/** After `load`, late work (fonts, deferred chunks, the first frames) is still landing. */
const SETTLE_MS = 3000;
const PROFILES = [
  { name: 'desktop', context: { viewport: { width: 1440, height: 900 } } },
  {
    name: 'phone',
    context: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    cpu: 4,
    // Fast 4G as Chrome's own preset has it: 9 Mbps down, 1.5 Mbps up, 165 ms.
    network: { offline: false, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8, latency: 165 },
  },
];
const KINDS = { Script: 'script', Stylesheet: 'style', Font: 'font', Image: 'image', Document: 'document' };

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

async function load(browser, origin, route, profile) {
  const context = await browser.newContext(profile.context);
  await context.addInitScript(() => {
    window.__perf = { lcp: 0, blocked: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__perf.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__perf.blocked += Math.max(0, entry.duration - 50);
    }).observe({ type: 'longtask', buffered: true });
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  if (profile.cpu) await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
  if (profile.network) await cdp.send('Network.emulateNetworkConditions', profile.network);

  const kinds = new Map();
  const bytes = { total: 0, script: 0, style: 0, font: 0, image: 0, document: 0, other: 0 };
  let requests = 0;
  cdp.on('Network.responseReceived', (event) => kinds.set(event.requestId, KINDS[event.type] ?? 'other'));
  cdp.on('Network.loadingFinished', (event) => {
    requests += 1;
    bytes.total += event.encodedDataLength;
    bytes[kinds.get(event.requestId) ?? 'other'] += event.encodedDataLength;
  });

  await page.goto(origin + route, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForTimeout(SETTLE_MS);
  const timing = await page.evaluate(() => ({
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0,
    lcp: window.__perf.lcp,
    blocked: window.__perf.blocked,
  }));
  await context.close();
  return { ...timing, requests, ...Object.fromEntries(Object.entries(bytes).map(([kind, value]) => [`bytes_${kind}`, value])) };
}

const external = option('origin');
const server = external ? { origin: external.replace(/\/$/, ''), stop: () => {} } : await startServer();
const browser = await chromium.launch();
const results = {};
try {
  for (const route of ROUTES) {
    for (const profile of PROFILES) {
      const runs = [];
      // Said as it goes: a full run takes minutes and prints its table last.
      process.stderr.write(`measuring ${route} [${profile.name}]\n`);
      for (let i = 0; i < RUNS; i += 1) runs.push(await load(browser, server.origin, route, profile));
      results[`${route} [${profile.name}]`] = Object.fromEntries(
        Object.keys(runs[0]).map((key) => [key, Math.round(median(runs.map((run) => run[key])))])
      );
    }
  }
} finally {
  await browser.close();
  server.stop();
}

const before = option('compare') ? JSON.parse(readFileSync(option('compare'), 'utf8')) : null;
const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
const COLUMNS = [
  ['fcp', (v) => `${v} ms`],
  ['lcp', (v) => `${v} ms`],
  ['blocked', (v) => `${v} ms`],
  ['bytes_total', kb],
  ['bytes_script', kb],
  ['bytes_style', kb],
  ['bytes_font', kb],
  ['bytes_image', kb],
  ['requests', (v) => String(v)],
];
for (const [name, row] of Object.entries(results)) {
  console.log(`\n${name}`);
  for (const [key, show] of COLUMNS) {
    const was = before?.[name]?.[key];
    const change = was === undefined || was === 0 ? '' : `  (was ${show(was)}, ${row[key] >= was ? '+' : ''}${Math.round(((row[key] - was) / was) * 100)}%)`;
    console.log(`  ${key.replace('bytes_', '').padEnd(9)} ${show(row[key]).padStart(10)}${change}`);
  }
}
if (option('json')) {
  writeFileSync(option('json'), `${JSON.stringify(results, null, 2)}\n`);
  console.log(`\nWrote ${option('json')}`);
}
