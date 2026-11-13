#!/usr/bin/env node
/**
 * validate-site-search.mjs
 *
 * Guards website/src/data/site-search.generated.ts, the index the MCP
 * endpoint's search_site tool serves to any agent that asks. Four checks:
 *
 *   1. Freshness: regenerates in memory and byte-compares against disk, so a
 *      page or spec edit cannot land without the regenerated index.
 *
 *   2. Every section can be cited: an absolute URL on the site, a heading
 *      and a body. A section with no URL once left an agent unable to say
 *      where a rule came from.
 *
 *   3. Consumer documentation only: no section comes from a source in
 *      MAINTAINER_SOURCES (generate-site-search.mjs owns the list and the
 *      reasons). Search once answered "Button tone" with the repository's
 *      own maintenance rules.
 *
 *   4. No holes and no leaks: the corpus validator's two screens, on this
 *      text. A dropped inline value ("save it at your project root as .")
 *      and a local path, analytics id, key or address all fail.
 *
 * Runs before every build via the validate-registry chain, after the
 * corpus validator, whose generator this index reads through.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE_URL } from './brand.mjs';
import {
  assembleSearchSections,
  buildSiteSearchFile,
  isMaintainerRoute,
  outputPath,
} from './generate-site-search.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const relative = (path) => path.replace(repoRoot + '/', '');

const errors = [];
const fail = (message) => errors.push(message);

let sections = [];
try {
  sections = assembleSearchSections();
  // Normalize CRLF so Windows checkouts validate identically to CI.
  const onDisk = existsSync(outputPath) ? readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n') : null;
  if (onDisk === null) {
    fail(`${relative(outputPath)} is missing. Run \`node scripts/generate-site-search.mjs\` and commit the result.`);
  } else if (onDisk !== buildSiteSearchFile()) {
    fail(`${relative(outputPath)} is stale. Run \`node scripts/generate-site-search.mjs\` and commit the result.`);
  }
} catch (error) {
  fail(`generating the search index failed: ${error.message}`);
}

const holes = [/[\w)\]`'"’] [,.;:](?=\s|$)/g, /: [,.;](?=\s|$)/g];
const leaks = [
  [/\/Users\/[A-Za-z]/g, 'local absolute path (/Users/…)'],
  [/property[\s_-]?(?:id)?\W{0,3}\d{6,}/gi, 'GA property id'],
  [/sk-ant-[A-Za-z0-9-]/g, 'Anthropic API key'],
  [/\b[A-Za-z0-9._%+-]+@(?!example\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, 'email address'],
];

for (const section of sections) {
  const where = `${section.url} (${section.heading})`;
  // 2. Citable.
  if (!section.url?.startsWith(`${SITE_URL}/`)) fail(`${where}: the section's URL is not an absolute URL on ${SITE_URL}.`);
  if (!section.heading?.trim()) fail(`${where}: the section has no heading.`);
  if (!section.body?.trim()) fail(`${where}: the section has no body.`);
  // 3. Consumer only.
  const route = section.url.slice(SITE_URL.length) || '/';
  if (isMaintainerRoute(route)) {
    fail(`${where}: the section comes from a maintainer source. MAINTAINER_SOURCES in scripts/generate-site-search.mjs keeps it out of the MCP's search.`);
  }
  // 4. Holes and leaks.
  for (const pattern of holes) {
    for (const match of section.body.matchAll(pattern)) {
      fail(
        `${where}: a dropped value left a hole: ${JSON.stringify(section.body.slice(Math.max(0, match.index - 50), match.index + 10))}. ` +
          `Resolve it in INLINE_VALUES in scripts/generate-site-corpus.mjs.`
      );
    }
  }
  for (const [pattern, what] of leaks) {
    for (const match of section.body.matchAll(pattern)) {
      fail(`${where}: the index contains a ${what} (${JSON.stringify(match[0].slice(0, 40))}). It is served to any MCP client; remove it at the source.`);
    }
  }
}

if (errors.length > 0) {
  console.error('\n✗ Site search index validation failed:\n');
  for (const error of errors) console.error(`  - ${error}\n`);
  process.exit(1);
}

console.log(`✓ Site search index is current: ${sections.length} consumer sections, each with its URL.`);
