#!/usr/bin/env node
/**
 * validate-mcp-tools.mjs
 *
 * Holds every stated MCP tool count to the tools the route actually
 * registers. The registrations live in one place — the `server.registerTool`
 * calls in website/src/app/api/mcp/route.ts — but the roster is restated as
 * data in website/src/lib/mcp-tools.ts (which the landing page and the
 * get-started page render), and its count is restated in prose on surfaces
 * that cannot import it: the README (which ships in the npm tarball, so a
 * wrong count there reaches every consumer) and the overview page. A tool
 * added or removed without those sentences fails here instead of shipping
 * as a lie.
 *
 * The check is deliberately narrow: any "<number> tools" phrase in a listed
 * file must equal the registered count. Surfaces that describe the tools by
 * capability without a number (llms.txt) have nothing to drift and are not
 * checked.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = execSync('git rev-parse --show-toplevel').toString().trim();

const routePath = join(repoRoot, 'website/src/app/api/mcp/route.ts');
const route = readFileSync(routePath, 'utf8');

const registered = [...route.matchAll(/server\.registerTool\(\s*["']([a-z_]+)["']/g)].map(
  (match) => match[1]
);

const errors = [];
if (registered.length === 0) {
  errors.push(
    'no server.registerTool calls found in website/src/app/api/mcp/route.ts — ' +
      'if the registration moved, update this script.'
  );
}

// The landing page and the get-started page render the roster from the
// MCP_TOOLS array in website/src/lib/mcp-tools.ts. Hold it to the
// registrations in both directions, and require an example prompt per
// entry: a new tool cannot ship without one.
const rosterPath = join(repoRoot, 'website/src/lib/mcp-tools.ts');
const roster = readFileSync(rosterPath, 'utf8');
const toolsArray = roster.match(/const MCP_TOOLS[^=]*=\s*\[([\s\S]*?)\];/);
if (!toolsArray) {
  errors.push(
    'the MCP_TOOLS array is missing from website/src/lib/mcp-tools.ts — ' +
      'the landing and get-started pages need it; if it was renamed, update this script.'
  );
} else {
  const entries = [...toolsArray[1].matchAll(/\{[\s\S]*?\}/g)].map((m) => m[0]);
  const listed = entries
    .map((entry) => entry.match(/name:\s*["']([a-z_]+)["']/)?.[1])
    .filter(Boolean);
  for (const name of registered) {
    if (!listed.includes(name)) {
      errors.push(`the MCP_TOOLS roster is missing registered tool "${name}".`);
    }
  }
  for (const name of listed) {
    if (!registered.includes(name)) {
      errors.push(`the MCP_TOOLS roster lists "${name}", which the route never registers.`);
    }
  }
  for (const entry of entries) {
    const name = entry.match(/name:\s*["']([a-z_]+)["']/)?.[1] ?? '(unnamed)';
    const prompt = entry.match(/prompt:\s*["'](.*?)["']/)?.[1];
    if (!prompt || prompt.trim().length === 0) {
      errors.push(`MCP_TOOLS entry "${name}" has no example prompt — every tool ships with one.`);
    }
  }
}

/** Files whose prose states the tool count. Add a file here when a new surface does. */
const COUNTED_SURFACES = ['README.md', 'website/src/app/overview/page.tsx'];

const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

for (const file of COUNTED_SURFACES) {
  const content = readFileSync(join(repoRoot, file), 'utf8');
  const claims = [...content.matchAll(/\b([A-Za-z]+|\d+)\s+(?:deterministic\s+)?tools\b/gi)];
  let counted = 0;
  for (const claim of claims) {
    const word = claim[1].toLowerCase();
    const stated = /^\d+$/.test(word) ? Number(word) : NUMBER_WORDS[word];
    if (stated === undefined) continue; // "build tools", "its tools" — not a count
    counted += 1;
    if (stated !== registered.length) {
      errors.push(
        `${file} says "${claim[0]}" but the MCP route registers ` +
          `${registered.length} (${registered.join(', ')}). Update the sentence.`
      );
    }
  }
  if (counted === 0) {
    errors.push(
      `${file} no longer states the MCP tool count — remove it from ` +
        `COUNTED_SURFACES in scripts/validate-mcp-tools.mjs, or restore the sentence.`
    );
  }
}

if (errors.length > 0) {
  console.error('\n✗ MCP tool count validation failed:\n');
  for (const error of errors) console.error(`  - ${error}\n`);
  process.exit(1);
}

console.log(
  `✓ MCP tool count in sync — ${registered.length} tools registered ` +
    `(${registered.join(', ')}), every stated count matches.`
);
