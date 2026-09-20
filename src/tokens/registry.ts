import registry from './registry.json';

/**
 * TOKEN REGISTRY — the single source of truth for the semantic-token
 * count.
 *
 * registry.json is GENERATED from the semantic token CSS
 * (tokens-light.css + tokens-typography.css + tokens-motion.css) by
 * scripts/generate-token-registry.mjs, and
 * scripts/validate-token-registry.mjs re-checks it (plus light/dark
 * colour parity) on every build — library, Storybook, and website —
 * so the counts here cannot silently drift from the CSS.
 *
 * Anywhere a token count is displayed — case studies, foundations
 * pages, Storybook docs — import TOKEN_COUNT / TOKEN_COUNTS from here.
 * Never hardcode the number.
 */
export type TokenCategory =
  | 'colour'
  | 'typography'
  | 'spacing'
  | 'radius'
  | 'border'
  | 'shadow'
  | 'icons'
  | 'motion';

/** Semantic token names, grouped by category. */
export const tokenRegistry = registry.categories as Record<TokenCategory, readonly string[]>;

/** Semantic-token count per category. */
export const TOKEN_COUNTS = Object.fromEntries(
  Object.entries(tokenRegistry).map(([category, names]) => [category, names.length])
) as Record<TokenCategory, number>;

/** The official semantic-token count. */
export const TOKEN_COUNT: number = Object.values(TOKEN_COUNTS).reduce(
  (sum, count) => sum + count,
  0
);
