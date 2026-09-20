/**
 * THE MOBILE STAGE'S RESPONSIVE EMULATION — why this module exists.
 *
 * The stage's Mobile preset narrows the workspace column to a phone
 * width, but it cannot narrow the browser: every `@media (max-width: …)`
 * rule — the token layer's display-tier step-down, a component's
 * small-screen block — keys off the real viewport, so on a desktop
 * screen the narrow column used to render desktop type sizes and
 * desktop component layouts under a Mobile label. This module derives
 * the phone rules from the stylesheets the page has actually loaded and
 * re-scopes them to the stage element, so the emulation reads the same
 * CSS a real phone would and can never drift from it:
 *
 * - `:root` custom-property declarations (the typography step-down) are
 *   re-declared on the stage element — custom properties inherit, so
 *   every sample inside resolves the phone values.
 * - Library rules (every selector in the `.ds-` namespace) are
 *   re-emitted prefixed with the stage selector, which also outranks
 *   the originals on specificity.
 *
 * Only a lone `(max-width: Npx)` condition wide enough to be true at
 * the stage's width is taken, so a compound or desktop-only query is
 * never misapplied. Rules targeting portalled overlays re-scope
 * harmlessly: a Dialog renders into document.body, outside the stage,
 * so overlays deliberately keep following the real viewport.
 *
 * The playground's own stage-aware styles (the section grids, MockNav's
 * link row) live next to their base rules in the CSS modules, keyed off
 * the same `data-stage="mobile"` marker the page sets on the stage.
 */

/* The Mobile preset's column width — mirrors `.dsContentMobile` in
   page.module.css. A media rule is included only when its condition
   would hold on a viewport this wide. */
const STAGE_WIDTH = 420;

export const STAGE_SCOPE = '[data-stage="mobile"]';

/* A lone max-width condition, e.g. `(max-width: 768px)`. */
const MAX_WIDTH_ONLY = /^\(\s*max-width:\s*(\d+(?:\.\d+)?)px\s*\)$/;

let cached: string | null = null;

/** Custom-property declarations of a rule, as CSS text ("" if none). */
const customProps = (style: CSSStyleDeclaration): string => {
  const decls: string[] = [];
  for (let i = 0; i < style.length; i += 1) {
    const prop = style.item(i);
    if (prop.startsWith("--")) {
      decls.push(`${prop}: ${style.getPropertyValue(prop)};`);
    }
  }
  return decls.join(" ");
};

/** The stage's phone stylesheet, derived once from the loaded CSS. */
export function stageMobileCss(): string {
  if (cached !== null) return cached;
  const out: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; /* cross-origin: the Google Fonts link */
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSMediaRule)) continue;
      const cond = rule.media.mediaText.match(MAX_WIDTH_ONLY);
      if (!cond || parseFloat(cond[1]) < STAGE_WIDTH) continue;
      for (const inner of Array.from(rule.cssRules)) {
        if (!(inner instanceof CSSStyleRule)) continue;
        const selectors = inner.selectorText.split(",").map((s) => s.trim());
        if (selectors.every((s) => s === ":root")) {
          const decls = customProps(inner.style);
          if (decls) out.push(`${STAGE_SCOPE} { ${decls} }`);
        } else if (selectors.every((s) => s.startsWith(".ds-"))) {
          const scoped = selectors
            .map((s) => `${STAGE_SCOPE} ${s}`)
            .join(", ");
          out.push(`${scoped} { ${inner.style.cssText} }`);
        }
      }
    }
  }
  cached = out.join("\n");
  return cached;
}
