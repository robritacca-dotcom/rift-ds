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
import { existsSync, readFileSync } from 'node:fs';
import { buildDependencyGraphFile, outputPath } from './generate-dependency-graph.mjs';

const errors = [];
const fail = (message) => errors.push(message);

let onDisk = null;

try {
  const expected = buildDependencyGraphFile();
  onDisk = existsSync(outputPath)
    ? readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n')
    : null;

  if (onDisk === null) {
    fail(
      'website/src/data/dependency-graph.generated.ts is missing — run ' +
        '`node scripts/generate-dependency-graph.mjs` and commit the result.'
    );
  } else if (onDisk !== expected) {
    fail(
      'website/src/data/dependency-graph.generated.ts is stale — run ' +
        '`node scripts/generate-dependency-graph.mjs` and commit the result.'
    );
  }
} catch (error) {
  fail(`generating the dependency graph failed: ${error.message}`);
}

const leakPatterns = [
  [/\/Users\/[A-Za-z]/g, 'local absolute path (/Users/…)'],
  [/[A-Za-z]:\\\\Users\\\\/g, 'local absolute path (drive letter)'],
  [/property[\s_-]?(?:id)?\W{0,3}\d{6,}/gi, 'GA property id'],
  [/sk-ant-[A-Za-z0-9-]/g, 'Anthropic API key'],
  [/\b[A-Za-z0-9._%+-]+@(?!example\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, 'email address'],
];

if (onDisk !== null) {
  for (const [pattern, what] of leakPatterns) {
    for (const match of onDisk.matchAll(pattern)) {
      fail(
        `The dependency graph contains a ${what} (${JSON.stringify(match[0].slice(0, 40))}). ` +
          'It is served to every /graph visitor — remove it from the source it came from.'
      );
    }
  }
}

if (errors.length > 0) {
  console.error('\n✗ Dependency graph validation failed:\n');
  for (const error of errors) console.error(`  - ${error}\n`);
  process.exit(1);
}

console.log('✓ Dependency graph is current.');
