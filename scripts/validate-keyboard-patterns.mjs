#!/usr/bin/env node
/**
 * validate-keyboard-patterns.mjs
 *
 * Holds the keyboard contract's three parts together:
 *   - src/components/keyboard-patterns.json, one table of keys per
 *     WAI-ARIA pattern;
 *   - `pattern` on a component in src/components/registry.json, which
 *     joins it to a table, and `partPatterns` where only a part of the
 *     component follows one;
 *   - src/stories/KeyboardContract.stories.tsx, which presses every row
 *     against every component that names the pattern.
 *
 * The component pages, the per-component markdown and the published
 * schemas print those rows as tested facts, so this fails on anything
 * that would let a row be printed without a test behind it:
 *   1. a `pattern` in the registry that no table defines, or a table no
 *      component names;
 *   2. a pattern with no runner or no exported story in the contract
 *      story, or a row whose id the story never reports as asserted;
 *   3. a FIXTURES row in the story for a component that names no such
 *      pattern (a member with no row is put on the page by its Default
 *      story, so it needs none);
 *   4. a malformed row: a repeated id, a missing sentence, keys that are
 *      not a list.
 *
 *   5. a component that is not classified at all. Every registered
 *      component names a pattern, has a part that does, or says who owns
 *      its keys with `keys.by`: "component" (keys of its own, which its own
 *      stories must press, or `see` another component that holds them),
 *      "platform" (the browser or the engine underneath) or "none"
 *      (nothing to focus). The contract story checks the last two claims
 *      against each component's default story.
 *
 * It reads the story as text. Whether the presses pass is the story
 * test's job (`npm run test`); this is the static half, so it belongs in
 * the build chain (`CHAIN` in scripts/chain.mjs).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { failStep } from './lib/report.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(repoRoot, path), 'utf8');

const { patterns } = JSON.parse(read('src/components/keyboard-patterns.json'));
const registry = JSON.parse(read('src/components/registry.json'));
const STORY = 'src/stories/KeyboardContract.stories.tsx';
const story = read(STORY);

const errors = [];
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A member is a component (fixture key `Name`) or one part of it (fixture
// key `Name:pattern`), the keys FIXTURES in the story uses.
const members = {};
for (const component of registry.components) {
  const named = [
    ...(component.pattern === undefined ? [] : [{ pattern: component.pattern, key: component.name }]),
    ...(component.partPatterns ?? []).map((entry) => {
      if (typeof entry.part !== 'string' || entry.part.length === 0) {
        errors.push(`${component.name}: a partPatterns entry needs a "part" that names the part in a sentence.`);
      }
      return { pattern: entry.pattern, key: `${component.name}:${entry.pattern}` };
    }),
  ];
  if (new Set(named.map((entry) => entry.pattern)).size !== named.length) {
    errors.push(`${component.name}: names the same pattern twice in registry.json.`);
  }
  for (const { pattern, key } of named) {
    if (!patterns[pattern]) {
      errors.push(`${component.name}: pattern "${pattern}" in registry.json is not a pattern in keyboard-patterns.json.`);
      continue;
    }
    (members[pattern] ??= []).push(key);
  }
}

// The block between `const NAME ... = {` and its closing `};`.
const block = (name) => story.match(new RegExp(`const ${name}\\b[^=]*= \\{\\n([\\s\\S]*?)\\n\\};`))?.[1] ?? '';
const fixtures = new Set([...block('FIXTURES').matchAll(/^ {2}'?([\w:-]+)'?: \{/gm)].map((m) => m[1]));
const runners = block('RUNNERS');

for (const [id, pattern] of Object.entries(patterns)) {
  if (!members[id]) errors.push(`${id}: no component in registry.json names this pattern.`);
  if (!pattern.label || !/^https:\/\/www\.w3\.org\/WAI\/ARIA\/apg\//.test(pattern.apg ?? '')) {
    errors.push(`${id}: needs a label and an apg URL on www.w3.org/WAI/ARIA/apg/.`);
  }
  if (!new RegExp(`^ {2}'?${escape(id)}'?:`, 'm').test(runners)) {
    errors.push(`${id}: no runner under RUNNERS in ${STORY}.`);
  }
  if (!story.includes(`contract('${id}')`)) {
    errors.push(`${id}: no story exported with contract('${id}') in ${STORY}.`);
  }
  const seen = new Set();
  for (const row of pattern.rows ?? []) {
    const where = `${id}.${row.id}`;
    if (!row.id || seen.has(row.id)) errors.push(`${where}: a row needs an id that is unique in its pattern.`);
    seen.add(row.id);
    if (!Array.isArray(row.keys)) errors.push(`${where}: keys must be a list (empty for a behaviour no key starts).`);
    else if ((row.keys.length === 0) !== (typeof row.when === 'string')) {
      errors.push(`${where}: a row with no keys needs "when" ("On open"), and a row with keys must not have one.`);
    }
    if (typeof row.text !== 'string' || !/^[A-Z].*\.$/.test(row.text)) {
      errors.push(`${where}: text must be a sentence, capitalised and ending in a full stop.`);
    }
    if (!story.includes(`done('${row.id}')`)) {
      errors.push(`${where}: ${STORY} never reports this row as asserted (no done('${row.id}')).`);
    }
  }
  if (seen.size === 0) errors.push(`${id}: a pattern needs at least one row.`);
}

// Every component is classified: a pattern, a part's pattern, or `keys`
// saying who owns them. No component is left unsaid.
const KEY_OWNERS = ['component', 'platform', 'none'];
const storyFileOf = (component) => {
  const dir = join(repoRoot, 'src', 'components', component.folder ?? component.name);
  return ['tsx', 'ts'].map((ext) => join(dir, `${component.name}.stories.${ext}`)).find((file) => existsSync(file));
};
const classes = { component: 0, platform: 0, none: 0 };
for (const component of registry.components) {
  const { name, keys } = component;
  const inContract = component.pattern !== undefined || (component.partPatterns ?? []).length > 0;
  if (keys === undefined) {
    if (!inContract) {
      errors.push(
        `${name}: unclassified. Give it a "pattern" (or "partPatterns"), or "keys": { "by": "component" | "platform" | "none" } in registry.json.`
      );
    }
    continue;
  }
  if (!KEY_OWNERS.includes(keys.by)) {
    errors.push(`${name}: keys.by must be one of ${KEY_OWNERS.join(', ')}.`);
    continue;
  }
  classes[keys.by] += 1;
  const noted = typeof keys.note === 'string' && /^[A-Z].*\.$/.test(keys.note);
  if (keys.by === 'none') {
    if (inContract) errors.push(`${name}: says it has nothing to focus, and also names a pattern.`);
    if (keys.note !== undefined) errors.push(`${name}: keys.by "none" takes no note.`);
    continue;
  }
  if (!noted) errors.push(`${name}: keys.by "${keys.by}" needs a "note": a sentence saying what the keys do or who owns them.`);
  if (keys.by !== 'component') continue;
  // A widget with keys of its own: its stories press them, or it points at the component that does.
  if (keys.see !== undefined) {
    if (!registry.components.some((other) => other.name === keys.see && other.name !== name)) {
      errors.push(`${name}: keys.see names no other registered component (${keys.see}).`);
    }
    continue;
  }
  const storyFile = storyFileOf(component);
  if (!storyFile || !/userEvent\.(keyboard|tab)\(/.test(readFileSync(storyFile, 'utf8'))) {
    errors.push(
      `${name}: its keys are its own (keys.by "component"), so its stories must press them: no userEvent.keyboard( or userEvent.tab( in ${storyFile ? storyFile.slice(repoRoot.length + 1) : 'a story file'}.`
    );
  }
}
for (const check of ["runClass('none')", "runClass('platform')"]) {
  if (!story.includes(check)) errors.push(`${STORY} no longer runs ${check}, which holds that class of component.`);
}

const named = new Set(Object.values(members).flat());
for (const name of fixtures) {
  if (!named.has(name)) errors.push(`${name}: has a FIXTURES row in ${STORY} but names no pattern in registry.json.`);
}

if (errors.length > 0) {
  console.error('\n✗ Keyboard pattern validation failed:\n');
  for (const error of errors) console.error(`  - ${error}\n`);
  failStep();
}

console.log(
  `✓ Keyboard contract in sync — ${registry.components.length} components all classified: ` +
    `${Object.keys(patterns).length} patterns over ${named.size} components and parts, ` +
    `${classes.component} with keys of their own, ${classes.platform} left to the platform, ${classes.none} with nothing to focus.`
);
