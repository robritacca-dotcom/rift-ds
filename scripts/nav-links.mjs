/**
 * nav-links.mjs
 *
 * Reads a flat link array out of website/src/config/navigation.ts, for the
 * scripts that need the site's lists (the corpus's site map, the template
 * thumbnails) without loading TypeScript. navigation.ts stays the one home
 * of those lists; this is the one parser of them.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

export const NAVIGATION_FILE = join(repoRoot, 'website', 'src', 'config', 'navigation.ts');

/**
 * The entries of `export const <exportName> = [ … ];`, less the section's
 * "Contents" link. Throws when the export is missing, is not a flat array
 * literal, or yields nothing, so a reshaped file fails loudly rather than
 * reading as an empty list.
 */
export function navLinks(source, exportName) {
  const start = source.indexOf(`export const ${exportName}`);
  if (start === -1) throw new Error(`navigation.ts: no export named ${exportName}`);
  const end = source.indexOf('\n];', start);
  if (end === -1) throw new Error(`navigation.ts: ${exportName} is not a flat array literal`);
  const body = source.slice(start, end);

  const links = [];
  for (const match of body.matchAll(/\{[^{}]*\}/g)) {
    const entry = match[0];
    const field = (key) => {
      const m = entry.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
      return m ? m[1] : null;
    };
    const href = field('href');
    const label = field('label');
    if (!href || !label || label === 'Contents') continue;
    links.push({
      href,
      label,
      description: field('description'),
      mobileOnly: /mobileOnly:\s*true/.test(entry),
      hideFromPlayground: /hideFromPlayground:\s*true/.test(entry),
    });
  }
  if (links.length === 0) throw new Error(`navigation.ts: ${exportName} yielded no links`);
  return links;
}

/** The same, read straight from navigation.ts. */
export const readNavLinks = (exportName) => navLinks(readFileSync(NAVIGATION_FILE, 'utf8'), exportName);
