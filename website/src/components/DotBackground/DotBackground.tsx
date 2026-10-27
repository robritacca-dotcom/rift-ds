import styles from "./DotBackground.module.css";

/**
 * The immersive stages' ground: a fixed, full-viewport dotted working-canvas
 * surface — the same dot ground the architecture maps draw on, promoted to a
 * whole-page backdrop for the surfaces whose panels float over it (the
 * playground; the canvas board and the expanded maps paint theirs on the
 * pannable surface itself).
 *
 * A page that renders this should render HiddenBackground beside it, so the
 * ambient shader layer stands down rather than glowing through the dots.
 *
 * `contained` is the other mode: the same ground filling a positioned frame
 * inside a page rather than the viewport (the home page's chat frame). It
 * covers only that frame, so it leaves the page's own background mode alone
 * and needs no HiddenBackground.
 */
export default function DotBackground({
  dots = true,
  contained = false,
}: {
  /** Draw the dot pattern. Off leaves the plain page colour, for a stage
      whose visitor wants to judge a theme without the texture behind it. */
  dots?: boolean;
  /** Fill the nearest positioned ancestor instead of the viewport, for a
      framed stage inside a page (the home page's chat frame). */
  contained?: boolean;
}) {
  const className = [styles.ground, dots ? "" : styles.plain, contained ? styles.contained : ""]
    .filter(Boolean)
    .join(" ");
  return <div className={className} aria-hidden="true" />;
}
