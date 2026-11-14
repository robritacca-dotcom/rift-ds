#!/usr/bin/env node
/**
 * validate-a11y-coverage.mjs
 *
 * Guards website/src/data/a11y-coverage.generated.ts, the figures behind the
 * /foundations/accessibility page. One check: freshness — regenerates in
 * memory and byte-compares against disk, so adding a story, an ARIA
 * attribute, or a new overlay cannot land while the page still states the old
 * number. (CI's drift guard catches the uncommitted regeneration.)
 *
 * The page makes public claims about how accessible the library is, which is
 * the kind of claim a reader has no way to check. A stale number there is
 * worse than no number, so the guard is the freshness compare rather than a
 * range: the figures are only trustworthy if they were read from the source
 * that shipped.
 *
 * Runs before every build via the validate-registry chain.
 */
import { existsSync } from 'node:fs';
import { buildA11yCoverageFile, outputPath } from './generate-a11y-coverage.mjs';
import { read } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

const errors = [];
const fail = (message) => errors.push(message);

try {
  const expected = buildA11yCoverageFile();
  const onDisk = existsSync(outputPath) ? read(outputPath) : null;

  if (onDisk === null) {
    fail(
      'website/src/data/a11y-coverage.generated.ts is missing — run ' +
        '`node scripts/generate-a11y-coverage.mjs` and commit the result.'
    );
  } else if (onDisk !== expected) {
    fail(
      'website/src/data/a11y-coverage.generated.ts is stale — run ' +
        '`node scripts/generate-a11y-coverage.mjs` and commit the result.'
    );
  }
} catch (error) {
  fail(`generating the a11y coverage figures failed: ${error.message}`);
}

finish('✗ A11y coverage validation failed:', errors, '✓ A11y coverage figures are current.');
