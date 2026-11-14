#!/usr/bin/env node
/**
 * validate-dependency-graph.mjs
 *
 * Guards website/src/data/dependency-graph.generated.ts, the data behind the
 * /graph page. One check: freshness — regenerates in memory and byte-compares
 * against disk, so a token, component, or import change cannot land without
 * the regenerated graph. (CI's drift guard catches the uncommitted
 * regeneration.) No leak screen is needed beyond the standard patterns: every
 * node and edge derives from the registries and from source structure that
 * ships in the public repo — but the standard patterns run anyway, since the
 * file is served to every /graph visitor.
 *
 * Runs before every build via the validate-registry chain.
 */
import { existsSync } from 'node:fs';
import { outputPath } from './generate-dependency-graph.mjs';
import { read } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';
import { leaksIn } from './lib/screens.mjs';

const errors = [];
const fail = (message) => errors.push(message);

let onDisk = null;

// The file as committed. Whether it is fresh is validate-generated-files.mjs's check.
if (existsSync(outputPath)) onDisk = read(outputPath);
else fail('website/src/data/dependency-graph.generated.ts is missing — run `node scripts/generate-dependency-graph.mjs` and commit the result.');

if (onDisk !== null) {
  for (const leak of leaksIn(onDisk)) {
    fail(
      `The dependency graph contains a ${leak.what} (${leak.shown}). ` +
        'It is served to every /graph visitor — remove it from the source it came from.'
    );
  }
}

finish('✗ Dependency graph validation failed:', errors, '✓ Dependency graph is current.');
