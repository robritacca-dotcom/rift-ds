#!/usr/bin/env node
/**
 * validate-template-thumbnails.mjs
 *
 * Holds website/public/images/templates/ to the playground's template list
 * (template-thumbnails.mjs, read from templatesSidebarLinks) in both
 * directions:
 *
 *   1. Every template the Templates rail offers has a thumbnail in every
 *      mode. A missing file is a broken picture on the rail, and a new
 *      template would otherwise ship with one.
 *   2. Every file in the folder belongs to a listed template and mode. An
 *      orphan is a renamed or retired template's picture still deployed.
 *
 * What a picture shows is a person's check, not this one's: the files are
 * screenshots, re-shot by hand with capture-template-thumbnails.mjs.
 *
 * Runs in the validate-registry chain: it reads source files only.
 */
import { existsSync, readdirSync } from 'node:fs';
import {
  THUMBNAIL_DIR,
  THUMBNAIL_MODES,
  thumbnailFile,
  thumbnailTemplates,
} from './template-thumbnails.mjs';

const expected = new Set(
  thumbnailTemplates().flatMap(({ slug }) => THUMBNAIL_MODES.map((mode) => thumbnailFile(slug, mode))),
);
const present = new Set(existsSync(THUMBNAIL_DIR) ? readdirSync(THUMBNAIL_DIR) : []);

const errors = [
  ...[...expected]
    .filter((file) => !present.has(file))
    .map((file) => `missing ${file}: run node scripts/capture-template-thumbnails.mjs`),
  ...[...present]
    .filter((file) => !expected.has(file))
    .map((file) => `orphan ${file}: no listed template or mode owns it`),
];

if (errors.length) {
  console.error('✗ Template thumbnails:');
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}
console.log(`✓ Template thumbnails: ${expected.size} files, one per listed template per mode.`);
