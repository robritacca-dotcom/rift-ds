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

import { SITE_URL } from './brand.mjs';
import { assembleSearchSections, isMaintainerRoute } from './generate-site-search.mjs';
import { finish } from './lib/report.mjs';
import { holesIn, leaksIn } from './lib/screens.mjs';

const errors = [];
const fail = (message) => errors.push(message);

let sections = [];
try {
  sections = assembleSearchSections();
} catch (error) {
  fail(`generating the search index failed: ${error.message}`);
}

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
  for (const hole of holesIn(section.body)) {
    fail(`${where}: a dropped value left a hole: ${hole}. Resolve it in INLINE_VALUES in scripts/generate-site-corpus.mjs.`);
  }
  for (const leak of leaksIn(section.body)) {
    fail(`${where}: the index contains a ${leak.what} (${leak.shown}). It is served to any MCP client; remove it at the source.`);
  }
}

finish(
  '✗ Site search index validation failed:',
  errors,
  `✓ Site search index is current: ${sections.length} consumer sections, each with its URL.`
);
