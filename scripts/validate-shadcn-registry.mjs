#!/usr/bin/env node
/**
 * validate-shadcn-registry.mjs
 *
 * Holds website/public/r/ (the shadcn-compatible registry — see
 * generate-shadcn-registry.mjs) to what an installable registry must be.
 * Whether the files are fresh (each one matches its generator, and nothing
 * else sits in the folder) is scripts/validate-generated-files.mjs's check.
 * Two checks here, on what the generator builds:
 *
 *   1. Leak screen — item files embed library source verbatim and are
 *      handed to strangers' projects, so every text file is held to the
 *      corpus's non-sanctionable patterns.
 *   2. Closure integrity — every relative import inside every embedded
 *      file must resolve to a target somewhere in the registry, so an
 *      installed component can never import a file no item carries.
 */
import { posix } from 'node:path';
import { assembleShadcnRegistry } from './generate-shadcn-registry.mjs';
import { finish } from './lib/report.mjs';
import { leaksIn } from './lib/screens.mjs';

const errors = [];

const expected = assembleShadcnRegistry();

/* 2. Leak screen — the corpus's non-sanctionable patterns. */
for (const [name, content] of expected) {
  if (Buffer.isBuffer(content)) continue;
  for (const leak of leaksIn(content)) errors.push(`website/public/r/${name} leaks ${leak.what}: "${leak.text}"`);
}

/* 3. Closure integrity: collect every target, then check every relative
   import inside every embedded file resolves to one. */
const targets = new Set();
const embedded = []; // { item, target, content }
for (const [name, content] of expected) {
  if (Buffer.isBuffer(content) || !name.endsWith('.json') || name === 'registry.json') continue;
  const item = JSON.parse(content);
  for (const file of item.files ?? []) {
    targets.add(file.target);
    embedded.push({ item: name, target: file.target, content: file.content });
  }
}
const importsOf = (file) => {
  if (file.target.endsWith('.css')) {
    return [...file.content.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]\)?/g)].map((m) => m[1]);
  }
  return [
    ...[...file.content.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]),
    ...[...file.content.matchAll(/(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g)].map((m) => m[1]),
  ];
};
for (const file of embedded) {
  for (const spec of importsOf(file)) {
    if (!spec.startsWith('.')) continue;
    const base = posix.normalize(posix.join(posix.dirname(file.target), spec));
    const resolves = [base, `${base}.ts`, `${base}.tsx`, `${base}.css`, `${base}/index.ts`].some((c) =>
      targets.has(c)
    );
    if (!resolves) {
      errors.push(
        `${file.item}: ${file.target} imports "${spec}", which no registry item carries — the closure walk missed it`
      );
    }
  }
}

finish(
  '✗ shadcn registry validation failed:',
  errors,
  `✓ shadcn registry sound — ${expected.size} files, closure complete, no leaked details.`
);
