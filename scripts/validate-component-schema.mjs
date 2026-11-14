#!/usr/bin/env node
/**
 * validate-component-schema.mjs
 *
 * Holds the published component schemas to their source: one <slug>.json
 * per public component under website/public/schema/components/, the chat
 * widget's included, plus the index website/public/schema/components.json.
 * Regenerates the set in memory through generate-component-schema.mjs and
 * checks three things:
 *
 *   1. Every entry has its schema file on disk, and the index exists.
 *   2. Every file in the components folder is a registered slug: an orphan
 *      means a component left the registry without taking its schema along.
 *   3. Every file byte-matches what the generator produces now, so a prop
 *      or description change cannot ship with a stale schema beside it.
 *
 * Whether each file is valid against the meta-schema is
 * validate-json-schemas.mjs's check, not this one's. Belongs in the
 * validate-registry chain, not post-build: the source is generated data.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { assembleComponentSchemaFiles, outputDir } from './generate-component-schema.mjs';
import { display, read } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

const errors = [];

const files = assembleComponentSchemaFiles();
for (const file of files) {
  if (!existsSync(file.path)) {
    errors.push(`missing ${display(file.path)} — run: node scripts/generate-component-schema.mjs`);
    continue;
  }
  if (read(file.path) !== file.content) {
    errors.push(`${display(file.path)} is stale — run: node scripts/generate-component-schema.mjs`);
  }
}

const wanted = new Set(
  files.filter((f) => f.path.startsWith(outputDir)).map((f) => relative(outputDir, f.path))
);
const onDisk = existsSync(outputDir) ? readdirSync(outputDir) : [];
for (const name of onDisk) {
  if (!wanted.has(name)) {
    errors.push(
      `${display(join(outputDir, name))} matches no registered component — ` +
        `run: node scripts/generate-component-schema.mjs`
    );
  }
}

finish(
  '✗ Component schema validation failed:',
  errors,
  `✓ Component schemas in sync — ${files.length} files match the registries and prop JSDoc.`
);
