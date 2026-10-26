#!/usr/bin/env node
/**
 * generate-component-md.mjs
 *
 * Builds website/public/components/<slug>.md — one markdown page per public
 * component, served beside the live docs page (append .md to a component
 * URL), the chat widget's page under /components included. The content is the prop contract for an agent to read
 * or a visitor to copy: registry metadata, import lines, and the documented
 * props of every export, from the same assembleComponentApi() pass that
 * feeds Storybook's props tables, the shipped .d.ts and the /api/mcp
 * get_component tool. No hand-written facts live here, so the files cannot
 * drift from the source: validate-component-md.mjs regenerates in memory
 * and byte-compares on every build. Two consumers point at these files:
 * the "Copy for agents" button on component pages
 * (website/src/components/PageLinks/CopyPageMarkdown.tsx) and the MCP
 * get_component response's markdownUrl.
 *
 * Deterministic and public-only, like every generated surface: no network,
 * no timestamps (the version stamp is PACKAGE_VERSION, which only moves on
 * a release), and nothing that is not already published through the
 * registries and the prop JSDoc. Runs via the validate-registry chain and
 * the website's predev/prebuild — never edit the generated files by hand.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleComponentApi } from './generate-component-api.mjs';
import { PACKAGE_NAME, PACKAGE_VERSION } from './package-manifest.mjs';
import { SITE_URL } from './brand.mjs';
import { chatRegistry, repoRoot } from './component-docgen.mjs';

/** The component pages' folder, the chat widget's page included. */
export const outputDir = join(repoRoot, 'website', 'public', 'components');

/**
 * The canonical site origin — scripts/brand.mjs is the one home for it,
 * and the website reads the same value through its generated mirror, so
 * every generated file and the site agree by construction. Kept as a
 * function because every generator calls it that way.
 */
export function siteUrl() {
  return SITE_URL;
}

/** One markdown table cell: pipes escaped, newlines flattened. */
const cell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();

/** The widget's route and import lines come from its registry, never from a rule restated here. */
const widgetFor = (entry) => chatRegistry.widgets.find((widget) => widget.name === entry.name);

/** The markdown document for one component-api entry. */
export function buildComponentMarkdown(entry, origin) {
  const isWidget = entry.kind === 'widget';
  const usage = isWidget
    ? `import { ${entry.exports.map((e) => e.component).join(', ')} } from '${entry.importPath}';`
    : entry.barrel === 'charts'
      ? `import { ${entry.name} } from '${PACKAGE_NAME}/charts'; // needs the optional recharts peer`
      : `import { ${entry.name} } from '${PACKAGE_NAME}';`;
  const rendering = entry.client
    ? `client component (declares 'use client')`
    : `server-renderable (no 'use client')`;
  const docsPath = `/components/${entry.slug}`;

  const lines = [
    `# ${entry.label}`,
    '',
    ...(entry.deprecated ? [`**Deprecated.** ${entry.deprecated}`, ''] : []),
    entry.description,
    '',
    `Generated from the ${PACKAGE_NAME} registry and prop JSDoc, version ${PACKAGE_VERSION}. ` +
      `The same data ships in the package's .d.ts and is served by the MCP endpoint at ${origin}/api/mcp.`,
    '',
    `- Category: ${entry.category}`,
    `- Import: \`${usage}\``,
  ];
  if (isWidget) {
    const widget = widgetFor(entry);
    for (const [subpath, what] of Object.entries(widget.subpaths)) {
      const peers = widget.peers[subpath];
      lines.push(
        `- Subpath \`${PACKAGE_NAME}${subpath.slice(1)}\`: ${what}` +
          (peers ? ` Optional peers: ${peers.join(', ')}.` : '')
      );
    }
    lines.push(`- Scaffold: \`npx ${PACKAGE_NAME} ${widget.command}\``);
    lines.push(`- Composes: ${widget.parts.join(', ')}`);
  } else {
    lines.push(`- Deep import: \`import { ${entry.name} } from '${entry.importPath}';\``);
  }
  lines.push(`- Rendering: ${rendering}`, `- Live docs: ${origin}${docsPath}`);

  for (const exported of entry.exports) {
    lines.push('', `## ${exported.component} props`, '');
    if (exported.deprecated && exported.component !== entry.name) {
      lines.push(`**Deprecated.** ${exported.deprecated}`, '');
    }
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

/**
 * Every generated file as { slug, dir, content }, in registry order, all
 * into outputDir: the chat widget's page sits under /components too.
 */
export function assembleComponentMdFiles() {
  const origin = siteUrl();
  return assembleComponentApi().map((entry) => ({
    slug: entry.slug,
    dir: outputDir,
    content: buildComponentMarkdown(entry, origin),
  }));
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  mkdirSync(outputDir, { recursive: true });
  const files = assembleComponentMdFiles();

  let written = 0;
  for (const file of files) {
    const dest = join(file.dir, `${file.slug}.md`);
    const existing = existsSync(dest) ? readFileSync(dest, 'utf8') : null;
    if (existing !== file.content) {
      writeFileSync(dest, file.content);
      written++;
    }
  }

  // A component leaving the registry takes its markdown page with it. Only
  // the components folder is pruned: the site root holds other files.
  const wanted = new Set(files.filter((f) => f.dir === outputDir).map((file) => `${file.slug}.md`));
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
