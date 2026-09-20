#!/usr/bin/env node
/**
 * check-external-links.mjs
 *
 * Probes every external link the built site renders and reports the ones
 * that no longer resolve. `validate-internal-links.mjs` proves internal
 * hrefs can never break; the outside world gets no such guarantee — a
 * profile moves, a referenced article is taken down, a product page dies —
 * and nothing in the build would ever notice. This script is the link-rot
 * loop's instrument (`.claude/skills/link-rot`), run monthly against a
 * fresh website build.
 *
 * Deliberately NOT part of `verify` or CI: it needs the network, its
 * results depend on the outside world's mood (timeouts, rate limits,
 * bot-blockers), and a dead external link is news from outside, not a
 * defect in the change being built. A flaky red build teaches people to
 * ignore red builds.
 *
 * Exit 1 when any probed link fails, so the loop can branch on it — but a
 * failure here is a LEAD, not a verdict. The loop verifies each one by
 * hand (browser UA, real browser) before calling it rot: plenty of hosts
 * answer scripts with 403/429 while serving browsers fine. Hosts already
 * known to do that live in KNOWN_BLOCKERS with a written reason; their
 * links are listed for manual checking instead of probed, and the link-rot
 * skill maintains the list as new offenders are confirmed.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const appHtmlDir = join(repoRoot, 'website', '.next', 'server', 'app');

if (!existsSync(appHtmlDir)) {
  console.error('check-external-links: website/.next/server/app missing — run the website build first.');
  process.exit(1);
}

/**
 * Hosts that reject non-browser clients regardless of the link's health.
 * Each entry needs a reason a stranger could audit; the link-rot loop adds
 * a host only after confirming the link works in a real browser while the
 * probe fails.
 */
const KNOWN_BLOCKERS = new Map([
  ['www.linkedin.com', 'answers HTTP 999 to anything without a full browser fingerprint'],
  ['x.com', 'requires JavaScript; plain HTTP clients get blocked or redirected to a challenge'],
  ['twitter.com', 'same challenge wall as x.com, reached via the legacy domain'],
]);

/**
 * RFC 2606 reserved documentation domains. The component showcase pages use
 * them as placeholder hrefs in demos (SourceChip, SourceTrail, ChatMessage…)
 * precisely because they are guaranteed never to be real destinations —
 * probing them reports designed-in 404s as rot.
 */
const DEMO_DOMAINS = /(^|\.)example\.(com|org|net)$/;

const SELF_ORIGINS = /^https?:\/\/(www\.)?robertritacca\.com/;
const TIMEOUT_MS = 10_000;
const CONCURRENCY = 8;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 (robertritacca.com link check)';

const walk = (dir, filter) => {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, filter));
    else if (filter(entry.name)) out.push(full);
  }
  return out;
};

/* ---- Collect every external href, with the pages that render it ---- */

const links = new Map(); // url -> Set of pages
for (const file of walk(appHtmlDir, (n) => n.endsWith('.html'))) {
  const page = '/' + relative(appHtmlDir, file).split(sep).join('/').replace(/\.html$/, '');
  // Normalize CRLF so Windows checkouts scan identically.
  const html = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  for (const m of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const url = m[1].replace(/&amp;/g, '&');
    if (SELF_ORIGINS.test(url)) continue;
    if (DEMO_DOMAINS.test(new URL(url).hostname)) continue;
    if (!links.has(url)) links.set(url, new Set());
    links.get(url).add(page === '/index' ? '/' : page);
  }
}

/* ---- Probe each one ---- */

async function probe(url) {
  const attempt = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': USER_AGENT, accept: '*/*' },
      });
      return { status: res.status };
    } catch (error) {
      return { error: error.name === 'AbortError' ? 'timeout' : String(error.cause ?? error.message) };
    } finally {
      clearTimeout(timer);
    }
  };

  let result = await attempt('HEAD');
  // Some servers refuse HEAD on healthy pages; a GET settles it.
  if (result.error || result.status >= 400) result = await attempt('GET');
  return result;
}

const urls = [...links.keys()].sort();
const blocked = urls.filter((u) => KNOWN_BLOCKERS.has(new URL(u).hostname));
const probable = urls.filter((u) => !KNOWN_BLOCKERS.has(new URL(u).hostname));

const results = new Map(); // url -> {status} | {error}
let cursor = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < probable.length) {
      const url = probable[cursor++];
      results.set(url, await probe(url));
    }
  }),
);

/* ---- Report ---- */

const dead = probable.filter((u) => {
  const r = results.get(u);
  return r.error || r.status >= 400;
});

const pagesOf = (url) => [...links.get(url)].slice(0, 4).join(', ');

if (blocked.length > 0) {
  console.log(`⚠ ${blocked.length} link(s) on known bot-blocking hosts — check these in a real browser:`);
  for (const url of blocked) {
    console.log(`  ${url} (${KNOWN_BLOCKERS.get(new URL(url).hostname)})\n    linked from: ${pagesOf(url)}`);
  }
}

if (dead.length > 0) {
  console.error(`✗ ${dead.length} of ${probable.length} probed external link(s) failed — verify each by hand before treating it as rot:`);
  for (const url of dead) {
    const r = results.get(url);
    console.error(`  ${url} — ${r.error ?? `HTTP ${r.status}`}\n    linked from: ${pagesOf(url)}`);
  }
  process.exit(1);
}
console.log(`✓ External links resolve — ${probable.length} probed OK (${links.size} unique external links across the prerendered pages).`);
