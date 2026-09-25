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
 *   2. withAria           — components whose source declares an ARIA role or
 *                           attribute
 *   3. withAccessibleName — components that name themselves for assistive
 *                           technology (aria-label / aria-labelledby)
 *   4. behaviourModules   — modules in the shared overlay behaviour layer
 *   5. overlayComponents  — the components built on that layer, derived from
 *                           the dismissal-stack import rather than listed by
 *                           hand, so a new overlay joins the page by existing
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

/** ARIA surface in a component's own source. */
const ARIA_ATTRIBUTE = /\brole=|\baria-[a-z]+/;
const ACCESSIBLE_NAME = /\baria-label\b|\baria-labelledby\b/;

/** The dismissal stack is the overlay signature: a component that joins it is
 *  one Escape and one outside click away from the shared contract. */
const LAYER_IMPORT = /from ['"][^'"]*behaviors\/useLayer['"]/;

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

  let withAria = 0;
  let withAccessibleName = 0;
  const overlayComponents = [];

  for (const component of registry.components) {
    const folder = component.folder ?? component.name;
    const source = read(join(root, 'src', 'components', folder, `${component.name}.tsx`));
    if (ARIA_ATTRIBUTE.test(source)) withAria += 1;
    if (ACCESSIBLE_NAME.test(source)) withAccessibleName += 1;
    if (LAYER_IMPORT.test(source)) overlayComponents.push(component.label);
  }

  const behaviourModules = readdirSync(join(root, 'src', 'behaviors')).filter((f) =>
    f.endsWith('.ts')
  ).length;

  return {
    stories,
    withAria,
    withAccessibleName,
    behaviourModules,
    overlayComponents: overlayComponents.sort(),
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
  /** Components whose source declares an ARIA role or attribute. */
  withAria: number;
  /** Components that name themselves for assistive technology. */
  withAccessibleName: number;
  /** Modules in the shared overlay behaviour layer. */
  behaviourModules: number;
  /** Components built on that layer, by display label. */
  overlayComponents: string[];
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
    `✓ Generated a11y coverage: ${coverage.stories} stories, ${coverage.withAria} components with ARIA, ` +
      `${coverage.overlayComponents.length} on the behaviour layer.`
  );
}
