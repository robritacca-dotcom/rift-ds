/**
 * component-sizes.mjs
 *
 * Each component's published size for the generators: the gzipped
 * JavaScript, in bytes, of the component bundled with everything it imports
 * except peer dependencies. scripts/validate-size-budget.mjs measures it
 * from dist/ and writes website/src/data/component-sizes.json (`--write`),
 * and holds that file to within 5% of a fresh measure.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const sizes = JSON.parse(
  readFileSync(join(repoRoot, 'website', 'src', 'data', 'component-sizes.json'), 'utf8')
).sizes;

/** The component's gzipped size in bytes, as validate-size-budget.mjs published it, or undefined. */
export const sizeOf = (name) => sizes[name];
