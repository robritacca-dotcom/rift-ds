#!/usr/bin/env node
/**
 * generate-site-search.mjs
 *
 * Builds website/src/data/site-search.generated.ts, the index the MCP
 * endpoint's search_site tool reads: the site's consumer documentation cut
 * into sections, each carrying the absolute URL it is published at, its
 * page's title and its heading. The site chat does not read this file; it
 * reads the whole corpus (generate-site-corpus.mjs), which this reuses page
 * by page, so the two cannot describe a page differently.
 *
 * Why a separate index rather than splitting the corpus at search time:
 *
 *   1. Audience. The corpus is for a visitor asking the site about itself,
 *      so it carries how the repository is maintained (CLAUDE.md), the
 *      owner's writing rules (content-design.md), the repo's own agent
 *      skills and loops. An agent building with the package is served the
 *      package's documentation instead, and those maintainer sources are
 *      left out here by construction (MAINTAINER_SOURCES says which and
 *      why). They are public, so this is about relevance, not secrecy.
 *
 *   2. Citations. Every section carries its URL. Splitting the corpus at
 *      its headings lost the page a subsection belonged to (the "Light /
 *      Dark Theme Contract" came back with no path at all).
 *
 *   3. Budget. The corpus condenses design.md to fit a model's context;
 *      search has no such limit, so it indexes the whole published spec,
 *      component sections included, and a query about one component finds
 *      that component's spec.
 *
 * Releases carry their date, so a query about the latest release can be
 * answered with the newest entry (website/src/lib/site-tools.ts owns the
 * ranking).
 *
 * Deterministic and public-only, by the same rules as the corpus, and held
 * by validate-site-search.mjs. Runs via the validate-registry chain and the
 * website's predev/prebuild, after the corpus; never edit the output.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { assembleAgentStarter } from './generate-agent-skill.mjs';
import { AGENT_STARTER_FILE, SITE_URL } from './brand.mjs';
import { pageProse, sectionSiteMap, sitePageBodies } from './generate-site-corpus.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

export const outputPath = join(repoRoot, 'website', 'src', 'data', 'site-search.generated.ts');

// Normalize CRLF so Windows checkouts generate byte-identical output to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

/**
 * The corpus sources this index leaves out, each a route the corpus reads,
 * with why it is for a maintainer rather than someone building with the
 * package. validate-site-search.mjs fails on a section from any of them.
 */
export const MAINTAINER_SOURCES = new Map([
  ['/blueprints/claude', 'CLAUDE.md, how this repository is maintained: its registries, validators and release process'],
  ['/blueprints/content-design', "content-design.md, the owner's rules for writing the site's own copy"],
  ['/skills', "the repository's own agent skills, the procedures that build this site"],
  ['/loops', "the scheduled loops that maintain this site"],
]);

/** True for a route under one of the maintainer sources. */
export const isMaintainerRoute = (route) =>
  [...MAINTAINER_SOURCES.keys()].some((source) => route === source || route.startsWith(`${source}/`));

const url = (path) => `${SITE_URL}${path}`;

/**
 * A markdown document cut at its headings (## to ####), skipping lines in
 * fenced code. Each section's heading is its trail from the top
 * ("Colour › Light / Dark Theme Contract"), so a hit names where it sits.
 */
function markdownSections(markdown, base) {
  const sections = [];
  const trail = [];
  let current = null;
  let fenced = false;
  const close = () => {
    if (current && current.lines.join('\n').trim()) {
      sections.push({ ...base, heading: current.heading, body: current.lines.join('\n').trim() });
    }
  };
  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    const match = !fenced && line.match(/^(#{1,4}) (.+)$/);
    if (match) {
      close();
      const level = match[1].length;
      trail.length = Math.max(0, level - 2);
      trail[level - 2] = match[2].trim();
      current = { heading: trail.filter(Boolean).join(' › ') || base.title, lines: [] };
    } else {
      if (!current) current = { heading: base.title, lines: [] };
      current.lines.push(line);
    }
  }
  close();
  return sections;
}

/** Every consumer section, in a stable order. */
export function assembleSearchSections() {
  const sections = [];

  // The site map: every page, so "where is X documented" has an answer.
  sections.push(
    ...markdownSections(sectionSiteMap().replace(/^## Site map\n/, ''), {
      url: url('/'),
      title: 'Site map',
    })
  );

  // The pages, one section each, minus the maintainer ones.
  for (const { route, body } of sitePageBodies()) {
    if (isMaintainerRoute(route)) continue;
    sections.push({ url: url(route === '/' ? '/' : route), title: route, heading: route, body });
  }

  // The agent starter, and the whole design specification.
  sections.push(
    ...markdownSections(assembleAgentStarter(), {
      url: url(`/${AGENT_STARTER_FILE}`),
      title: AGENT_STARTER_FILE,
    })
  );
  sections.push(
    ...markdownSections(read(join(repoRoot, 'design.md')), {
      url: url('/blueprints/design'),
      title: 'design.md',
    })
  );

  // The component library: the overview prose, then one section a category.
  const registry = JSON.parse(read(join(repoRoot, 'src', 'components', 'registry.json')));
  const overview = pageProse('components');
  if (overview) {
    sections.push({ url: url('/components'), title: 'Components', heading: 'Components', body: overview });
  }
  for (const category of registry.categories) {
    const lines = registry.components
      .filter((component) => component.category === category.id)
      .map((component) => `- ${component.label} (${url(`/components/${component.slug}`)}): ${component.description}`);
    sections.push({
      url: url('/components'),
      title: 'Components',
      heading: `Components › ${category.label}`,
      body: `${category.description}\n\n${lines.join('\n')}`,
    });
  }

  // The release log, one section a version, newest first, dated.
  const log = JSON.parse(read(join(repoRoot, 'website', 'src', 'data', 'release-log.json')));
  for (const entry of log.releases) {
    sections.push({
      url: url('/releases'),
      title: 'Release log',
      heading: `${entry.version}: ${entry.title}`,
      body: entry.body.join('\n\n'),
      date: entry.date,
    });
  }

  return sections;
}

export function buildSiteSearchFile() {
  const sections = assembleSearchSections();
  return `// AUTO-GENERATED — do not edit by hand.
// Source of truth: the published pages, the agent starter, design.md, the
// component registry and the release log, read through generate-site-corpus.mjs.
// Regenerate: node scripts/generate-site-search.mjs (runs via predev/prebuild).

/** One searchable section of the consumer documentation. */
export interface SiteSearchSection {
  /** The absolute URL the section is published at. */
  url: string;
  /** The page or document it belongs to. */
  title: string;
  /** Its heading, with the headings above it ("Colour › Light / Dark Theme Contract"). */
  heading: string;
  body: string;
  /** A release entry's publish date (YYYY-MM-DD). */
  date?: string;
}

/** The index search_site reads, consumer documentation only. */
export const siteSearchSections: readonly SiteSearchSection[] = ${JSON.stringify(sections, null, 2)};
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(outputPath, buildSiteSearchFile());
  console.log(`✓ Generated ${outputPath.replace(repoRoot + '/', '')}`);
}
