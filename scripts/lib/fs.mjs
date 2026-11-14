/**
 * lib/fs.mjs
 *
 * The file helpers every chain script shares, so the conventions the
 * new-validator skill asks for live in one place instead of being copied
 * into each script: the repo root, the CRLF-normalising read, the
 * repo-relative display path and the directory walk.
 *
 * A helper module, not a chain script: it checks nothing by itself.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The repository root, from this file's own location, never the cwd. */
export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** A path under the repo root. */
export const fromRoot = (...parts) => join(repoRoot, ...parts);

/**
 * A text file, with CRLF normalised so a Windows checkout
 * (core.autocrlf=true) reads byte for byte what CI reads. Every read a
 * script parses, matches or byte-compares goes through this.
 */
export const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

/** A file under the repo root, read the same way. */
export const readRel = (rel) => read(join(repoRoot, rel));

/** A JSON file, read the same way. */
export const readJson = (path) => JSON.parse(read(path));

/** A path as the repo writes it: relative to the root, forward slashes. */
export const display = (path) => relative(repoRoot, path).replaceAll('\\', '/');

/**
 * Every file under `dir`, depth first in directory order, for which
 * `keep(name, path)` is true. `skipDir(name, path)` prunes a folder.
 * Returns absolute paths.
 */
export function walk(dir, keep = () => true, skipDir = () => false, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skipDir(entry.name, full)) walk(full, keep, skipDir, files);
    } else if (keep(entry.name, full)) {
      files.push(full);
    }
  }
  return files;
}
