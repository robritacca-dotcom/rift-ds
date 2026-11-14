/**
 * keyboard-patterns.mjs
 *
 * The keyboard contract as the generators read it: the patterns a
 * registered component names (`pattern`, and `partPatterns` for one of its
 * parts, in src/components/registry.json) joined to each pattern's tested rows in
 * src/components/keyboard-patterns.json. The per-component markdown and
 * the published schemas print what this returns, so they can only say what
 * src/stories/KeyboardContract.stories.tsx presses.
 * scripts/validate-keyboard-patterns.mjs holds the data and the story
 * together.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(readFileSync(join(repoRoot, 'src', 'components', file), 'utf8'));

export const keyboardPatterns = read('keyboard-patterns.json').patterns;
const registry = read('registry.json');

/** How a row's keys read in prose and in a table cell: "Shift + Tab", "Arrow Right". */
export const keyLabel = (keys) =>
  keys.map((key) => key.replace(/^Arrow(?=[A-Z])/, 'Arrow ')).join(' + ');

/** `{ by, note?, see? }` for a component whose registry entry says who owns its keys, or null. `see` names the component whose stories hold them. */
export function keysOf(name) {
  const keys = registry.components.find((entry) => entry.name === name)?.keys;
  return keys ? { by: keys.by, ...(keys.note ? { note: keys.note } : {}), ...(keys.see ? { see: keys.see } : {}) } : null;
}

/**
 * Every pattern a component is tested against, as `{ pattern, part?, label,
 * apg, rows }`: the whole component's first, then its parts'. Empty when
 * it names none.
 */
export function keyboardFor(name) {
  const component = registry.components.find((entry) => entry.name === name);
  if (!component) return [];
  return [
    ...(component.pattern ? [{ pattern: component.pattern }] : []),
    ...(component.partPatterns ?? []),
  ].map(({ pattern, part }) => {
    const { label, apg, rows } = keyboardPatterns[pattern];
    return {
      pattern,
      ...(part ? { part } : {}),
      label,
      apg,
      rows: rows.map((row) => ({
        keys: row.keys,
        ...(row.when ? { when: row.when } : {}),
        text: row.text,
        ...(row.inline ? { inline: true } : {}),
      })),
    };
  });
}
