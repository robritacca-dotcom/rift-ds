#!/usr/bin/env node
/**
 * generate-readme-banner.mjs
 *
 * Screenshots the running site's home hero into .github/readme-banner.jpg,
 * the image the README opens with (BoardUI's convention: a designed
 * lockup at ~2:1, the system demonstrating itself). A deliberate by-hand
 * script like the sync scripts, never part of the build: rerun it when
 * the hero changes enough that the banner lies.
 *
 *   node scripts/generate-readme-banner.mjs [url]
 *
 * Point it at a PRODUCTION server (npx next start), not next dev — the
 * dev indicator badge would ship in the image. Dark theme, the served
 * default brand, chat FAB hidden (it is chrome, not the product).
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const url = process.argv[2] ?? 'http://localhost:3211/';
const outPath = join(repoRoot, '.github', 'readme-banner.jpg');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1800, height: 880 },
  deviceScaleFactor: 2,
});
await page.addInitScript(() => {
  try {
    localStorage.setItem('theme', 'dark');
  } catch {
    /* ignore */
  }
});
await page.goto(url, { waitUntil: 'networkidle' });
await page.addStyleTag({
  content: '[class*="SiteChat"], [class*="chatFab"], [class*="AiButton"], .ds-ai-button { display: none !important; }',
});
/* Let the hero's entrance animation and the shader field settle. */
await page.waitForTimeout(2500);
mkdirSync(join(repoRoot, '.github'), { recursive: true });
await page.screenshot({
  path: outPath,
  type: 'jpeg',
  quality: 88,
  clip: { x: 0, y: 0, width: 1800, height: 880 },
});
await browser.close();
console.log(`✓ Banner written to .github/readme-banner.jpg (1800x880 logical, @2x capture).`);
