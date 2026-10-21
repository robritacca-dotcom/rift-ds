#!/usr/bin/env node
/**
 * validate-google-font-index.mjs
 *
 * Holds website/src/data/google-fonts.generated.ts to its generator,
 * scripts/generate-google-font-index.mjs. The playground's DESIGN.md import
 * decides from this file whether a typeface can be loaded exactly and at
 * which weights, so a stale copy would request weights a family lacks (which
 * makes Google reject the whole stylesheet) or miss a face Google now
 * serves. Regeneration also fails when a stand-in in the generator's
 * SUBSTITUTES table names a family the catalogue does not carry.
 *
 * Reads installed package data only, so it runs in the validate-registry
 * chain and the website's prebuild.
 */
import { existsSync, readFileSync } from 'node:fs';
import { assembleGoogleFontIndex, outputPath } from './generate-google-font-index.mjs';

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const errors = [];
let expected = '';
try {
  expected = assembleGoogleFontIndex();
} catch (error) {
  errors.push(error.message);
}

if (expected) {
  if (!existsSync(outputPath)) {
    errors.push('google-fonts.generated.ts is missing. Run: node scripts/generate-google-font-index.mjs');
  } else if (read(outputPath) !== expected) {
    errors.push('google-fonts.generated.ts is stale. Run: node scripts/generate-google-font-index.mjs');
  }
}

if (errors.length > 0) {
  console.error('✗ Google font index validation failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

const count = (expected.match(/^ {2}".+": "[v\d]/gm) ?? []).length;
console.log(`✓ Google font index matches its generator (${count} families)`);
