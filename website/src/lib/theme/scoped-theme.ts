/**
 * A THEME HELD TO ONE ELEMENT.
 *
 * The token layer and the generated preset stylesheets all declare on the
 * root element, and a custom property resolves its `var()` chain where it is
 * declared. So writing a preset's primitives onto a card does nothing to the
 * semantic tokens the card reads: those were resolved on `<html>` against
 * the applied theme and are inherited as finished values.
 *
 * This module re-declares the whole token layer at a scope instead. It reads
 * every token rule off the live CSSOM (the base scopes, the dark scope, and
 * each `html[data-brand]` preset rule, media wrappers kept) and re-emits the
 * custom properties under `[data-theme-scope="<id>"]`, where the chains
 * resolve again against that element. An element carrying the attribute
 * wears that theme whatever the page around it is wearing, and still follows
 * the page's light or dark mode.
 *
 * Nothing is mirrored: the scoped rules are the shipped rules with the
 * selector swapped, so a retuned token or a new preset is picked up by
 * existing. Client-only, and installed as a constructed stylesheet, which
 * sits after the document's own sheets in the cascade.
 */



/** The attribute a scoped element carries; its value is a theme id. */
export const THEME_SCOPE_ATTRIBUTE = "data-theme-scope";

const SCOPE = `[${THEME_SCOPE_ATTRIBUTE}]`;
/* One compound of a token-scope selector: nothing but the root element and
   the two theme attributes. Anything else is not a token rule. */
const TOKEN_SCOPE =
  /^(?:html)?(?::root|\[data-theme=["']?(?:light|dark)["']?\]|\[data-brand=["']?[\w-]+["']?\])+$/;
const DARK = /\[data-theme=["']?dark/;
const BRAND = /\[data-brand=["']?([\w-]+)/;

/** The scoped twin of a token-scope selector, or null when it is not one. */
function scopedSelector(selectorText: string): string | null {
  const scoped: string[] = [];
  for (const part of selectorText.split(",").map((s) => s.trim())) {
    if (!TOKEN_SCOPE.test(part)) return null;
    const brand = BRAND.exec(part)?.[1];
    /* A preset rule outranks the dark base scope on the root element, so its
       twin doubles the attribute to hold the same order here. */
    const target = brand
      ? `[${THEME_SCOPE_ATTRIBUTE}="${brand}"]${SCOPE}`
      : SCOPE;
    scoped.push(DARK.test(part) ? `[data-theme="dark"] ${target}` : target);
  }
  return scoped.join(", ");
}

function scopedRules(rules: CSSRuleList): string {
  let css = "";
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSMediaRule) {
      const inner = scopedRules(rule.cssRules);
      if (inner) css += `@media ${rule.conditionText} {\n${inner}}\n`;
      continue;
    }
    if (!(rule instanceof CSSStyleRule)) continue;
    const selector = scopedSelector(rule.selectorText);
    if (!selector) continue;
    let declarations = "";
    for (let i = 0; i < rule.style.length; i++) {
      const property = rule.style.item(i);
      if (!property.startsWith("--")) continue;
      declarations += `${property}:${rule.style.getPropertyValue(property)};`;
    }
    if (declarations) css += `${selector}{${declarations}}\n`;
  }
  return css;
}

/**
 * Install the scoped token layer for this document. Returns the cleanup that
 * removes it. The base theme needs no rule of its own: an element scoped to
 * the base theme id matches no preset rule and so wears the raw token files.
 */
export function installScopedThemes(): () => void {
  let css = "";
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      css += scopedRules(sheet.cssRules);
    } catch {
      /* cross-origin sheet: no token declarations there */
    }
  }
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  return () => {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
      (s) => s !== sheet
    );
  };
}

