#!/usr/bin/env node
/**
 * validate-component-api.mjs
 *
 * Guards website/src/data/component-api.generated.ts, the prop reference the
 * website's /api/mcp route serves verbatim to MCP clients. Two checks:
 *
 *   1. Freshness — regenerates in memory and byte-compares against disk, so
 *      a prop or registry change cannot land without the regenerated file.
 *      (CI also runs a drift guard after the generators.)
 *
 *   2. No leaked details — the file is handed to strangers' agents, so it is
 *      held to the same non-sanctionable leak patterns as the site corpus: a
 *      local path, analytics id, or API key must never appear in it. The
 *      source is JSDoc that already ships in the npm tarball, so a hit here
 *      means the leak is in the published package too — fix the source.
 *
 * Runs before every build via the validate-registry chain.
 */
import { existsSync, readFileSync } from 'node:fs';
import { buildComponentApiFile, outputPath } from './generate-component-api.mjs';
import { repoRoot } from './component-docgen.mjs';

const relative = (path) => path.replace(repoRoot + '/', '');
const errors = [];
const fail = (message) => errors.push(message);

let onDisk = null;

// 1. Freshness.
try {
  const expected = buildComponentApiFile();
  onDisk = existsSync(outputPath)
    ? readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n')
    : null;

  if (onDisk === null) {
    fail(
      `${relative(outputPath)} is missing — run ` +
        `\`node scripts/generate-component-api.mjs\` and commit the result.`
    );
  } else if (onDisk !== expected) {
    fail(
      `${relative(outputPath)} is stale — run ` +
        `\`node scripts/generate-component-api.mjs\` and commit the result.`
    );
  }
} catch (error) {
  fail(`generating the component API failed: ${error.message}`);
}

// 2. Leaked details — the patterns validate-site-corpus.mjs holds its prompt
// files to. The email screen is a hard ban here, stricter than the corpus's
// allowlist: prop JSDoc never reaches the corpus validator, and no
// corpus-facts() mechanism exists to sanction an address in it.
const leakPatterns = [
  [/\/Users\/[A-Za-z]/g, 'local absolute path (/Users/…)'],
  [/property[\s_-]?(?:id)?\W{0,3}\d{6,}/gi, 'GA property id'],
  [/sk-ant-[A-Za-z0-9-]/g, 'Anthropic API key'],
  [/\b[A-Za-z0-9._%+-]+@(?!example\.)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, 'email address'],
];

if (onDisk !== null) {
  for (const [pattern, what] of leakPatterns) {
    for (const match of onDisk.matchAll(pattern)) {
      fail(
        `The component API contains a ${what} (${JSON.stringify(match[0].slice(0, 40))}). ` +
          `It is served to any MCP client — remove it from the prop JSDoc it came from.`
      );
    }
  }
}

if (errors.length > 0) {
  console.error('\n✗ Component API validation failed:\n');
  for (const error of errors) console.error(`  - ${error}\n`);
  process.exit(1);
}

console.log('✓ Component API is current and free of leaked details.');
