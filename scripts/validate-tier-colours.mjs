#!/usr/bin/env node
/**
 * Holds headline text to its tier's colour role.
 *
 * The display tier (Mega, Display 1 and 2, Sub Display) and the heading
 * tier (Headings 1 to 3) each have a colour role, `--color-text-display`
 * and `--color-text-heading`, which alias the primary text until a theme
 * tones the tier (design.md's Text section owns the roles). A rule that
 * sets a tier's type style and colours it with `--color-text-primary`
 * would quietly opt out of the theme's tone, so it fails here: colour it
 * with its tier's role instead. A rule that sets both tiers' tokens is
 * read as display, the larger.
 *
 * Reads every stylesheet in the library (src/components, src/chat) and
 * the site (website/src). Runs in the validate-registry chain and the
 * website's prebuild.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROOTS = ['src/components', 'src/chat', 'website/src'];

const DISPLAY = /--font-(mega-[12]|display-[12]|sub-display)-/;
const HEADING = /--font-heading-[123]-/;
const PRIMARY = /(^|[;\s{])color:\s*var\(--color-text-primary\)/;

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.css')) files.push(path);
  }
};
ROOTS.forEach((root) => walk(join(repoRoot, root)));

const errors = [];
let tierRules = 0;
for (const file of files) {
  const css = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  /* Innermost blocks only: a declaration list never holds a brace. */
  for (const match of css.matchAll(/\{([^{}]*)\}/g)) {
    const body = match[1];
    const tier = DISPLAY.test(body) ? 'display' : HEADING.test(body) ? 'heading' : null;
    if (!tier) continue;
    tierRules += 1;
    if (PRIMARY.test(body)) {
      const line = css.slice(0, match.index).split('\n').length;
      errors.push(
        `${relative(repoRoot, file)}:${line} sets a ${tier}-tier style in --color-text-primary; use var(--color-text-${tier})`
      );
    }
  }
}

if (errors.length > 0) {
  console.error(`✗ Type-tier colours: ${errors.length} rule(s) bypass their tier's colour role\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ Type-tier colours: ${tierRules} display and heading rules across ${files.length} stylesheets, none in the primary text.`);
