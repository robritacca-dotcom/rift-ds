#!/usr/bin/env node
/**
 * validate-storybook-paths.mjs
 *
 * Every Storybook link the website writes must land on a story that
 * exists. A docs page names its Storybook docs with a `storybookPath`
 * string (`/?path=/docs/<id>--docs`, passed to PageLinks), and the id is
 * derived from a story file's `title` the way Storybook derives it
 * (lowercased, every run of other characters a hyphen). Nothing else
 * checks the pair: a component renamed or a story retitled leaves the
 * page linking a Storybook id that no longer exists, which 404s for the
 * reader and passes every build. The 2026-11-25 renames (NavList to
 * SideNav, SidebarPanel to SubNavPanel, NavStack to DrillMenu) shipped
 * three such links before a drift audit caught them.
 *
 * The ids come from every `title:` in a `*.stories.ts(x)` file and every
 * `<Meta title="…">` in an `.mdx` file under `src/`; the links from every
 * `storybookPath` string literal under `website/src/` (generated data and
 * the gitignored local labs left out).
 *
 * Runs in the validate-registry chain: it reads only source files.
 */
import { join } from 'node:path';
import { display, read, repoRoot, walk } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';

/** Storybook's id for a title: lowercased, runs of other characters as one hyphen. */
const storyId = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ids = new Set();
for (const file of walk(join(repoRoot, 'src'), (path) => /\.(stories\.tsx?|mdx)$/.test(path))) {
  const source = read(file);
  for (const [, title] of source.matchAll(/^\s*title:\s*['"`]([^'"`]+)['"`]/gm)) ids.add(storyId(title));
  for (const [, title] of source.matchAll(/<Meta\b[^>]*\btitle=["']([^"']+)["']/g)) ids.add(storyId(title));
}

const errors = [];
let checked = 0;
const skip = (path) => /\.generated\.|[\\/]labs[\\/]local[\\/]/.test(path);
for (const file of walk(join(repoRoot, 'website', 'src'), (path) => /\.tsx?$/.test(path) && !skip(path))) {
  const source = read(file);
  for (const [, id] of source.matchAll(/storybookPath[=:]\s*["'`]\/\?path=\/(?:docs|story)\/([a-z0-9-]+?)--[a-z0-9-]+["'`]/g)) {
    checked += 1;
    if (!ids.has(id)) {
      errors.push(
        `${display(file)} links Storybook id "${id}", which no story title produces. ` +
          `Point it at the story's current title (lowercased, hyphenated), or retitle the story.`
      );
    }
  }
}

finish(
  '✗ Storybook paths:',
  errors,
  `✓ Storybook paths resolve — ${checked} storybookPath link(s), each to one of ${ids.size} story ids.`
);
