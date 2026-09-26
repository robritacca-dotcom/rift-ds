/**
 * capture-readme-banner.mjs
 *
 * Re-shoots `.github/readme-banner.jpg`, the image at the top of README.md.
 *
 * This exists because the banner is the one surface in the repo that states
 * facts without a generator behind it. On 2026-09-26 the committed banner
 * still showed the old codename wordmark, an install line naming the retired
 * scoped package (RETIRED_PACKAGE_NAMES in brand.mjs is its only home), 132
 * components and 8 themes: a brand, a package name and two counts that had
 * all moved, frozen in a screenshot no validator could see. README.md ships
 * inside the npm tarball and npm rewrites relative image paths against the
 * repository field, so that image heads the package page — the most-read
 * surface the project has, saying four wrong things at once.
 *
 * A screenshot cannot be byte-compared against a generator, so this is not a
 * build step and never will be. It is a deliberate by-hand refresh, the same
 * arrangement as sync-preset-fonts.mjs and sync-worldmap-land.mjs: run it
 * whenever the hero changes what it says, and commit the result.
 *
 *   node scripts/capture-readme-banner.mjs            # shoots SITE_URL
 *   node scripts/capture-readme-banner.mjs <origin>   # shoots somewhere else
 *
 * The second form is for shooting a deploy before its domain resolves, or a
 * local `next start`. The origin is never written to a file, only read.
 *
 * Shot in dark mode, because the hero's ambient shader reads as a flat grey
 * wash in light mode at this crop. The theme is set through localStorage
 * before first paint, which is where layout.tsx's theme guard looks, so the
 * page renders dark from the first frame instead of flashing light.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { SITE_URL } from './brand.mjs';
import { repoRoot } from './served-site.mjs';

/** Matches the committed banner, so README layout does not shift. */
const WIDTH = 1800;
const HEIGHT = 880;

/**
 * Shoot at 2x and downscale to WIDTH. A 1x capture of this hero renders the
 * display-weight headline noticeably soft once GitHub scales it into the
 * README column; the downscale from 2x keeps the file in the same size class
 * as a 1x shot while looking sharp on a retina screen.
 */
const SCALE = 2;

const OUT = join(repoRoot, '.github/readme-banner.jpg');

const origin = (process.argv[2] ?? SITE_URL).replace(/\/$/, '');

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: SCALE,
  colorScheme: 'dark',
});

// layout.tsx reads localStorage('theme') in its pre-paint guard.
await context.addInitScript(() => {
  try {
    localStorage.setItem('theme', 'dark');
  } catch {
    /* private mode — the colorScheme hint above still applies */
  }
});

const page = await context.newPage();
console.log(`Shooting ${origin} at ${WIDTH}x${HEIGHT} @${SCALE}x …`);
await page.goto(origin, { waitUntil: 'networkidle', timeout: 60_000 });

// The hero's entrance animation and the shader's first frames both settle
// well inside a second; without this the stats row can be caught mid-fade.
await page.waitForTimeout(2_000);

const tmp = mkdtempSync(join(tmpdir(), 'rift-banner-'));
const raw = join(tmp, 'raw.png');
await page.screenshot({ path: raw, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
await browser.close();

// sips ships with macOS; the downscale and JPEG encode in one pass.
execFileSync('sips', ['-Z', String(WIDTH), '-s', 'format', 'jpeg', '-s', 'formatOptions', '80', raw, '--out', OUT], {
  stdio: 'ignore',
});
rmSync(tmp, { recursive: true, force: true });

const { size } = await import('node:fs').then((fs) => fs.statSync(OUT));
console.log(`✓ Wrote .github/readme-banner.jpg (${(size / 1024).toFixed(0)} KB)`);
console.log('  Check it reads the current brand, package name and counts before committing.');
