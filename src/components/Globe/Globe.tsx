'use client';

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import './Globe.css';

/** A place on the globe. */
export interface GlobePoint {
  /** Stable identifier, referenced by arcs and by `activePointId`. */
  id: string;
  /** Latitude in degrees, north positive. */
  lat: number;
  /** Longitude in degrees, east positive. */
  lng: number;
  /** Short label drawn beside the marker when `showLabels` is on. */
  label?: string;
  /**
   * Marker glyph. `point` is a cross (something that moves or listens),
   * `anchor` is a square (something fixed). The glyph is the only difference.
   */
  kind?: 'point' | 'anchor';
  /**
   * Marker colour, any CSS colour (`var(--color-status-warning-border)`
   * works) — the same per-point channel WorldMap carries, so one dataset
   * keys identically on both projections. Omit for the text-ramp default;
   * a coloured marker keeps its colour on hover instead of brightening.
   */
  color?: string;
}

/** A great-circle arc between two points. */
export interface GlobeArc {
  /** `id` of the point the arc leaves. */
  from: string;
  /** `id` of the point the arc reaches. */
  to: string;
  /**
   * Stroke colour, any CSS colour (`var(--color-chart-series-3)` works).
   * Omit for the default cobalt-to-violet gradient along the arc.
   */
  color?: string;
  /** How far the arc lifts off the surface at its midpoint, as a fraction of the radius. */
  altitude?: number;
}

/** Where the globe is looking: `[longitude, latitude]` of the centre, in degrees. */
export type GlobeRotation = [number, number];

/** Props owned by Globe itself — everything else falls through to the root `<div>`. */
type GlobeOwnProps = {
  /** The places to mark. */
  points?: GlobePoint[];
  /** The arcs to draw between them. An arc whose endpoint is not in `points` is skipped. */
  arcs?: GlobeArc[];
  /**
   * Controlled view: `[longitude, latitude]` of the centre, in degrees.
   * Pair with `onRotationChange`. Omit to let the globe own its rotation.
   */
  rotation?: GlobeRotation;
  /** Initial view when uncontrolled. */
  defaultRotation?: GlobeRotation;
  /** Fires whenever the view changes — drag, keys, or the auto-rotation. */
  onRotationChange?: (rotation: GlobeRotation) => void;
  /**
   * Spin slowly on its own, in degrees per second. Pauses while the pointer
   * is over the globe or it has focus, and never runs under
   * `prefers-reduced-motion`. `0` switches it off.
   */
  autoRotate?: number;
  /** Drag to rotate, and rotate with the arrow keys (or W, A, S, D) when focused. */
  interactive?: boolean;
  /** Degrees between graticule lines. `0` removes the graticule. */
  graticuleStep?: number;
  /** Draw each point's `label` beside its marker. */
  showLabels?: boolean;
  /** The point to single out: its marker enlarges and its callout renders. */
  activePointId?: string;
  /** Fires as the pointer enters a marker, and with `null` as it leaves. */
  onPointHover?: (point: GlobePoint | null) => void;
  /** Fires when a marker is clicked. */
  onPointClick?: (point: GlobePoint) => void;
  /**
   * Renders the annotation for the active (or hovered) point. It is placed
   * beside the marker in an HTML overlay, so any markup works; MapCallout is
   * the intended filling. The overlay carries `data-side="left"|"right"` for
   * which side of the marker it sits on.
   */
  renderCallout?: (point: GlobePoint) => React.ReactNode;
  /**
   * Accessible name for the globe, e.g. "Listening points across the
   * network". The point and arc counts are appended for screen readers.
   */
  label?: string;
  /** Additional CSS classes */
  className?: string;
};

export interface GlobeProps
  extends GlobeOwnProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof GlobeOwnProps | 'children'> {}

// ── Geometry ───────────────────────────────────────────────────────────────

/** The drawing's coordinate space. The SVG scales to its container. */
const VIEW = 480;
const CENTER = VIEW / 2;
/** Sphere radius in viewBox units, leaving room for arcs to lift off the surface. */
const RADIUS = 180;
/** Samples along a graticule line and along an arc. */
const GRATICULE_SAMPLES = 60;
const ARC_SAMPLES = 48;
/** Drag sensitivity: rotating across the full radius turns the globe a quarter turn. */
const DRAG_DEGREES_PER_RADIUS = 90;
/** Keyboard step per press, in degrees. */
const KEY_STEP = 10;
/** Latitude clamp so the poles never flip over the top. */
const MAX_LAT = 80;
/** Marker half-size in viewBox units. */
const MARKER = 5;

const DEG = Math.PI / 180;

type Vec3 = [number, number, number];

/** Unit vector for a lat/lng: x toward 0°E, y toward 90°E, z north. */
const toVec = (lat: number, lng: number): Vec3 => {
  const φ = lat * DEG;
  const λ = lng * DEG;
  return [Math.cos(φ) * Math.cos(λ), Math.cos(φ) * Math.sin(λ), Math.sin(φ)];
};

type Projected = { x: number; y: number; visible: boolean };

/**
 * Orthographic projection of a world vector, scaled by `1 + altitude`, for a
 * view centred on `rotation`. `visible` is false when the point sits behind
 * the sphere's disc — a lifted point past the limb still shows.
 */
const makeProjector = ([lng0, lat0]: GlobeRotation) => {
  const λ0 = lng0 * DEG;
  const φ0 = lat0 * DEG;
  const cosλ = Math.cos(λ0);
  const sinλ = Math.sin(λ0);
  const cosφ = Math.cos(φ0);
  const sinφ = Math.sin(φ0);
  return ([x, y, z]: Vec3, altitude = 0): Projected => {
    // Spin about the pole so the centre longitude faces the viewer…
    const x1 = x * cosλ + y * sinλ;
    const y1 = -x * sinλ + y * cosλ;
    // …then tilt so the centre latitude sits at the middle of the disc.
    const depth = x1 * cosφ + z * sinφ;
    const up = -x1 * sinφ + z * cosφ;
    const s = 1 + altitude;
    const sx = y1 * s;
    const sy = up * s;
    return {
      x: CENTER + RADIUS * sx,
      y: CENTER - RADIUS * sy,
      visible: depth >= 0 || sx * sx + sy * sy > 1,
    };
  };
};

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * Splits a projected polyline into front and back path data, so the visible
 * run draws solid and the hidden run draws faint.
 */
const splitRuns = (pts: Projected[]) => {
  let front = '';
  let back = '';
  let prev: Projected | undefined;
  for (const p of pts) {
    const cmd = `${prev && prev.visible === p.visible ? 'L' : 'M'}${round(p.x)} ${round(p.y)}`;
    if (p.visible) front += cmd;
    else back += cmd;
    // A run that changes side restarts on the other side from this point.
    if (prev && prev.visible !== p.visible) {
      const start = `M${round(prev.x)} ${round(prev.y)}L${round(p.x)} ${round(p.y)}`;
      if (p.visible) front += start;
      else back += start;
    }
    prev = p;
  }
  return { front, back };
};

/** Points along the great circle from `a` to `b`, lifted by `altitude` at the middle. */
const arcVectors = (a: Vec3, b: Vec3, altitude: number): [Vec3, number][] => {
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const ω = Math.acos(dot);
  const sinω = Math.sin(ω);
  const out: [Vec3, number][] = [];
  for (let i = 0; i <= ARC_SAMPLES; i++) {
    const t = i / ARC_SAMPLES;
    let v: Vec3;
    if (sinω < 1e-6) {
      v = a;
    } else {
      const wa = Math.sin((1 - t) * ω) / sinω;
      const wb = Math.sin(t * ω) / sinω;
      v = [wa * a[0] + wb * b[0], wa * a[1] + wb * b[1], wa * a[2] + wb * b[2]];
    }
    out.push([v, altitude * Math.sin(t * Math.PI)]);
  }
  return out;
};

const normalizeLng = (lng: number) => ((((lng + 180) % 360) + 360) % 360) - 180;
const clampLat = (lat: number) => Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));

// ── Reduced motion as an external store (same recipe as Carousel) ──────────

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const subscribeReducedMotion = (callback: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerReducedMotion = () => false;

const KEY_DELTAS: Record<string, GlobeRotation> = {
  ArrowLeft: [KEY_STEP, 0],
  ArrowRight: [-KEY_STEP, 0],
  ArrowUp: [0, -KEY_STEP],
  ArrowDown: [0, KEY_STEP],
  a: [KEY_STEP, 0],
  d: [-KEY_STEP, 0],
  w: [0, -KEY_STEP],
  s: [0, KEY_STEP],
};

/**
 * Globe — an orthographic globe drawn in SVG, for showing where things are
 * and what connects them: a graticule, markers at lat/lng, and great-circle
 * arcs between them. No map library, no tile server, no land data; the
 * graticule alone gives the sphere its shape, which is the point — this is
 * for the geometry of a network, not for navigation.
 *
 * Colour comes from the tokens: the graticule in the divider colour, markers
 * in the text colours, arcs along the cobalt-to-violet chart series. Rotate
 * it by dragging, with the arrow keys when focused, or let it turn on its own.
 */
export const Globe = React.forwardRef<HTMLDivElement, GlobeProps>(
  (
    {
      points = [],
      arcs = [],
      rotation: rotationProp,
      defaultRotation = [-20, 20],
      onRotationChange,
      autoRotate = 3,
      interactive = true,
      graticuleStep = 30,
      showLabels = true,
      activePointId,
      onPointHover,
      onPointClick,
      renderCallout,
      label = 'Globe',
      className = '',
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerEnter,
      onPointerLeave,
      onKeyDown,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-globe';
    const gradientId = useId();

    const isControlled = rotationProp !== undefined;
    const [innerRotation, setInnerRotation] = useState<GlobeRotation>(defaultRotation);
    const rotation = isControlled ? rotationProp : innerRotation;

    const rotationRef = useRef(rotation);
    rotationRef.current = rotation;
    const onRotationChangeRef = useRef(onRotationChange);
    onRotationChangeRef.current = onRotationChange;

    const commit = useCallback(
      (next: GlobeRotation) => {
        const clean: GlobeRotation = [normalizeLng(next[0]), clampLat(next[1])];
        if (!isControlled) setInnerRotation(clean);
        onRotationChangeRef.current?.(clean);
      },
      [isControlled],
    );

    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [paused, setPaused] = useState(false);
    const reducedMotion = useSyncExternalStore(
      subscribeReducedMotion,
      getReducedMotion,
      getServerReducedMotion,
    );

    // ── Auto-rotation ──────────────────────────────────────────────────────
    const spinning = autoRotate !== 0 && !paused && !reducedMotion;
    useEffect(() => {
      if (!spinning) return;
      let frame = 0;
      let last = performance.now();
      const tick = (now: number) => {
        const dt = (now - last) / 1000;
        last = now;
        const [lng, lat] = rotationRef.current;
        commit([lng - autoRotate * dt, lat]);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [spinning, autoRotate, commit]);

    // ── Drag ───────────────────────────────────────────────────────────────
    const rootRef = useRef<HTMLDivElement | null>(null);
    const drag = useRef<{ x: number; y: number; rotation: GlobeRotation } | null>(null);
    const [dragging, setDragging] = useState(false);

    const setRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(e);
      if (!interactive || e.button !== 0) return;
      drag.current = { x: e.clientX, y: e.clientY, rotation: rotationRef.current };
      setDragging(true);
      setPaused(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(e);
      if (!drag.current || !rootRef.current) return;
      const radiusPx = (rootRef.current.clientWidth * (RADIUS / VIEW)) || 1;
      const perPx = DRAG_DEGREES_PER_RADIUS / radiusPx;
      const [lng, lat] = drag.current.rotation;
      commit([
        lng - (e.clientX - drag.current.x) * perPx,
        lat + (e.clientY - drag.current.y) * perPx,
      ]);
    };

    const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!drag.current) return;
      drag.current = null;
      setDragging(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerUp?.(e);
      endDrag(e);
    };
    const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerCancel?.(e);
      endDrag(e);
    };

    const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerEnter?.(e);
      setPaused(true);
    };
    const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerLeave?.(e);
      if (document.activeElement !== e.currentTarget) setPaused(false);
    };

    // ── Keyboard ───────────────────────────────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (!interactive || e.defaultPrevented) return;
      const delta = KEY_DELTAS[e.key] ?? KEY_DELTAS[e.key.toLowerCase()];
      if (!delta) return;
      e.preventDefault();
      const [lng, lat] = rotationRef.current;
      commit([lng + delta[0], lat + delta[1]]);
    };

    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(e);
      setPaused(true);
    };
    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      onBlur?.(e);
      if (!e.currentTarget.matches(':hover')) setPaused(false);
    };

    // ── Drawing ────────────────────────────────────────────────────────────
    const project = makeProjector(rotation);

    // Graticule: one path per side, every line joined into it.
    let graticuleFront = '';
    let graticuleBack = '';
    if (graticuleStep > 0) {
      for (let lng = -180; lng < 180; lng += graticuleStep) {
        const pts: Projected[] = [];
        for (let i = 0; i <= GRATICULE_SAMPLES; i++) {
          pts.push(project(toVec(-90 + (180 * i) / GRATICULE_SAMPLES, lng)));
        }
        const runs = splitRuns(pts);
        graticuleFront += runs.front;
        graticuleBack += runs.back;
      }
      for (let lat = -90 + graticuleStep; lat < 90; lat += graticuleStep) {
        const pts: Projected[] = [];
        for (let i = 0; i <= GRATICULE_SAMPLES; i++) {
          pts.push(project(toVec(lat, -180 + (360 * i) / GRATICULE_SAMPLES)));
        }
        const runs = splitRuns(pts);
        graticuleFront += runs.front;
        graticuleBack += runs.back;
      }
    }

    const byId = new Map(points.map((p) => [p.id, p]));
    const projectedPoints = points.map((p) => ({ point: p, at: project(toVec(p.lat, p.lng)) }));

    const drawnArcs = arcs.flatMap((arc, i) => {
      const from = byId.get(arc.from);
      const to = byId.get(arc.to);
      if (!from || !to) return [];
      const altitude = arc.altitude ?? 0.25;
      const samples = arcVectors(toVec(from.lat, from.lng), toVec(to.lat, to.lng), altitude);
      const pts = samples.map(([v, h]) => project(v, h));
      const runs = splitRuns(pts);
      return [
        {
          key: `${arc.from}-${arc.to}-${i}`,
          color: arc.color,
          start: pts[0],
          end: pts[pts.length - 1],
          ...runs,
        },
      ];
    });

    const calloutId = activePointId ?? hoveredId;
    const callout = calloutId ? projectedPoints.find((p) => p.point.id === calloutId) : undefined;
    const calloutSide = callout && callout.at.x < CENTER ? 'left' : 'right';

    const classes = [
      baseClass,
      interactive ? `${baseClass}--interactive` : '',
      dragging ? `${baseClass}--dragging` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const description = `${points.length} ${points.length === 1 ? 'point' : 'points'}, ${
      arcs.length
    } ${arcs.length === 1 ? 'arc' : 'arcs'}.${
      interactive ? ' Drag to rotate, or use the arrow keys when focused.' : ''
    }`;

    return (
      <div
        {...rest}
        ref={setRef}
        className={classes}
        role={interactive ? 'application' : 'img'}
        aria-roledescription="globe"
        aria-label={`${label}. ${description}`}
        tabIndex={interactive ? 0 : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <svg
          className={`${baseClass}__svg`}
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {drawnArcs.map((arc) =>
              arc.color ? null : (
                <linearGradient
                  key={arc.key}
                  id={`${gradientId}-${arc.key}`}
                  gradientUnits="userSpaceOnUse"
                  x1={round(arc.start.x)}
                  y1={round(arc.start.y)}
                  x2={round(arc.end.x)}
                  y2={round(arc.end.y)}
                >
                  <stop offset="0" className={`${baseClass}__arc-stop-start`} />
                  <stop offset="1" className={`${baseClass}__arc-stop-end`} />
                </linearGradient>
              ),
            )}
          </defs>

          <circle className={`${baseClass}__limb`} cx={CENTER} cy={CENTER} r={RADIUS} />
          {graticuleBack && <path className={`${baseClass}__graticule-back`} d={graticuleBack} />}
          {graticuleFront && <path className={`${baseClass}__graticule`} d={graticuleFront} />}

          <g className={`${baseClass}__arcs`}>
            {drawnArcs.map((arc) => {
              const stroke = arc.color ?? `url(#${gradientId}-${arc.key})`;
              return (
                <g key={arc.key}>
                  {arc.back && (
                    <path className={`${baseClass}__arc-back`} d={arc.back} stroke={stroke} />
                  )}
                  {arc.front && (
                    <path className={`${baseClass}__arc`} d={arc.front} stroke={stroke} />
                  )}
                </g>
              );
            })}
          </g>

          <g className={`${baseClass}__points`}>
            {projectedPoints.map(({ point, at }) => {
              const x = round(at.x);
              const y = round(at.y);
              const active = point.id === calloutId;
              const markerClasses = [
                `${baseClass}__point`,
                `${baseClass}__point--${point.kind ?? 'point'}`,
                at.visible ? '' : `${baseClass}__point--back`,
                active ? `${baseClass}__point--active` : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <g
                  key={point.id}
                  className={markerClasses}
                  style={point.color ? { color: point.color } : undefined}
                  transform={`translate(${x} ${y})`}
                  onPointerEnter={() => {
                    setHoveredId(point.id);
                    onPointHover?.(point);
                  }}
                  onPointerLeave={() => {
                    setHoveredId((id) => (id === point.id ? null : id));
                    onPointHover?.(null);
                  }}
                  onClick={onPointClick ? () => onPointClick(point) : undefined}
                >
                  {/* Hit area, larger than the glyph. */}
                  <circle className={`${baseClass}__hit`} r={MARKER * 2.4} />
                  {point.kind === 'anchor' ? (
                    <rect
                      className={`${baseClass}__glyph`}
                      x={-MARKER}
                      y={-MARKER}
                      width={MARKER * 2}
                      height={MARKER * 2}
                    />
                  ) : (
                    <path
                      className={`${baseClass}__glyph`}
                      d={`M${-MARKER} 0H${MARKER}M0 ${-MARKER}V${MARKER}`}
                    />
                  )}
                  {showLabels && point.label && (
                    <text className={`${baseClass}__label`} x={MARKER * 1.8} y={-MARKER * 1.2}>
                      {point.label}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {callout && renderCallout && (
          <div
            className={`${baseClass}__callout`}
            data-side={calloutSide}
            style={{
              left: `${(callout.at.x / VIEW) * 100}%`,
              top: `${(callout.at.y / VIEW) * 100}%`,
            }}
          >
            {renderCallout(callout.point)}
          </div>
        )}
      </div>
    );
  },
);

Globe.displayName = 'Globe';
