#!/usr/bin/env node
/**
 * The site's analytics events have one home: `website/src/lib/analytics.ts`.
 *
 * Its `SITE_EVENTS` table names the events the site sends on its own (the
 * actions that mean a visitor is taking the system rather than reading about
 * it), and its `trackEvent` is the only way they reach Google Analytics. A
 * call site passes a member of the table, so a rename reaches every caller or
 * fails here; a member nobody calls is a chart in GA that will never move;
 * and a second path to `gtag` would be a second vocabulary nothing checks.
 * /privacy discloses what is counted, so it must name the four actions too.
 *
 * Checks:
 *  - `gtag(` and `dataLayer` appear under website/src only in the root
 *    layout (the snippet) and the analytics module (the one caller)
 *  - every `trackEvent(` call outside the module passes `SITE_EVENTS.<key>`
 *    as its first argument, with `<key>` a member of the table
 *  - every member of the table has at least one call site
 *  - the privacy page's analytics section names each of the four actions
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(repoRoot, 'website', 'src');
const moduleRel = 'website/src/lib/analytics.ts';
const layoutRel = 'website/src/app/layout.tsx';
const privacyRel = 'website/src/app/privacy/page.tsx';

/* Normalize CRLF so Windows checkouts validate identically to CI. */
const read = (rel) => readFileSync(join(repoRoot, rel), 'utf8').replace(/\r\n/g, '\n');

const errors = [];

const files = readdirSync(srcDir, { withFileTypes: true, recursive: true })
  .filter((e) => e.isFile() && /\.(ts|tsx)$/.test(e.name) && !/\.generated\.ts$/.test(e.name))
  .map((e) => relative(repoRoot, join(e.parentPath ?? e.path, e.name)).replace(/\\/g, '/'));

/* ── 1. The table ───────────────────────────────────────────────────────── */
const moduleSource = read(moduleRel);
const tableMatch = moduleSource.match(/export const SITE_EVENTS = \{([\s\S]*?)\} as const;/);
if (!tableMatch) {
  console.error(`✗ ${moduleRel} no longer declares \`export const SITE_EVENTS = { … } as const\``);
  process.exit(1);
}
const keys = [...tableMatch[1].matchAll(/^\s*(\w+):\s*"([a-z_]+)",?$/gm)].map(([, key, name]) => ({ key, name }));
if (keys.length === 0) errors.push(`${moduleRel} — SITE_EVENTS is empty`);
const names = keys.map((k) => k.name);
for (const name of names) {
  if (names.indexOf(name) !== names.lastIndexOf(name)) errors.push(`${moduleRel} — event name "${name}" appears twice`);
}

/* ── 2. One path to gtag ────────────────────────────────────────────────── */
const uses = new Map(keys.map((k) => [k.key, []]));
for (const file of files) {
  const source = read(file);
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[ \t]*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

  if (file !== moduleRel && file !== layoutRel && /\bgtag\(|\bdataLayer\b/.test(code)) {
    errors.push(
      `${file} — reaches gtag or the dataLayer directly. The layout owns the snippet and ` +
        `${moduleRel} owns every call; import trackEvent from it instead.`
    );
  }
  if (file === moduleRel) continue;

  /* ── 3. Every call passes a member of the table ───────────────────────── */
  for (const match of code.matchAll(/\btrackEvent\(\s*([^,)]+)/g)) {
    const arg = match[1].trim();
    const member = arg.match(/^SITE_EVENTS\.(\w+)$/);
    if (!member) {
      errors.push(`${file} — trackEvent(${arg}, …) must pass SITE_EVENTS.<key>, not an expression or a string`);
      continue;
    }
    if (!uses.has(member[1])) {
      errors.push(`${file} — trackEvent(SITE_EVENTS.${member[1]}) names a key the table does not hold`);
      continue;
    }
    uses.get(member[1]).push(file);
  }
}

/* ── 4. Every member has a caller ───────────────────────────────────────── */
for (const [key, callers] of uses) {
  if (callers.length === 0) {
    errors.push(`${moduleRel} — SITE_EVENTS.${key} has no call site; a chart nothing feeds. Wire it or drop it.`);
  }
}

/* ── 5. The privacy page names the four actions ─────────────────────────── */
const privacy = read(privacyRel).replace(/&apos;/g, "'").replace(/\s+/g, ' ');
for (const phrase of ['install snippet', 'agent starter', "component's markdown", 'opening the chat']) {
  if (!privacy.includes(phrase)) {
    errors.push(`${privacyRel} — the Analytics section no longer says "${phrase}"; /privacy discloses every event the site sends`);
  }
}

if (errors.length > 0) {
  console.error('✗ validate-analytics-events found problems:\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error('');
  process.exit(1);
}

const total = [...uses.values()].reduce((n, callers) => n + callers.length, 0);
console.log(`✓ validate-analytics-events: ${keys.length} events, ${total} call sites, one path to gtag`);
