/**
 * capture-compare-shots.mjs
 *
 * Re-shoots the four images behind the home page's compare section
 * (website/src/components/HomeCompare/HomeCompare.tsx): the payroll console
 * template as the site renders it in the Blueprint theme, and the same screen as a coding agent builds it with no
 * design system (scripts/compare-shots/vibecoded-payroll.html, a Tailwind
 * page that is never shipped), each in light and dark.
 *
 * Screenshots state the template in pixels no validator can read, so this
 * is not a build step. It is a by-hand refresh on the same footing as
 * capture-readme-banner.mjs: run it whenever the payroll console changes
 * what it shows, and commit the result.
 *
 *   node scripts/capture-compare-shots.mjs            # shoots SITE_URL
 *   node scripts/capture-compare-shots.mjs <origin>   # e.g. http://localhost:3000
 *
 * The vibecoded page loads Tailwind's play CDN, so the capture needs the
 * network either way.
 */
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { SITE_URL } from './brand.mjs';
import { repoRoot } from './served-site.mjs';

// sharp arrives with Next in the website workspace; borrow it from there.
const sharp = createRequire(join(repoRoot, 'website', 'package.json'))('sharp');

const WIDTH = 1440;
const HEIGHT = 900;
const SCALE = 2;
/** Output width: sharp on a retina screen at the section's widest frame. */
const OUT_WIDTH = 2400;

const OUT_DIR = join(repoRoot, 'website/public/images/compare');
const TEMPLATE_PATH = '/templates/payroll-console';
/**
 * The theme the Rift half is shot in: a preset id from THEME_PRESETS
 * (Blueprint's id is `contrast`). Set through the same localStorage key the
 * layout's pre-paint script reads, so the page paints in it from frame one.
 */
const BRAND = 'contrast';
const VIBECODED = pathToFileURL(join(repoRoot, 'scripts/compare-shots/vibecoded-payroll.html')).href;

const origin = (process.argv[2] ?? SITE_URL).replace(/\/$/, '');

mkdirSync(OUT_DIR, { recursive: true });
const browser = await chromium.launch();

for (const theme of ['light', 'dark']) {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
    colorScheme: theme,
  });
  // layout.tsx reads localStorage('theme') in its pre-paint guard.
  await context.addInitScript(({ t, brand }) => {
    try {
      localStorage.setItem('theme', t);
      localStorage.setItem('brand', brand);
    } catch {
      /* the colorScheme hint above still applies */
    }
  }, { t: theme, brand: BRAND });

  const shots = [
    { name: `rift-${theme}`, url: `${origin}${TEMPLATE_PATH}` },
    { name: `vibecoded-${theme}`, url: `${VIBECODED}?theme=${theme}` },
  ];
  for (const { name, url } of shots) {
    const page = await context.newPage();
    console.log(`Shooting ${url} …`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    // The dev server's indicator is not part of the screen.
    await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
    // Entrance animations and the chat rail's first frames settle well inside this.
    await page.waitForTimeout(2_000);
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
    const out = join(OUT_DIR, `${name}.webp`);
    const info = await sharp(png).resize({ width: OUT_WIDTH }).webp({ quality: 80 }).toFile(out);
    console.log(`✓ ${name}.webp (${(info.size / 1024).toFixed(0)} KB)`);
    await page.close();
  }
  await context.close();
}

await browser.close();
console.log('Check both halves show the same content before committing.');
