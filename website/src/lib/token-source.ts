/**
 * TOKEN DECLARATIONS, READ OFF THE LIVE CSSOM.
 *
 * `getComputedStyle` resolves every `var()` before handing a value back, so
 * it can never say *which* primitive a semantic token chains to — only what
 * it currently equals. This module reads the DECLARED values instead: it
 * scans the document's stylesheets for custom-property declarations in the
 * token scopes (`:root` / `[data-theme="light"]`, and `[data-theme="dark"]`)
 * and follows `var(--…)` references name by name. That is the same chain
 * `scripts/validate-token-references.mjs` build-enforces (every semantic
 * colour token references a primitive), read back at runtime.
 *
 * Inline overrides on the root element take precedence, deliberately: the
 * playground's levers re-theme by writing onto `documentElement.style`, and
 * pointer-mode overrides are themselves `var(--primitive-…)` references, so
 * a chain followed through the inline layer reports the *re-pointed* ramp,
 * not the shipped one.
 *
 * Client-only (it reads `document`); callers re-collect after a theme flip
 * or lever change rather than holding one collection forever.
 */

export type DeclaredTokens = {
  /** Base declarations: `:root` and `[data-theme="light"]` scopes. */
  root: Map<string, string>;
  /** Dark-theme overrides: `[data-theme="dark"]` scopes. */
  dark: Map<string, string>;
};

const DARK_SCOPE = /\[data-theme=["']?dark/;
const LIGHT_SCOPE = /\[data-theme=["']?light/;

export function collectDeclaredTokens(): DeclaredTokens {
  const root = new Map<string, string>();
  const dark = new Map<string, string>();

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin (Google Fonts) — no token declarations there
    }
    for (const rule of Array.from(rules)) {
      /* Token declarations live in top-level rules; the one media block in
         the token layer (the display tier's responsive collapse) holds
         literal sizes, never references, so nested rules can be skipped. */
      if (!(rule instanceof CSSStyleRule)) continue;
      const selector = rule.selectorText;
      const isDark = DARK_SCOPE.test(selector);
      const isBase =
        !isDark && (selector.includes(":root") || LIGHT_SCOPE.test(selector));
      if (!isDark && !isBase) continue;
      const target = isDark ? dark : root;
      for (let i = 0; i < rule.style.length; i++) {
        const property = rule.style.item(i);
        if (!property.startsWith("--")) continue;
        target.set(property, rule.style.getPropertyValue(property).trim());
      }
    }
  }
  return { root, dark };
}

/** The declared (unresolved) value of a custom property, honouring the
    cascade the way the browser does: the root element's inline style wins,
    then the active theme scope, then the base scope. */
export function declaredValueOf(
  name: string,
  declared: DeclaredTokens,
): string | null {
  const inline = document.documentElement.style.getPropertyValue(name).trim();
  if (inline) return inline;
  if (document.documentElement.dataset.theme === "dark") {
    const darkValue = declared.dark.get(name);
    if (darkValue) return darkValue;
  }
  return declared.root.get(name) ?? null;
}

const VAR_REF = /^var\(\s*(--[\w-]+)/;

/**
 * The chain of token names a custom property resolves through, starting
 * with the name itself: `--color-chat-bubble-sent-bg` yields
 * `["--color-chat-bubble-sent-bg", "--color-bg-container-secondary",
 * "--primitive-neutral-01"]`. The walk stops at the first literal value
 * (or a cycle, which the token layer never ships but a lever could
 * accidentally write).
 */
export function varChain(name: string, declared: DeclaredTokens): string[] {
  const chain: string[] = [];
  const seen = new Set<string>();
  let current: string | null = name;
  while (current && !seen.has(current)) {
    chain.push(current);
    seen.add(current);
    const raw = declaredValueOf(current, declared);
    const match = raw ? VAR_REF.exec(raw) : null;
    current = match ? match[1] : null;
  }
  return chain;
}

/** The primitive a token chains to, or null when its declared value is a
    literal that never touches the primitive layer. */
export function primitiveOf(
  name: string,
  declared: DeclaredTokens,
): string | null {
  return (
    varChain(name, declared).find((link) => link.startsWith("--primitive-")) ??
    null
  );
}
