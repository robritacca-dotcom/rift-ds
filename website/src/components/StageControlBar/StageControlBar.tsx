import type { ReactNode } from "react";
import styles from "./StageControlBar.module.css";

export interface StageControlBarProps {
  /** Accessible name for the bar's group of controls. */
  label: string;
  /** The bar's controls — compose with StageControlBarSeparator between
      unrelated clusters. */
  children: ReactNode;
}

/**
 * The immersive stages' bottom control bar: a glass pill floating at the
 * bottom centre of the viewport, holding a stage's own instruments (the
 * playground's theme flip and inspect switch) — the same furniture as the
 * architecture maps' zoom pill, promoted to a shared shell so every stage
 * hangs its controls in the same place.
 */
export default function StageControlBar({ label, children }: StageControlBarProps) {
  return (
    <>
      {/* A fade to the page floor behind the bar, so content scrolling
          under it dims out instead of colliding with the controls. */}
      <div className={styles.fade} aria-hidden="true" />
      <div className={styles.bar} role="group" aria-label={label}>
        {children}
      </div>
    </>
  );
}

/** A hairline divider between the bar's control clusters. */
export function StageControlBarSeparator() {
  return <span className={styles.separator} aria-hidden="true" />;
}

/** The bar's last slot, for a text control (the inspect switch): unlike the
    filled pills, bare text needs a little optical air before the bar's
    rounded end. */
export function StageControlBarEndSlot({ children }: { children: ReactNode }) {
  return <span className={styles.endSlot}>{children}</span>;
}
