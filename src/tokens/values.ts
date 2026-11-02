import values from './values.json';

/**
 * TOKEN VALUES: what every semantic token resolves to, per theme and per
 * mode, without parsing CSS.
 *
 * values.json is GENERATED from the token CSS and the preset composer by
 * scripts/generate-token-values.mjs (one resolution pass, shared with the
 * DTCG files under website/public/schema/tokens/), and
 * scripts/validate-token-values.mjs byte-compares it on every build, so
 * a value here can never drift from the stylesheet a consumer loads.
 *
 * Themes are keyed by id, the base look first and then every preset in
 * the selector order; each carries a light and a dark map of token name
 * to resolved literal, plus `media`: per @media prelude, only the tokens
 * whose value changes inside that block. The token registry
 * (./registry.ts) stays the home for names and counts; this module is
 * the home for values.
 */
export type ThemeMode = 'light' | 'dark';

/** One theme's resolved values. */
export interface ThemeTokenValues {
  /** Token name to resolved literal, light mode. */
  readonly light: Readonly<Record<string, string>>;
  /** Token name to resolved literal, dark mode. */
  readonly dark: Readonly<Record<string, string>>;
  /** Per @media prelude (without the keyword), the tokens that differ inside it. */
  readonly media?: Readonly<Record<string, Readonly<Record<string, string>>>>;
}

/** Resolved values, keyed by theme id. */
export const tokenValues = values.themes as Readonly<Record<string, ThemeTokenValues>>;

/** Every shipped theme id, the base look first. */
export const THEME_IDS: readonly string[] = Object.keys(tokenValues);

/** A token's resolved value in one theme and mode, or undefined when the
    theme or the token is unknown. */
export function tokenValue(name: string, theme: string, mode: ThemeMode): string | undefined {
  return tokenValues[theme]?.[mode]?.[name];
}
