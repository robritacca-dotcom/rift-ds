/**
 * The model drawn flat, for the board's previews: the same generated
 * building the 3D artifact shows (building.ts), projected to SVG path data
 * in the browser with no WebGL, so a thumbnail costs a few path strings.
 * The shell is outlines (slabs, columns, the core), each trade's runs are
 * centre lines along their axis, and equipment is its footprint, filled.
 * Terminals (sprinkler heads, diffusers, grilles) and the curtain wall are
 * left out: at thumbnail size they are noise. Each still looks along its
 * camera preset's own direction (CAMERA_DIRECTION, which the viewer flies
 * by), so a still is the view its quick link opens: the camera's
 * perspective drawn as a parallel projection. Pure and cached per spec.
 */

import { FLOOR, MEP_DISCIPLINES, aabbOf, generateBuilding, type Element, type MepDiscipline } from "./building";
import { CAMERA_DIRECTION, CLASH_FRAME, type CameraPreset } from "./view";

export type PreviewView = CameraPreset;

export type PreviewSpec = {
  view: PreviewView;
  /** One storey, or the whole building. */
  level?: number | null;
  /** The trades drawn; every trade when left out. */
  disciplines?: readonly MepDiscipline[];
  /** A clash to mark, by number. */
  clash?: number | null;
  /** Frame the marked clash as the camera does (CLASH_FRAME either side), drawing only what that box holds. */
  framedOnClash?: boolean;
};

export type PreviewPaths = {
  viewBox: string;
  shell: string;
  runs: Record<MepDiscipline, string>;
  equipment: Record<MepDiscipline, string>;
  /** Clash markers, in view coordinates; the marked clash is flagged. */
  clashes: { x: number; y: number; marked: boolean }[];
};

const SKIP = new Set(["Sprinkler head", "Diffuser", "Return grille", "Mullion", "Spandrel"]);

type P2 = [number, number];

const normalise = (v: number[]) => {
  const n = Math.hypot(v[0], v[1], v[2]) || 1;
  return v.map((c) => c / n);
};
const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** The camera's screen axes for a preset: right, and up (screen y runs down). */
function projector(view: PreviewView): (x: number, y: number, z: number) => P2 {
  const { dir, up } = CAMERA_DIRECTION[view];
  const back = normalise(dir);
  const right = normalise(cross(up, back));
  const screenUp = cross(back, right);
  return (x, y, z) => [x * right[0] + y * right[1] + z * right[2], -(x * screenUp[0] + y * screenUp[1] + z * screenUp[2])];
}

/** True when an element sits in the storey's band, a riser crossing it included. */
const inStorey = (e: Element, level: number) => {
  const [, minY, , , maxY] = aabbOf(e);
  return maxY > level * FLOOR + 0.05 && minY < (level + 1) * FLOOR - 0.05;
};

const cache = new Map<string, PreviewPaths>();

export function previewPaths(spec: PreviewSpec): PreviewPaths {
  const key = JSON.stringify([spec.view, spec.level ?? null, spec.disciplines ?? null, spec.clash ?? null, spec.framedOnClash ?? false]);
  const hit = cache.get(key);
  if (hit) return hit;

  const { elements, clashes, byId } = generateBuilding();
  const project = projector(spec.view);
  const trades = new Set(spec.disciplines ?? MEP_DISCIPLINES);
  const level = spec.level ?? null;
  const focus = spec.framedOnClash ? clashes.find((c) => c.number === spec.clash) : undefined;
  const frame = focus ? focus.at.flatMap((c) => [c - CLASH_FRAME]).concat(focus.at.map((c) => c + CLASH_FRAME)) : null;
  const inFrame = (e: Element) => {
    if (!frame) return true;
    const b = aabbOf(e);
    return b[0] < frame[3] && b[3] > frame[0] && b[1] < frame[4] && b[4] > frame[1] && b[2] < frame[5] && b[5] > frame[2];
  };
  const shown = elements.filter(
    (e) => !SKIP.has(e.kind) && inFrame(e) && (level === null || inStorey(e, level) || (e.kind === "Slab" && e.level === level)),
  );

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const fit = ([x, y]: P2) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };
  const pt = (p: P2) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  const line = (a: P2, b: P2) => `M${pt(a)}L${pt(b)}`;
  const quad = (q: P2[]) => `M${pt(q[0])}L${pt(q[1])}L${pt(q[2])}L${pt(q[3])}Z`;

  /* The face a box shows the camera: its top in plan and 3D, its front in elevation. */
  const face = (b: number[]): P2[] =>
    spec.view === "front"
      ? [project(b[0], b[1], b[5]), project(b[3], b[1], b[5]), project(b[3], b[4], b[5]), project(b[0], b[4], b[5])]
      : [project(b[0], b[4], b[2]), project(b[3], b[4], b[2]), project(b[3], b[4], b[5]), project(b[0], b[4], b[5])];

  let shell = "";
  const runs = Object.fromEntries(MEP_DISCIPLINES.map((d) => [d, ""])) as Record<MepDiscipline, string>;
  const equipment = Object.fromEntries(MEP_DISCIPLINES.map((d) => [d, ""])) as Record<MepDiscipline, string>;

  for (const e of shown) {
    const b = aabbOf(e);
    if (e.discipline === "architecture") {
      if (e.kind === "Column") {
        const cx = (b[0] + b[3]) / 2;
        const cz = (b[2] + b[5]) / 2;
        if (spec.view === "top") {
          const q = face(b);
          q.forEach(fit);
          shell += quad(q);
        } else {
          const a = project(cx, b[1], cz);
          const c = project(cx, b[4], cz);
          fit(a);
          fit(c);
          shell += line(a, c);
        }
      } else {
        const q = face(b);
        q.forEach(fit);
        shell += quad(q);
      }
      continue;
    }
    if (!trades.has(e.discipline)) continue;
    const d = e.discipline as MepDiscipline;
    if (e.length > 0) {
      /* A run: its centre line along the longest side. */
      const sx = b[3] - b[0];
      const sy = b[4] - b[1];
      const sz = b[5] - b[2];
      const cx = (b[0] + b[3]) / 2;
      const cy = (b[1] + b[4]) / 2;
      const cz = (b[2] + b[5]) / 2;
      const [a, c] =
        sx >= sy && sx >= sz
          ? [project(b[0], cy, cz), project(b[3], cy, cz)]
          : sz >= sy
            ? [project(cx, cy, b[2]), project(cx, cy, b[5])]
            : [project(cx, b[1], cz), project(cx, b[4], cz)];
      fit(a);
      fit(c);
      runs[d] += line(a, c);
    } else {
      const q = face(b);
      q.forEach(fit);
      equipment[d] += quad(q);
    }
  }

  const marks = clashes
    /* A clash shows where its storey does and one of its trades is drawn. */
    .filter((c) => (level === null || c.level === level) && [c.a, c.b].some((id) => trades.has(byId.get(id)?.discipline as MepDiscipline)))
    .map((c) => {
      const [x, y] = project(c.at[0], c.at[1], c.at[2]);
      return { x, y, marked: c.number === spec.clash };
    });

  /* Framed on a clash, the still is the camera's box, not what it holds. */
  if (frame) {
    minX = minY = Infinity;
    maxX = maxY = -Infinity;
    for (const x of [frame[0], frame[3]]) for (const y of [frame[1], frame[4]]) for (const z of [frame[2], frame[5]]) fit(project(x, y, z));
  }
  const pad = Math.max(maxX - minX, maxY - minY) * 0.04;
  const out: PreviewPaths = {
    viewBox: `${(minX - pad).toFixed(1)} ${(minY - pad).toFixed(1)} ${(maxX - minX + pad * 2).toFixed(1)} ${(maxY - minY + pad * 2).toFixed(1)}`,
    shell,
    runs,
    equipment,
    clashes: marks,
  };
  cache.set(key, out);
  return out;
}
