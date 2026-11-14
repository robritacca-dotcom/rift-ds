#!/usr/bin/env node
/**
 * validate-chat-cards.mjs — every card a chat reply can carry is drawn to
 * one recipe.
 *
 * On 2026-11-05 a side-by-side review of the chat cards found them drawn
 * eleven ways: three title sizes, four insets, three fills, two corners,
 * three one-row heights and a different gap under every title. They were
 * standardised onto one recipe, `src/behaviors/chat-card.css`, whose
 * `--ds-chat-card-*` properties are the only home of the family's values
 * (design.md's "The chat cards are one family" owns the rules). This script
 * keeps it that way, so a change to the recipe reaches every card and a new
 * card starts inside the family rather than beside it:
 *
 *   1. The family is the `:where()` selector list in chat-card.css, and
 *      every class in it belongs to a component stylesheet in
 *      src/components (a stale entry fails).
 *   2. Every member's component module imports chat-card.css, so the
 *      properties exist wherever the card renders.
 *   3. No member restates a value the recipe owns: the card fill
 *      (`--color-chat-card-bg`), the 20px inset (`--padding-500`), the
 *      bubbles' corner on a root rule (`--radius-600`) or the one-row
 *      height calc. Each reads its `--ds-chat-card-*` property instead.
 *   4. An ai component outside the family whose root rule draws a card
 *      shell of its own (a border, a corner and a fill together) fails
 *      until it joins the family or is listed in NOT_CARDS below with the
 *      reason it is not a chat card.
 *
 * Reads source CSS and TSX only, so it runs in the validate-registry chain.
 */
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { read, repoRoot } from './lib/fs.mjs';
import { finish } from './lib/report.mjs';


const RECIPE = 'src/behaviors/chat-card.css';
const componentsDir = join(repoRoot, 'src', 'components');

/** ai components that draw a shell but are not cards a reply carries. */
const NOT_CARDS = {
  AiButton: 'the entry point to the chat, a control rather than a card in the thread',
  DocumentChip: 'a legacy one-row file reference, a chip rather than a card',
  Mention: 'an inline tag in the text of a message',
  SourceChip: 'a citation pill inside a reply or a SourceTrail row',
  AgentRail: 'the companion rail beside a chat, a panel rather than a card in the thread',
  ArtifactPanel: 'the panel an artifact opens into beside the conversation',
  AttachmentTile: 'one file as a square tile, drawn to the attachment family',
  ChatHeader: 'the top row of a chat surface',
  Composer: 'the message input, drawn to the input family',
  ModelPicker: 'a picker in the composer, drawn to the menu family',
  PromptSuggestions: 'suggestion chips, drawn by Chip',
  ThreadPanel: 'the session-history rail',
  ThreadTabs: 'the strip of open sessions',
};

/** Values the recipe owns, which a member reads through its property. */
const RESTATED = [
  [/var\(--color-chat-card-bg\)/, 'the card fill: use var(--ds-chat-card-bg)'],
  [/var\(--padding-500\)/, 'the 20px inset: use var(--ds-chat-card-inset)'],
  [/calc\(var\(--control-height-compact\)\s*\+\s*2\s*\*\s*var\(--padding-100\)\)/, 'the one-row height: use var(--ds-chat-card-row-height)'],
];

const errors = [];

// 1. The family, from the recipe's :where() list.
const recipe = read(join(repoRoot, RECIPE));
const list = /:where\(([^)]*)\)\s*\{/.exec(recipe);
if (!list) {
  errors.push(`${RECIPE}: no :where(...) selector list found; the family is that list.`);
}
const family = list ? [...list[1].matchAll(/\.(ds-[a-z0-9-]+)/g)].map((m) => m[1]) : [];

// Which component stylesheet defines each root class.
const componentDirs = readdirSync(componentsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
const owner = new Map();
const rootRule = new Map();
for (const dir of componentDirs) {
  const css = join(componentsDir, dir.name, `${dir.name}.css`);
  if (!existsSync(css)) continue;
  const text = read(css);
  // A class a stylesheet's selectors open with is that component's, a
  // compound root (UsageCard's `.ds-usage-card.ds-chart`) included.
  for (const m of text.matchAll(/^\.(ds-[a-z0-9-]+)(?=[\s.:,{])/gm)) {
    if (!owner.has(m[1])) owner.set(m[1], dir.name);
  }
  for (const m of text.matchAll(/^\.(ds-[a-z0-9-]+) \{\n([\s\S]*?)\n\}/gm)) {
    if (m[1] === `ds-${dir.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`) rootRule.set(dir.name, m[2]);
  }
}

const members = new Set();
for (const cls of family) {
  const name = owner.get(cls);
  if (!name) {
    errors.push(`${RECIPE}: .${cls} is in the family but no component stylesheet defines it; remove it from the list.`);
    continue;
  }
  members.add(name);
}

for (const name of members) {
  // 2. The import.
  const tsx = join(componentsDir, name, `${name}.tsx`);
  if (!read(tsx).includes("import '../../behaviors/chat-card.css';")) {
    errors.push(`src/components/${name}/${name}.tsx: a chat card that does not import the recipe; add import '../../behaviors/chat-card.css'.`);
  }
  // 3. No restated recipe values.
  const cssPath = `src/components/${name}/${name}.css`;
  const css = read(join(repoRoot, cssPath));
  css.split('\n').forEach((line, i) => {
    for (const [pattern, fix] of RESTATED) {
      if (pattern.test(line)) errors.push(`${cssPath}:${i + 1} restates ${fix}.`);
    }
  });
  const root = rootRule.get(name);
  if (root && /border-radius:\s*var\(--radius-600\)/.test(root)) {
    errors.push(`${cssPath}: the root rule restates the bubbles' corner: use var(--ds-chat-card-radius).`);
  }
}

// 4. An ai component drawing a card shell outside the family.
const registry = JSON.parse(read(join(repoRoot, 'src', 'components', 'registry.json')));
let checked = 0;
for (const entry of registry.components.filter((c) => c.category === 'ai')) {
  checked++;
  if (members.has(entry.name) || NOT_CARDS[entry.name]) continue;
  const root = rootRule.get(entry.name);
  if (!root) continue;
  const shell = /(^|\n)\s*border(-[a-z-]+)?:/.test(root) && /border-radius:/.test(root) && /background(-color)?:/.test(root);
  if (shell) {
    errors.push(
      `src/components/${entry.name}/${entry.name}.css: an ai component drawing a card shell of its own. If a chat reply carries it, add its root class to the :where() list in ${RECIPE} and read the --ds-chat-card-* properties; if it is not a chat card, add it to NOT_CARDS in scripts/validate-chat-cards.mjs with the reason.`,
    );
  }
}
for (const name of Object.keys(NOT_CARDS)) {
  if (!registry.components.some((c) => c.name === name && c.category === 'ai')) {
    errors.push(`scripts/validate-chat-cards.mjs: NOT_CARDS names ${name}, which is not an ai component; remove it.`);
  }
}

finish(
  '✗ Chat card validation failed:',
  errors,
  `✓ Chat cards on one recipe — ${members.size} cards read ${RECIPE}; ${checked} ai components checked for a shell of their own.`,
);
