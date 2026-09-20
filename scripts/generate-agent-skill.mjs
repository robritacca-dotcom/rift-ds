#!/usr/bin/env node
/**
 * generate-agent-skill.mjs
 *
 * Builds the consumer agent skill — a SKILL.md plus a reference catalog that
 * a consumer of @robr0/design-system can drop into their own .claude/skills/
 * so their coding agent knows the library every session. Served from
 * website/public/skill/robr0-design-system/ (the blueprints precedent:
 * generated, tracked, drift-guarded), advertised in llms.txt and on the
 * get-started page.
 *
 * This is for people using the package, not for this repo (whose own skills
 * live in .claude/skills/ and publish through /skills). Every fact derives
 * from an existing source of truth: the component registry and prop JSDoc
 * via assembleComponentApi(), the token registry, the package manifest, and
 * the site origin. No hand-written fact lives here, and the props
 * themselves are deliberately not restated — the catalog points at the
 * shipped .d.ts, the per-component .md pages and the MCP endpoint instead,
 * so a truncated copy can never shadow the real contract.
 *
 * Deterministic (version-stamped with PACKAGE_VERSION, no timestamps) and
 * byte-compared by validate-agent-skill.mjs. Runs via the validate-registry
 * chain and the website's predev/prebuild — never edit the output by hand.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registry, repoRoot } from './component-docgen.mjs';
import { assembleComponentApi } from './generate-component-api.mjs';
import { siteUrl } from './generate-component-md.mjs';
import { PACKAGE_NAME, PACKAGE_VERSION } from './package-manifest.mjs';

export const skillDir = join(repoRoot, 'website', 'public', 'skill', 'robr0-design-system');

const tokenRegistry = JSON.parse(
  readFileSync(join(repoRoot, 'src', 'tokens', 'registry.json'), 'utf8')
);

/** Both generated files as { path, content }, paths relative to skillDir. */
export function assembleAgentSkill() {
  const origin = siteUrl();
  const api = assembleComponentApi();
  const categories = registry.categories;
  const countFor = (id) => api.filter((entry) => entry.category === id).length;
  const tokenCount = Object.values(tokenRegistry.categories).reduce(
    (total, names) => total + names.length,
    0
  );

  const categoryLines = categories.map(
    (category) =>
      `- ${category.label} (${countFor(category.id)}): ${category.description}`
  );

  const skillMd = `---
name: robr0-design-system
description: Build React UI with ${PACKAGE_NAME}. Use when installing the package, composing its components, theming with its design tokens, or reading a component's exact prop contract.
---

# Using ${PACKAGE_NAME}

Generated from the library's registries at version ${PACKAGE_VERSION}, alongside every deploy of ${origin}. The library is ${api.length} React components across ${categories.length} categories, themed by ${tokenCount} semantic design tokens, published to npm.

## Install

\`\`\`bash
npm install ${PACKAGE_NAME}
\`\`\`

Import the token stylesheet once, then components from the barrel or by deep subpath:

\`\`\`tsx
import '${PACKAGE_NAME}/tokens/tokens.css';
import { Button } from '${PACKAGE_NAME}';
import { Input } from '${PACKAGE_NAME}/components/Input/Input';
\`\`\`

The package is ESM-only, resolved via exports subpaths: use a bundler that handles CSS and font imports from node_modules (Vite, Next.js, webpack) and set TypeScript's \`moduleResolution\` to \`"bundler"\` (or \`"nodenext"\`). Components are provider-free with one exception: wrap the tree in \`ToastProvider\` if (and only if) the toast queue is used via \`useToast\`.

## Dark mode

Set \`data-theme="dark"\` on the root element. Every semantic colour token has a light and a dark value; components never query \`prefers-color-scheme\` themselves.

## Theming

Components read semantic tokens (\`--color-*\`, \`--radius-*\`, \`--font-*\`, \`--motion-*\`, ...), and every semantic colour token references a \`--primitive-*\` value. Re-theme by overriding primitives: one override cascades through both themes at once. Never hardcode a colour beside the components; override the token it should come from. The full token reference lives at ${origin}/foundations, and the MCP endpoint's \`list_tokens\` tool serves the registry.

## Charts

Components that import recharts ship from \`${PACKAGE_NAME}/charts\` and need the optional recharts peer dependency. Everything in the main barrel is dependency-free.

## Fonts

The primary typeface is not bundled: set \`--font-family-primary\` to your own (the system is designed around Nunito Sans). The Material Symbols icon font ships inside the package, and any component import loads it.

## Timings in JavaScript

Timer-driven timings (hover delays, toast auto-dismiss, the streaming reveal's pacing) are exported as constants from \`${PACKAGE_NAME}/tokens/motion\`. Import the constant rather than writing a literal millisecond value.

## The catalog

references/components.md lists every component with its import line and description. The categories:

${categoryLines.join('\n')}

## Exact prop contracts

Do not guess props. Three equivalent sources, all generated from the same JSDoc that ships in the package:

- The \`.d.ts\` files in \`node_modules/${PACKAGE_NAME}\` once installed.
- \`${origin}/components/<slug>.md\` — one markdown contract per component, next to its live docs page.
- The MCP endpoint at \`${origin}/api/mcp\` — the \`get_component\` tool returns the full contract for one component.
`;

  const catalogSections = categories.map((category) => {
    const entries = api
      .filter((entry) => entry.category === category.id)
      .map((entry) => {
        const importLine =
          entry.barrel === 'charts'
            ? `\`import { ${entry.name} } from '${PACKAGE_NAME}/charts';\` (needs the optional recharts peer)`
            : `\`import { ${entry.name} } from '${PACKAGE_NAME}';\``;
        const rendering = entry.client
          ? `client component (declares 'use client')`
          : `server-renderable (no 'use client')`;
        return [
          `### ${entry.label}`,
          '',
          entry.description,
          '',
          `- Import: ${importLine}`,
          `- Rendering: ${rendering}`,
          `- Contract: ${origin}/components/${entry.slug}.md`,
        ].join('\n');
      });
    return `## ${category.label} (${entries.length})\n\n${category.description}\n\n${entries.join('\n\n')}`;
  });

  const componentsMd = `# ${PACKAGE_NAME} component catalog

Generated from the component registry at version ${PACKAGE_VERSION}. One entry per public component; each Contract link is the component's full prop table as markdown.

${catalogSections.join('\n\n')}
`;

  return [
    { path: 'SKILL.md', content: skillMd },
    { path: join('references', 'components.md'), content: componentsMd },
  ];
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  let written = 0;
  for (const file of assembleAgentSkill()) {
    const dest = join(skillDir, file.path);
    mkdirSync(join(dest, '..'), { recursive: true });
    const existing = existsSync(dest) ? readFileSync(dest, 'utf8') : null;
    if (existing !== file.content) {
      writeFileSync(dest, file.content);
      written++;
    }
  }
  console.log(
    written > 0
      ? `✓ Agent skill regenerated — ${written} file(s) written to website/public/skill/robr0-design-system.`
      : '✓ Agent skill up to date — website/public/skill/robr0-design-system matches the registries.'
  );
}
