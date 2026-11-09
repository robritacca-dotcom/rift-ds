/**
 * A still of the generated building for the board: previewPaths drawn as
 * one SVG, the shell in a quiet line, each trade in its colour in the 3D
 * model, and the clashes as warning marks (the marked one ringed). The
 * strokes hold their width at any size, so a thumbnail and the hero read
 * alike. Decorative: the link around it carries the name.
 */

import React from "react";
import { MEP_DISCIPLINES } from "./_lib/building";
import { previewPaths, type PreviewSpec } from "./_lib/preview";
import styles from "./RacewayChatHome.module.css";

const TRADE: Record<(typeof MEP_DISCIPLINES)[number], string> = {
  mechanical: styles.previewMechanical,
  plumbing: styles.previewPlumbing,
  fire: styles.previewFire,
  electrical: styles.previewElectrical,
};

export default function ModelPreview({ spec, className }: { spec: PreviewSpec; className?: string }) {
  const paths = previewPaths(spec);
  /* A clash mark's radius, as a share of the drawing, so it reads at any size. */
  const box = paths.viewBox.split(" ").map(Number);
  const r = Math.max(box[2], box[3]) * 0.012;

  return (
    <svg className={[styles.preview, className].filter(Boolean).join(" ")} viewBox={paths.viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      <path className={styles.previewShell} d={paths.shell} />
      {MEP_DISCIPLINES.map((d) => (
        <g key={d} className={TRADE[d]}>
          <path className={styles.previewRuns} d={paths.runs[d]} />
          <path className={styles.previewEquipment} d={paths.equipment[d]} />
        </g>
      ))}
      {paths.clashes.map((c, i) => (
        <g key={i} className={styles.previewClash}>
          {c.marked && <circle className={styles.previewClashRing} cx={c.x} cy={c.y} r={r * 2.4} />}
          <circle cx={c.x} cy={c.y} r={r} />
        </g>
      ))}
    </svg>
  );
}
