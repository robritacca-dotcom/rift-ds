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
 */
export default function DotBackground() {
  return <div className={styles.ground} aria-hidden="true" />;
}
