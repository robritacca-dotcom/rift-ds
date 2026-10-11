/**
 * token-values.mjs
 *
 * The one reader of what the token CSS resolves to. The token registry
 * (src/tokens/registry.json) holds names and categories only; a surface
 * that needs a token's VALUE, per theme and per breakpoint, reads it
 * here: the consumer skills' token reference (generate-agent-skill.mjs)
 * and the foundations pages' mirror check (validate-foundation-mirrors.mjs,
 * which shares the parser).
 *
 * A helper module, not a chain script: it validates nothing by itself.
 * It reads source CSS only, so everything that imports it stays
 * deterministic.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokensDir = join(repoRoot, 'src', 'tokens');
// Normalize CRLF so Windows checkouts read identically to CI.
const read = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

export const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Split a stylesheet into the declarations outside any at-rule and those
 * inside each @media block, keyed by the block's prelude. The token files
 * nest no deeper than `@media { :root { … } }`.
 */
export function parseCss(css) {
  const base = new Map();
  const media = new Map();
  const text = stripComments(css);
  let depth = 0;
  let current = null; // the @media prelude we are inside, if any
  let mediaDepth = -1;
  let buffer = '';
  const flush = (target) => {
    for (const m of buffer.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) target.set(m[1], m[2].trim());
    buffer = '';
  };
  let prelude = '';
  for (const ch of text) {
    if (ch === '{') {
      if (prelude.trim().startsWith('@media') && current === null) {
        current = prelude.trim().replace(/\s+/g, ' ');
        mediaDepth = depth;
        if (!media.has(current)) media.set(current, new Map());
      }
      depth++;
      prelude = '';
      buffer = '';
    } else if (ch === '}') {
      flush(current === null ? base : media.get(current));
      depth--;
      if (current !== null && depth === mediaDepth) {
        current = null;
        mediaDepth = -1;
      }
      prelude = '';
    } else {
      prelude += ch;
      buffer += ch;
    }
  }
  return { base, media };
}

/**
 * Substitute every var() in a value until none is left, looking each
 * name up through `scopes` in order (first hit wins). Returns the literal
 * value, plus the primitive the chain ended on when the whole value was
 * one reference chain. Throws on a name nothing defines: a reference
 * table with a hole in it is worse than a failed build.
 */
function resolveValue(name, scopes) {
  const lookup = (token) => scopes.map((scope) => scope.get(token)).find((v) => v !== undefined);
  let value = lookup(name);
  if (value === undefined) throw new Error(`${name} is defined in no token file`);
  let primitive = null;
  for (let hops = 0; hops < 24; hops++) {
    const whole = value.match(/^var\(\s*(--[a-z0-9-]+)\s*\)$/i);
    if (whole && whole[1].startsWith('--primitive-')) primitive = whole[1];
    if (!/var\(/.test(value)) {
      return { value: value.replace(/\s+/g, ' ').trim(), primitive };
    }
    value = value.replace(/var\(\s*(--[a-z0-9-]+)\s*\)/gi, (_, ref) => {
      const next = lookup(ref);
      if (next === undefined) throw new Error(`${name} references ${ref}, which no token file defines`);
      return next;
    });
  }
  throw new Error(`${name} did not resolve within 24 var() hops (a reference cycle?)`);
}

/**
 * Every semantic token's resolved values: { light, dark, media } per
 * name, where light and dark are { value, primitive } and media maps an
 * @media prelude to the value the token takes inside it (light scope),
 * present only for the blocks that redefine the token or something on
 * its chain.
 */
export function resolveTokenValues(names) {
  const files = ['tokens-light.css', 'tokens-typography.css', 'tokens-motion.css', 'tokens-primitives.css'].map(
    (file) => parseCss(read(join(tokensDir, file)))
  );
  const dark = parseCss(read(join(tokensDir, 'tokens-dark.css'))).base;
  const lightScopes = files.map((file) => file.base);
  const darkScopes = [dark, ...lightScopes];

  const preludes = [...new Set(files.flatMap((file) => [...file.media.keys()]))];
  const mediaScopes = new Map(
    preludes.map((prelude) => [
      prelude,
      [...files.map((file) => file.media.get(prelude)).filter(Boolean), ...lightScopes],
    ])
  );

  const resolved = new Map();
  for (const name of names) {
    const light = resolveValue(name, lightScopes);
    const media = {};
    for (const [prelude, scopes] of mediaScopes) {
      const inside = resolveValue(name, scopes);
      if (inside.value !== light.value) media[prelude] = inside;
    }
    resolved.set(name, { light, dark: resolveValue(name, darkScopes), media });
  }
  return resolved;
}
