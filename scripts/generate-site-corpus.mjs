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
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { siteRoutes, isDynamicSegment } from './site-routes.mjs';
import { NPM_URL, PACKAGE_NAME, REPOSITORY_URL, STORYBOOK_URL } from './brand.mjs';

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
 */
const TOKEN_BUDGET = 140_000;

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
  isBlockTag(node) || (ts.isJsxFragment(node) && !hasBlockDescendant(node));

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
    if (!isProse(text) || seen.has(text)) return;
    seen.add(text);
    lines.push(text);
  };

  /** All text directly under a block element, skipping nested block elements. */
  const inlineText = (node, parts) => {
    node.forEachChild((child) => {
      if (ts.isJsxText(child)) {
        consumed.add(child);
        parts.push(decode(child.text));
      } else if (isBlockElement(child)) {
        // Emitted on its own line when the walk reaches it.
      } else {
        inlineText(child, parts);
      }
    });
    return parts;
  };

  const visit = (node) => {
    if (isBlockElement(node)) {
      // Joined without a separator: JSX text nodes carry their own spacing, so
      // adding one puts a space before the punctuation after an inline <strong>.
      push(inlineText(node, []).join(''));
    } else if (ts.isJsxText(node) && !consumed.has(node)) {
      push(node.text);
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

const pageProse = (...segments) => {
  const dir = join(websiteApp, ...segments);
  const sources = [join(dir, 'page.tsx'), ...coLocatedFiles(dir, segments.length === 0)];
  return sources
    .map((path) => extractProse(read(path), path))
    .filter(Boolean)
    .join('\n');
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
   flat object literals, which is what makes that safe.
   ============================================================ */

function navLinks(source, exportName) {
  const start = source.indexOf(`export const ${exportName}`);
  if (start === -1) throw new Error(`navigation.ts: no export named ${exportName}`);
  const end = source.indexOf('\n];', start);
  if (end === -1) throw new Error(`navigation.ts: ${exportName} is not a flat array literal`);
  const body = source.slice(start, end);

  const links = [];
  for (const match of body.matchAll(/\{[^{}]*\}/g)) {
    const entry = match[0];
    const field = (key) => {
      const m = entry.match(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
      return m ? m[1] : null;
    };
    const href = field('href');
    const label = field('label');
    if (!href || !label || label === 'Contents') continue;
    links.push({ href, label, description: field('description') });
  }
  if (links.length === 0) throw new Error(`navigation.ts: ${exportName} yielded no links`);
  return links;
}

const linkLines = (links) =>
  links
    .map((l) => `- ${l.label} (${l.href})${l.description ? `: ${l.description}` : ''}`)
    .join('\n');

/**
 * Component doc paths come from the registry, not from navigation.ts:
 * componentsSidebarLinks is *derived* from the registry in code, so the
 * textual parse above sees only its hardcoded overview entry — which once
 * left the model a "complete" site map with one component path in it.
 */
function componentDocLines() {
  const registry = JSON.parse(read(join(repoRoot, 'src', 'components', 'registry.json')));
  return registry.components
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

function sectionSiteMap() {
  const nav = read(join(repoRoot, 'website', 'src', 'config', 'navigation.ts'));
  return `## Site map

Every page on the site. Link to these paths when pointing someone at more detail.

### Main pages

- Home (/): the design system on one page, with live component demos
- Playground (/playground): re-theme the design system live and copy the CSS

### Design system docs

${linkLines(navLinks(nav, 'docsSidebarLinks'))}

### Foundations

${linkLines(navLinks(nav, 'foundationsSidebarLinks'))}

### Component documentation

- Components overview (/components)
${componentDocLines()}

### Elsewhere

- Storybook: ${STORYBOOK_URL} (rendered API reference with props tables)
- npm: ${NPM_URL} (\`npm install ${PACKAGE_NAME}\`)
- GitHub: ${REPOSITORY_URL} (full source)`;
}

/* ============================================================
   Site pages — every other route's prose, automatically

   The page list is the filesystem (scripts/site-routes.mjs), the same
   authority the sitemap uses, so a new page's prose reaches the corpus on
   the next build with no registration step. Routes covered by a dedicated
   section (About, Case studies, Blueprints…) are mapped to it; routes that
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
  ['/',
    'the home page is the landing collage — its prose is demo filler for the live components, not information; the sections it links to are all covered'],
  ['/graph',
    'the dependency-graph instrument — its prose is the instrument\'s own controls and panel labels; the graph\'s data is the registries the corpus already carries, and the /overview section that links to it is covered'],
  ['/labs/marketing',
    'a noindex test page rebuilding a reference marketing dashboard entirely from the system\'s tokens and components, to probe how far they stretch — its prose is fictional demo data, not information'],
  ['/labs/payroll',
    'a noindex test page imagining the chat as a docked side rail beside a payroll product, to exercise the agent panel at product scale — its prose is fictional demo data, not information'],
  ['/templates/marketing-dashboard',
    'the marketing dashboard template rendered full viewport (the same app shell as /labs/marketing, its origin) — its prose is fictional demo data; the template\'s facts live on the /templates index, which is covered'],
  ['/templates/relay-console',
    'the relay console template rendered full viewport — its prose is fictional network telemetry; the template\'s facts live on the /templates index, which is covered'],
  ['/templates/team-calendar',
    'the team calendar template rendered full viewport — its prose is fictional schedule data; the template\'s facts live on the /templates index, which is covered'],
  ['/templates/agent-workbench',
    'the agent workbench template rendered full viewport — its prose is a fictional coding session; the template\'s facts live on the /templates index, which is covered'],
  ['/templates/roadmap-planner',
    'the roadmap planner template rendered full viewport — its prose is a fictional product plan; the template\'s facts live on the /templates index, which is covered'],
  ['/templates/sales-pipeline',
    'the sales pipeline template rendered full viewport — its prose is a fictional CRM book of business; the template\'s facts live on the /templates index, which is covered'],
  ['/templates/payroll-console',
    'the payroll console template rendered full viewport (the same app shell as /labs/payroll, its origin) — its prose is a fictional pay run; the template\'s facts live on the /templates index, which is covered'],
  ['/templates/sign-in',
    'the sign-in template rendered full viewport — its prose is a fictional product\'s front door; the template\'s facts live on the /templates index, which is covered'],
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

function sectionSitePages() {
  const pages = sitePageRoutes()
    .map((route) => {
      const segments = route === '/' ? [] : route.slice(1).split('/');
      const { prose, factsMarkdown } = pageContent(...segments);
      const body = [prose, factsMarkdown].filter(Boolean).join('\n\n');
      return body ? `### ${route === '/' ? '/ (home)' : route}\n\n${body}` : null;
    })
    .filter(Boolean)
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

  return `## Release log

One entry per published npm version, newest first. Published at /releases.

${entries || 'No releases have been published from this repository yet; the first entry lands with the first npm publish.'}`;
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
