#!/usr/bin/env node
/**
 * Holds website/src/config/brand.generated.ts to scripts/brand.mjs:
 * regenerates in memory and byte-compares, so an edited mirror (or a
 * brand change that skipped the generator) fails the build instead of
 * shipping two versions of a brand fact.
 */
import { buildBrandModule } from './generate-brand-module.mjs';
import { fromRoot, read } from './lib/fs.mjs';
import { failStep } from './lib/report.mjs';

const path = fromRoot('website', 'src', 'config', 'brand.generated.ts');

let committed;
try {
  committed = read(path);
} catch {
  console.error(
    '✗ website/src/config/brand.generated.ts is missing — run node scripts/generate-brand-module.mjs'
  );
  failStep();
}

if (committed !== buildBrandModule()) {
  console.error(
    '✗ brand.generated.ts is stale — run node scripts/generate-brand-module.mjs and commit the result'
  );
  failStep();
}

console.log('✓ Brand module in sync with scripts/brand.mjs.');
