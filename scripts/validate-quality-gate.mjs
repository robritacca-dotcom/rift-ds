#!/usr/bin/env node
/**
 * validate-quality-gate.mjs
 *
 * Holds website/src/data/quality-gate.generated.ts, the list of every check
 * on /skills/super-ship, to its generator, scripts/generate-quality-gate.mjs.
 *
 *   1. Coverage: every script and command the validate-registry chain, the
 *      verify entry and the CI workflow run has a line in
 *      website/src/data/quality-gate.json, and every line there names
 *      something that runs. The generator owns the rule; this reports it.
 *   2. Freshness: regenerates in memory and byte-compares against disk, so
 *      a chain change cannot ship with the page still showing the old list.
 *
 * Belongs in the validate-registry chain: it reads package.json, the
 * workflow and a data file, never build output.
 */
import { existsSync, readFileSync } from 'node:fs';
import { outputPath, renderQualityGate } from './generate-quality-gate.mjs';

const errors = [];
let expected = null;
try {
  expected = renderQualityGate();
} catch (error) {
  errors.push(error.message);
}

if (expected !== null) {
  if (!existsSync(outputPath)) {
    errors.push('website/src/data/quality-gate.generated.ts is missing — run: node scripts/generate-quality-gate.mjs');
  } else if (readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n') !== expected) {
    errors.push('website/src/data/quality-gate.generated.ts is stale — run: node scripts/generate-quality-gate.mjs');
  }
}

if (errors.length > 0) {
  console.error('\n✗ Quality gate list validation failed:\n');
  for (const error of errors) console.error(`  - ${error}\n`);
  process.exit(1);
}

const count = (expected.match(/"name":/g) || []).length;
console.log(`✓ Quality gate list in sync — ${count} checks match package.json and ci.yml.`);
