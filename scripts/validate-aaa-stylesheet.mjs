#!/usr/bin/env node
/**
 * validate-aaa-stylesheet.mjs
 *
 * Holds the AAA mode's generated colour sheet (src/tokens/aaa-colours.css)
 * to its source. Regenerating it in memory re-runs every pairing in the
 * generator's PAIRINGS table against the shipped tokens and every preset,
 * both themes, so this fails when:
 *
 *   1. a token, preset or pairing changed and the committed sheet is stale;
 *   2. a theme can no longer reach AAA for some pairing at all (the
 *      generator throws and names the token, the surface and the ratio);
 *   3. src/tokens/aaa.css stops importing the sheet, which would leave the
 *      mode with motion and focus but none of its colour;
 *   4. code in src/ asks matchMedia for prefers-reduced-motion itself
 *      instead of going through src/behaviors/reducedMotion.ts. A media
 *      query cannot see the host's switch on <html> (data-motion="reduce"
 *      or the AAA mode), so a component that checked it directly would
 *      keep animating in the mode.
 *
 * Belongs in the validate-registry chain (and the website prebuild),
 * right after generate-aaa-stylesheet.mjs.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { AAA_OUTPUT, renderAaaColours } from './generate-aaa-stylesheet.mjs';

const REGENERATE = 'run: node scripts/generate-aaa-stylesheet.mjs';
const errors = [];
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

let expected;
try {
  expected = await renderAaaColours();
} catch (error) {
  errors.push(error.message);
}

if (expected !== undefined) {
  let actual = null;
  try {
    actual = read(AAA_OUTPUT);
  } catch {
    errors.push(`missing src/tokens/aaa-colours.css: ${REGENERATE}`);
  }
  if (actual !== null && actual !== expected) errors.push(`src/tokens/aaa-colours.css is stale: ${REGENERATE}`);
}

const entry = read(join(AAA_OUTPUT, '..', 'aaa.css'));
if (!/@import\s+(url\()?['"]\.\/aaa-colours\.css['"]\)?\s*;/.test(entry)) {
  errors.push('src/tokens/aaa.css no longer imports ./aaa-colours.css, so the AAA mode would ship without its colour');
}

const srcDir = join(AAA_OUTPUT, '..', '..');
const HELPER = join(srcDir, 'behaviors', 'reducedMotion.ts');
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path);
    return /\.(ts|tsx)$/.test(entry.name) && !/\.stories\.tsx?$/.test(entry.name) ? [path] : [];
  });
for (const file of walk(srcDir)) {
  if (file === HELPER) continue;
  const source = read(file);
  if (/matchMedia\([^)]*reduced-motion/.test(source) || /REDUCED_MOTION_QUERY\s*=/.test(source)) {
    errors.push(
      `${relative(join(srcDir, '..'), file).replace(/\\/g, '/')} reads prefers-reduced-motion itself; ` +
        'use prefersReducedMotion / useReducedMotion from src/behaviors/reducedMotion.ts, which also sees data-motion and the AAA mode'
    );
  }
}

if (errors.length > 0) {
  console.error('validate-aaa-stylesheet: failed');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(
  'validate-aaa-stylesheet: the AAA colour sheet matches its source, every pairing clears AAA in every theme, ' +
    'and every JS reduced-motion check goes through the shared helper'
);
