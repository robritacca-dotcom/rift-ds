#!/usr/bin/env node
/**
 * validate-js-timings.mjs
 *
 * Holds CLAUDE.md's rule that timings living in JavaScript timers have one
 * home: the shared constants in src/tokens/motion.ts (published as
 * rift-ds/tokens/motion). A literal ms value written into a component cannot
 * be found, tuned or mirrored against its token; until 2026-10-21 five had
 * accumulated (Globe's token re-read, ShaderField's watchdog and colour fade,
 * the demo's retry and the thread naming delay), one of them a hand copy of
 * --motion-duration-slow nothing checked.
 *
 * Checks every non-story .ts/.tsx file in src/components and src/chat:
 *   1. No setTimeout / setInterval with a literal delay of 10ms or more (a
 *      zero delay, "after this task", is not a timing).
 *   2. No `const <NAME>_MS = <number>`: name the constant in motion.ts and
 *      import it.
 * SANCTIONED lists the timings that are not motion at all (network timeouts),
 * each with its reason. The table is held in both directions.
 *
 * Runs in the `validate-registry` chain: it reads source only.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const display = (path) => relative(repoRoot, path).replaceAll('\\', '/');

/** "file#NAME" → why the literal is not a motion timing. */
const SANCTIONED = {
  'src/chat/followups.ts#FOLLOWUPS_TIMEOUT_MS': 'a network timeout on the follow-ups request, not a motion timing',
  'src/chat/transport.ts#FIRST_BYTE_TIMEOUT_MS': 'a network timeout on the first streamed byte, not a motion timing',
};

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.tsx?$/.test(entry.name) && !/\.(stories|test)\.tsx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/\/\/.*$/gm, (m) => ' '.repeat(m.length));
const lineOf = (src, index) => src.slice(0, index).split('\n').length;

const errors = [];
const used = new Set();
let files = 0;
for (const file of [...walk(join(repoRoot, 'src', 'components')), ...walk(join(repoRoot, 'src', 'chat'))]) {
  files += 1;
  const path = display(file);
  const src = strip(read(file));
  for (const m of src.matchAll(/\bset(Timeout|Interval)\([\s\S]*?,\s*([\d_]+)\s*\)/g)) {
    if (Number(m[2].replaceAll('_', '')) < 10) continue;
    errors.push(`${path}:${lineOf(src, m.index)} passes a literal ${m[2]}ms to set${m[1]}. Import the timing from src/tokens/motion.ts, or add a named constant there.`);
  }
  for (const m of src.matchAll(/\bconst\s+([A-Z][A-Z0-9_]*_MS)\s*=\s*([\d_]+)\s*;/g)) {
    const key = `${path}#${m[1]}`;
    if (SANCTIONED[key]) {
      used.add(key);
      continue;
    }
    errors.push(`${path}:${lineOf(src, m.index)} defines ${m[1]} = ${m[2]}. JS timings live in src/tokens/motion.ts: add it there (with what it paces) and import it.`);
  }
}
for (const key of Object.keys(SANCTIONED)) {
  if (!used.has(key)) errors.push(`SANCTIONED lists ${key}, which no longer defines that literal: remove the entry.`);
}

if (errors.length > 0) {
  console.error('✗ JS timing validation failed:');
  for (const error of errors) console.error(`    - ${error}`);
  process.exit(1);
}
console.log(`✓ JS timings come from src/tokens/motion.ts — ${files} files scanned, ${used.size} sanctioned network timeouts`);
