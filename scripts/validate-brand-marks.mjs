#!/usr/bin/env node
/**
 * validate-brand-marks.mjs
 *
 * Holds website/src/data/brand-marks.generated.ts to its generator,
 * scripts/generate-brand-marks.mjs: the brand marks the playground's
 * DESIGN.md import shows beside a recognised file's title. Regeneration
 * fails when the generator's BRANDS list names a slug the installed
 * simple-icons no longer carries, so a dropped mark cannot leave the
 * import matching a brand it has nothing to draw for.
 *
 * Reads installed package data only, so it runs in the validate-registry
 * chain and the website's prebuild.
 */
import { existsSync, readFileSync } from 'node:fs';
import { assembleBrandMarks, outputPath } from './generate-brand-marks.mjs';

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const errors = [];
let expected = '';
try {
  expected = assembleBrandMarks();
} catch (error) {
  errors.push(error.message);
}

if (expected) {
  if (!existsSync(outputPath)) {
    errors.push('brand-marks.generated.ts is missing. Run: node scripts/generate-brand-marks.mjs');
  } else if (read(outputPath) !== expected) {
    errors.push('brand-marks.generated.ts is stale. Run: node scripts/generate-brand-marks.mjs');
  }
}

if (errors.length > 0) {
  console.error('✗ Brand marks validation failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('✓ Brand marks match simple-icons and the generator.');
