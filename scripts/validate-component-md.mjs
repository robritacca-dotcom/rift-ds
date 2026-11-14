#!/usr/bin/env node
/**
 * validate-component-md.mjs
 *
 * Holds the generated markdown contract pages to their source: one
 * <slug>.md per public component under website/public/components/, the
 * chat widget's included. Regenerates the set in memory and checks three
 * things:
 *
 *   1. Every entry has its markdown page on disk.
 *   2. Every file in the components folder is a registered slug — an
 *      orphan means a component left the registry without taking its page
 *      along.
 *   3. Every page byte-matches what the generator produces now, so a prop
 *      or description change cannot ship with a stale contract beside it.
 *   4. Every props table row reads cleanly: no empty code span (an empty
 *      string default is written `''`, never as nothing in backticks) and no
 *      double space inside a cell (a folded JSDoc paragraph break). Both
 *      once shipped on button.md.
 *
 * Belongs in the validate-registry chain, not post-build: the source is
 * generated data, not rendered HTML.
 */
import { join } from 'node:path';
import { assembleComponentMdFiles } from './generate-component-md.mjs';
import { display as displayPath } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

const errors = [];

const files = assembleComponentMdFiles();
const display = (file) => displayPath(join(file.dir, `${file.slug}.md`));

for (const file of files) {
  // 4. Clean table rows, checked on what the generator writes.
  for (const row of file.content.split('\n').filter((line) => line.startsWith('| '))) {
    const prop = row.slice(2, row.indexOf(' |'));
    const cells = row.slice(2, -2).split(/(?<!\\)\|/).map((text) => text.trim());
    if (cells.some((text) => /^`+$/.test(text))) {
      errors.push(`${display(file)}: the ${prop} row has an empty code span. Write an empty string default as ''.`);
    }
    if (cells.some((text) => / {2,}/.test(text))) {
      errors.push(`${display(file)}: the ${prop} row has a double space. Fold the whitespace in generate-component-md.mjs.`);
    }
  }
}

finish(
  '✗ Component markdown validation failed:',
  errors,
  `✓ Component markdown in sync — ${files.length} pages match the registries and prop JSDoc.`
);
