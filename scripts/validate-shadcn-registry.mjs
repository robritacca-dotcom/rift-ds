#!/usr/bin/env node
/**
 * validate-shadcn-registry.mjs
 *
 * Holds website/public/r/ (the shadcn-compatible registry — see
 * generate-shadcn-registry.mjs) to its sources:
 *
 *   1. Regenerates in memory and byte-compares every file, both
 *      directions — a stale item, a missing one, and an orphan file all
 *      fail. Since the generator derives from the component registry,
 *      this also holds the item set to the registry.
 *   2. Leak screen — item files embed library source verbatim and are
 *      handed to strangers' projects, so every text file is held to the
 *      corpus's non-sanctionable patterns.
 *   3. Closure integrity — every relative import inside every embedded
 *      file must resolve to a target somewhere in the registry, so an
 *      installed component can never import a file no item carries.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, posix, relative } from 'node:path';
import { assembleShadcnRegistry, outputDir } from './generate-shadcn-registry.mjs';
import { read, walk } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';
import { leaksIn } from './lib/screens.mjs';

const errors = [];
const REGENERATE = 'node scripts/generate-shadcn-registry.mjs';

const expected = assembleShadcnRegistry();

/* 1. Byte-compare, both directions. */
const onDisk = new Set(
  (existsSync(outputDir) ? walk(outputDir) : []).map((path) => relative(outputDir, path).replace(/\\/g, '/'))
);

for (const [name, content] of expected) {
  if (!onDisk.has(name)) {
    errors.push(`website/public/r/${name} is missing — ${REGENERATE}`);
    continue;
  }
  // Normalize CRLF on text files so Windows checkouts validate identically to CI.
  const disk = Buffer.isBuffer(content)
    ? readFileSync(join(outputDir, name))
    : Buffer.from(read(join(outputDir, name)));
  const next = Buffer.isBuffer(content) ? content : Buffer.from(content);
  if (!disk.equals(next)) errors.push(`website/public/r/${name} is stale — ${REGENERATE}`);
}
for (const name of onDisk) {
  if (!expected.has(name)) errors.push(`website/public/r/${name} is an orphan — ${REGENERATE} prunes it`);
}

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
  `✓ shadcn registry in sync — ${expected.size} files match the component registry, closure complete, no leaked details.`
);
