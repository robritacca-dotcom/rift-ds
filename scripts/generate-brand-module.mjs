#!/usr/bin/env node
/**
 * Writes website/src/config/brand.generated.ts — the TypeScript mirror of
 * scripts/brand.mjs, so website code reads brand facts from a typed module
 * while the .mjs stays the single authored home. Byte-held by
 * scripts/validate-brand-module.mjs; CI's drift guard catches a stale
 * committed copy.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as brand from './brand.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = join(
  repoRoot,
  'website',
  'src',
  'config',
  'brand.generated.ts'
);

export function buildBrandModule() {
  const entries = Object.entries(brand)
    .filter(([, value]) => typeof value === 'string')
    .map(
      ([name, value]) => `export const ${name}: string = ${JSON.stringify(value)};`
    )
    .join('\n');

  return `// AUTO-GENERATED — do not edit by hand.
// Source of truth: scripts/brand.mjs (the one home for brand facts).
// Regenerate: node scripts/generate-brand-module.mjs (runs via predev/prebuild).

${entries}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(outputPath, buildBrandModule());
  console.log(`✓ Generated ${outputPath.replace(repoRoot + '/', '')}`);
}
