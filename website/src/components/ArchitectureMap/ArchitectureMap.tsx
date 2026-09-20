"use client";

/**
 * An architecture map on a pannable, zoomable canvas: the embedded figure,
 * its caption, and the full-viewport expanded overlay (StageToolbar frame,
 * scroll lock, Esc, focus management). The drawing itself is composed from
 * the sibling parts — MapViewport (pan/zoom surface and controls), MapNode
 * (cells and zones), MapEdges (connectors and label chips) — each of which
 * reads only the ArchMap data in types.ts.
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import StageToolbar from "@/components/StageToolbar/StageToolbar";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";
import { MapViewport } from "./MapViewport";
import type { ArchMap } from "./types";
import styles from "./ArchitectureMap.module.css";

export interface ArchitectureMapProps {
  map: ArchMap;
  /** One-sentence caption rendered under the embedded panel. */
  caption?: string;
}

export function ArchitectureMap({ map, caption }: ArchitectureMapProps) {
  const [open, setOpen] = useState(false);
  const expandRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const owner = `arch-map-${map.id}`;
    const figure = expandRef.current;
    lockBodyScroll(owner);
    overlayRef.current
      ?.querySelector<HTMLButtonElement>('button[aria-label="Close this view"]')
      ?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlockBodyScroll(owner);
      figure
        ?.querySelector<HTMLButtonElement>('button[aria-label="Expand the map"]')
        ?.focus();
    };
  }, [open, map.id]);

  return (
    <figure className={styles.figure} ref={expandRef}>
      <MapViewport map={map} expanded={false} onExpand={() => setOpen(true)} />
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
      {open
        ? createPortal(
            <div
              ref={overlayRef}
              className={styles.overlay}
              role="dialog"
              aria-modal="true"
              aria-label={map.label}
            >
              <StageToolbar append={map.title} onExit={() => setOpen(false)} />
              <MapViewport map={map} expanded />
              <p className={styles.hint}>
                Drag to pan. Scroll or pinch to zoom. Esc to close.
              </p>
            </div>,
            document.body,
          )
        : null}
    </figure>
  );
}
