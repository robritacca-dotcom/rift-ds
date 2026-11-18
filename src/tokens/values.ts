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
  /** The theme's display name, as a theme menu shows it ("Signal"). It can differ from the id ("plum"), which is the preset's `data-brand` value and stylesheet name. */
  readonly label: string;
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

/** The base look's id: the theme the token files carry on their own, with no
    preset stylesheet and no `data-brand` attribute. */
export const BASE_THEME_ID: string = THEME_IDS[0];

/** A shipped theme, as a theme menu needs it. */
export interface ShippedTheme {
  /** The theme id, which `tokenValues` is keyed by. */
  readonly id: string;
  /** The display name ("Signal"). */
  readonly label: string;
  /**
   * The `data-brand` value that applies it on the root element, which is
   * also its stylesheet's name (`rift-ds/tokens/presets/<brand>.css`), or
   * null for the base look, which needs neither.
   */
  readonly brand: string | null;
}

/** Every shipped theme, the base look first, with its display name and the attribute that applies it. */
export const SHIPPED_THEMES: readonly ShippedTheme[] = THEME_IDS.map((id) => ({
  id,
  label: tokenValues[id].label,
  brand: id === BASE_THEME_ID ? null : id,
}));

/**
 * The shipped themes as ThemePicker options: each theme's id as the value,
 * its display name, and its action colour in `mode` as the swatch. Pass
 * the list straight to `<ThemePicker themes={...} />`; the value it
 * reports is an id, which `SHIPPED_THEMES` turns into its `data-brand`.
 */
export function shippedThemeOptions(mode: ThemeMode = 'light'): { value: string; label: string; color?: string }[] {
  return SHIPPED_THEMES.map(({ id, label }) => ({
    value: id,
    label,
    color: tokenValue('--color-action-primary-bg', id, mode),
  }));
}

/** A token's resolved value in one theme and mode, or undefined when the
    theme or the token is unknown. */
export function tokenValue(name: string, theme: string, mode: ThemeMode): string | undefined {
  return tokenValues[theme]?.[mode]?.[name];
}
