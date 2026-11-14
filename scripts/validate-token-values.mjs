#!/usr/bin/env node
/**
 * validate-token-values.mjs
 *
 * Holds the two surfaces generate-token-values.mjs writes to their
 * sources, the token CSS and the preset composer. Regenerates both in
 * memory and checks:
 *
 *   1. Drift, in both directions: src/tokens/values.json and every
 *      website/public/schema/tokens/<theme>.<mode>.tokens.json byte-match
 *      the regeneration, a file the generator would write is on disk, and
 *      nothing else sits in the DTCG folder (an orphan means a theme left
 *      the selector order without taking its files along).
 *   2. DTCG shape, over every generated file: each leaf has a $value and a
 *      $type from DTCG_TYPES, every `{group.name}` alias resolves inside
 *      the same file (a DTCG consumer never sees another file), and no
 *      group or token name carries a `.`, `{` or `}`, which the alias
 *      syntax reserves.
 *
 * Belongs in the validate-registry chain and the website prebuild: the
 * sources are the token CSS and a TypeScript module, not rendered HTML.
 */
import { assembleTokenValues } from './generate-token-values.mjs';
import { finish } from './lib/report.mjs';


/** The DTCG 2025.10 types the generator may emit. */
const DTCG_TYPES = new Set([
  'color',
  'dimension',
  'duration',
  'cubicBezier',
  'fontFamily',
  'fontWeight',
  'number',
  'shadow',
]);

const errors = [];
const { values, dtcg } = await assembleTokenValues();

/* 2. DTCG shape. */
const RESERVED = /[.{}]/;
for (const [name, content] of dtcg) {
  const file = JSON.parse(content);
  const leaves = new Map();
  const walk = (node, path) => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      if (RESERVED.test(key)) {
        errors.push(`${name}: the name "${key}" under ${path.join('.') || 'the root'} carries a reserved character (. { })`);
      }
      const here = [...path, key];
      if (child && typeof child === 'object' && !Array.isArray(child) && '$value' in child) {
        leaves.set(here.join('.'), child);
      } else if (child && typeof child === 'object' && !Array.isArray(child)) {
        walk(child, here);
      } else {
        errors.push(`${name}: ${here.join('.')} is neither a group nor a token`);
      }
    }
  };
  walk(file, []);
  for (const [path, token] of leaves) {
    if (!DTCG_TYPES.has(token.$type)) {
      errors.push(`${name}: ${path} has $type "${token.$type}", not one of ${[...DTCG_TYPES].join(', ')}`);
    }
    if (typeof token.$value === 'string') {
      const alias = token.$value.match(/^\{([^{}]+)\}$/);
      if (!alias) {
        errors.push(`${name}: ${path} has a string $value that is not an alias: ${token.$value}`);
      } else if (!leaves.has(alias[1])) {
        errors.push(`${name}: ${path} aliases ${token.$value}, which the file does not carry`);
      }
    }
  }
}

finish(
  '✗ Token values validation failed:',
  errors,
  () =>
    `✓ Token values in sync: ${Object.keys(JSON.parse(values).themes).length} themes, ${dtcg.size} DTCG files match the token CSS and the preset composer.`
);
