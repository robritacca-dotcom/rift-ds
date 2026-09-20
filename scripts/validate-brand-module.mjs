#!/usr/bin/env node
/**
 * Holds website/src/config/brand.generated.ts to scripts/brand.mjs:
 * regenerates in memory and byte-compares, so an edited mirror (or a
 * brand change that skipped the generator) fails the build instead of
 * shipping two versions of a brand fact.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBrandModule } from './generate-brand-module.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(repoRoot, 'website', 'src', 'config', 'brand.generated.ts');

let committed;
try {
  committed = readFileSync(path, 'utf8');
} catch {
  console.error(
    '✗ website/src/config/brand.generated.ts is missing — run node scripts/generate-brand-module.mjs'
  );
  process.exit(1);
}

if (committed !== buildBrandModule()) {
  console.error(
    '✗ brand.generated.ts is stale — run node scripts/generate-brand-module.mjs and commit the result'
  );
  process.exit(1);
}

console.log('✓ Brand module in sync with scripts/brand.mjs.');
