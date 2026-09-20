/**
 * component-docgen.mjs
 *
 * The one home for how this project reads component props out of the
 * TypeScript source. Two consumers share it so their view of the API can
 * never disagree: validate-prop-docs.mjs (every own prop carries a JSDoc
 * description) and generate-component-api.mjs (the machine-readable prop
 * reference the website's /api/mcp route serves).
 *
 * These settings mirror .storybook/main.ts exactly, so both consumers see
 * what the rendered props table sees. Two of them are load-bearing:
 *   - tsconfig.app.json, because the root tsconfig.json is solution-style
 *     ("files": [] plus references) and yields a program with no files
 *   - shouldIncludePropTagMap, because it moves an `@deprecated` tag out of
 *     `description` and into `tags`. A prop documented *only* with the tag
 *     therefore has an empty description and renders as a blank cell. Put a
 *     sentence before the tag so both survive.
 *
 * react-docgen-typescript is used rather than react-docgen because it
 * resolves types instead of pattern-matching the AST, which is what makes it
 * cope with the two shapes react-docgen cannot see:
 *   - components that return `createPortal(...)` with no direct JSX
 *     (AlertDialog, CommandPalette) — react-docgen finds no component
 *     definition at all and reports nothing
 *   - files exporting several components (Checkbox + CheckboxGroup)
 * It also handles the one folder-of-components entry, src/components/Chart,
 * which has no Chart.tsx.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withCustomConfig } from 'react-docgen-typescript';

export const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
export const componentsDir = join(repoRoot, 'src', 'components');

/** The component registry — the official public component list. */
export const registry = JSON.parse(
  readFileSync(join(componentsDir, 'registry.json'), 'utf8')
);

/**
 * The component source files backing one registry entry. Paths come back
 * with forward slashes on every platform: react-docgen-typescript reports
 * filePath that way, and consumers match these paths against it, so a
 * Windows backslash here would silently match nothing.
 */
export function sourceFilesFor(name, dir = join(componentsDir, name)) {
  const posix = (path) => path.replaceAll('\\', '/');
  const canonical = join(dir, `${name}.tsx`);
  if (existsSync(canonical)) return [posix(canonical)];
  // Folder-of-components entry: every non-story component file.
  return readdirSync(dir)
    .filter((file) => file.endsWith('.tsx') && !file.includes('.stories.'))
    .sort()
    .map((file) => posix(join(dir, file)));
}

/** Every source file behind the public registry, deduplicated, in registry order. */
export function librarySourceFiles() {
  // Entries with a `folder` field share an implementation folder (the charts
  // in Chart/); each contributes its own <Name>.tsx from it.
  const files = registry.components.flatMap((component) =>
    sourceFilesFor(
      component.name,
      join(componentsDir, component.folder ?? component.name)
    )
  );
  return [...new Set(files)];
}

/**
 * Parse the whole library in one call. One call builds a single TypeScript
 * program; parsing file-by-file rebuilds it each time and is far slower.
 */
export function parseLibrary() {
  const parser = withCustomConfig(join(repoRoot, 'tsconfig.app.json'), {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    shouldIncludePropTagMap: true,
    // Own props only — native pass-through attributes are React's to document.
    propFilter: (prop) =>
      !(prop.parent && prop.parent.fileName.includes('node_modules')),
  });
  return parser.parse(librarySourceFiles());
}
