"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./StageControlBar.module.css";

export interface StageControlBarProps {
  /** Accessible name for the bar's group of controls. */
  label: string;
  /** The bar's controls — compose with StageControlBarSeparator between
      unrelated clusters. A function receives whether the labelled bar fits
      the workspace, so its controls can drop to their icons when it does
      not (`showLabels` on a segmented control). */
  children: ReactNode | ((fit: { labels: boolean }) => ReactNode);
}

/**
 * The immersive stages' bottom control bar: a glass pill floating at the
 * bottom centre of the stage's workspace (between the host's side panels,
 * declared as --stage-bar-start/--stage-bar-end; the viewport's centre when
 * it declares none), holding a stage's own instruments (the
 * playground's theme flip and inspect switch) — the same furniture as the
 * architecture maps' zoom pill, promoted to a shared shell so every stage
 * hangs its controls in the same place.
 *
 * The bar never runs under the side panels: it measures the workspace (a
 * hidden probe spanning the same two declarations) against its own width
 * with every label showing, and when the labelled bar would not fit it
 * tells a function child to shed its labels. The labelled width is read
 * only while the labels show, so the bar cannot oscillate between the two.
 */
export default function StageControlBar({ label, children }: StageControlBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<HTMLSpanElement>(null);
  const labelledWidth = useRef(0);
  const [labels, setLabels] = useState(true);
  const measured = typeof children === "function";

  useEffect(() => {
    const bar = barRef.current;
    const room = roomRef.current;
    if (!measured || !bar || !room || typeof ResizeObserver === "undefined") return;
    const fit = () => {
      if (labels) labelledWidth.current = bar.offsetWidth;
      setLabels(labelledWidth.current <= room.offsetWidth);
    };
    const observer = new ResizeObserver(fit);
    observer.observe(bar);
    observer.observe(room);
    return () => observer.disconnect();
  }, [measured, labels]);

  return (
    <>
      {/* A fade to the page floor behind the bar, so content scrolling
          under it dims and blurs out instead of colliding with the
          controls: the tint and three blur layers of the header's
          progressive backdrop, mirrored to rise from the viewport foot. */}
      <div className={styles.fade} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      {measured && <span ref={roomRef} className={styles.room} aria-hidden="true" />}
      <div ref={barRef} className={styles.bar} role="group" aria-label={label}>
        {typeof children === "function" ? children({ labels }) : children}
      </div>
    </>
  );
}

/** A hairline divider between the bar's control clusters. */
export function StageControlBarSeparator() {
  return <span className={styles.separator} aria-hidden="true" />;
}

/** A slot for a filled control (a primary button): insets it as far from
    the bar's edge as a segmented control's active pill, so both ends of the
    bar keep the same air. */
export function StageControlBarActionSlot({ children }: { children: ReactNode }) {
  return <span className={styles.actionSlot}>{children}</span>;
}

/** The bar's last slot, for a text control (the inspect switch): unlike the
    filled pills, bare text needs a little optical air before the bar's
    rounded end. */
export function StageControlBarEndSlot({ children }: { children: ReactNode }) {
  return <span className={styles.endSlot}>{children}</span>;
}
