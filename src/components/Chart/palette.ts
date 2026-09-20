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
