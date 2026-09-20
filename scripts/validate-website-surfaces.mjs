#!/usr/bin/env node
/**
 * Validates that every public component in src/components/registry.json
 * is fully represented on the website and in design.md:
 *
 *   1. website/src/app/components/<slug>/page.tsx exists (showcase page)
 *   2. ComponentPreviews.tsx has a preview entry for the slug (both
 *      directions — every key in the map must be a registered slug too).
 *      The index grid and category pages map over the registry, so card
 *      presence there is structurally guaranteed; the preview map is the
 *      one hand-maintained surface left.
 *   3. design.md has a `### Heading` spec section for the component
 *
 * The sidebar nav entry and its alphabetical order used to be checked here.
 * componentsSidebarLinks is now DERIVED from the registry, so both are
 * structurally guaranteed — a registered component cannot be missing from the
 * nav, and the order is a sort() call rather than a hand-maintained list.
 * Checking them again would only assert that Array.prototype.sort works.
 *
 * This is the guard against the "registered but invisible" drift class
 * (AppLayout/EntityCard shipped for months with no page, nav entry, or
 * spec). Runs in the validate-registry chain before every build.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILES as BLUEPRINT_FILES, blueprintSlug } from './sync-blueprints.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const registry = JSON.parse(
  read(join(repoRoot, 'src', 'components', 'registry.json'))
);

const previewsSource = read(
  join(
    repoRoot,
    'website',
    'src',
    'components',
    'ComponentPreviews',
    'ComponentPreviews.tsx'
  )
);
const designMd = read(join(repoRoot, 'design.md'));

// Keys of the previews map — the `"<slug>": () => (` entries.
const previewKeys = new Set(
  [...previewsSource.matchAll(/^ {2}"([a-z0-9-]+)": \(\) => \(/gm)].map(
    ([, slug]) => slug
  )
);

/**
 * design.md spec headings, normalized. Shared headings split on "/" so
 * "### AppLayout / AppSidebar" and "### Input / Textarea" cover both
 * components; "### Contribution graph" normalizes to "contributiongraph".
 */
const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const specHeadings = new Set(
  [...designMd.matchAll(/^### (.+)$/gm)].flatMap(([, heading]) =>
    heading.split('/').map((part) => normalize(part))
  )
);

const missingPage = [];
const missingPreview = [];
const missingSpec = [];

// slug and label are stored in the registry, so a name-to-slug exception is
// data, not a special case each validator has to remember.
for (const { name, slug } of registry.components) {

  if (
    !existsSync(
      join(repoRoot, 'website', 'src', 'app', 'components', slug, 'page.tsx')
    )
  ) {
    missingPage.push(`${name} → website/src/app/components/${slug}/page.tsx`);
  }
  if (!previewKeys.has(slug)) {
    missingPreview.push(
      `${name} → "${slug}" entry in website/src/components/ComponentPreviews/ComponentPreviews.tsx`
    );
  }
  if (!specHeadings.has(normalize(name))) {
    missingSpec.push(`${name} → "### ${name}" section in design.md`);
  }
}

// Every folder under website/src/app/components must be a registered slug —
// an orphan folder is usually a rename that missed the registry, and it
// would ship as an unlisted page.
const knownSegments = new Set(registry.components.map((c) => c.slug));
const orphanFolders = readdirSync(
  join(repoRoot, 'website', 'src', 'app', 'components'),
  { withFileTypes: true }
)
  .filter((entry) => entry.isDirectory() && !knownSegments.has(entry.name))
  .map(
    (entry) =>
      `website/src/app/components/${entry.name} is neither a registered component slug nor a category id`
  );

let failed = false;
const fail = (msg) => {
  failed = true;
  console.error(`✗ ${msg}`);
};

// SECTION_OG_IMAGE_SEGMENTS in navigation.ts names the sections whose own
// opengraph-image.tsx is re-stated on every sub-page's Open Graph block (a
// segment that declares `openGraph` replaces the inherited images). Both
// directions are checked: a listed section must have the image file, and a
// section-level image file must be listed — otherwise sub-page share cards
// silently fall back to the root card.
const appDir = join(repoRoot, 'website', 'src', 'app');
const navSource = read(join(repoRoot, 'website', 'src', 'config', 'navigation.ts'));
const listMatch = navSource.match(
  /SECTION_OG_IMAGE_SEGMENTS\s*=\s*\[([^\]]*)\]/
);
const listedSegments = listMatch
  ? [...listMatch[1].matchAll(/"([^"]+)"/g)].map(([, s]) => s)
  : [];
const sectionsWithOgImage = readdirSync(appDir, { withFileTypes: true })
  .filter(
    (e) =>
      e.isDirectory() &&
      existsSync(join(appDir, e.name, 'opengraph-image.tsx')) &&
      // Sections only: a segment with sub-pages. Leaf pages (e.g. /overview)
      // declare metadata and the file image in the same segment, where the
      // file already wins — they don't need listing.
      readdirSync(join(appDir, e.name), { withFileTypes: true }).some(
        (c) => c.isDirectory() && existsSync(join(appDir, e.name, c.name, 'page.tsx'))
      )
  )
  .map((e) => `/${e.name}`);
const ogListStale = [
  ...listedSegments
    .filter((s) => !existsSync(join(appDir, s.slice(1), 'opengraph-image.tsx')))
    .map((s) => `${s} is listed but has no website/src/app${s}/opengraph-image.tsx`),
  ...sectionsWithOgImage
    .filter((s) => !listedSegments.includes(s))
    .map(
      (s) =>
        `${s} has a section opengraph-image.tsx but is missing from SECTION_OG_IMAGE_SEGMENTS in navigation.ts`
    ),
];

// Every spec synced to website/public needs a page to read it on, or it is
// published as a raw download nothing links to.
const missingBlueprintPage = BLUEPRINT_FILES.filter(
  (name) =>
    !existsSync(
      join(repoRoot, 'website', 'src', 'app', 'blueprints', blueprintSlug(name), 'page.tsx')
    )
).map((name) => `${name} → website/src/app/blueprints/${blueprintSlug(name)}/page.tsx`);

// The llms.txt route hand-lists a raw-markdown download per published spec.
// Both directions: every synced spec must be advertised, and every
// advertised root .md must be synced — an unsynced advert is a public link
// to a 404, the drift class that unpublishing a spec nearly created once and
// the reason this runs in both directions rather than one.
const llmsSource = read(
  join(repoRoot, 'website', 'src', 'app', 'llms.txt', 'route.ts')
);
const advertisedSpecs = [
  ...llmsSource.matchAll(/\$\{SITE_URL\}\/([\w-]+\.md)\b/g),
].map(([, f]) => f);
const llmsStale = [
  ...BLUEPRINT_FILES.filter((f) => !advertisedSpecs.includes(f)).map(
    (f) => `${f} is synced to website/public but not offered as a download in llms.txt`
  ),
  ...advertisedSpecs.filter((f) => !BLUEPRINT_FILES.includes(f)).map(
    (f) => `llms.txt advertises ${f}, which is not in sync-blueprints FILES — that link 404s`
  ),
];

// The semantic-colours page states it documents ALL colour tokens, and prints
// the count from TOKEN_COUNTS. Both halves have to stay true: a token added to
// the CSS lands in the registry (and so in the printed number) without adding
// itself to the page's hand-authored swatch arrays, which would silently turn
// the sentence into a lie. Checked in both directions.
const colourTokens = JSON.parse(
  read(join(repoRoot, 'src', 'tokens', 'registry.json'))
).categories.colour;
const swatchSource = read(
  join(appDir, 'foundations', 'colour-mode', 'page.tsx')
);
const documentedColours = new Set(
  [...swatchSource.matchAll(/(?:cssVar|bgVar|borderVar):\s*'(--color-[a-z0-9-]+)'|(?:cssVar|bgVar|borderVar):\s*"(--color-[a-z0-9-]+)"/g)]
    .map(([, single, double]) => single ?? double)
);
const colourSwatchDrift = [
  ...colourTokens.filter((t) => !documentedColours.has(t)).map(
    (t) => `${t} is in the token registry but has no swatch on /foundations/colour-mode`
  ),
  ...[...documentedColours].filter((t) => !colourTokens.includes(t)).map(
    (t) => `/foundations/colour-mode shows ${t}, which is not a registered colour token`
  ),
];

// Reverse direction: a preview entry for a slug the registry doesn't know is
// dead artwork — usually a rename that missed the map.
const registeredSlugs = new Set(registry.components.map((c) => c.slug));
const orphanPreviews = [...previewKeys]
  .filter((k) => !registeredSlugs.has(k))
  .map((k) => `"${k}" in ComponentPreviews.tsx is not a registered component slug`);

for (const [what, list] of [
  ['Registry components with no website showcase page', missingPage],
  ['Registry components missing a ComponentPreviews entry', missingPreview],
  ['Preview entries with no registry component', orphanPreviews],
  ['Registry components with no design.md spec section', missingSpec],
  ['Folders under website/src/app/components with no registry entry', orphanFolders],
  ['Blueprint specs synced to website/public with no page to read them on', missingBlueprintPage],
  ['llms.txt spec downloads out of sync with sync-blueprints FILES', llmsStale],
  ['SECTION_OG_IMAGE_SEGMENTS out of sync with section opengraph-image files', ogListStale],
  ['Semantic colours page out of sync with the colour token registry', colourSwatchDrift],
]) {
  if (list.length > 0) {
    fail(`${what}:\n` + list.map((l) => `    - ${l}`).join('\n'));
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `✓ Website surfaces in sync — ${registry.components.length} components each have ` +
    `a page, preview entry, and design.md spec, and ${BLUEPRINT_FILES.length} blueprint specs ` +
    `each have a page (the nav entry and its ordering are derived from the registry, ` +
    `so they cannot drift), and all ${colourTokens.length} colour tokens have a swatch ` +
    `on /foundations/colour-mode.`
);
