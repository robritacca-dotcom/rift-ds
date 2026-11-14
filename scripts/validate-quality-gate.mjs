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
import { existsSync } from 'node:fs';
import { outputPath, renderQualityGate } from './generate-quality-gate.mjs';
import { read } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

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
  } else if (read(outputPath) !== expected) {
    errors.push('website/src/data/quality-gate.generated.ts is stale — run: node scripts/generate-quality-gate.mjs');
  }
}

finish('✗ Quality gate list validation failed:', errors, () => {
  const count = (expected.match(/"name":/g) || []).length;
  return `✓ Quality gate list in sync — ${count} checks match package.json and ci.yml.`;
});
