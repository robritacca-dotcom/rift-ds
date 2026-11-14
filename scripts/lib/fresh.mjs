/**
 * lib/fresh.mjs
 *
 * The one comparison between a generated surface and its generator. A
 * generator exports `surface()`, which says what it writes:
 *
 *   {
 *     regenerate: 'node scripts/generate-x.mjs',
 *     files:   [[absolutePath, content], ...]     content is a string or a Buffer
 *     folders: [{ dir, entries, recursive }]      optional; see below
 *   }
 *
 * `staleErrors` holds the disk to it in both directions: every file must
 * exist and match byte for byte (text is read with CRLF normalised, so a
 * Windows checkout compares the way CI does), and a folder the generator
 * owns may hold nothing it did not write. `entries` is the set of names
 * allowed directly inside `dir`; with `recursive`, it is the set of
 * forward-slash paths of every file under it.
 *
 * scripts/validate-generated-files.mjs runs it over every generator in the
 * chain. Each message names the regeneration command.
 *
 * A helper module, not a chain script: it checks nothing by itself.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { display, read, walk } from './fs.mjs';

export function staleErrors({ regenerate, files, folders = [] }) {
  const errors = [];
  const fix = `Run \`${regenerate}\` and commit the result.`;
  for (const [path, content] of files) {
    if (!existsSync(path)) {
      errors.push(`${display(path)} is missing. ${fix}`);
    } else if (Buffer.isBuffer(content) ? !readFileSync(path).equals(content) : read(path) !== content) {
      errors.push(`${display(path)} is stale. ${fix}`);
    }
  }
  for (const { dir, entries, recursive = false } of folders) {
    if (!existsSync(dir)) continue;
    const found = recursive
      ? walk(dir).map((path) => relative(dir, path).replaceAll('\\', '/'))
      : readdirSync(dir);
    for (const name of found) {
      if (!entries.has(name)) {
        errors.push(`${display(join(dir, name))} is an orphan: its generator does not write it. ${fix}`);
      }
    }
  }
  return errors;
}
