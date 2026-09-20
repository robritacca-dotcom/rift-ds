#!/usr/bin/env node
/**
 * validate-component-md.mjs
 *
 * Holds the generated component markdown pages (website/public/components/,
 * one <slug>.md per public component) to their source. Regenerates the set
 * in memory and checks three things:
 *
 *   1. Every public component has its markdown page on disk.
 *   2. Every file in the folder is a registered slug — an orphan means a
 *      component left the registry without taking its page along.
 *   3. Every page byte-matches what the generator produces now, so a prop
 *      or description change cannot ship with a stale contract beside it.
 *
 * Belongs in the validate-registry chain, not post-build: the source is
 * generated data, not rendered HTML.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { assembleComponentMdFiles, outputDir } from './generate-component-md.mjs';

const errors = [];

const files = assembleComponentMdFiles();
const wanted = new Map(files.map((file) => [`${file.slug}.md`, file.content]));

for (const file of files) {
  const dest = join(outputDir, `${file.slug}.md`);
  if (!existsSync(dest)) {
    errors.push(`missing ${file.slug}.md — run: node scripts/generate-component-md.mjs`);
    continue;
  }
  if (readFileSync(dest, 'utf8').replace(/\r\n/g, '\n') !== file.content) {
    errors.push(`${file.slug}.md is stale — run: node scripts/generate-component-md.mjs`);
  }
}

const onDisk = existsSync(outputDir) ? readdirSync(outputDir) : [];
for (const name of onDisk) {
  if (!wanted.has(name)) {
    errors.push(
      `website/public/components/${name} matches no registered component — ` +
        `run: node scripts/generate-component-md.mjs`
    );
  }
}

if (errors.length > 0) {
  console.error('\n✗ Component markdown validation failed:\n');
  for (const error of errors) console.error(`  - ${error}\n`);
  process.exit(1);
}

console.log(`✓ Component markdown in sync — ${files.length} pages match the registry and prop JSDoc.`);
