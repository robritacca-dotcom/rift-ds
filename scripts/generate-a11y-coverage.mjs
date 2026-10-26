#!/usr/bin/env node
/**
 * generate-a11y-coverage.mjs
 *
 * Writes the accessibility coverage figures the /foundations/accessibility
 * page displays, read out of the library source rather than typed into page
 * copy. Every number there is a countable fact about the repo, so it belongs
 * in a registry under CLAUDE.md's Registries rule: a hand-written "925
 * stories" goes stale the first time someone adds a story, and nothing would
 * fail.
 *
 * Five facts, each derived from one pass over src/:
 *   1. stories            — every exported Storybook story, each of which is a
 *                           render test plus an axe audit in `npm run test`
 *   2. storiedComponents  — registered components with a story file of their
 *                           own in their folder, so audited by name; the page
 *                           states it as a share of the registry, and a
 *                           component without a story drops that share below
 *                           all of them instead of being claimed
 *   3. behaviourModules   — modules in the shared overlay behaviour layer
 *   4. modalOverlays      — the overlays that hold focus: the components that
 *                           import the focus scope, which traps Tab, restores
 *                           focus and makes the page behind inert
 *   5. layerComponents    — every component on the dismissal stack, modal or
 *                           not (the popovers, menus, pickers and tooltips
 *                           joined it on 2026-10-21), derived from the stack's
 *                           import
 *   The last two are derived from imports rather than listed by hand, so a new
 *   overlay joins the page by existing, and a non-modal one can never be
 *   claimed to trap focus.
 *
 * The component list comes from src/components/registry.json, so a component
 * that is not registered is not counted: the registry is the authority on what
 * the library ships, and validate-component-registry.mjs already holds it to
 * the folders on disk.
 *
 * Output: website/src/data/a11y-coverage.generated.ts (committed;
 * validate-a11y-coverage.mjs regenerates in memory and byte-compares, and
 * CI's drift guard catches a stale commit).
 *
 * Runs in the validate-registry chain: it reads source files only, so it
 * needs no build output and must run before anything that imports it.
 */
import { readFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

export const outputPath = join(root, 'website', 'src', 'data', 'a11y-coverage.generated.ts');

// Normalize CRLF so Windows checkouts validate identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

/** An exported story: `export const Name: Story =`, including the typed
 *  variants (`GroupStory`, `StoryObj<typeof X>`) the library also uses. */
const STORY_EXPORT = /^export const [A-Z][A-Za-z0-9_]*\s*:\s*[^=]*Story[^=]*=/gm;

/* No ARIA census, deliberately. A component built on a native element (a
 * table, a blockquote, a button with a text label) needs no ARIA at all, so a
 * count of the ones that declare it reads as a shortfall when it is the first
 * rule of ARIA working. Naming is judged by axe and by
 * validate-accessible-names.mjs instead. */

/** The dismissal stack: a component that joins it dismisses through the
 *  shared one-press-one-layer contract. */
const LAYER_IMPORT = /from ['"][^'"]*behaviors\/useLayer['"]/;
/** The focus scope: a component that imports it holds focus while open. */
const FOCUS_SCOPE_IMPORT = /from ['"][^'"]*behaviors\/useFocusScope['"]/;

/** Every *.stories.ts(x) under src/, recursively. */
function storyFiles(dir, found = []) {
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      storyFiles(full, found);
    } else if (/\.stories\.tsx?$/.test(entry)) {
      found.push(full);
    }
  }
  return found;
}

export function collectA11yCoverage() {
  const registry = JSON.parse(read(join(root, 'src', 'components', 'registry.json')));

  let stories = 0;
  for (const file of storyFiles(join(root, 'src'))) {
    stories += read(file).match(STORY_EXPORT)?.length ?? 0;
  }

  let storiedComponents = 0;
  const modalOverlays = [];
  const layerComponents = [];

  for (const component of registry.components) {
    const folder = component.folder ?? component.name;
    const dir = join(root, 'src', 'components', folder);
    const source = read(join(dir, `${component.name}.tsx`));
    // A shared folder (the chart set) holds one story file per component, so
    // a story counts when it is named for the component or imports it.
    const storied = readdirSync(dir).some(
      (file) =>
        /\.stories\.tsx?$/.test(file) &&
        (file.startsWith(`${component.name}.`) ||
          new RegExp(`from ['"]\\./${component.name}['"]`).test(read(join(dir, file))))
    );
    if (storied) storiedComponents += 1;
    if (LAYER_IMPORT.test(source)) layerComponents.push(component.label);
    if (FOCUS_SCOPE_IMPORT.test(source)) modalOverlays.push(component.label);
  }

  /* The .ts hooks only, deliberately: the page counts the keyboard and
     focus modules, and the providers (LinkProvider.tsx, LocaleProvider.tsx)
     are neither. The locale data module is the one .ts file that is not
     either, so it is left out by name. */
  const NOT_KEYBOARD_OR_FOCUS = new Set(['locale.ts']);
  const behaviourModules = readdirSync(join(root, 'src', 'behaviors')).filter(
    (f) => f.endsWith('.ts') && !NOT_KEYBOARD_OR_FOCUS.has(f)
  ).length;

  return {
    stories,
    storiedComponents,
    behaviourModules,
    modalOverlays: modalOverlays.sort(),
    layerComponents: layerComponents.sort(),
  };
}

export function buildA11yCoverageFile() {
  const coverage = collectA11yCoverage();

  return `// AUTO-GENERATED — do not edit by hand.
// Source of truth: the component registry, the component and behaviour source
// in src/, and the Storybook story files.
// Regenerate: node scripts/generate-a11y-coverage.mjs (runs via predev/prebuild).

export interface A11yCoverage {
  /** Exported Storybook stories — each one a render test plus an axe audit. */
  stories: number;
  /** Registered components with a story file of their own. */
  storiedComponents: number;
  /** Modules in the shared overlay behaviour layer. */
  behaviourModules: number;
  /** The modal overlays (they import the focus scope), by display label. */
  modalOverlays: string[];
  /** Every component on the dismissal stack, modal or not, by display label. */
  layerComponents: string[];
}

export const a11yCoverage: A11yCoverage = ${JSON.stringify(coverage, null, 2)};
`;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  const content = buildA11yCoverageFile();
  writeFileSync(outputPath, content);
  const coverage = collectA11yCoverage();
  console.log(
    `✓ Generated a11y coverage: ${coverage.stories} stories, ` +
      `${coverage.layerComponents.length} on the dismissal stack (${coverage.modalOverlays.length} of them modal).`
  );
}
