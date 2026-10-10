/**
 * A stand-in source logo for demos: one letter on a full-colour disc, the
 * shape a real favicon takes in SourceChip's leading slot. The brands are
 * invented, so the colours come from the chart series accents and follow
 * the theme. Decorative — SourceChip hides its logo slot from assistive tech.
 */
const TONES = {
  mint: "var(--color-chart-series-2)",
  gold: "var(--color-chart-series-3)",
  coral: "var(--color-chart-series-4)",
  violet: "var(--color-chart-series-5)",
  amber: "var(--color-chart-series-6)",
  cobalt: "var(--color-chart-series-7)",
} as const;

export type SourceLogoTone = keyof typeof TONES;

export function SourceLogoMock({ letter, tone }: { letter: string; tone: SourceLogoTone }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect width="20" height="20" fill={TONES[tone]} />
      <text
        x="10"
        y="10.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="700"
        fill="var(--color-bg-page-primary)"
      >
        {letter}
      </text>
    </svg>
  );
}
