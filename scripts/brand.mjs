#!/usr/bin/env node
/**
 * BRAND — the single source of truth for every brand fact.
 *
 * The whole point of this module is rename day: when a name changes,
 * this file (plus the mark component) is the edit, and everything else —
 * the package manifest, the generated TS module the website reads, the
 * README regions, the agent skills, the MCP server name, the init bin —
 * follows through generators and validators. The move off the
 * "Dragonspine" codename to Rift DS was one commit here, which is the
 * proof the arrangement works.
 *
 * Nothing outside this file may restate a value that lives here: scripts
 * import it directly; website code reads the generated mirror
 * (website/src/config/brand.generated.ts, written by
 * scripts/generate-brand-module.mjs and byte-held by
 * scripts/validate-brand-module.mjs).
 */

/** The product name, as prose and titles print it. */
export const BRAND_NAME = 'Rift DS';

/** The short form: wordmarks, the library's own logo defaults. */
export const BRAND_SHORT = 'Rift';

/** The site chat's public name — the FAB, the palette's ask row. */
export const ASSISTANT_NAME = 'Rift AI';

/**
 * The person who designed and built the system. The footer credits them
 * and the structured data names them as the author of both schema nodes;
 * nothing else may restate either value. AUTHOR_URL is the personal site,
 * deliberately a different host from SITE_URL: robertritacca.com was this
 * project's home until the 2026-09-26 move, and it is now the portfolio
 * the credit points at, which is why it is not a RETIRED_HOST.
 */
export const AUTHOR_NAME = 'Robert Ritacca';
export const AUTHOR_URL = 'https://robertritacca.com';

/**
 * The published npm package. Also the specifier every import in this
 * repo uses (the workspace consumes the real package name). Renaming it
 * is mechanised: edit this constant, move the old name into
 * RETIRED_PACKAGE_NAMES below, run `node scripts/rename-package.mjs`
 * (rewrites every import and manifest key from the old name to this
 * one), then `npm install` to re-link the workspace and refresh the
 * lockfile. validate-package-exports fails the build between the edit
 * and the sweep, so the two can never ship apart.
 */
export const PACKAGE_NAME = 'rift-ds';

/**
 * Names this package used to have. A build fails while any of them
 * survives anywhere in source (validate-package-exports scans for
 * them), so a rename can leave no straggler imports or stale install
 * snippets. Append, never remove.
 */
export const RETIRED_PACKAGE_NAMES = ['@robr0/design-system'];

/**
 * The deployed site's origin. Baked into the sitemap, canonicals, OG
 * urls, llms.txt, the corpus, and the init bin at build time — point it
 * at the real deployment before any `build:lib`.
 */
export const SITE_URL = 'https://rift-ds.com';

/** The source repository. */
export const REPOSITORY_URL = 'https://github.com/robritacca-dotcom/rift-ds';

/** The deployed Storybook (its own Vercel project, built from main). */
export const STORYBOOK_URL = 'https://storybook.rift-ds.com';

/**
 * Hosts this project used to live on. The package name has had
 * RETIRED_PACKAGE_NAMES guarding it since rename day; a domain had
 * nothing, which is how the 2026-09-26 move found eight hand-written
 * `dragonspine-delta.vercel.app` links sitting in README.md — a file
 * that ships inside the npm tarball, so every one of them would have
 * reached a consumer pointing at a host this project had left.
 *
 * A build fails while any of these appears in source (the scan in
 * validate-package-exports.mjs), so a URL written from memory cannot
 * ship. Entries are bare hosts, never schemes: the Vercel PROJECT is
 * still named `dragonspine`, and CLAUDE.md says so truthfully.
 * Append, never remove.
 */
export const RETIRED_HOSTS = [
  'dragonspine-delta.vercel.app',
  'dragonspine-storybook.vercel.app',
  'dragonspine.vercel.app',
];

/** The npm package page, derived — never restated. */
export const NPM_URL = `https://www.npmjs.com/package/${PACKAGE_NAME}`;

/**
 * The Figma origin. This is the real design file the system was drawn
 * from, so it survives the codename: it is provenance, not branding.
 */
export const FIGMA_URL = 'https://www.figma.com/@robr0';

/**
 * The design file every figmaUrl deep link appends its node-id to. The
 * file KEY is the stable part (Figma redirects on the name slug, so the
 * links keep working whatever the file is called); keeping the base
 * here means a renamed file is still a one-line change.
 */
export const FIGMA_FILE_URL = 'https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/Rift';

/** Browser-tab title suffix and og:site_name. */
export const TITLE_SUFFIX = BRAND_NAME;

/**
 * GA4 measurement id for the rift-ds.com property (created 2026-10-08).
 * Public by design: it is visible in every page's source. Emptying it
 * short-circuits the analytics snippet entirely, which is the off switch.
 */
export const GA_ID = 'G-Y279CKE2RL';

/** The MCP server's advertised name (client configs, serverInfo). */
export const MCP_SERVER_NAME = 'rift-ds';

/**
 * The library skill's folder name: the consumer agent skill that teaches
 * the package itself. It is the skill `npx <pkg> init --out <dir>` writes
 * (the flag predates the other skills), which is why it keeps a constant
 * of its own beside the table below.
 */
export const SKILL_NAME = 'rift-design-system';

/**
 * Every consumer agent skill the site publishes under /skill/<name>/ and
 * `npx <pkg> init` installs under .claude/skills/<name>/, in install
 * order. The folder names are brand facts, so they live here; `role`
 * binds each row to its builder in scripts/generate-agent-skill.mjs,
 * which fails generation on a row with no builder or a builder with no
 * row. Which files a skill holds is the generator's to say, and
 * /skill/manifest.json is where everything else (the init bin, the
 * website) reads the answer.
 */
export const AGENT_SKILLS = [
  { role: 'library', name: SKILL_NAME },
  { role: 'apply-theme', name: 'rift-apply-theme' },
  { role: 'style-audit', name: 'rift-style-audit' },
];

/** The package's bin name (the `npx` entry). */
export const BIN_NAME = 'rift-ds';
