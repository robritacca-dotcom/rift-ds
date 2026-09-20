"use client";

/**
 * The pannable, zoomable canvas an architecture map renders on.
 *
 * Interaction contract:
 * - Embedded: drag pans (mouse/pen only, so touch keeps scrolling the page),
 *   pinch or ctrl+wheel zooms, plain wheel scrolls the page as normal.
 * - Expanded: any pointer pans, wheel zooms freely.
 * - The drawing refits itself on resize until the visitor takes over.
 *
 * Controls are the /canvas board's floating pill: zoom out, the percent
 * readout (resets to 100%), zoom in, fit, and — embedded only — expand.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { resolveEdges } from "./geometry";
import { MapEdgeLayer, MapEdgeLabels } from "./MapEdges";
import { MapNode } from "./MapNode";
import type { ArchMap } from "./types";
import styles from "./ArchitectureMap.module.css";

const MIN_SCALE = 0.15;
const MAX_SCALE = 2.5;
const FIT_PADDING = 28;

export interface MapViewportProps {
  map: ArchMap;
  /** Full-viewport overlay mode: touch pans, wheel zooms freely. */
  expanded: boolean;
  /** Renders the expand control when given (the embedded panel). */
  onExpand?: () => void;
}

export function MapViewport({ map, expanded, onExpand }: MapViewportProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, s: 0.5 });
  const [dragging, setDragging] = useState(false);
  const interactedRef = useRef(false);
  const dragRef = useRef<{ id: number; x: number; y: number } | null>(null);
  /* Live pointer positions, for the two-finger pinch in the expanded view. */
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistRef = useRef<number | null>(null);

  const fit = useCallback(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    /* Deliberately below MIN_SCALE when the panel demands it: on a phone the
       widest map fits well under 0.15, and a fit that cannot fit is no fit. */
    const s = Math.min(
      (r.width - FIT_PADDING * 2) / map.width,
      (r.height - FIT_PADDING * 2) / map.height,
      1,
    );
    setView({ s, x: (r.width - map.width * s) / 2, y: (r.height - map.height * s) / 2 });
  }, [map.width, map.height]);

  const refit = useCallback(() => {
    interactedRef.current = false;
    fit();
  }, [fit]);

  useEffect(() => {
    fit();
    const el = surfaceRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!interactedRef.current) fit();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  /* Wheel zoom needs preventDefault, so it cannot be a React (passive) listener. */
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!expanded && !e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      interactedRef.current = true;
      const r = el.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      setView((v) => {
        const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.s * Math.exp(-e.deltaY * 0.0016)));
        const k = s / v.s;
        return { s, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [expanded]);

  const zoomAroundCenter = useCallback((nextScale: (current: number) => number) => {
    const el = surfaceRef.current;
    if (!el) return;
    interactedRef.current = true;
    const r = el.getBoundingClientRect();
    const px = r.width / 2;
    const py = r.height / 2;
    setView((v) => {
      const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale(v.s)));
      const k = s / v.s;
      return { s, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }, []);

  const zoomBy = useCallback(
    (factor: number) => zoomAroundCenter((s) => s * factor),
    [zoomAroundCenter],
  );
  const zoomTo100 = useCallback(() => zoomAroundCenter(() => 1), [zoomAroundCenter]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    /* Capturing the pointer would swallow the control buttons' clicks. */
    if ((e.target as HTMLElement).closest("button")) return;
    /* Embedded on touch: a finger keeps scrolling the page; the expanded view pans. */
    if (!expanded && e.pointerType === "touch") return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
    interactedRef.current = true;
    if (pointersRef.current.size === 2) {
      /* Second finger down: the drag becomes a pinch. */
      const [a, b] = [...pointersRef.current.values()];
      pinchDistRef.current = Math.hypot(b.x - a.x, b.y - a.y);
      dragRef.current = null;
      setDragging(false);
    } else {
      dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
      setDragging(true);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = surfaceRef.current;
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (pinchDistRef.current !== null && pointersRef.current.size === 2 && el) {
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const factor = dist / (pinchDistRef.current || dist);
      pinchDistRef.current = dist;
      const r = el.getBoundingClientRect();
      const px = (a.x + b.x) / 2 - r.left;
      const py = (a.y + b.y) / 2 - r.top;
      setView((v) => {
        const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.s * factor));
        const k = s / v.s;
        return { s, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
      });
      return;
    }
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    dragRef.current = { id: drag.id, x: e.clientX, y: e.clientY };
    setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchDistRef.current = null;
    if (dragRef.current?.id !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
  };

  const edges = resolveEdges(map);
  const markerPrefix = `${map.id}-${expanded ? "full" : "embed"}`;

  return (
    <div
      ref={surfaceRef}
      className={`${styles.surface} ${expanded ? styles.surfaceFull : styles.surfaceEmbed} ${dragging ? styles.surfaceDragging : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="group"
      aria-label={map.label}
    >
      <div
        className={styles.world}
        style={{
          width: map.width,
          height: map.height,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
        }}
      >
        {map.nodes.filter((n) => n.kind === "zone").map((n) => (
          <MapNode key={n.id} node={n} />
        ))}
        <MapEdgeLayer edges={edges} width={map.width} height={map.height} markerPrefix={markerPrefix} />
        {map.nodes.filter((n) => n.kind !== "zone").map((n) => (
          <MapNode key={n.id} node={n} />
        ))}
        <MapEdgeLabels edges={edges} />
      </div>

      <div className={styles.controls} role="toolbar" aria-label={`${map.title} map controls`}>
        <CircularButton
          icon="remove"
          variant="tertiary"
          size="compact"
          ariaLabel="Zoom out"
          onClick={() => zoomBy(1 / 1.25)}
        />
        <button
          type="button"
          className={styles.zoomLevel}
          onClick={zoomTo100}
          aria-label={`Zoom ${Math.round(view.s * 100)}%. Reset to 100%`}
        >
          {Math.round(view.s * 100)}%
        </button>
        <CircularButton
          icon="add"
          variant="tertiary"
          size="compact"
          ariaLabel="Zoom in"
          onClick={() => zoomBy(1.25)}
        />
        <span className={styles.separator} aria-hidden="true" />
        <CircularButton
          icon="fit_screen"
          variant="tertiary"
          size="compact"
          ariaLabel="Fit the whole map"
          onClick={refit}
        />
        {onExpand ? (
          <CircularButton
            icon="open_in_full"
            variant="tertiary"
            size="compact"
            ariaLabel="Expand the map"
            onClick={onExpand}
          />
        ) : null}
      </div>
    </div>
  );
}
