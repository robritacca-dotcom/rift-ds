#!/usr/bin/env node
/**
 * generate-component-md.mjs
 *
 * Builds website/public/components/<slug>.md — one markdown page per public
 * component, served beside the live docs page (append .md to a component
 * URL). The content is the component's prop contract for an agent to read
 * or a visitor to copy: registry metadata, import lines, and the documented
 * props of every export, from the same assembleComponentApi() pass that
 * feeds Storybook's props tables, the shipped .d.ts and the /api/mcp
 * get_component tool. No hand-written facts live here, so the files cannot
 * drift from the source: validate-component-md.mjs regenerates in memory
 * and byte-compares on every build.
 *
 * Deterministic and public-only, like every generated surface: no network,
 * no timestamps (the version stamp is PACKAGE_VERSION, which only moves on
 * a release), and nothing that is not already published through the
 * registry and the prop JSDoc. Runs via the validate-registry chain and the
 * website's predev/prebuild — never edit the generated files by hand.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleComponentApi } from './generate-component-api.mjs';
import { PACKAGE_NAME, PACKAGE_VERSION } from './package-manifest.mjs';
import { repoRoot } from './component-docgen.mjs';

export const outputDir = join(repoRoot, 'website', 'public', 'components');

/**
 * The canonical site origin, read from the website's own constant rather
 * than restated — a renamed domain fails here instead of shipping stale
 * links in every generated file.
 */
export function siteUrl() {
  const source = readFileSync(
    join(repoRoot, 'website', 'src', 'lib', 'structuredData.ts'),
    'utf8'
  ).replace(/\r\n/g, '\n');
  const match = source.match(/export const SITE_URL = ["']([^"']+)["']/);
  if (!match) {
    throw new Error(
      'SITE_URL not found in website/src/lib/structuredData.ts — ' +
        'if the constant moved, update scripts/generate-component-md.mjs.'
    );
  }
  return match[1];
}

/** One markdown table cell: pipes escaped, newlines flattened. */
const cell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();

/** The markdown document for one component-api entry. */
export function buildComponentMarkdown(entry, origin) {
  const usage =
    entry.barrel === 'charts'
      ? `import { ${entry.name} } from '${PACKAGE_NAME}/charts'; // needs the optional recharts peer`
      : `import { ${entry.name} } from '${PACKAGE_NAME}';`;
  const rendering = entry.client
    ? `client component (declares 'use client')`
    : `server-renderable (no 'use client')`;

  const lines = [
    `# ${entry.label}`,
    '',
    entry.description,
    '',
    `Generated from the ${PACKAGE_NAME} registry and prop JSDoc, version ${PACKAGE_VERSION}. ` +
      `The same data ships in the package's .d.ts and is served by the MCP endpoint at ${origin}/api/mcp.`,
    '',
    `- Category: ${entry.category}`,
    `- Import: \`${usage}\``,
    `- Deep import: \`import { ${entry.name} } from '${entry.importPath}';\``,
    `- Rendering: ${rendering}`,
    `- Live docs: ${origin}/components/${entry.slug}`,
  ];

  for (const exported of entry.exports) {
    lines.push('', `## ${exported.component} props`, '');
    if (exported.props.length === 0) {
      lines.push('No own props; native attributes pass through.');
      continue;
    }
    lines.push(
      '| Prop | Type | Required | Default | Description |',
      '| --- | --- | --- | --- | --- |'
    );
    for (const prop of exported.props) {
      const description = prop.deprecated
        ? `${cell(prop.description)} Deprecated: ${cell(prop.deprecated)}`
        : cell(prop.description);
      lines.push(
        `| ${cell(prop.name)} | \`${cell(prop.type)}\` | ${prop.required ? 'yes' : 'no'} | ` +
          `${prop.defaultValue != null ? `\`${cell(prop.defaultValue)}\`` : ''} | ${description} |`
      );
    }
  }

  lines.push('');
  return lines.join('\n');
}

/** Every generated file as { slug, content }, in registry order. */
export function assembleComponentMdFiles() {
  const origin = siteUrl();
  return assembleComponentApi().map((entry) => ({
    slug: entry.slug,
    content: buildComponentMarkdown(entry, origin),
  }));
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  mkdirSync(outputDir, { recursive: true });
  const files = assembleComponentMdFiles();
  const wanted = new Set(files.map((file) => `${file.slug}.md`));

  let written = 0;
  for (const file of files) {
    const dest = join(outputDir, `${file.slug}.md`);
    const existing = existsSync(dest) ? readFileSync(dest, 'utf8') : null;
    if (existing !== file.content) {
      writeFileSync(dest, file.content);
      written++;
    }
  }

  // A component leaving the registry takes its markdown page with it.
  let pruned = 0;
  for (const name of readdirSync(outputDir)) {
    if (!wanted.has(name)) {
      rmSync(join(outputDir, name));
      pruned++;
    }
  }

  console.log(
    written + pruned > 0
      ? `✓ Component markdown regenerated — ${files.length} files (${written} written, ${pruned} pruned).`
      : `✓ Component markdown up to date — ${files.length} files.`
  );
}
