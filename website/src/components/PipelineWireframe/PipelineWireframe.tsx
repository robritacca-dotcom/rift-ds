/**
 * An abstract 2D wireframe of the site's pipeline — the mega panel's
 * showcase graphic. A vector in the spirit of the home page's DS card
 * rather than a page screenshot: label-free node blocks, one zone, bezier
 * connectors and a single teal edge, on the same dotted canvas ground the
 * /overview architecture maps draw on. Everything resolves from semantic
 * tokens, so it re-themes with the site; no client JS, no raster to
 * re-shoot when the page it gestures at changes.
 */

import styles from "./PipelineWireframe.module.css";

/** A wireframe node: chip square plus two text bars, no words. */
function Block({
  x,
  y,
  w = 150,
  chip,
  dashed = false,
}: {
  x: number;
  y: number;
  w?: number;
  chip: "info" | "warning" | "positive" | "action" | "neutral";
  dashed?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        className={`${styles.node} ${dashed ? styles.nodeDashed : ""}`}
        width={w}
        height={60}
        rx={14}
      />
      <rect className={styles[`chip-${chip}`]} x={14} y={16} width={28} height={28} rx={9} />
      <rect className={styles.barStrong} x={54} y={20} width={Math.min(64, w - 70)} height={8} rx={4} />
      <rect className={styles.barSoft} x={54} y={34} width={Math.min(84, w - 62)} height={6} rx={3} />
    </g>
  );
}

export default function PipelineWireframe({ className }: { className?: string }) {
  return (
    <div className={`${styles.frame} ${className ?? ""}`}>
      {/* Top-anchored meet: the drawing keeps its shape at the top of the
          frame however tall the frame runs, and the dotted ground carries
          on beneath it. */}
      <svg
        className={styles.drawing}
        viewBox="0 0 760 475"
        preserveAspectRatio="xMidYMin meet"
        role="img"
        aria-label="An abstract wireframe of the site's pipeline: source blocks flowing through a validation stage and out to two destinations."
      >
        <defs>
          <marker id="pw-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className={styles.markerFlow} />
          </marker>
          <marker id="pw-arrow-accent" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className={styles.markerAccent} />
          </marker>
        </defs>

        {/* The generate-and-validate zone behind its node */}
        <rect className={styles.zone} x={252} y={172} width={214} height={128} rx={18} />

        {/* Edges under the nodes */}
        <path className={styles.edge} d="M 190 237 C 226 237, 236 237, 272 237" markerEnd="url(#pw-arrow)" />
        <path className={styles.edge} d="M 446 220 C 492 200, 490 145, 526 122" markerEnd="url(#pw-arrow)" />
        <path
          className={`${styles.edge} ${styles.edgeAccent}`}
          d="M 446 254 C 492 274, 490 329, 526 352"
          markerEnd="url(#pw-arrow-accent)"
        />
        <path
          className={`${styles.edge} ${styles.edgeDashed}`}
          d="M 190 92 C 240 92, 250 180, 288 200"
          markerEnd="url(#pw-arrow)"
        />

        {/* Nodes */}
        <Block x={40} y={62} chip="neutral" dashed />
        <Block x={40} y={207} chip="info" />
        <Block x={274} y={207} w={170} chip="warning" />
        <Block x={530} y={92} w={170} chip="positive" />
        <Block x={530} y={322} w={170} chip="action" />
      </svg>
    </div>
  );
}
