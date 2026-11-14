#!/usr/bin/env node
/**
 * validate-page-prose-width.mjs
 *
 * Holds the component-doc-page skill's rule that prose on a component page is
 * never width-capped: page text fills the content column, the way the Button
 * page does, and a `max-width` belongs only on a demo container. On
 * 2026-10-21 nine pages had drifted, each capping a section note or intro at
 * 560px, so their paragraphs ended at a different measure from every
 * neighbouring page's.
 *
 * A rule in a component page's `page.module.css` that sets paragraph type (a
 * `--font-paragraph-*` token) is prose, and may not set a `max-width` in
 * pixels or characters. Text that belongs to a rendered demo rather than the
 * page (a paragraph inside a mock app frame) is sanctioned in SANCTIONED by
 * page and selector, with the reason; the table is held in both directions.
 *
 * Runs in the `validate-registry` chain: it reads source only.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fromRoot, read } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

const pagesDir = fromRoot('website', 'src', 'app', 'components');

/** "slug selector" → why the capped text is demo content, not page prose. */
const SANCTIONED = {
  'app-layout .demoBody': 'the body copy inside the mock app the demo renders, sized like the app content it stands in for',
  'streaming-text .demoCard': 'the card the live streaming demo types into: a demo surface with a reading measure, not page prose',
};

const errors = [];
const used = new Set();
let rules = 0;
for (const slug of readdirSync(pagesDir)) {
  let css;
  try {
    css = read(join(pagesDir, slug, 'page.module.css'));
  } catch {
    continue;
  }
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = m[2];
    if (!/--font-paragraph-/.test(body)) continue;
    rules += 1;
    const cap = body.match(/max-width:\s*([0-9.]+(px|ch|rem|em))/);
    if (!cap) continue;
    const selector = m[1].trim().split('\n').pop().trim();
    const key = `${slug} ${selector}`;
    if (SANCTIONED[key]) {
      used.add(key);
      continue;
    }
    errors.push(
      `website/src/app/components/${slug}/page.module.css — ${selector} is page prose capped at ${cap[1]}. ` +
        `Prose fills the content column (the component-doc-page skill); remove the max-width, or, if this ` +
        `text belongs to a rendered demo, sanction it in SANCTIONED in scripts/validate-page-prose-width.mjs.`
    );
  }
}
for (const key of Object.keys(SANCTIONED)) {
  if (!used.has(key)) errors.push(`SANCTIONED lists "${key}", which is no longer a capped paragraph rule: remove the entry.`);
}

finish(
  '✗ Page prose width validation failed:',
  errors,
  `✓ Component page prose fills its column — ${rules} paragraph rules checked, ${used.size} sanctioned demo text`
);
