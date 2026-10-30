"use client";

import { useEffect, useRef, useState } from "react";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { typeStyleColour, type Overrides } from "@/lib/theme/theme-overrides";
import styles from "./DesignView.module.css";

/* ============================================
   The DESIGN.md view: bring a source, then read what the theme became.
   The children are the banner and the source card or dropzone, which the
   page owns because every view's drop reports to them. Below them the
   theme's decisions as a specimen, drawn from token names, with every
   caption read back from the rendered element.
   ============================================ */

const COLOURS: ReadonlyArray<[label: string, token: string]> = [
  ["Action", "--color-action-primary-bg"],
  ["Action hover", "--color-action-primary-bg-hover"],
  ["Action pressed", "--color-action-primary-bg-active"],
  ["On action", "--color-action-primary-text"],
  ["Page", "--color-bg-page-primary"],
  ["Surface", "--color-bg-container-primary"],
  ["Soft surface", "--color-bg-container-secondary"],
  ["Deep surface", "--color-bg-container-tertiary"],
  ["Ink", "--color-text-primary"],
  ["Secondary text", "--color-text-secondary"],
  ["Tertiary text", "--color-text-tertiary"],
  ["Border", "--color-bg-container-border"],
];

const TYPE: ReadonlyArray<[style: string, sample: string]> = [
  ["display-1", "Every pixel, one token."],
  ["heading-1", "Ship the whole look"],
  ["heading-3", "Surfaces and depth"],
  ["title-body", "A title for a card or a row"],
  ["paragraph", "Body text carries the reading, and lets the headings do the shouting."],
  ["caption", "Caption text for metadata and timestamps"],
];

const RADII = ["--radius-100", "--radius-200", "--radius-300", "--radius-400", "--radius-600", "--radius-pill"];

export const DESIGN_SECTIONS = [
  { id: "colour", label: "Colour" },
  { id: "type", label: "Typography" },
  { id: "shape", label: "Shape" },
] as const;

const toHex = (rgb: string) => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(rgb);
  if (!m) return rgb;
  const hex = `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
  return m[4] !== undefined && Number(m[4]) < 1 ? `${hex} · ${Math.round(Number(m[4]) * 100)}%` : hex;
};

/* Re-read the next frame after the levers or the mode move, once the page
   has written the new overrides. */
function Swatch({ label, token, stamp }: { label: string; token: string; stamp: unknown }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rgb, setRgb] = useState<string | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const el = ref.current;
      if (el) setRgb(getComputedStyle(el).backgroundColor);
    });
    return () => cancelAnimationFrame(frame);
  }, [stamp]);
  return (
    <div className={styles.swatch}>
      <div ref={ref} className={styles.swatchFill} style={{ background: `var(${token})` }} />
      <span className={styles.swatchLabel}>{label}</span>
      <span className={styles.swatchValue}>{rgb ? toHex(rgb) : " "}</span>
    </div>
  );
}

export function DesignView({
  overrides,
  hidden,
  narrow,
  children,
}: {
  /** The live levers, watched so the captions follow them. */
  overrides: Overrides;
  hidden: ReadonlySet<string>;
  narrow: boolean;
  children: React.ReactNode;
}) {
  const mode = useSiteTheme();
  const stamp = `${mode}:${JSON.stringify(overrides)}`;
  return (
    <div className={styles.view}>
      {children}
      {!hidden.has("colour") && (
        <section className={styles.section} aria-label="Colour">
          <SectionTitle title="Colour" />
          <div className={narrow ? styles.swatchesNarrow : styles.swatches}>
            {COLOURS.map(([label, token]) => (
              <Swatch key={token} label={label} token={token} stamp={stamp} />
            ))}
          </div>
        </section>
      )}
      {!hidden.has("type") && (
        <section className={styles.section} aria-label="Typography">
          <SectionTitle title="Typography" />
          <div className={styles.ladder}>
            {TYPE.map(([style, sample]) => (
              <div key={style} className={narrow ? styles.rowNarrow : styles.row}>
                <span className={styles.rowName}>{style}</span>
                <p
                  className={styles.sample}
                  style={{
                    fontFamily: `var(--font-${style}-family)`,
                    fontSize: `var(--font-${style}-size)`,
                    fontWeight: `var(--font-${style}-weight)`,
                    lineHeight: `var(--font-${style}-line-height)`,
                    letterSpacing: `var(--font-${style}-letter-spacing)`,
                    color: typeStyleColour(style),
                  }}
                >
                  {sample}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
      {!hidden.has("shape") && (
        <section className={styles.section} aria-label="Shape">
          <SectionTitle title="Shape" />
          <div className={styles.radii}>
            {RADII.map((token) => (
              <div key={token} className={styles.radius}>
                <span className={styles.radiusShape} style={{ borderTopLeftRadius: `var(${token})` }} />
                <code className={styles.rowName}>{token.replace("--radius-", "")}</code>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
