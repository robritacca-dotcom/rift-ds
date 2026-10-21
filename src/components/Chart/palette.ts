/**
 * The ordered series palette shared by every multi-series chart.
 * Each entry is a var() reference to the `--color-chart-series-{n}` token,
 * which SVG paint resolves live, so the palette follows the active theme
 * (including a mid-session switch) and any consumer re-theming of the
 * tokens. The fallbacks are the light-theme resolved values, used when a
 * token is missing from the cascade.
 */
const SERIES_FALLBACKS = [
  '#0E6E8F',
  '#06D6A0',
  '#FFD166',
  '#EF476F',
  '#9E47EF',
  '#EF8247',
  '#1E47B0',
];

export function getChartSeriesColors(): string[] {
  return SERIES_FALLBACKS.map(
    (fallback, i) => `var(--color-chart-series-${i + 1}, ${fallback})`,
  );
}

/**
 * A type token's size in pixels, read at render. recharts sizes SVG text
 * through an attribute, which cannot hold var(), so the chart text needs the
 * resolved number: the token's computed value on the document, which follows
 * a theme's type scale. Server markup and a consumer without the token get the
 * fallback, the token's base value (validate-token-references.mjs holds it to
 * the token); recharts draws no text until it has measured on the client.
 */
export function readTokenPx(name: string, fallback: string): number {
  const base = parseFloat(fallback);
  if (typeof window === 'undefined') return base;
  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(value) && value > 0 ? value : base;
}
