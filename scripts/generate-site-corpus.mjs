#!/usr/bin/env node
/**
 * generate-site-corpus.mjs
 *
 * Builds website/src/data/site-corpus.generated.ts — one markdown document
 * describing the whole public site, which /api/chat sends to the model as a
 * cached system block. The chat widget answers from this and nothing else.
 *
 * Two properties this file must keep, or the build breaks:
 *
 *   1. Deterministic. No network, no timestamps, no directory-order
 *      dependence. validate-site-corpus.mjs regenerates in memory and
 *      byte-compares against disk, and CI runs a drift guard after the
 *      generators, so any nondeterminism fails the build.
 *
 *   2. Public-only. Every source here is already published on the site or in
 *      the repo. Nothing private is in the model's context, so a successful
 *      prompt injection yields off-brand prose, never a leak. Keep it that
 *      way: do not add a source that isn't already public.
 *
 *   3. Owner-authored only. The model treats corpus text as context, so
 *      third-party words (a client quote, a testimonial, a pulled-in review)
 *      would be an injection surface into the chat. Today every word on the
 *      site is the owner's, which is what makes automatic page-prose
 *      extraction safe; the day a page carries third-party text, it needs
 *      an explicit decision (probably an EXCLUDED_ROUTES entry) before the
 *      next build ships it to the model.
 *
 * Both halves are security boundaries, not style choices. The public half
 * is enforced as an allowlist where it can be: an email address may reach
 * the corpus only through a page's corpus-facts() directive, and
 * validate-site-corpus.mjs fails on any other route in. That validator
 * also screens for local paths, analytics ids and keys, but it cannot
 * judge whether a new source was meant to be public, or whether the owner
 * wrote it; that judgement is the author's.
 *
 * The sources: every page's prose (read through the TypeScript AST from the
 * route's whole folder, JSX text plus the attributes in PROSE_ATTRIBUTES),
 * the corpus-facts() data blocks, the data registries, and the root specs
 * (CLAUDE.md and design.md condensed, content-design.md in full). The page
 * list is the filesystem (site-routes.mjs), so a new page is covered with no
 * registration; deliberate absences live in EXCLUDED_ROUTES with a reason.
 *
 * Section order is stable → volatile so an edit to a late section leaves the
 * earlier text byte-identical. There is one cache breakpoint today (the whole
 * corpus), but the ordering keeps a second breakpoint available later.
 *
 * Runs via the validate-registry chain and the website's predev/prebuild —
 * never edit the generated file by hand.
 *
 * Flags: --dump prints the corpus to stdout instead of writing it.
 *        --sizes prints a per-section byte/token breakdown.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { siteRoutes, isDynamicSegment } from './site-routes.mjs';
import { navLinks } from './nav-links.mjs';
import { readBreakpoints } from './breakpoint-source.mjs';
import { buildQualityGate } from './generate-quality-gate.mjs';
import { assembleAgentStarter } from './generate-agent-skill.mjs';
import { loadThemeSource } from './generate-preset-stylesheets.mjs';
import { collectA11yCoverage } from './generate-a11y-coverage.mjs';
import * as brand from './brand.mjs';
import {
  AGENT_STARTER_FILE,
  AUTHOR_NAME,
  AUTHOR_URL,
  FIGMA_URL,
  NPM_URL,
  PACKAGE_NAME,
  REPOSITORY_URL,
  STORYBOOK_URL,
} from './brand.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const websiteApp = join(repoRoot, 'website', 'src', 'app');

export const outputPath = join(
  repoRoot, 'website', 'src', 'data', 'site-corpus.generated.ts'
);

/**
 * Characters per token, measured rather than guessed: a real Sonnet 5 request
 * carrying this corpus reported 87,898 cached input tokens against ~252,000
 * characters of persona plus corpus, which is 2.87. Rounded down so the
 * estimate errs high and the gate trips early.
 *
 * Used only for the budget gate and the --sizes report; billing never depends
 * on it. Re-measure with `usage.cache_read_input_tokens` if the corpus shape
 * changes a lot.
 */
const CHARS_PER_TOKEN = 2.85;

/**
 * Generation fails above this, so the corpus can't quietly grow unbounded.
 *
 * Sized against cost, not aesthetics: the corpus is cached, so a warm message
 * reads it at roughly 2.7 cents and only a cold cache write costs real money
 * (about 35 cents, once per five-minute window). The ceiling leaves headroom
 * for the site to grow without a rewrite, while still catching a change that
 * doubles the corpus by accident.
 *
 * Raised from 95K on 2026-08-12, when publishing an essay took the corpus 188
 * tokens over. Raised again to 105K on 2026-08-14, when shipping ShaderField
 * took it 265 over — a new component, its page and its spec are exactly the
 * growth this corpus exists to carry. That raise was sized deliberately larger
 * than the overage: 100K had drifted to under 550 tokens of headroom, so every
 * clearance had become one paragraph, and a guard that fails on ordinary
 * writing gets read as noise rather than as a signal.
 *
 * Raising it is the right move for growth the corpus exists to carry — a new
 * essay, a case study, a component. It is the wrong move for a section that
 * suddenly doubled: trim that instead, and read the `--sizes` report before
 * deciding which of the two this is.
 *
 * Raised to 130K on 2026-08-25, when the walk started reading prose out of the
 * attributes in PROSE_ATTRIBUTES. That added about 5,500 tokens, effectively
 * all of it the case studies' figure captions and Alert callouts — words that
 * were on those pages all along and simply never reached the model. Sized well
 * past the overage on purpose: the budget had drifted to under 2,800 tokens of
 * headroom, which is one case study away from failing on ordinary writing.
 *
 * Raised to 140K on 2026-09-12, when the contact page's consulting blurb
 * (published so the chat can answer consulting questions) landed against
 * roughly 500 tokens of remaining headroom. No section doubled — the
 * case-study TLDRs shipped the same day deliberately stay out of the corpus
 * (their data module's doc block owns why) — so this is the ordinary-growth
 * case, sized well past the ceiling for the same headroom reason as every
 * raise above.
 *
 * Raised to 150K on 2026-11-11, when the 1.26.0 release-log entry landed
 * against about 55 tokens of headroom. No section doubled: the room had gone
 * to the specs' ordinary growth (the blueprints are half the corpus) and to
 * one log entry a release, so this is the ordinary-growth case again.
 */
const TOKEN_BUDGET = 150_000;

/** Normalize CRLF so Windows checkouts generate byte-identical output to CI. */
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

/* ============================================================
   Prose extraction from page components

   The pages are TSX, and their prose lives in two places: JSX text, and
   string literals inside data arrays (the about page's timeline bullets, the
   case-study detail fields). This walks the TypeScript AST rather than
   pattern-matching the source: a regex over these files reliably swallows
   whole runs of markup, because the pages nest components, template-literal
   class names, and inline expressions several levels deep.

   Text is gathered per block-level element, so a sentence containing an
   inline <Link> or <strong> stays one sentence instead of fragmenting.

   Run with --dump after touching a page to eyeball the result.
   ============================================================ */

/** Elements whose text is one prose line. Inline tags are folded into these. */
const BLOCK_TAGS = new Set([
  'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'figcaption', 'dt', 'dd', 'td', 'th', 'caption', 'summary',
]);

const ENTITIES = {
  '&apos;': "'", '&rsquo;': '’', '&lsquo;': '‘', '&quot;': '"',
  '&ldquo;': '“', '&rdquo;': '”', '&amp;': '&', '&nbsp;': ' ',
  '&mdash;': '—', '&ndash;': '–', '&hellip;': '…', '&times;': '×',
  '&lt;': '<', '&gt;': '>', '&rarr;': '→', '&larr;': '←', '&harr;': '↔',
};

/**
 * A JSX text node as React renders it: whitespace that holds a line break
 * is dropped at the start and end of the node, and a run of lines between
 * is joined by one space. Collapsing it to a space instead put one before
 * the full stop in `</Link>⏎  . Add it with:`, which the page never shows.
 */
const jsxText = (raw) =>
  raw
    .split(/\r?\n/)
    .map((line, index, lines) => {
      let text = line.replace(/\t/g, ' ');
      if (index > 0) text = text.replace(/^ +/, '');
      if (index < lines.length - 1) text = text.replace(/ +$/, '');
      return text;
    })
    .filter((line, index, lines) => line !== '' || lines.length === 1)
    .join(' ');

const decode = (text) =>
  text.replace(/&[a-z]+;/gi, (entity) => ENTITIES[entity] ?? entity);

/** True for fragments that read as sentences rather than code. */
export function isProse(text) {
  if (text.length < 25) return false;
  if (text.split(/\s+/).length < 4) return false;
  if (/^[/.#@]/.test(text)) return false;          // paths, selectors, imports
  if (/^https?:/.test(text)) return false;
  if (/^[\w-]+$/.test(text)) return false;         // bare identifiers
  if (/^[\d\s.,:%-]+$/.test(text)) return false;   // numeric noise
  return /[a-z]{3}/.test(text);                    // needs real words
}

const jsxTagName = (node) => {
  const opening = ts.isJsxElement(node) ? node.openingElement : node;
  return opening.tagName ? opening.tagName.getText() : '';
};

const isBlockTag = (node) =>
  (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) &&
  BLOCK_TAGS.has(jsxTagName(node));

/** True when nothing below this node is its own block, so its text is one line. */
function hasBlockDescendant(node) {
  let found = false;
  const walk = (current) => {
    if (found) return;
    current.forEachChild((child) => {
      if (found) return;
      if (isBlockTag(child)) found = true;
      else walk(child);
    });
  };
  walk(node);
  return found;
}

/**
 * Block elements, plus leaf JSX fragments. Bullet items are often written as
 * `<>text <Link>label</Link> more text</>` inside a data array; without the
 * fragment case those split into three lines mid-sentence. Fragments with
 * block descendants are skipped so a page-level wrapper can't swallow the lot.
 */
const isBlockElement = (node) =>
  isBlockTag(node) || (ts.isJsxFragment(node) && !hasBlockDescendant(node)) || isLinkCard(node);

/** A JSX element's attribute by name, or undefined. */
const jsxAttribute = (node, name) => {
  const opening = ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : null;
  return opening?.attributes.properties.find(
    (attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText() === name
  );
};

/** True when a block tag encloses the node, so it reads inside that block's line. */
function hasBlockAncestor(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (isBlockTag(current)) return true;
  }
  return false;
}

/**
 * A link that stands as a card of its own (an <a> or <Link> with an href,
 * outside any paragraph, holding no block). Its pieces are one unit: a
 * stat's number, its title and its label, or a link's name and the line
 * under it. Read piece by piece, the number was lost and the label stood
 * alone ("Each with docs and stories"); read as one line, the pieces are
 * joined with a middle dot ("178 · React components · Each with docs and
 * stories").
 */
function isLinkCard(node) {
  return (
    ts.isJsxElement(node) &&
    Boolean(jsxAttribute(node, 'href')) &&
    !hasBlockDescendant(node) &&
    !hasBlockAncestor(node)
  );
}

/**
 * Elements whose text a visitor never reads as the page's content, so the
 * walk skips their whole subtree:
 *   - aria-hidden content (an icon's ligature name, a decorative glyph)
 *   - an EmptyState, which renders only when a list has nothing to show:
 *     the releases page carried "The first entry lands with the first npm
 *     publish." beside 27 releases
 */
const SKIPPED_ELEMENTS = new Set(['EmptyState']);
function isSkippedElement(node) {
  if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) return false;
  if (SKIPPED_ELEMENTS.has(jsxTagName(node))) return true;
  const hidden = jsxAttribute(node, 'aria-hidden');
  if (!hidden) return false;
  const value = hidden.initializer;
  if (!value) return true;
  if (ts.isStringLiteral(value)) return value.text === 'true';
  return ts.isJsxExpression(value) && value.expression?.kind === ts.SyntaxKind.TrueKeyword;
}

/**
 * JSX attributes that hold copy a visitor reads, rather than markup plumbing.
 *
 * Most attributes are className, src and width, so the walk below skips them
 * wholesale. These are the exceptions: a figure caption, an Alert's title and
 * body, an image's alt text. On the case-study pages that is not decoration —
 * the captions carry the argument a diagram is making, and an Alert is how a
 * page states the context a reader needs (that a 2021 project predates
 * practical LLMs, say). Left out, the chat answers those questions blind.
 *
 * Exported so validate-shipped-prose.mjs holds the same set; two lists of
 * "which attributes hold words" would drift.
 */
export const PROSE_ATTRIBUTES = new Set([
  'caption', 'label', 'title', 'alt', 'placeholder', 'dek',
  'helperText', 'description', 'pendingLabel', 'emptyMessage',
  'sub', 'subtitle', 'delta', 'value', 'body', 'content',
  'tagline', 'detail', 'meta', 'aria-label',
]);

/**
 * Deliberately absent, and worth naming so nobody adds them: `allow` (iframe
 * permission lists), `sizes` (image hints), `gradientTransform` (SVG matrices).
 * Each holds a long string that reads as words to a sentence filter and as
 * noise to a reader. The rule for admitting an attribute here is whether a
 * visitor sees its text on the page.
 */

/**
 * The brand constants page prose interpolates as visible text, resolved to
 * what the page renders. Only public, owner-authored values belong here:
 * every string export of scripts/brand.mjs is one, since the site prints
 * them.
 */
const INLINE_CONSTANTS = new Map(
  Object.entries(brand).filter(([, value]) => typeof value === 'string' || typeof value === 'number')
);

/* ============================================================
   Inline values

   A page writes values into its prose (`{COMPONENT_COUNT} components`,
   `<code>{AGENT_STARTER_FILE}</code>`). Dropping one leaves the sentence
   with a hole ("save it at your project root as ."), and a model reading
   the corpus repeats the hole as an instruction, so every inline value is
   resolved, or its line is left out, and which of the two is never silent.

   resolveInline() tries, in order: a literal; a brand constant; a value in
   INLINE_VALUES; a module-scope constant in the same file whose initializer
   is a literal, an array literal (for `.length`) or a sum of those. A line
   with anything left over is recorded in unresolvedExpressions and kept
   out of the corpus, and pageProse fails generation for a corpus route
   unless the expression is in RUNTIME_EXPRESSIONS: a value that only
   exists while the page runs (the chip a visitor just picked).
   ============================================================ */

const read0 = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const jsonOf = (path) => JSON.parse(read0(path));

// The theme modules, loaded the way the preset generator loads them (Node's
// TypeScript stripping), so a theme's label is read from its one home.
const themeSource = await loadThemeSource();
const themeBrand = await import(
  pathToFileURL(join(repoRoot, 'website', 'src', 'lib', 'theme', 'brand.ts')).href
);
// The chat's media queries, built by the library's own helpers.
const chatQueries = await import(pathToFileURL(join(repoRoot, 'src', 'chat', 'queries.ts')).href);

/** "a, b and c", the way the pages join a short list. */
const andList = (items) =>
  items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items.join('');

/** The month-day-year date the pages print, in the site's one locale. */
const longDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * Values a page computes from published data, keyed by the expression as
 * written (whitespace folded), each computed here from the same source the
 * page reads. pageProse records which are used, and validate-site-corpus.mjs
 * fails on an entry no page uses any more, so the table cannot rot.
 */
const INLINE_VALUES = new Map(Object.entries({
  COMPONENT_COUNT: () => jsonOf(join(repoRoot, 'src', 'components', 'registry.json')).components.length,
  SKILL_COUNT: () => {
    const skills = jsonOf(join(repoRoot, '.claude', 'skills', 'registry.json'));
    return skills.displayed.length + skills.external.length;
  },
  'TOKEN_COUNTS.colour': () => jsonOf(join(repoRoot, 'src', 'tokens', 'registry.json')).categories.colour.length,
  TOKEN_COUNT: () =>
    Object.values(jsonOf(join(repoRoot, 'src', 'tokens', 'registry.json')).categories).reduce((sum, names) => sum + names.length, 0),
  TOKEN_CATEGORY_COUNT: () => Object.keys(jsonOf(join(repoRoot, 'src', 'tokens', 'registry.json')).categories).length,
  RELEASE_COUNT: () => releaseLog().releases.length,
  SYSTEM_THEME_COUNT: () => Object.keys(jsonOf(join(repoRoot, 'src', 'tokens', 'values.json')).themes).length,
  'themeList(KIT_THEME_LABELS)': (sourceFile) =>
    andList(literalValue(sourceFile, 'KIT_THEMES').map((theme) => theme.label)),
  'THEME_SELECTOR_ORDER.filter((id) => id !== BASE_THEME_ID) .map((id) => THEME_PRESETS[id].label) .join(", ")': () =>
    themeSource.THEME_SELECTOR_ORDER.filter((id) => id !== themeBrand.BASE_THEME_ID)
      .map((id) => themeSource.THEME_PRESETS[id].label)
      .join(', '),
  BEHAVIOUR_MODULE_COUNT: () => a11yCoverage().behaviourModules,
  'modalOverlays.slice(0, -1).join(", ")': () => a11yCoverage().modalOverlays.slice(0, -1).join(', '),
  'modalOverlays.at(-1)': () => a11yCoverage().modalOverlays.at(-1),
  'layerComponents.length': () => a11yCoverage().layerComponents.length,
  totalIcons: (sourceFile) =>
    literalValue(sourceFile, 'iconCategories').reduce((sum, category) => sum + category.icons.length, 0),
  'DOCK_QUERY.replace(/[()]/g, "")': () => chatQueries.DOCK_QUERY.replace(/[()]/g, ''),
  'TAKEOVER_QUERY.replace(/[()]/g, "")': () => chatQueries.TAKEOVER_QUERY.replace(/[()]/g, ''),
  THREADS_RAIL_MIN_WIDTH: () => moduleConstant(join(repoRoot, 'src', 'chat', 'queries.ts'), 'THREADS_RAIL_MIN_WIDTH'),
  ASIDE_RAIL_MIN_WIDTH: () => moduleConstant(join(repoRoot, 'src', 'chat', 'queries.ts'), 'ASIDE_RAIL_MIN_WIDTH'),
  SUGGESTION_MAX_CHARS: () => moduleConstant(join(repoRoot, 'src', 'chat', 'suggestions.ts'), 'SUGGESTION_MAX_CHARS'),
  ARTIFACT_CARD_KIND: () => moduleConstant(join(repoRoot, 'src', 'chat', 'types.ts'), 'ARTIFACT_CARD_KIND'),
  'firstRelease.version': () => releaseLog().releases.at(-1).version,
  'formatDate(firstRelease.date)': () => longDate(releaseLog().releases.at(-1).date),
  'formatDate(firstEarlierRelease.date)': () => longDate(releaseLog().predecessorReleases.at(-1).date),
  PREDECESSOR_RELEASE_COUNT: () => releaseLog().predecessorReleases.length,
}));

// From the generator's own collector, not its output file: the chain writes
// that file after this one, so reading it would lag a change by one build.
let a11yCache;
const a11yCoverage = () => (a11yCache ??= collectA11yCoverage());
const releaseLog = () => jsonOf(join(repoRoot, 'website', 'src', 'data', 'release-log.json'));

/** Expressions INLINE_VALUES answered, so a stale entry can be found. */
export const usedInlineValues = new Set();
export const inlineValueKeys = () => [...INLINE_VALUES.keys()];

/**
 * Values that exist only while a page runs, keyed `<route file>::<expression>`.
 * A line holding one is left out of the corpus, by decision, with the reason.
 */
const RUNTIME_EXPRESSIONS = new Map([
  ['docs/blocks/page.tsx::block.route', 'one line per block, drawn in a loop; the blocks section lists each block by name'],
  ['foundations/themes/page.tsx::preset.radiusScale', 'a per-theme readout drawn in a loop over the presets'],
  ['foundations/themes/page.tsx::preset.density', 'a per-theme readout drawn in a loop over the presets'],
  ['foundations/themes/page.tsx::motionSpeedPercent(preset.motionScale)', 'a per-theme readout drawn in a loop over the presets'],
  ['foundations/themes/page.tsx::preset.elevation', 'a per-theme readout drawn in a loop over the presets'],
  ['foundations/themes/page.tsx::tiles.length', 'the count of tiles the page draws for the visitor\'s colour mode'],
  ['playground/sections/AiSection.tsx::suggestion', 'the chip the visitor just picked'],
  ['playground/sections/SurfacesSection.tsx::card + 1', 'the card the visitor is on in the deck'],
]);
export const runtimeExpressionKeys = () => [...RUNTIME_EXPRESSIONS.keys()];

/** Marks a value the walk could not resolve, inside a line being gathered. */
const UNRESOLVED = '\u0000';

/**
 * Inline expressions a page renders that could not be resolved, gathered
 * per file by extractProse: { expression, line }. pageProse checks them.
 */
export const unresolvedExpressions = new Map();

/** A literal initializer as a JS value: strings, numbers, booleans, arrays and objects of them. */
function literalOf(node) {
  while (node && (ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isSatisfiesExpression(node))) {
    node = node.expression;
  }
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) {
    const items = node.elements.map(literalOf);
    return items.includes(undefined) ? undefined : items;
  }
  if (ts.isObjectLiteralExpression(node)) {
    const out = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue; // a spread or method is not data
      const key = property.name.text ?? property.name.getText();
      // A value that is not literal (JSX, a call) stays undefined in the
      // object: the count of an array of such objects still resolves.
      out[key] = literalOf(property.initializer);
    }
    return out;
  }
  return undefined;
}

/** A module-scope `const` in the file, as a literal value, or undefined. */
function literalValue(sourceFile, name) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    if (!(statement.declarationList.flags & ts.NodeFlags.Const)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === name) {
        return literalOf(declaration.initializer);
      }
    }
  }
  return undefined;
}

/** A literal constant exported by another module, read without running it. */
function moduleConstant(path, name) {
  const value = literalValue(ts.createSourceFile(path, read0(path), ts.ScriptTarget.Latest, true), name);
  if (value === undefined) throw new Error(`generate-site-corpus: ${name} in ${path} is no longer a literal constant; update INLINE_VALUES.`);
  return value;
}

/** What an inline `{expression}` renders as text, or undefined when unknown. */
function resolveInline(expression, sourceFile) {
  const value = valueOf(expression, sourceFile);
  return value === undefined || typeof value === 'object' ? undefined : String(value);
}

function valueOf(expression, sourceFile) {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
  if (ts.isNumericLiteral(expression)) return Number(expression.text);
  if (ts.isParenthesizedExpression(expression)) return valueOf(expression.expression, sourceFile);
  if (ts.isTemplateExpression(expression)) {
    let text = expression.head.text;
    for (const span of expression.templateSpans) {
      const part = valueOf(span.expression, sourceFile);
      if (part === undefined || typeof part === 'object') return undefined;
      text += String(part) + span.literal.text;
    }
    return text;
  }
  const key = expression.getText(sourceFile).replace(/\s+/g, ' ');
  if (INLINE_VALUES.has(key)) {
    usedInlineValues.add(key);
    return INLINE_VALUES.get(key)(sourceFile);
  }
  if (ts.isIdentifier(expression)) {
    if (INLINE_CONSTANTS.has(expression.text)) return INLINE_CONSTANTS.get(expression.text);
    return literalValue(sourceFile, expression.text);
  }
  // `items.length` on a literal array in the same file.
  if (ts.isPropertyAccessExpression(expression) && expression.name.text === 'length') {
    const target = valueOf(expression.expression, sourceFile);
    return Array.isArray(target) ? target.length : undefined;
  }
  // A sum of resolved numbers (`core.length + extended.length`).
  if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = valueOf(expression.left, sourceFile);
    const right = valueOf(expression.right, sourceFile);
    return typeof left === 'number' && typeof right === 'number' ? left + right : undefined;
  }
  return undefined;
}

/** True when a string literal is structural rather than prose. */
function isStructuralString(node) {
  const parent = node.parent;
  if (!parent) return true;
  if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) return true;
  const attribute = ts.isJsxAttribute(parent) ? parent
    : ts.isJsxAttribute(parent?.parent) ? parent.parent
    : null;
  if (attribute) {
    return !(
      ts.isIdentifier(attribute.name) && PROSE_ATTRIBUTES.has(attribute.name.text)
    );
  }
  return false;
}

/* Exported so validate-shipped-prose.mjs checks exactly the text this
   extracts. Two readers of "what counts as page prose" would drift; one
   cannot. */
export function extractProse(source, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName, source, ts.ScriptTarget.Latest, /* setParentNodes */ true, ts.ScriptKind.TSX
  );

  const seen = new Set();
  const consumed = new Set();
  const lines = [];

  const push = (raw) => {
    const text = decode(raw).replace(/\s+/g, ' ').trim();
    if (text.includes(UNRESOLVED)) {
      const readable = text.replace(new RegExp(`${UNRESOLVED}([^${UNRESOLVED}]*)${UNRESOLVED}`, 'g'), '{$1}');
      const words = text.replace(new RegExp(`${UNRESOLVED}[^${UNRESOLVED}]*${UNRESOLVED}`, 'g'), '');
      if (!isProse(words.trim())) return;
      const found = unresolvedExpressions.get(fileName) ?? [];
      for (const match of text.matchAll(new RegExp(`${UNRESOLVED}([^${UNRESOLVED}]*)${UNRESOLVED}`, 'g'))) {
        found.push({ expression: match[1], line: readable });
      }
      unresolvedExpressions.set(fileName, found);
      return;
    }
    if (!isProse(text) || seen.has(text)) return;
    seen.add(text);
    lines.push(text);
  };

  /** All text directly under a block element, skipping nested block elements. */
  const inlineText = (node, parts) => {
    node.forEachChild((child) => {
      if (isSkippedElement(child)) return;
      if (ts.isJsxText(child)) {
        consumed.add(child);
        parts.push(decode(jsxText(child.text)));
      } else if (ts.isJsxExpression(child) && child.expression && !ts.isJsxAttribute(child.parent)) {
        // `{" "}` and `{AUTHOR_NAME}` render as text, so they read as text:
        // dropping them left "built by ." in the corpus.
        const { expression } = child;
        const value = resolveInline(expression, sourceFile);
        if (value !== undefined) parts.push(value);
        else {
          // JSX inside the expression (`{open && <em>…</em>}`) still reads
          // as text; an expression that yields none is a value the page
          // computes, which the walk cannot know.
          const before = parts.join('');
          inlineText(child, parts);
          if (parts.join('') === before) parts.push(`${UNRESOLVED}${expression.getText(sourceFile).replace(/\s+/g, ' ')}${UNRESOLVED}`);
        }
      } else if (isBlockElement(child)) {
        // Emitted on its own line when the walk reaches it.
      } else {
        inlineText(child, parts);
      }
    });
    return parts;
  };

  /** A link card's pieces, each element's text on its own, joined with a middle dot. */
  const cardText = (node) => {
    const pieces = [];
    const collect = (current) => {
      current.forEachChild((child) => {
        if (isSkippedElement(child)) return;
        if (ts.isJsxElement(child) && !child.children.some((c) => ts.isJsxElement(c) || ts.isJsxSelfClosingElement(c))) {
          pieces.push(inlineText(child, []).join(''));
        } else if (ts.isJsxText(child) || ts.isJsxExpression(child)) {
          pieces.push(inlineText({ forEachChild: (fn) => fn(child) }, []).join(''));
        } else {
          collect(child);
        }
      });
    };
    collect(node);
    return pieces.map((piece) => piece.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' · ');
  };

  const visit = (node) => {
    if (isSkippedElement(node)) return;
    if (isLinkCard(node)) {
      push(cardText(node));
    } else if (isBlockElement(node)) {
      // Joined without a separator: JSX text nodes carry their own spacing, so
      // adding one puts a space before the punctuation after an inline <strong>.
      push(inlineText(node, []).join(''));
    } else if (ts.isJsxText(node) && !consumed.has(node)) {
      push(jsxText(node.text));
    } else if (
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      !isStructuralString(node)
    ) {
      push(node.text);
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return lines.join('\n');
}

/**
 * Next's own file conventions. Their text is metadata, chrome or an error
 * state, never page prose, so the co-located sweep below skips them.
 */
const NEXT_SPECIAL_FILES = new Set([
  'layout', 'template', 'loading', 'error', 'global-error', 'not-found',
  'default', 'icon', 'apple-icon', 'opengraph-image', 'twitter-image',
]);

/**
 * The .tsx files a route folder owns besides page.tsx, sorted for determinism.
 *
 * A page that outgrows one file splits into co-located components — the
 * playground's section files are the worked example, and a long case study is
 * the obvious next one. Reading page.tsx alone made that refactor silently
 * delete the page from the chat's knowledge while every validator stayed
 * green: the route is still on disk, still "covered", and now says nothing.
 *
 * Only folders that are not themselves routes are followed, so one page can
 * never swallow another's prose, and the root route is skipped outright
 * because its folder is the whole app directory.
 */
function coLocatedFiles(dir, isRoot) {
  if (isRoot) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  )) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      // A folder holding a page.tsx is another route; it speaks for itself.
      if (existsSync(join(full, 'page.tsx'))) continue;
      files.push(...coLocatedFiles(full, false));
    } else if (
      entry.name.endsWith('.tsx') &&
      entry.name !== 'page.tsx' &&
      !NEXT_SPECIAL_FILES.has(entry.name.replace(/\.tsx$/, ''))
    ) {
      files.push(full);
    }
  }
  return files;
}

/** Runtime expressions met on corpus routes, so a stale sanction can be found. */
export const usedRuntimeExpressions = new Set();

export const pageProse = (...segments) => {
  const dir = join(websiteApp, ...segments);
  const sources = [join(dir, 'page.tsx'), ...coLocatedFiles(dir, segments.length === 0)];
  const prose = sources
    .map((path) => extractProse(read(path), path))
    .filter(Boolean)
    .join('\n');
  // An inline value the walk could not resolve, on a page the chat reads,
  // fails generation (the Inline values block above owns the rules).
  for (const path of sources) {
    const rel = path.slice(websiteApp.length + 1).replaceAll('\\', '/');
    for (const { expression, line } of unresolvedExpressions.get(path) ?? []) {
      const key = `${rel}::${expression}`;
      if (RUNTIME_EXPRESSIONS.has(key)) {
        usedRuntimeExpressions.add(key);
        continue;
      }
      throw new Error(
        `generate-site-corpus: ${rel} renders {${expression}} in prose the corpus cannot resolve:\n  ${line}\n` +
          `Add it to INLINE_VALUES in scripts/generate-site-corpus.mjs, computed from the same data the page reads, ` +
          `or to RUNTIME_EXPRESSIONS with a reason if it only exists while the page runs.`
      );
    }
  }
  return prose;
};

/* ============================================================
   Published facts — the corpus-facts directive

   isProse() deliberately drops short data strings, which is exactly what
   loses an email address or a job title stored in a data array. A page opts
   its data in *in place*, with a comment above a module-scope declaration:

     /* corpus-facts(Ways to reach Rob): published on /contact *​/
     const connectMethods: ContactMethod[] = [ … ];

   The initializer is serialised as a labelled fact block. The label becomes
   the heading; the reason is for the repo reader. Same convention as the CSS
   ds-allow() directive: the sanction lives next to the thing it sanctions.

   These blocks are also the leak-screen allowlist: validate-site-corpus.mjs
   permits a contact-shaped detail (an email address) in the corpus only when
   it arrived through a corpus-facts block — i.e. only when a page deliberately
   published it. A malformed directive fails generation outright.
   ============================================================ */

const FACTS_DIRECTIVE = /corpus-facts\(([^)]*)\)/;

/** Property names that never carry visitor-facing facts. */
const DROP_PROPS = new Set(['icon', 'logo', 'image', 'avatar', 'cover']);

/** Asset references (`/logos/x.svg`) are chrome, not facts. */
const isAssetPath = (text) => /^\/[\w./-]+\.[a-z0-9]{2,4}$/i.test(text);

/** All human-readable text inside a JSX value, flattened to one line. */
function jsxToText(node) {
  const parts = [];
  const walk = (current) => {
    if (ts.isJsxText(current)) {
      parts.push(decode(current.text));
      return;
    }
    if (ts.isJsxAttributes(current) || ts.isJsxAttribute(current)) return;
    if (ts.isStringLiteral(current) && ts.isJsxExpression(current.parent)) {
      parts.push(decode(current.text));
      return;
    }
    current.forEachChild(walk);
  };
  walk(node);
  return parts.join('').replace(/\s+/g, ' ').trim();
}

/**
 * Serialise an opted-in initializer to fact lines. Property names become
 * labels; a `{label, value}` pair collapses to `Label: value`; arrays of
 * strings become bullets; booleans stay (`present: true` is how the timeline
 * marks a current role); asset paths and DROP_PROPS are chrome and dropped.
 * Every emitted value string is collected for the leak-screen allowlist.
 */
function factsLines(node, values) {
  const text = (n) => {
    const t = decode(n.text).replace(/\s+/g, ' ').trim();
    values.add(t);
    return t;
  };

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return [text(node)];
  }
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) {
    const t = jsxToText(node);
    if (t) values.add(t);
    return t ? [t] : [];
  }
  if (ts.isArrayLiteralExpression(node)) {
    const lines = [];
    for (const element of node.elements) {
      if (ts.isObjectLiteralExpression(element) || ts.isArrayLiteralExpression(element)) {
        if (lines.length > 0) lines.push('');
        lines.push(...factsLines(element, values));
      } else {
        const inner = factsLines(element, values);
        lines.push(...inner.map((line) => `- ${line}`));
      }
    }
    return lines;
  }
  if (ts.isObjectLiteralExpression(node)) {
    const props = node.properties.filter((p) => ts.isPropertyAssignment(p));
    const named = new Map(
      props.map((p) => [p.name && ts.isIdentifier(p.name) ? p.name.text : p.name?.getText(), p])
    );
    const lines = [];
    const emitted = new Set();

    // `{label, value}` is the common published-channel shape — collapse it.
    const labelProp = named.get('label');
    const valueProp = named.get('value');
    if (
      labelProp && valueProp &&
      ts.isStringLiteral(labelProp.initializer) && ts.isStringLiteral(valueProp.initializer)
    ) {
      lines.push(`${text(labelProp.initializer)}: ${text(valueProp.initializer)}`);
      emitted.add('label');
      emitted.add('value');
    }

    for (const prop of props) {
      const name = prop.name && ts.isIdentifier(prop.name) ? prop.name.text : prop.name?.getText();
      if (!name || emitted.has(name) || DROP_PROPS.has(name)) continue;
      const value = prop.initializer;
      if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) {
        const t = decode(value.text).replace(/\s+/g, ' ').trim();
        if (isAssetPath(t)) continue;
        values.add(t);
        lines.push(`${name}: ${t}`);
      } else if (value.kind === ts.SyntaxKind.TrueKeyword) {
        lines.push(`${name}: true`);
      } else if (value.kind === ts.SyntaxKind.FalseKeyword) {
        lines.push(`${name}: false`);
      } else if (ts.isNumericLiteral(value)) {
        lines.push(`${name}: ${value.text}`);
      } else if (ts.isJsxElement(value) || ts.isJsxSelfClosingElement(value) || ts.isJsxFragment(value)) {
        const t = jsxToText(value);
        if (t) {
          values.add(t);
          lines.push(`${name}: ${t}`);
        }
      } else if (ts.isArrayLiteralExpression(value) || ts.isObjectLiteralExpression(value)) {
        lines.push(...factsLines(value, values));
      }
      // Anything else (call expressions, identifiers) is code, not a fact.
    }
    return lines;
  }
  return [];
}

/**
 * Fact blocks declared in one page file: `[{label, lines, values}]`.
 * Throws when a `corpus-facts` marker exists that did not parse as a
 * directive on a module-scope declaration — a sanction that silently fails
 * open would defeat the point of having one.
 */
function extractFacts(source, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX
  );

  const blocks = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const ranges = ts.getLeadingCommentRanges(source, statement.getFullStart()) ?? [];
    for (const range of ranges) {
      const comment = source.slice(range.pos, range.end);
      const match = comment.match(FACTS_DIRECTIVE);
      if (!match) continue;
      const label = match[1].trim();
      if (!label) {
        throw new Error(`${fileName}: corpus-facts directive has an empty label`);
      }
      const declaration = statement.declarationList.declarations[0];
      if (!declaration?.initializer) {
        throw new Error(
          `${fileName}: corpus-facts(${label}) sits on a declaration with no initializer`
        );
      }
      const values = new Set();
      const lines = factsLines(declaration.initializer, values);
      if (lines.length === 0) {
        throw new Error(`${fileName}: corpus-facts(${label}) produced no facts — check the shape`);
      }
      blocks.push({ label, lines, values });
    }
  }

  const markers = source.split('corpus-facts(').length - 1;
  if (markers !== blocks.length) {
    throw new Error(
      `${fileName}: ${markers} corpus-facts marker(s) but ${blocks.length} parsed — ` +
        `a directive is malformed or not attached to a module-scope declaration`
    );
  }
  return blocks;
}

/**
 * Prose plus rendered fact blocks for one page.
 *
 * Prose comes from the whole route folder via `pageProse`; facts stay bound to
 * page.tsx, which is where a `corpus-facts()` directive is declared and what
 * `sanctionedFacts` reads to build the leak-screen allowlist. Keeping those
 * two readers on the same file is what makes the screen fail closed: a
 * contact-shaped detail published anywhere else has no allowlist entry, so it
 * fails the build rather than slipping through.
 */
function pageContent(...segments) {
  const path = join(websiteApp, ...segments, 'page.tsx');
  const facts = extractFacts(read(path), path);
  const factsMarkdown = facts
    .map(({ label, lines }) => `#### ${label}\n\n${lines.join('\n')}`)
    .join('\n\n');
  return { prose: pageProse(...segments), factsMarkdown, facts };
}

/**
 * Every value string published through a corpus-facts block, across all
 * static pages. This is the leak-screen allowlist: a detail may appear in
 * the corpus only if a page deliberately published it.
 */
export function sanctionedFacts() {
  const values = new Set();
  for (const route of siteRoutes()) {
    if (route.split('/').some(isDynamicSegment)) continue;
    const segments = route === '/' ? [] : route.slice(1).split('/');
    const path = join(websiteApp, ...segments, 'page.tsx');
    for (const block of extractFacts(read(path), path)) {
      for (const value of block.values) values.add(value);
    }
  }
  return values;
}

/* ============================================================
   Navigation

   navigation.ts is TypeScript importing from the package workspace, so this
   Node script reads it as text rather than importing it. The link arrays are
   flat object literals, which is what makes that safe. The parser, navLinks,
   lives in nav-links.mjs, shared with the playground's template thumbnails.
   ============================================================ */

const linkLines = (links) =>
  links
    .map((l) => `- ${l.label} (${l.href})${l.description ? `: ${l.description}` : ''}${l.mobileOnly ? ' (phone only, no tablet or desktop layout)' : ''}`)
    .join('\n');

/**
 * Component doc paths come from the registry, not from navigation.ts:
 * componentsSidebarLinks is *derived* from the registry in code, so the
 * textual parse above sees only its hardcoded overview entry — which once
 * left the model a "complete" site map with one component path in it.
 */
function componentDocLines() {
  const registry = JSON.parse(read(join(repoRoot, 'src', 'components', 'registry.json')));
  const widgets = JSON.parse(read(join(repoRoot, 'src', 'chat', 'registry.json')));
  // The chat widget's page sits under /components with the rest (src/chat/registry.json).
  return [...registry.components, ...widgets.widgets]
    .map((c) => `- ${c.label} (/components/${c.slug})`)
    .sort((a, b) => a.localeCompare(b))
    .join('\n');
}

/* ============================================================
   design.md

   The full spec is ~110KB, and its "## Components" section is ~73KB of
   token-level detail that a visitor conversation never needs at that depth.
   Condense it to each component's opening paragraph and keep every other
   section whole: the design language, theme contract, and known gaps are
   what people actually ask about.
   ============================================================ */

function condenseDesignSpec(source) {
  const componentsStart = source.indexOf('\n## Components\n');
  if (componentsStart === -1) {
    throw new Error('design.md: no "## Components" section — the trim needs updating');
  }
  const after = source.indexOf('\n## ', componentsStart + 1);
  if (after === -1) {
    throw new Error('design.md: "## Components" is the final section — the trim needs updating');
  }

  // The per-component blocks are dropped entirely: the Component library
  // section already carries every component's registry description and doc
  // path, and each page goes deeper than a spec paragraph could. The freed
  // budget is what pays for the essays.
  return [
    source.slice(0, componentsStart),
    '\n## Components\n',
    '\nComponent-level specs are deliberately not repeated here. The Component ',
    'library section of this document lists every component with its ',
    'description and documentation path (/components/<slug>); the full ',
    'token-level specs live in the design.md download at /blueprints/design ',
    'and in Storybook.\n',
    source.slice(after),
  ].join('');
}

/* ============================================================
   Sections
   ============================================================ */

export function sectionSiteMap() {
  const nav = read(join(repoRoot, 'website', 'src', 'config', 'navigation.ts'));
  return `## Site map

Every page on the site. Link to these paths when pointing someone at more detail.

### Main pages

- Home (/): the design system on one page, with live component demos
- Playground (/playground): re-theme the design system live and export the theme as CSS, a THEME.md and an agent prompt

### Design system docs

${linkLines(navLinks(nav, 'docsSidebarLinks'))}

### Foundations

${linkLines(navLinks(nav, 'foundationsSidebarLinks'))}

### Templates

Complete product screens built from the system alone, with fictional data. The /templates index previews each one live.

${linkLines(navLinks(nav, 'templatesSidebarLinks'))}

### Component documentation

- Components overview (/components)
${componentDocLines()}

### Elsewhere

- Storybook: ${STORYBOOK_URL} (rendered API reference with props tables)
- npm: ${NPM_URL} (\`npm install ${PACKAGE_NAME}\`)
- GitHub: ${REPOSITORY_URL} (full source)
- Figma: ${FIGMA_URL} (the free Figma kit on the Figma Community; /docs/figma explains it)

### Author

Designed and built by ${AUTHOR_NAME} (${AUTHOR_URL}), who writes the specs Claude Code builds from. The site footer credits the same person on every page. MIT licensed.`;
}

/* ============================================================
   Site pages — every other route's prose, automatically

   The page list is the filesystem (scripts/site-routes.mjs), the same
   authority the sitemap uses, so a new page's prose reaches the corpus on
   the next build with no registration step. Routes covered by a dedicated
   section (About, Blueprints…) are mapped to it; routes that
   must NOT be included are excluded here with a written reason.
   validate-chat-coverage.mjs holds this map honest against the disk.
   ============================================================ */

/** Routes whose content already lives in a dedicated section. */
function coveredElsewhere() {
  return new Map([
    ['/components', 'Components'],
    ['/loops', 'Loops'],
    ['/blueprints/claude', 'Blueprints'],
    ['/blueprints/design', 'Blueprints'],
    ['/blueprints/content-design', 'Blueprints'],
  ]);
}

/**
 * Routes deliberately absent from the corpus. Every entry needs a reason a
 * stranger could audit; the coverage validator fails on stale entries.
 */
const EXCLUDED_ROUTES = new Map([
  ['/foundations/themes/[id]',
    'one specimen page per theme, drawing the components in that theme: its only prose is specimen sample text, and every fact it shows is in the theme presets the corpus already carries through /foundations/themes'],
  ['/',
    'the home page is the landing collage — its prose is demo filler for the live components, and its closing questions restate facts the pages they link to own (get-started, the chat docs, the playground); the sections it links to are all covered'],
  ['/graph',
    'the dependency-graph instrument — its prose is the instrument\'s own controls and panel labels; the graph\'s data is the registries the corpus already carries, and the /overview section that links to it is covered'],
  ['/labs',
    'the noindex labs index: a list of the labs experiments, each one excluded below, whose only prose is their titles and one-line descriptions'],
  ['/labs/marketing',
    'a noindex test page rebuilding a reference marketing dashboard entirely from the system\'s tokens and components, to probe how far they stretch — its prose is fictional demo data, not information'],
  ['/labs/glass-chat',
    'a noindex test page hosting the site chat as frosted glass over a piece of art — a surface experiment whose only prose is the chat widget\'s own'],
  ['/labs/horizon',
    'a noindex test page hosting the site chat over a soft planet horizon drawn in a shader, a surface experiment whose only prose is the chat widget\'s own'],
  ['/labs/rift',
    'a noindex test page hosting the site chat as frosted glass over a glowing tear in the page, a surface experiment whose only prose is the chat widget\'s own'],
  ['/labs/tables',
    'the table test bench: fictional projects staged to judge the tables, a labs page outside the IA'],
  ['/labs/table-command',
    'the table command bench: a fictional order ledger staged to test the toolbar AI command, a labs page outside the IA'],
  ['/labs/rtl',
    'the right-to-left bench: the library laid out in placeholder Arabic to test direction, a labs page outside the IA'],
  ['/labs/tables/full',
    'the table bench\'s most complex table as a full page: the same fictional projects, a labs page outside the IA'],
  ['/labs/bento',
    'a noindex test page for feature banners that open into an overlay — a surface experiment whose prose restates facts the covered pages already carry'],
  ['/labs/raceway-chat',
    'the raceway chat lab: a chat-first construction platform over a generated MEP model drawn with xeokit, a noindex surface experiment whose prose is fictional demo data'],
  ['/templates/analytics',
    'the analytics template rendered full viewport — its prose is fictional demo data; its name and summary reach the corpus through the site map\'s Templates list, drawn from templatesSidebarLinks'],
  ['/templates/chat-home',
    'the chat home template rendered full viewport, an assistant product whose welcome screen is a board of tiles — its prose is fictional demo data and scripted replies; its name and summary reach the corpus through the site map\'s Templates list, drawn from templatesSidebarLinks'],
  ['/templates/mobile-dashboard',
    'the mobile dashboard template rendered full viewport, a phone-only app screen — its prose is fictional demo data; its name and summary reach the corpus through the site map\'s Templates list, drawn from templatesSidebarLinks'],
  ['/templates/relay-console',
    'the relay console template rendered full viewport — its prose is fictional network telemetry; its name and summary reach the corpus through the site map\'s Templates list, drawn from templatesSidebarLinks'],
  ['/templates/team-calendar',
    'the team calendar template rendered full viewport — its prose is fictional schedule data; its name and summary reach the corpus through the site map\'s Templates list, drawn from templatesSidebarLinks'],
  ['/templates/roadmap-planner',
    'the roadmap planner template rendered full viewport — its prose is a fictional product plan; its name and summary reach the corpus through the site map\'s Templates list, drawn from templatesSidebarLinks'],
  ['/templates/merchant-sales',
    'the merchant sales template rendered full viewport — its prose is a fictional merchant ledger; its name and summary reach the corpus through the site map\'s Templates list, drawn from templatesSidebarLinks'],
  ['/templates/sign-in',
    'the sign-in template rendered full viewport — its prose is a fictional product\'s front door; its name and summary reach the corpus through the site map\'s Templates list, drawn from templatesSidebarLinks'],
  ['/docs/blocks/app-shell',
    'the app-shell block rendered full screen from the file the init bin ships: placeholder data in a fictional product; the block\'s name, description and command reach the corpus through /docs/blocks, which maps over the blocks registry'],
  ['/docs/blocks/dashboard',
    'the dashboard block rendered full screen from the file the init bin ships: placeholder data in a fictional product; the block\'s name, description and command reach the corpus through /docs/blocks, which maps over the blocks registry'],
  ['/docs/blocks/sign-in',
    'the sign-in block rendered full screen from the file the init bin ships: placeholder data in a fictional product; the block\'s name, description and command reach the corpus through /docs/blocks, which maps over the blocks registry'],
  ['/templates/landing-page',
    'the landing page template rendered full viewport — its prose is a fictional payments product\'s marketing page; its name and summary reach the corpus through the site map\'s Templates list, drawn from templatesSidebarLinks'],
]);

/** Component showcase pages: excluded as a class, with one shared reason. */
const COMPONENT_PAGE_EXCLUSION =
  'component showcase pages are demo shells; each component’s facts are carried by the ' +
  'Component library section (registry description + path) and the design.md spec paragraph';


/** The routes whose prose the Site pages section includes, in sorted order. */
function sitePageRoutes() {
  const covered = coveredElsewhere();
  return siteRoutes().filter((route) => {
    if (route.split('/').some(isDynamicSegment)) return false;
    if (covered.has(route)) return false;
    if (EXCLUDED_ROUTES.has(route)) return false;
    if (/^\/components\//.test(route)) return false;
    return true;
  });
}

/**
 * Coverage declaration for validate-chat-coverage.mjs: every disk route is
 * either covered by a section or excluded with a reason.
 */
export function routeCoverage() {
  const covered = new Map(coveredElsewhere());
  for (const route of sitePageRoutes()) covered.set(route, 'Site pages');
  const excluded = new Map(EXCLUDED_ROUTES);
  for (const route of siteRoutes()) {
    if (/^\/components\//.test(route)) excluded.set(route, COMPONENT_PAGE_EXCLUSION);
  }
  return { covered, excluded };
}

/**
 * Data a page renders from a module rather than writing in its source, so
 * the prose extractor cannot see it. Each entry reads the same module the
 * page does, keyed by route; validate-corpus-coverage.mjs is what notices
 * when a page needs one.
 */
const ROUTE_DATA = new Map([
  ['/skills/super-ship', () =>
    'Every check a ship runs, in order (from the validate-registry and verify entries in package.json and the CI workflow; the page renders the same list):\n\n' +
    buildQualityGate()
      .map((group) => `${group.title}. ${group.body}\n` + group.checks.map((c) => `- ${c.name}: ${c.text}`).join('\n'))
      .join('\n\n')],
  ['/foundations/layout', () =>
    'Breakpoints, from the library (src/tokens/breakpoints.ts, published as rift-ds/tokens/breakpoints) and the site (website/src/config/breakpoints.ts):\n\n' +
    readBreakpoints(repoRoot)
      .map((b) => `- ${b.label}, ${b.query}, ${b.scope}: ${b.role}`)
      .join('\n') +
    '\n\nThe site\'s layout custom properties (declared in its global stylesheet; the page prints their values from it):\n\n' +
    [...read(join(repoRoot, 'website', 'src', 'config', 'layout-properties.ts'))
      .matchAll(/name:\s*"(--layout-[\w-]+)",\s*role:\s*"([^"]+)"/g)]
      .map((m) => `- ${m[1]}: ${m[2]}`)
      .join('\n') +
    '\n\nStacking layers, lowest first (the library\'s --layer-* in src/tokens/tokens-light.css, then the site\'s --layer-site-* in its global stylesheet):\n\n' +
    [
      ...read(join(repoRoot, 'src', 'tokens', 'tokens-light.css')).matchAll(/(--layer-[\w-]*)\s*:\s*(\d+)\s*;[ \t]*\/\*\s*([^*]+?)\s*\*\//g),
      ...read(join(repoRoot, 'website', 'src', 'app', 'globals.css')).matchAll(/(--layer-site-[\w-]*)\s*:\s*(\d+)\s*;[ \t]*\/\*\s*([^*]+?)\s*\*\//g),
    ]
      .sort((a, b) => Number(a[2]) - Number(b[2]))
      .map((m) => `- ${m[1]}, z-index ${m[2]}: ${m[3]}`)
      .join('\n')],
]);

/**
 * Each corpus page's text, by route: its prose, its corpus-facts blocks and
 * its route data. Shared with generate-site-search.mjs, so the MCP's search
 * index reads a page exactly as the chat does.
 */
export function sitePageBodies() {
  return sitePageRoutes()
    .map((route) => {
      const segments = route === '/' ? [] : route.slice(1).split('/');
      const { prose, factsMarkdown } = pageContent(...segments);
      const body = [prose, factsMarkdown, ROUTE_DATA.get(route)?.()].filter(Boolean).join('\n\n');
      return { route, body };
    })
    .filter(({ body }) => body);
}

function sectionSitePages() {
  const pages = sitePageBodies()
    .map(({ route, body }) => `### ${route === '/' ? '/ (home)' : route}\n\n${body}`)
    .join('\n\n');

  return `## Site pages

Prose from the site's pages, by route. The components and the blueprints have their own sections.

${pages}`;
}

/**
 * CLAUDE.md, minus the procedural body. A visitor asks *why* the system works
 * the way it does — the registry principle, the token tiers, the shipping
 * vocabulary — never how to run the seventh validator. The step-by-step
 * checklists and file tables are dead weight in a conversation.
 * Throws when an expected heading disappears, so a doc restructure fails
 * loudly instead of silently shipping a mangled corpus.
 */
const CLAUDE_MD_DROPPED_SECTIONS = [
  'Quick Start',
  'Project Structure',
  'How to Add a New Component',
  'How to Add a New Token',
  'Key Files',
];

function condenseClaudeMd(source) {
  let condensed = source;
  for (const heading of CLAUDE_MD_DROPPED_SECTIONS) {
    const start = condensed.indexOf(`\n## ${heading}\n`);
    if (start === -1) {
      throw new Error(`CLAUDE.md: no "## ${heading}" section — the corpus trim needs updating`);
    }
    const after = condensed.indexOf('\n## ', start + 1);
    condensed =
      after === -1
        ? condensed.slice(0, start)
        : condensed.slice(0, start) + condensed.slice(after);
  }
  return condensed;
}

function sectionBlueprints() {
  const claude = condenseClaudeMd(read(join(repoRoot, 'CLAUDE.md')));
  const design = condenseDesignSpec(read(join(repoRoot, 'design.md')));
  const content = read(join(repoRoot, 'content-design.md'));

  return `## Blueprints: the specs this project is built from

These published markdown documents are how the site and design system get built. Each is readable on its own page: /blueprints/claude, /blueprints/design, and /blueprints/content-design. There is no /blueprints index page, so always link the specific document.

A fourth file, ${AGENT_STARTER_FILE}, is for people building with the package rather than the system itself: a short starter to save at a project root or paste into a coding agent. Its full text is shown with a copy button at the top of /docs/get-started (the "With an agent" tab), the header's Get started button copies it in one click, and the raw file is at /${AGENT_STARTER_FILE}.

### ${AGENT_STARTER_FILE}: the starter for a coding agent

${assembleAgentStarter().replace(/^#\s+.+\n+/, '').replace(/^## /gm, '#### ')}

### CLAUDE.md: how the repository is maintained

Condensed to the architecture: the step-by-step contributor checklists live in the full document at /blueprints/claude.

${claude}

### design.md: the design specification

${design}

### content-design.md: the writing rules

${content}`;
}

function sectionComponents() {
  const registry = JSON.parse(read(join(repoRoot, 'src', 'components', 'registry.json')));
  const byCategory = new Map();
  for (const c of registry.components) {
    if (!byCategory.has(c.category)) byCategory.set(c.category, []);
    byCategory.get(c.category).push(c);
  }

  const groups = registry.categories
    .map((cat) => {
      const items = byCategory.get(cat.id) ?? [];
      const lines = items
        .map((c) => `- ${c.label} (/components/${c.slug}): ${c.description}`)
        .join('\n');
      return `### ${cat.label}\n\n${cat.description}\n\n${lines}`;
    })
    .join('\n\n');

  return `## Component library

${pageProse('components')}

${registry.components.length} components published as ${PACKAGE_NAME}, grouped by category. Each has documentation at the path shown.

${groups}`;
}

function sectionSkills() {
  const skillsDir = join(repoRoot, '.claude', 'skills');
  const registry = JSON.parse(read(join(skillsDir, 'registry.json')));

  const entries = registry.displayed.map((slug) => {
    const source = read(join(skillsDir, slug, 'SKILL.md'));
    const fm = source.match(/^---\n([\s\S]*?)\n---\n/);
    const line = (key) => {
      const m = fm ? fm[1].match(new RegExp(`^${key}:[ \\t]*(.+)$`, 'm')) : null;
      return m ? m[1].trim() : null;
    };
    let description = line('displayDescription') ?? line('description') ?? '';
    try {
      description = JSON.parse(description);
    } catch {
      /* already a bare string */
    }
    return `- ${line('name') ?? slug}: ${description}`;
  });

  return `## Agent skills

Repeatable procedures the agents follow when working on this project. Documented at /skills.

${entries.join('\n')}`;
}

function sectionLoops() {
  // The committed loops registry (website/src/data/loops.json) — the same
  // committed-data pattern as the journal. The page renders this data
  // verbatim, so carrying it here is what keeps the /loops route covered
  // once its prose lives in JSON instead of the page source.
  const { loops } = JSON.parse(
    read(join(repoRoot, 'website', 'src', 'data', 'loops.json'))
  );

  const entries = loops
    .map(
      (l) =>
        `### ${l.slug} (${l.cadence.toLowerCase()}, ${l.status})\n\n${l.description}\n\nEach run: ${l.stages.join(', ')}. Guardrails: ${l.guardrails.join('; ')}. Built on the ${l.skills.join(', ')} skill${l.skills.length > 1 ? 's' : ''}.`
    )
    .join('\n\n');

  return `## Loops

Recurring agent loops: skills that run on a schedule against real data and end in a branch for the owner to review. Documented at /loops.

${pageProse('loops')}

${entries}`;
}

function sectionReleases() {
  const data = JSON.parse(read(join(repoRoot, 'website', 'src', 'data', 'release-log.json')));
  const entries = data.releases
    .map((e) => `### ${e.version} — ${e.title} (${e.date})\n\n${e.body.join('\n\n')}`)
    .join('\n\n');

  const earlier = data.predecessorReleases
    .map((e) => `- ${e.version} (${e.date})${e.summary ? `: ${e.summary}` : ''}`)
    .join('\n');

  return `## Release log

One entry per published npm version, newest first. Published at /releases.

${entries || 'No releases have been published from this repository yet; the first entry lands with the first npm publish.'}

### Before the rename

The versions published under the package's earlier name, before it was renamed and restarted at 1.0.0. Listed beneath the log at /releases, newest first.

${earlier}`;
}

/* ============================================================
   Assembly
   ============================================================ */

const SECTIONS = [
  ['Site map', sectionSiteMap],
  ['Site pages', sectionSitePages],
  ['Blueprints', sectionBlueprints],
  ['Components', sectionComponents],
  ['Skills', sectionSkills],
  ['Loops', sectionLoops],
  ['Releases', sectionReleases],
];

const PREAMBLE = `# Full site content

Everything below is published on this site or in its public repository. It is the complete set of facts available for answering questions about the design system and the site that documents it.
`;

/** The corpus text itself, ungated so --dump still works when over budget. */
export function assembleCorpus() {
  const parts = SECTIONS.map(([, build]) => build());
  // Both inline tables only hold what a page still renders.
  const staleValues = inlineValueKeys().filter((key) => !usedInlineValues.has(key));
  const staleRuntime = runtimeExpressionKeys().filter((key) => !usedRuntimeExpressions.has(key));
  if (staleValues.length + staleRuntime.length > 0) {
    throw new Error(
      `generate-site-corpus: no corpus page renders ${[...staleValues, ...staleRuntime].join(', ')} any more; ` +
        `remove ${staleValues.length ? 'INLINE_VALUES' : 'RUNTIME_EXPRESSIONS'} entries that no page uses.`
    );
  }
  return { corpus: [PREAMBLE, ...parts].join('\n\n---\n\n') + '\n', parts };
}

export function buildSiteCorpus() {
  const { corpus, parts } = assembleCorpus();

  const approxTokens = Math.round(corpus.length / CHARS_PER_TOKEN);
  if (approxTokens > TOKEN_BUDGET) {
    const breakdown = SECTIONS.map(
      ([name], i) => `    ${name}: ${Math.round(parts[i].length / CHARS_PER_TOKEN)} tokens`
    ).join('\n');
    throw new Error(
      `Site corpus is ~${approxTokens} tokens, over the ${TOKEN_BUDGET} budget.\n` +
        `Trim a section before the cost of every chat message goes up.\n${breakdown}`
    );
  }

  return `// AUTO-GENERATED — do not edit by hand.
// Source of truth: the published site (navigation, page prose, data registries)
// and the root specs CLAUDE.md, design.md, content-design.md.
// Regenerate: node scripts/generate-site-corpus.mjs (runs via predev/prebuild).

/** Every public fact about the site, sent to the model as a cached system block. */
export const siteCorpus: string = ${JSON.stringify(corpus)};

/** Rough token count, for logging and the build-time budget gate only. */
export const siteCorpusApproxTokens = ${approxTokens};
`;
}

/** Per-section byte and token breakdown, for tuning what to trim. */
export function corpusSizes() {
  return SECTIONS.map(([name, build]) => {
    const text = build();
    return { name, chars: text.length, tokens: Math.round(text.length / CHARS_PER_TOKEN) };
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);

  if (args.includes('--sizes')) {
    const rows = corpusSizes();
    for (const { name, chars, tokens } of rows) {
      console.log(`${name.padEnd(16)} ${String(chars).padStart(8)} chars  ~${tokens} tokens`);
    }
    const total = rows.reduce((sum, r) => sum + r.tokens, 0);
    console.log(`${'TOTAL'.padEnd(16)} ${''.padStart(8)}        ~${total} tokens (budget ${TOKEN_BUDGET})`);
  } else if (args.includes('--dump')) {
    // Ungated on purpose: --dump is how you diagnose an over-budget corpus.
    console.log(assembleCorpus().corpus);
  } else {
    writeFileSync(outputPath, buildSiteCorpus());
    console.log(`✓ Generated ${outputPath.replace(repoRoot + '/', '')}`);
  }
}
