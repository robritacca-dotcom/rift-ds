/**
 * capture-template-thumbnails.mjs
 *
 * Re-shoots the playground's template thumbnails: one small JPEG per
 * template per colour mode, under website/public/images/templates/. The
 * Templates view's rail shows them so a visitor can see every screen before
 * picking one, while only the picked template runs live in the stage frame.
 * A live preview per template would load every template's whole app at
 * once (a document, React, its charts and its data each), for a strip of
 * pictures a few hundred pixels wide; a still costs one small image.
 *
 * A screenshot cannot be byte-compared against a generator, so this is not
 * a build step, the same footing as capture-readme-banner.mjs: run it
 * whenever a template changes what it shows, or a template is added, and
 * commit the files. validate-template-thumbnails.mjs (in the build) holds
 * the folder to the template list in both directions, so a new template
 * cannot ship without its pictures, but only a person can see whether a
 * picture is current.
 *
 *   node scripts/capture-template-thumbnails.mjs            # serves the build
 *   node scripts/capture-template-thumbnails.mjs <origin>   # shoots a running site
 *
 * The first form needs `npm run build` in website/ first. Shot in the
 * served theme (no stored pick), at a desktop viewport rendered at half
 * scale, so each file is the thumbnail's own size rather than a full shot
 * the browser shrinks.
 */
import { mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { startServer } from './served-site.mjs';
import {
  THUMBNAIL_DIR,
  THUMBNAIL_MODES,
  thumbnailFile,
  thumbnailTemplates,
} from './template-thumbnails.mjs';

/** The desktop the templates are laid out for, as the stage shows them. */
const VIEWPORT = { width: 1440, height: 900 };

/** Half scale: a 720x450 file, sharp at the rail's width on a retina screen. */
const SCALE = 0.5;

/** Entrance animations and charts settle well inside this. */
const SETTLE_MS = 2_500;

const QUALITY = 78;

let origin = process.argv[2]?.replace(/\/$/, '');
let stop = () => {};
if (!origin) {
  const server = await startServer();
  origin = server.origin;
  stop = server.stop;
}

mkdirSync(THUMBNAIL_DIR, { recursive: true });
const browser = await chromium.launch();
try {
  for (const mode of THUMBNAIL_MODES) {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: SCALE,
      colorScheme: mode,
    });
    // layout.tsx reads localStorage('theme') in its pre-paint guard, and
    // TemplateShell reads 'template-layout': the stills show the default
    // layout whatever the default happens to be stored as later.
    await context.addInitScript((theme) => {
      try {
        localStorage.setItem('theme', theme);
        localStorage.setItem('template-layout', 'inset');
      } catch {
        /* private mode: the colorScheme hint still applies */
      }
    }, mode);
    const page = await context.newPage();
    for (const { href, slug } of thumbnailTemplates()) {
      await page.goto(`${origin}${href}`, { waitUntil: 'networkidle', timeout: 60_000 });
      // A dev server's build badge is not part of the template.
      await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
      await page.waitForTimeout(SETTLE_MS);
      const out = join(THUMBNAIL_DIR, thumbnailFile(slug, mode));
      await page.screenshot({ path: out, type: 'jpeg', quality: QUALITY });
      console.log(`✓ ${thumbnailFile(slug, mode)} (${(statSync(out).size / 1024).toFixed(0)} KB)`);
    }
    await context.close();
  }
} finally {
  await browser.close();
  stop();
}
console.log('  Look at every picture before committing: no validator can see them.');
