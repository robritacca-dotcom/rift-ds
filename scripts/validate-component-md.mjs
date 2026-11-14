#!/usr/bin/env node
/**
 * validate-component-md.mjs
 *
 * Holds the generated markdown contract pages (one <slug>.md per public
 * component under website/public/components/, the chat widget's included)
 * to a readable shape.
 * Whether the files are fresh (each one matches its generator, and nothing
 * else sits in the folder) is scripts/validate-generated-files.mjs's check.
 * One check here:
 *
 *   1. Every props table row reads cleanly: no empty code span (an empty
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
  `✓ Component markdown reads cleanly — ${files.length} pages, no broken table row.`
);
