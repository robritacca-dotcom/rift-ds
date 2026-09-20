'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CircularButton } from '../CircularButton/CircularButton';
import { HoverCard } from '../HoverCard/HoverCard';
import './WorldMap.css';
import { LAND_PATH } from './land';

/** A place on the map. */
export interface WorldMapPoint {
  /** Stable identifier, referenced by `activePointId`. */
  id: string;
  /** Latitude in degrees, north positive. */
  lat: number;
  /** Longitude in degrees, east positive. */
  lng: number;
  /** Short label drawn beside the marker when `showLabels` is on, and the marker's accessible name. */
  label?: string;
  /**
   * Marker glyph. `point` is a filled dot (something plotted), `anchor` is
   * an outlined square (something fixed) — the same vocabulary Globe and
   * MapLegend draw.
   */
  kind?: 'point' | 'anchor';
  /**
   * Marker colour, any CSS colour (`var(--color-chart-series-2)` works) —
   * the flat map's channel for colour-coding a category per point. Omit for
   * the default text colour.
   */
  color?: string;
}

/** The framed window: `[west, south, east, north]` in degrees. */
export type WorldMapBounds = [number, number, number, number];

/** Props owned by WorldMap itself — everything else falls through to the root `<div>`. */
type WorldMapOwnProps = {
  /** The places to mark. A point outside the framed view is simply not drawn. */
  points?: WorldMapPoint[];
  /**
   * The window the map frames: `[west, south, east, north]` in degrees.
   * It must not cross the antimeridian. Defaults to the whole world
   * (Antarctica is not in the land data). Changing it resets any zoom.
   */
  bounds?: WorldMapBounds;
  /**
   * How the framed window meets the container: `contain` letterboxes so the
   * whole window is visible, `cover` fills the container and crops the
   * window's edges — the full-bleed stage look.
   */
  fit?: 'contain' | 'cover';
  /**
   * Renders the zoom pill (zoom out, a percent readout that resets the
   * view, zoom in). Zoom steps into `bounds` and out past them — down to
   * the whole world with air around it, the graticule carrying on into
   * the space. Ctrl or ⌘ with the scroll wheel (a trackpad pinch) zooms at
   * the pointer; a plain scroll keeps scrolling the page. Dragging, or the
   * arrow keys with the map focused, moves the view anywhere on the world
   * at any zoom; a finger only drags while zoomed in, so the page keeps
   * its touch scroll too. Needs `interactive`.
   */
  showZoomControls?: boolean;
  /** How far the zoom controls can step in, as a multiple of `bounds`. */
  maxZoom?: number;
  /** Degrees between graticule lines. `0` removes the graticule. */
  graticuleStep?: number;
  /** Draw each point's `label` beside its marker. */
  showLabels?: boolean;
  /** The point to single out: its marker enlarges and its callout renders. */
  activePointId?: string;
  /** Markers are real buttons: hoverable, focusable, clickable. Off, they become inert glyphs and the map is one image. */
  interactive?: boolean;
  /** Fires as the pointer enters a marker (or it takes focus), and with `null` as it leaves. */
  onPointHover?: (point: WorldMapPoint | null) => void;
  /** Fires when a marker is clicked. */
  onPointClick?: (point: WorldMapPoint) => void;
  /**
   * Renders the annotation for the active (or hovered) point, placed beside
   * its marker in an HTML overlay; MapCallout is the intended filling. The
   * overlay carries `data-side="left"|"right"` for which side of the marker
   * it opens on — toward the map's centre, where the room is.
   */
  renderCallout?: (point: WorldMapPoint) => React.ReactNode;
  /**
   * Wraps each marker in the library's HoverCard, with this as the card's
   * content — the floating-panel alternative to `renderCallout`'s bare
   * readout, opening on hover or focus with the system's delays and Escape
   * dismissal. Content must be phrasing-level (spans), the panel's own
   * rule. Opens upward, or downward for a marker near the frame's top.
   * Needs `interactive`; when both renderers are given, this one wins.
   */
  renderHoverCard?: (point: WorldMapPoint) => React.ReactNode;
  /**
   * Accessible name for the map, e.g. "Offices across the network". The
   * point count is appended for screen readers.
   */
  label?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface WorldMapProps
  extends WorldMapOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof WorldMapOwnProps | 'children'> {}

// ── Projection ─────────────────────────────────────────────────────────────
// Web Mercator in a 0..360 square: x linear in longitude, y through the
// Mercator formula with the standard ±85.05° clamp. One unit is one degree
// of longitude, so a bounds box becomes an SVG viewBox directly. The land
// data in land.ts is baked in this same space by scripts/sync-worldmap-land.mjs,
// and the two must move together.

const MAX_LAT = 85.0511;
const R = 180 / Math.PI;

const projX = (lng: number) => lng + 180;
const projY = (lat: number) => {
  const clamped = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));
  return 180 - R * Math.log(Math.tan(Math.PI / 4 + (clamped * Math.PI) / 180 / 2));
};

/** The whole world, minus the Antarctic band the land data drops. */
const WORLD_BOUNDS: WorldMapBounds = [-180, -58, 180, 84];

/** The world's projected box, for the pan clamp and the zoom-out floor. */
const WORLD_X0 = projX(WORLD_BOUNDS[0]);
const WORLD_X1 = projX(WORLD_BOUNDS[2]);
const WORLD_Y0 = projY(WORLD_BOUNDS[3]);
const WORLD_Y1 = projY(WORLD_BOUNDS[1]);
const WORLD_W = WORLD_X1 - WORLD_X0;
const WORLD_H = WORLD_Y1 - WORLD_Y0;

/** Zooming out stops once the whole world fits the window with this much
 * air around it (and a margin for what a `cover` crop takes back). */
const ZOOM_OUT_HEADROOM = 1.3;

/** Graticule latitude lines stop here — Mercator stretches anything nearer the poles into noise. */
const GRATICULE_MAX_LAT = 80;

/** One press of a zoom control multiplies the zoom by this. */
const ZOOM_STEP = 1.5;

/** One arrow-key press pans by this fraction of the visible window. */
const KEY_PAN = 0.1;

/** Pointer travel below this many pixels stays a click, not a pan. */
const DRAG_THRESHOLD = 3;

const round = (n: number) => Math.round(n * 10) / 10;

const clampTo = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/** Clamps a window centre so the window stays inside a box; a window as big
 * as the box (or bigger) sits centred on it. */
const clampCenter = (c: number, half: number, lo: number, hi: number) =>
  hi - lo <= half * 2 ? (lo + hi) / 2 : clampTo(c, lo + half, hi - half);

/** A percentage for an inline style, pre-rounded to what the browser's own
 * CSS serialisation keeps — a full-precision float would come back from the
 * DOM shortened and trip React's hydration comparison. */
const pct = (n: number) => `${n.toFixed(4)}%`;

/* useLayoutEffect measures the frame before paint; on the server it would
   only warn, so it degrades to useEffect there. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type View = { key: string; zoom: number; cx: number; cy: number };

/**
 * WorldMap — a flat world map drawn in SVG from Natural Earth's land
 * shapes, for plotting where things are: token-coloured continents, a
 * quiet graticule, and lat/lng markers that carry their own colour. The
 * companion to Globe for when the geography should read at a glance rather
 * than turn — still no map library and no tile server: the land ships as
 * one baked path, so the whole map themes with the tokens.
 *
 * The root fills its container: give the wrapper the size, never the root
 * a height through `className` — that would tie with the component's own
 * fill rule at equal specificity and lose in some stylesheet orders.
 * Frame it with `bounds` (a lng/lat window that becomes the viewBox) and
 * `fit` (`cover` fills a stage edge to edge); `showZoomControls` adds zoom
 * into the window, with drag and arrow-key panning while zoomed. Markers
 * are real buttons — hover, focus, and click all work — and the callout
 * overlay places whatever `renderCallout` returns beside the active
 * marker; MapCallout is the intended filling.
 */
export const WorldMap = React.forwardRef<HTMLDivElement, WorldMapProps>(
  (
    {
      points = [],
      bounds = WORLD_BOUNDS,
      fit = 'contain',
      showZoomControls = false,
      maxZoom = 8,
      graticuleStep = 15,
      showLabels = false,
      activePointId,
      interactive = true,
      onPointHover,
      onPointClick,
      renderCallout,
      renderHoverCard,
      label = 'World map',
      className = '',
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-world-map';

    const [west, south, east, north] = bounds;
    const bx0 = projX(west);
    const by0 = projY(north);
    const bW = Math.max(projX(east) - bx0, 0.1);
    const bH = Math.max(projY(south) - by0, 0.1);

    // ── The view: a zoomed window inside the bounds ──────────────────────
    // Uncontrolled and keyed to the bounds, so a new `bounds` (a region
    // change) starts fresh at zoom 1 instead of keeping a stale window.
    const boundsKey = bounds.join(',');
    const [storedView, setStoredView] = useState<View | null>(null);
    const view = storedView && storedView.key === boundsKey ? storedView : null;

    const zoomEnabled = interactive && showZoomControls;
    const zoom = zoomEnabled && view ? view.zoom : 1;
    const viewW = bW / zoom;
    const viewH = bH / zoom;

    /* Panning roams the whole world, not just the given window: `bounds` is
       the frame a region starts (and resets) at, and the pan box is the
       world's extent, grown to the bounds if they reach further. */
    const panX0 = Math.min(projX(WORLD_BOUNDS[0]), bx0);
    const panX1 = Math.max(projX(WORLD_BOUNDS[2]), bx0 + bW);
    const panY0 = Math.min(projY(WORLD_BOUNDS[3]), by0);
    const panY1 = Math.max(projY(WORLD_BOUNDS[1]), by0 + bH);

    const cx = clampCenter(view?.cx ?? bx0 + bW / 2, viewW / 2, panX0, panX1);
    const cy = clampCenter(view?.cy ?? by0 + bH / 2, viewH / 2, panY0, panY1);
    const x0 = cx - viewW / 2;
    const y0 = cy - viewH / 2;

    /* The zoom-out floor: far enough that the whole world sits in the
       window with space around it, wherever the bounds started. Never
       above 1 — the given frame is always reachable. */
    const minZoom = Math.min(
      1,
      Math.min(bW / WORLD_W, bH / WORLD_H) / ZOOM_OUT_HEADROOM,
    );

    const setView = (nextZoom: number, nextCx: number, nextCy: number) => {
      const bounded = clampTo(nextZoom, minZoom, maxZoom);
      const z = Math.abs(bounded - 1) < 0.01 ? 1 : bounded;
      setStoredView({ key: boundsKey, zoom: z, cx: nextCx, cy: nextCy });
    };

    const stepZoom = (direction: 1 | -1) => {
      setView(direction > 0 ? zoom * ZOOM_STEP : zoom / ZOOM_STEP, cx, cy);
    };

    /* Wheel zoom, anchored at the pointer — the architecture maps' embedded
       contract: ctrl or ⌘ must be held (which is also what a trackpad pinch
       emits), so a plain scroll keeps scrolling the page. It needs
       preventDefault, so it cannot be a React (passive) listener; the ref
       carries the live view so the listener attaches once. */
    const wheelStateRef = useRef({
      zoom,
      cx,
      cy,
      viewW,
      viewH,
      minZoom,
      maxZoom,
      boundsKey,
    });
    wheelStateRef.current = { zoom, cx, cy, viewW, viewH, minZoom, maxZoom, boundsKey };
    const frameElRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const el = frameElRef.current;
      if (!el || !zoomEnabled) return;
      const onWheel = (e: WheelEvent) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const s = wheelStateRef.current;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const fx = (e.clientX - rect.left) / rect.width;
        const fy = (e.clientY - rect.top) / rect.height;
        const bounded = clampTo(s.zoom * Math.exp(-e.deltaY * 0.0016), s.minZoom, s.maxZoom);
        const z = Math.abs(bounded - 1) < 0.01 ? 1 : bounded;
        // The projected point under the pointer stays under the pointer.
        const anchorX = s.cx - s.viewW / 2 + fx * s.viewW;
        const anchorY = s.cy - s.viewH / 2 + fy * s.viewH;
        const nextW = (s.viewW * s.zoom) / z;
        const nextH = (s.viewH * s.zoom) / z;
        setStoredView({
          key: s.boundsKey,
          zoom: z,
          cx: anchorX + (0.5 - fx) * nextW,
          cy: anchorY + (0.5 - fy) * nextH,
        });
      };
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }, [zoomEnabled]);

    // ── The frame: a window-shaped box fitted to the container ───────────
    // The SVG scales to the frame, and because the frame's aspect ratio is
    // the window's, marker percentages stay exact — which an SVG letterbox
    // would break. `cover` overflows the container and the root crops it.
    // Zooming never changes the frame: the window keeps the bounds' aspect
    // ratio, so only the viewBox and the percentages move.
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [frame, setFrame] = useState<{ width: number; height: number } | null>(null);
    const frameRef = useRef(frame);
    frameRef.current = frame;

    const setRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    useIsomorphicLayoutEffect(() => {
      const node = rootRef.current;
      if (!node) return;
      const measure = () => {
        const { clientWidth, clientHeight } = node;
        if (clientWidth === 0 || clientHeight === 0) return;
        const scaleX = clientWidth / bW;
        const scaleY = clientHeight / bH;
        const scale = fit === 'cover' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
        setFrame({ width: bW * scale, height: bH * scale });
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      return () => observer.disconnect();
    }, [bW, bH, fit]);

    // ── Panning ──────────────────────────────────────────────────────────
    const drag = useRef<{
      pointerId: number;
      startX: number;
      startY: number;
      startCx: number;
      startCy: number;
      unitsPerPx: number;
    } | null>(null);
    const dragMoved = useRef(false);
    const [panning, setPanning] = useState(false);

    /* Grabbable whenever there is world beyond the visible window — even at
       100%, since the frame is a starting view, not a wall. Touch is the
       exception below. */
    const pannable =
      zoomEnabled && (viewW < panX1 - panX0 - 0.01 || viewH < panY1 - panY0 - 0.01);

    const handleFramePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pannable || e.button !== 0) return;
      /* A finger only pans while zoomed (where touch-action is locked);
         unzoomed, it keeps scrolling the page — the architecture maps'
         contract. */
      if (e.pointerType === 'touch' && zoom <= 1) return;
      const measured = frameRef.current;
      if (!measured) return;
      drag.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startCx: cx,
        startCy: cy,
        unitsPerPx: viewW / measured.width,
      };
      dragMoved.current = false;
      e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleFramePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      if (!dragMoved.current && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
      if (!dragMoved.current) {
        dragMoved.current = true;
        setPanning(true);
      }
      setView(zoom, d.startCx - dx * d.unitsPerPx, d.startCy - dy * d.unitsPerPx);
    };

    const endFrameDrag = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag.current) return;
      drag.current = null;
      setPanning(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    };

    const handleRootKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (!zoomEnabled || e.defaultPrevented) return;
      switch (e.key) {
        case 'ArrowLeft':
          setView(zoom, cx - viewW * KEY_PAN, cy);
          break;
        case 'ArrowRight':
          setView(zoom, cx + viewW * KEY_PAN, cy);
          break;
        case 'ArrowUp':
          setView(zoom, cx, cy - viewH * KEY_PAN);
          break;
        case 'ArrowDown':
          setView(zoom, cx, cy + viewH * KEY_PAN);
          break;
        case '+':
        case '=':
          stepZoom(1);
          break;
        case '-':
        case '_':
          stepZoom(-1);
          break;
        default:
          return;
      }
      e.preventDefault();
    };

    // ── Hover ────────────────────────────────────────────────────────────
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const enterPoint = (point: WorldMapPoint) => {
      setHoveredId(point.id);
      onPointHover?.(point);
    };
    const leavePoint = (point: WorldMapPoint) => {
      setHoveredId((id) => (id === point.id ? null : id));
      onPointHover?.(null);
    };

    // ── Drawing ──────────────────────────────────────────────────────────
    /* The graticule covers the whole window, not just the world: meridians
       continue at the same spacing past the antimeridian, and parallels
       past ±80° continue at the step's own spacing — so panning or zooming
       out never runs off the lined paper, it just shows the map with space
       around it. */
    let graticule = '';
    if (graticuleStep > 0) {
      const x1 = x0 + viewW;
      const y1 = y0 + viewH;
      const left = round(x0);
      const right = round(x1);
      const top = round(y0);
      const bottom = round(y1);
      const firstLng = Math.floor((x0 - 180) / graticuleStep) * graticuleStep;
      for (let lng = firstLng; projX(lng) <= x1; lng += graticuleStep) {
        graticule += `M${round(projX(lng))} ${top}V${bottom}`;
      }
      const ys: number[] = [];
      for (let lat = -GRATICULE_MAX_LAT; lat <= GRATICULE_MAX_LAT; lat += graticuleStep) {
        ys.push(projY(lat));
      }
      const gTop = projY(GRATICULE_MAX_LAT);
      const gBottom = projY(-GRATICULE_MAX_LAT);
      for (let y = gTop - graticuleStep; y >= y0; y -= graticuleStep) ys.push(y);
      for (let y = gBottom + graticuleStep; y <= y1; y += graticuleStep) ys.push(y);
      for (const y of ys) {
        if (y < y0 || y > y1) continue;
        graticule += `M${left} ${round(y)}H${right}`;
      }
    }

    const placed = points.flatMap((point) => {
      const px = ((projX(point.lng) - x0) / viewW) * 100;
      const py = ((projY(point.lat) - y0) / viewH) * 100;
      if (px < 0 || px > 100 || py < 0 || py > 100) return [];
      return [{ point, px, py }];
    });

    const calloutId = activePointId ?? hoveredId;
    const callout = calloutId ? placed.find((p) => p.point.id === calloutId) : undefined;
    const calloutSide = callout && callout.px < 50 ? 'right' : 'left';

    const classes = [baseClass, className].filter(Boolean).join(' ');

    const frameClasses = [
      `${baseClass}__frame`,
      pannable ? `${baseClass}__frame--pannable` : '',
      pannable && zoom > 1 ? `${baseClass}__frame--touch-lock` : '',
      panning ? `${baseClass}__frame--panning` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const markerClasses = (point: WorldMapPoint) =>
      [
        `${baseClass}__marker`,
        `${baseClass}__marker--${point.kind ?? 'point'}`,
        point.id === calloutId ? `${baseClass}__marker--active` : '',
      ]
        .filter(Boolean)
        .join(' ');

    const markerStyle = (px: number, py: number, color?: string): React.CSSProperties => ({
      left: pct(px),
      top: pct(py),
      ...(color ? ({ '--ds-world-map-marker-color': color } as React.CSSProperties) : {}),
    });

    const description = `${placed.length} ${placed.length === 1 ? 'point' : 'points'}.${
      zoomEnabled
        ? ' Zoom with the controls or the plus and minus keys; drag or use the arrow keys to move the map.'
        : ''
    }`;

    return (
      <div
        {...rest}
        ref={setRef}
        className={classes}
        role={interactive ? 'group' : 'img'}
        aria-label={`${label}. ${description}`}
        tabIndex={zoomEnabled ? 0 : undefined}
        onKeyDown={handleRootKeyDown}
      >
        <div
          ref={frameElRef}
          className={frameClasses}
          style={frame ? { width: `${frame.width}px`, height: `${frame.height}px` } : undefined}
          onPointerDown={handleFramePointerDown}
          onPointerMove={handleFramePointerMove}
          onPointerUp={endFrameDrag}
          onPointerCancel={endFrameDrag}
        >
          <svg
            className={`${baseClass}__svg`}
            viewBox={`${round(x0)} ${round(y0)} ${round(viewW)} ${round(viewH)}`}
            preserveAspectRatio={fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            {graticule && <path className={`${baseClass}__graticule`} d={graticule} />}
            <path className={`${baseClass}__land`} d={LAND_PATH} />
          </svg>

          {placed.map(({ point, px, py }) => {
            if (!interactive) {
              return (
                <span
                  key={point.id}
                  className={markerClasses(point)}
                  style={markerStyle(px, py, point.color)}
                >
                  <span className={`${baseClass}__dot`} aria-hidden="true" />
                  {showLabels && point.label && (
                    <span className={`${baseClass}__label`}>{point.label}</span>
                  )}
                </span>
              );
            }

            const marker = (
              <button
                type="button"
                className={markerClasses(point)}
                style={renderHoverCard ? undefined : markerStyle(px, py, point.color)}
                aria-label={point.label ?? point.id}
                onPointerEnter={() => enterPoint(point)}
                onPointerLeave={() => leavePoint(point)}
                onFocus={() => enterPoint(point)}
                onBlur={() => leavePoint(point)}
                onClick={
                  onPointClick
                    ? () => {
                        // A pan that started on a marker is not a click.
                        if (dragMoved.current) return;
                        onPointClick(point);
                      }
                    : undefined
                }
              >
                <span className={`${baseClass}__dot`} aria-hidden="true" />
                {showLabels && point.label && (
                  <span className={`${baseClass}__label`} aria-hidden="true">
                    {point.label}
                  </span>
                )}
              </button>
            );

            if (!renderHoverCard) return React.cloneElement(marker, { key: point.id });

            /* The slot owns the marker's position, so the HoverCard keeps
               its own layout contract; near the frame's top the card opens
               downward instead. */
            return (
              <span
                key={point.id}
                className={`${baseClass}__marker-slot`}
                style={markerStyle(px, py, point.color)}
              >
                <HoverCard
                  content={renderHoverCard(point)}
                  position={py < 25 ? 'bottom' : 'top'}
                >
                  {marker}
                </HoverCard>
              </span>
            );
          })}

          {callout && renderCallout && !renderHoverCard && (
            <div
              className={`${baseClass}__callout`}
              data-side={calloutSide}
              style={{ left: pct(callout.px), top: pct(callout.py) }}
            >
              {renderCallout(callout.point)}
            </div>
          )}
        </div>

        {zoomEnabled && (
          <div className={`${baseClass}__zoom`} role="toolbar" aria-label="Map zoom controls">
            <CircularButton
              icon="remove"
              variant="tertiary"
              size="compact"
              ariaLabel="Zoom out"
              disabled={zoom <= minZoom + 0.001}
              onClick={() => stepZoom(-1)}
            />
            <button
              type="button"
              className={`${baseClass}__zoom-level`}
              onClick={() => setStoredView(null)}
              aria-label={`Zoom ${Math.round(zoom * 100)}%. Reset the view`}
            >
              {Math.round(zoom * 100)}%
            </button>
            <CircularButton
              icon="add"
              variant="tertiary"
              size="compact"
              ariaLabel="Zoom in"
              disabled={zoom >= maxZoom}
              onClick={() => stepZoom(1)}
            />
          </div>
        )}
      </div>
    );
  },
);

WorldMap.displayName = 'WorldMap';
