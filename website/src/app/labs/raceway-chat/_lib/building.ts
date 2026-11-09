/**
 * The generated building: a fictional six-storey lab and office block with
 * every MEP system routed through it, written by this file alone (no model
 * file, no IFC, nothing from a real project). It is pure data, so the
 * viewer draws it, the welcome board counts it and the chat route reads it,
 * and all three agree.
 *
 * Every element is an axis-aligned box or cylinder, the way a router lays
 * orthogonal runs. Y is up, X runs along the building's length and Z
 * across it; units are metres. Each storey's plenum (between the ceiling
 * at +3.0 and the next slab at +4.2) is stacked by trade: sprinklers
 * highest, then domestic water, then cable tray and conduit, with the duct
 * mains below. A few runs are deliberately routed through another trade's
 * space, and the clash check at the bottom finds them the way a
 * coordination tool would, by overlapping the trades' bounding boxes.
 */

export type Discipline = "architecture" | "mechanical" | "plumbing" | "fire" | "electrical";
export const MEP_DISCIPLINES = ["mechanical", "plumbing", "fire", "electrical"] as const;
export type MepDiscipline = (typeof MEP_DISCIPLINES)[number];

export const DISCIPLINE_LABEL: Record<Discipline, string> = {
  architecture: "Architecture",
  mechanical: "Mechanical",
  plumbing: "Plumbing",
  fire: "Fire protection",
  electrical: "Electrical",
};

type Axis = "x" | "y" | "z";
type Vec = [number, number, number];

export type Element = {
  id: string;
  discipline: Discipline;
  /** The system within the trade, as a coordinator names it. */
  system: string;
  /** What the element is: duct, pipe, head, tray, AHU. */
  kind: string;
  name: string;
  /** 0 is the ground floor; LEVELS is the roof. */
  level: number;
  shape: "box" | "cylinder";
  centre: Vec;
  /** Box: its full size. Cylinder: [diameter, length, diameter] before it is turned to its axis. */
  size: Vec;
  /** For a cylinder: the axis it runs along. */
  axis: Axis;
  /** Run length in metres, for the takeoff; zero for a fixture or equipment. */
  length: number;
};

export type Clash = {
  number: number;
  level: number;
  a: string;
  b: string;
  /** "Mechanical × Fire protection". */
  trades: string;
  description: string;
  /** The overlap's centre, for the camera. */
  at: Vec;
};

export const LEVELS = 6;
export const FLOOR = 4.2;
const SLAB = 0.3;
const LENGTH = 63;
const DEPTH = 36;
const BAY = 9;

export const BUILDING = {
  name: "Alder Street Labs",
  use: "Lab and office",
  storeys: LEVELS,
  footprint: `${LENGTH} m × ${DEPTH} m`,
};

export const levelName = (level: number) => (level >= LEVELS ? "Roof" : level === 0 ? "Ground floor" : `Level ${level}`);

/* ------------------------------------------------------------ builders */

let serial = 0;
const out: Element[] = [];

function box(discipline: Discipline, system: string, kind: string, level: number, min: Vec, max: Vec, name?: string, length = 0) {
  const centre: Vec = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
  const size: Vec = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const id = `${discipline}-${++serial}`;
  out.push({ id, discipline, system, kind, name: name ?? `${kind} ${serial}`, level, shape: "box", centre, size, axis: "y", length });
  return id;
}

/** A rectangular run (duct, tray) between two points on one axis, `w` across and `h` high. */
function run(discipline: Discipline, system: string, kind: string, level: number, a: Vec, b: Vec, w: number, h: number, name?: string) {
  const axis: Axis = a[0] !== b[0] ? "x" : a[2] !== b[2] ? "z" : "y";
  const half: Vec = axis === "x" ? [0, h / 2, w / 2] : axis === "z" ? [w / 2, h / 2, 0] : [w / 2, 0, h / 2];
  const min: Vec = [Math.min(a[0], b[0]) - half[0], Math.min(a[1], b[1]) - half[1], Math.min(a[2], b[2]) - half[2]];
  const max: Vec = [Math.max(a[0], b[0]) + half[0], Math.max(a[1], b[1]) + half[1], Math.max(a[2], b[2]) + half[2]];
  const length = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  return box(discipline, system, kind, level, min, max, name, length);
}

/** A round run (pipe, conduit) between two points on one axis. */
function pipe(discipline: Discipline, system: string, kind: string, level: number, a: Vec, b: Vec, diameter: number, name?: string) {
  const axis: Axis = a[0] !== b[0] ? "x" : a[2] !== b[2] ? "z" : "y";
  const length = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  const centre: Vec = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const id = `${discipline}-${++serial}`;
  out.push({ id, discipline, system, kind, name: name ?? `${kind} ${serial}`, level, shape: "cylinder", centre, size: [diameter, length, diameter], axis, length });
  return id;
}

/** The bounding box of an element, as [minX, minY, minZ, maxX, maxY, maxZ]. */
export function aabbOf(e: Element) {
  let [sx, sy, sz] = e.size;
  if (e.shape === "cylinder") {
    const d = e.size[0];
    const l = e.size[1];
    [sx, sy, sz] = e.axis === "x" ? [l, d, d] : e.axis === "z" ? [d, d, l] : [d, l, d];
  }
  const [cx, cy, cz] = e.centre;
  return [cx - sx / 2, cy - sy / 2, cz - sz / 2, cx + sx / 2, cy + sy / 2, cz + sz / 2];
}

/* ------------------------------------------------------------ the shell */

function architecture() {
  for (let level = 0; level <= LEVELS; level++) {
    const y = level * FLOOR;
    box("architecture", "Floors", "Slab", level, [0, y, 0], [LENGTH, y + SLAB, DEPTH], `${levelName(level)} slab`);
    if (level === LEVELS) break;
    const top = y + FLOOR;
    for (let x = 0; x <= LENGTH; x += BAY) {
      for (let z = 0; z <= DEPTH; z += BAY) {
        box("architecture", "Structure", "Column", level, [x - 0.3, y + SLAB, z - 0.3], [x + 0.3, top, z + 0.3], `Column ${String.fromCharCode(65 + x / BAY)}${z / BAY + 1}`);
      }
    }
    /* The curtain wall: a spandrel band and mullions on each face. */
    for (const z of [0, DEPTH]) {
      box("architecture", "Envelope", "Spandrel", level, [0, top - 1.2, z - 0.1], [LENGTH, top, z + 0.1], "Spandrel");
      for (let x = 4.5; x < LENGTH; x += 4.5) box("architecture", "Envelope", "Mullion", level, [x - 0.05, y + SLAB, z - 0.1], [x + 0.05, top - 1.2, z + 0.1], "Mullion");
    }
    for (const x of [0, LENGTH]) {
      box("architecture", "Envelope", "Spandrel", level, [x - 0.1, top - 1.2, 0], [x + 0.1, top, DEPTH], "Spandrel");
      for (let z = 4.5; z < DEPTH; z += 4.5) box("architecture", "Envelope", "Mullion", level, [x - 0.1, y + SLAB, z - 0.05], [x + 0.1, top - 1.2, z + 0.05], "Mullion");
    }
    /* The core: stair and lifts, with the MEP shaft on its east side. */
    box("architecture", "Core", "Core wall", level, [26.6, y + SLAB, 13.4], [27, top, 22.6], "Core wall");
    box("architecture", "Core", "Core wall", level, [35.6, y + SLAB, 13.4], [36, top, 22.6], "Core wall");
    box("architecture", "Core", "Core wall", level, [26.6, y + SLAB, 13.4], [36, top, 13.8], "Core wall");
    box("architecture", "Core", "Core wall", level, [26.6, y + SLAB, 22.2], [36, top, 22.6], "Core wall");
    box("architecture", "Core", "Lift shaft", level, [31, y + SLAB, 14.5], [35, top, 18], "Lift shaft");
  }
}

/* ---------------------------------------------------------- mechanical */

function mechanical() {
  const ahuTop = LEVELS * FLOOR + SLAB;
  box("mechanical", "Air handling", "AHU", LEVELS, [6, ahuTop, 9], [20, ahuTop + 3, 15], "AHU-1");
  box("mechanical", "Air handling", "AHU", LEVELS, [43, ahuTop, 21], [57, ahuTop + 3, 27], "AHU-2");
  box("mechanical", "Chilled water", "Chiller", LEVELS, [43, ahuTop, 6], [53, ahuTop + 2.4, 11], "CH-1");
  box("mechanical", "Exhaust", "Exhaust fan", LEVELS, [24, ahuTop, 27], [26.5, ahuTop + 1.2, 29.5], "EF-1");
  box("mechanical", "Exhaust", "Exhaust fan", LEVELS, [12, ahuTop, 27], [14.5, ahuTop + 1.2, 29.5], "EF-2");
  /* Roof ducts from the units down to the shaft. */
  run("mechanical", "Supply air", "Duct", LEVELS, [20, ahuTop + 1.2, 12], [37.5, ahuTop + 1.2, 12], 1.2, 0.8, "AHU-1 supply header");
  run("mechanical", "Supply air", "Duct", LEVELS, [37.5, ahuTop + 1.2, 12], [37.5, ahuTop + 1.2, 16], 1.2, 0.8, "AHU-1 supply header");
  run("mechanical", "Return air", "Duct", LEVELS, [43, ahuTop + 1.2, 24], [37.5, ahuTop + 1.2, 24], 1.2, 0.8, "AHU-2 return header");
  run("mechanical", "Return air", "Duct", LEVELS, [37.5, ahuTop + 1.2, 24], [37.5, ahuTop + 1.2, 20], 1.2, 0.8, "AHU-2 return header");

  /* Risers in the shaft, roof to ground. */
  run("mechanical", "Supply air", "Duct", 0, [37.5, SLAB, 16], [37.5, ahuTop + 1.6, 16], 1.2, 1.0, "Supply riser SR-1");
  run("mechanical", "Return air", "Duct", 0, [37.5, SLAB, 20], [37.5, ahuTop + 1.6, 20], 1.2, 1.0, "Return riser RR-1");

  for (let level = 0; level < LEVELS; level++) {
    const b = level * FLOOR;
    const yMain = b + 3.45;
    const name = levelName(level);
    /* Supply: two mains from the riser, east and west, with branches to the perimeter. */
    run("mechanical", "Supply air", "Duct", level, [37.5, yMain, 16], [37.5, yMain, 11], 1.2, 0.5, `${name} supply main`);
    run("mechanical", "Supply air", "Duct", level, [6, yMain, 11], [58, yMain, 11], 1.2, 0.5, `${name} supply main S`);
    run("mechanical", "Supply air", "Duct", level, [40, yMain, 16], [40, yMain, 25], 1.0, 0.5, `${name} supply main N`);
    run("mechanical", "Supply air", "Duct", level, [6, yMain, 25], [58, yMain, 25], 1.0, 0.5, `${name} supply main N`);
    for (let x = 6; x <= 58; x += 4.5) {
      const tall = level === 4 && x === 42; // routed through the south tray on level 4
      const yBranch = tall ? b + 3.6 : b + 3.4;
      const h = tall ? 0.5 : 0.3;
      run("mechanical", "Supply air", "Duct", level, [x, yBranch, 10.4], [x, yBranch, 3], 0.4, h, `${name} supply branch`);
      run("mechanical", "Supply air", "Duct", level, [x, b + 3.4, 25.5], [x, b + 3.4, 33], 0.4, 0.3, `${name} supply branch`);
      box("mechanical", "Supply air", "VAV box", level, [x - 0.45, b + 3.2, 8.6], [x + 0.45, b + 3.65, 9.4], `${name} VAV`);
      box("mechanical", "Supply air", "VAV box", level, [x - 0.45, b + 3.2, 28.1], [x + 0.45, b + 3.65, 28.9], `${name} VAV`);
      for (const z of [5, 31]) box("mechanical", "Supply air", "Diffuser", level, [x - 0.3, b + 2.95, z - 0.3], [x + 0.3, b + 3.05, z + 0.3], "Diffuser");
    }
    /* Return: mains either side of the core, with grilles. */
    run("mechanical", "Return air", "Duct", level, [37.5, b + 3.5, 20], [37.5, b + 3.5, 23], 1.0, 0.45, `${name} return main`);
    run("mechanical", "Return air", "Duct", level, [6, b + 3.5, 23], [26, b + 3.5, 23], 1.0, 0.45, `${name} return main W`);
    run("mechanical", "Return air", "Duct", level, [37, b + 3.5, 23], [58, b + 3.5, 23], 1.0, 0.45, `${name} return main E`);
    for (let x = 8; x <= 56; x += 9) box("mechanical", "Return air", "Return grille", level, [x - 0.3, b + 2.95, 23.6], [x + 0.3, b + 3.05, 24.2], "Return grille");
  }
}

/* ------------------------------------------------------------ plumbing */

function plumbing() {
  const top = LEVELS * FLOOR + SLAB;
  pipe("plumbing", "Domestic cold water", "Pipe", 0, [38.6, SLAB, 18], [38.6, top, 18], 0.1, "Cold water riser CW-1");
  pipe("plumbing", "Domestic hot water", "Pipe", 0, [38.9, SLAB, 18], [38.9, top, 18], 0.08, "Hot water riser HW-1");
  pipe("plumbing", "Sanitary", "Pipe", 0, [39.2, 0, 18.6], [39.2, top, 18.6], 0.15, "Waste stack WS-1");
  pipe("plumbing", "Vent", "Pipe", 0, [39.2, 0, 17.4], [39.2, top + 1, 17.4], 0.1, "Vent stack VS-1");
  box("plumbing", "Domestic hot water", "Water heater", 0, [41, SLAB, 14], [42.2, SLAB + 2, 15.2], "WH-1");
  box("plumbing", "Domestic cold water", "Booster pump", 0, [43, SLAB, 14], [44.5, SLAB + 1.2, 15.5], "BP-1");

  for (let level = 0; level < LEVELS; level++) {
    const b = level * FLOOR;
    const name = levelName(level);
    /* Washrooms on the core's north side, a pantry at the east end. */
    const yCw = b + 4.05;
    const yHw = level === 3 ? b + 3.5 : b + 3.98; // dropped under the beams on level 3, into the return main
    pipe("plumbing", "Domestic cold water", "Pipe", level, [38.6, yCw, 18], [38.6, yCw, 26.2], 0.05, `${name} CW branch`);
    pipe("plumbing", "Domestic cold water", "Pipe", level, [38.6, yCw, 26.2], [28, yCw, 26.2], 0.05, `${name} CW branch`);
    pipe("plumbing", "Domestic cold water", "Pipe", level, [38.6, yCw, 26.2], [52, yCw, 26.2], 0.04, `${name} CW to pantry`);
    pipe("plumbing", "Domestic hot water", "Pipe", level, [38.9, yHw, 18], [38.9, yHw, 22.8], 0.04, `${name} HW branch`);
    pipe("plumbing", "Domestic hot water", "Pipe", level, [38.9, yHw, 22.8], [28, yHw, 22.8], 0.04, `${name} HW branch`);
    /* Fixture drops sit between the supply branches, never under one. */
    for (const x of [29.6, 30.8, 31.9, 34.4]) {
      pipe("plumbing", "Domestic cold water", "Pipe", level, [x, b + 1, 26.2], [x, yCw, 26.2], 0.025, `${name} fixture drop`);
      box("plumbing", "Sanitary", "Fixture", level, [x - 0.3, b + SLAB, 26.6], [x + 0.3, b + 1.1, 27.2], `${name} WC`);
    }
    box("plumbing", "Sanitary", "Fixture", level, [51.4, b + SLAB, 26.6], [52.6, b + 1.2, 27.2], `${name} pantry sink`);
    /* Waste under the slab, in the plenum below. */
    if (level > 0) {
      const yWaste = b - 0.2;
      pipe("plumbing", "Sanitary", "Pipe", level - 1, [28, yWaste, 26.9], [39.2, yWaste, 26.9], 0.1, `${name} waste`);
      pipe("plumbing", "Sanitary", "Pipe", level - 1, [39.2, yWaste, 26.9], [39.2, yWaste, 18.6], 0.1, `${name} waste`);
      pipe("plumbing", "Sanitary", "Pipe", level - 1, [52, yWaste, 26.9], [39.2, yWaste, 26.9], 0.075, `${name} pantry waste`);
    }
  }
}

/* -------------------------------------------------------------- fire */

function fire() {
  const top = LEVELS * FLOOR;
  pipe("fire", "Standpipe", "Pipe", 0, [27.4, SLAB, 14.2], [27.4, top, 14.2], 0.15, "Standpipe SP-1");
  box("fire", "Sprinkler", "Fire pump", 0, [20, SLAB, 14], [22, SLAB + 1.4, 16], "FP-1");

  for (let level = 0; level < LEVELS; level++) {
    const b = level * FLOOR;
    const name = levelName(level);
    const zMain = level === 5 ? 16.2 : 12.6; // run through the shaft, and the supply riser, on level 5
    const yMain = b + 3.92;
    pipe("fire", "Sprinkler", "Pipe", level, [27.4, yMain, 14.2], [27.4, yMain, zMain], 0.1, `${name} sprinkler feed`);
    pipe("fire", "Sprinkler", "Pipe", level, [3, yMain, zMain], [60, yMain, zMain], 0.1, `${name} cross main`);
    for (let x = 4.5; x <= 58.5; x += 3.6) {
      const dropped = level === 1 && x > 22 && x < 23; // dropped into the south supply main on level 1
      const yBranch = b + 3.9;
      if (dropped) {
        pipe("fire", "Sprinkler", "Pipe", level, [x, yBranch, zMain], [x, yBranch, 13], 0.04, `${name} branch line`);
        pipe("fire", "Sprinkler", "Pipe", level, [x, b + 3.55, 13], [x, b + 3.55, 9], 0.04, `${name} branch line (offset)`);
        pipe("fire", "Sprinkler", "Pipe", level, [x, yBranch, 9], [x, yBranch, 2], 0.04, `${name} branch line`);
      } else if (x > 26 && x < 41) {
        /* The core and the shaft: the branch stops either side of them. */
        pipe("fire", "Sprinkler", "Pipe", level, [x, yBranch, 2], [x, yBranch, 13.2], 0.04, `${name} branch line`);
        pipe("fire", "Sprinkler", "Pipe", level, [x, yBranch, 24], [x, yBranch, 34], 0.04, `${name} branch line`);
      } else {
        pipe("fire", "Sprinkler", "Pipe", level, [x, yBranch, 2], [x, yBranch, 34], 0.04, `${name} branch line`);
      }
      /* Heads on a grid set clear of the trays and the duct mains. */
      for (let z = 2.5; z <= 32; z += 3.6) {
        if (x > 26 && x < 41 && z > 13.2 && z < 24) continue; // the core has its own
        if (Math.abs(x - 40) < 0.8 && z > 15.5 && z < 25.6) continue; // clear of the north supply stub
        pipe("fire", "Sprinkler", "Sprinkler head", level, [x, b + 3.06, z], [x, yBranch, z], 0.025, "Sprinkler head");
      }
    }
  }
}

/* ---------------------------------------------------------- electrical */

function electrical() {
  const top = LEVELS * FLOOR + SLAB;
  run("electrical", "Power", "Busway", 0, [36.6, SLAB, 21.4], [36.6, top, 21.4], 0.3, 0.5, "Busway riser BW-1");
  box("electrical", "Power", "Switchboard", 0, [41, SLAB, 19], [46, SLAB + 2.2, 20], "MSB-1");
  box("electrical", "Power", "Generator", LEVELS, [27, top, 6], [33, top + 2.2, 9], "GEN-1");
  box("electrical", "Power", "Transformer", 0, [47, SLAB, 19], [49, SLAB + 1.8, 20.5], "TX-1");

  for (let level = 0; level < LEVELS; level++) {
    const b = level * FLOOR;
    const name = levelName(level);
    box("electrical", "Power", "Panelboard", level, [36.05, b + 0.8, 20.6], [36.3, b + 2.2, 21.2], `LP-${level + 1}A`);
    box("electrical", "Power", "Panelboard", level, [36.05, b + 0.8, 19.6], [36.3, b + 2.2, 20.2], `HP-${level + 1}A`);
    const yTray = b + 3.78;
    /* Trays north and south, fed from the shaft. */
    run("electrical", "Cable tray", "Tray", level, [41.5, yTray, 21.4], [41.5, yTray, 29], 0.6, 0.1, `${name} tray stub N`);
    run("electrical", "Cable tray", "Tray", level, [6, yTray, 29], [58, yTray, 29], 0.6, 0.1, `${name} tray N`);
    run("electrical", "Cable tray", "Tray", level, [41.5, yTray, 15], [41.5, yTray, 7], 0.45, 0.1, `${name} tray stub S`);
    run("electrical", "Cable tray", "Tray", level, [6, yTray, 7], [58, yTray, 7], 0.45, 0.1, `${name} tray S`);
    /* Conduit from the trays to the perimeter, every second bay. */
    for (let x = 7.5; x <= 57; x += 9) {
      const low = level === 2 && x === 25.5; // routed under the north supply main on level 2
      const y = low ? b + 3.55 : b + 3.8;
      pipe("electrical", "Lighting", "Conduit", level, [x, y, 29], [x, y, 34.5], 0.032, `${name} conduit`);
      pipe("electrical", "Lighting", "Conduit", level, [x, y, 22], [x, y, 29], 0.032, low ? `${name} conduit (dropped)` : `${name} conduit`);
      pipe("electrical", "Receptacles", "Conduit", level, [x, b + 3.8, 7], [x, b + 3.8, 1.5], 0.025, `${name} conduit`);
      pipe("electrical", "Receptacles", "Conduit", level, [x, b + 0.4, 1.5], [x, b + 3.8, 1.5], 0.025, `${name} conduit drop`);
    }
  }
}

/* --------------------------------------------------------------- clashes */

/** Overlaps between two different trades' elements, by bounding box, past a small tolerance. */
function findClashes(elements: Element[]): Clash[] {
  const mep = elements.filter((e) => e.discipline !== "architecture");
  const cell = 3;
  const grid = new Map<string, Element[]>();
  const boxes = new Map<string, number[]>();
  for (const e of mep) {
    const a = aabbOf(e);
    boxes.set(e.id, a);
    for (let x = Math.floor(a[0] / cell); x <= Math.floor(a[3] / cell); x++)
      for (let y = Math.floor(a[1] / cell); y <= Math.floor(a[4] / cell); y++)
        for (let z = Math.floor(a[2] / cell); z <= Math.floor(a[5] / cell); z++) {
          const key = `${x}:${y}:${z}`;
          const list = grid.get(key);
          if (list) list.push(e);
          else grid.set(key, [e]);
        }
  }
  const tolerance = 0.01;
  const seen = new Set<string>();
  const found: Omit<Clash, "number">[] = [];
  for (const list of grid.values()) {
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const [p, q] = [list[i], list[j]];
        if (p.discipline === q.discipline) continue;
        const pair = p.id < q.id ? `${p.id}|${q.id}` : `${q.id}|${p.id}`;
        if (seen.has(pair)) continue;
        seen.add(pair);
        const [a, b] = [boxes.get(p.id)!, boxes.get(q.id)!];
        const overlap = [0, 1, 2].map((k) => Math.min(a[k + 3], b[k + 3]) - Math.max(a[k], b[k]));
        if (overlap.some((o) => o <= tolerance)) continue;
        const at: Vec = [0, 1, 2].map((k) => (Math.max(a[k], b[k]) + Math.min(a[k + 3], b[k + 3])) / 2) as Vec;
        const [first, second] = MEP_DISCIPLINES.indexOf(p.discipline as MepDiscipline) <= MEP_DISCIPLINES.indexOf(q.discipline as MepDiscipline) ? [p, q] : [q, p];
        found.push({
          level: Math.min(LEVELS, Math.max(0, Math.floor(at[1] / FLOOR))),
          a: first.id,
          b: second.id,
          trades: `${DISCIPLINE_LABEL[first.discipline]} × ${DISCIPLINE_LABEL[second.discipline]}`,
          description: `${first.name} runs through ${second.name.charAt(0).toLowerCase()}${second.name.slice(1)}`,
          at,
        });
      }
  }
  /* One clash per pair of runs is enough to report; several heads under one duct read as one. */
  const merged = new Map<string, Omit<Clash, "number">>();
  for (const c of found) {
    const ea = elements.find((e) => e.id === c.a)!;
    const eb = elements.find((e) => e.id === c.b)!;
    const key = `${c.level}|${ea.system}|${eb.name}`;
    if (!merged.has(key)) merged.set(key, c);
  }
  return [...merged.values()].sort((x, y) => x.level - y.level || x.at[0] - y.at[0]).map((c, i) => ({ ...c, number: i + 1 }));
}

/* ------------------------------------------------------------ the model */

export type BuildingModel = {
  elements: Element[];
  clashes: Clash[];
  byId: Map<string, Element>;
  /** Run lengths and counts per trade, for the takeoff. */
  takeoff: { discipline: MepDiscipline; label: string; items: { label: string; value: string }[]; elements: number }[];
};

let cached: BuildingModel | null = null;

export function generateBuilding(): BuildingModel {
  if (cached) return cached;
  serial = 0;
  out.length = 0;
  architecture();
  mechanical();
  plumbing();
  fire();
  electrical();
  const elements = out.slice();
  const clashes = findClashes(elements);
  const metres = (filter: (e: Element) => boolean) => Math.round(elements.filter(filter).reduce((sum, e) => sum + e.length, 0) * 3.281);
  const count = (filter: (e: Element) => boolean) => elements.filter(filter).length;
  const ft = (n: number) => `${n.toLocaleString("en-US")} ft`;
  const takeoff: BuildingModel["takeoff"] = [
    {
      discipline: "mechanical",
      label: DISCIPLINE_LABEL.mechanical,
      elements: count((e) => e.discipline === "mechanical"),
      items: [
        { label: "Ductwork", value: ft(metres((e) => e.kind === "Duct")) },
        { label: "VAV boxes", value: String(count((e) => e.kind === "VAV box")) },
        { label: "Air terminals", value: String(count((e) => e.kind === "Diffuser" || e.kind === "Return grille")) },
      ],
    },
    {
      discipline: "plumbing",
      label: DISCIPLINE_LABEL.plumbing,
      elements: count((e) => e.discipline === "plumbing"),
      items: [
        { label: "Domestic water pipe", value: ft(metres((e) => e.system.startsWith("Domestic") && e.kind === "Pipe")) },
        { label: "Waste and vent", value: ft(metres((e) => (e.system === "Sanitary" || e.system === "Vent") && e.kind === "Pipe")) },
        { label: "Fixtures", value: String(count((e) => e.kind === "Fixture")) },
      ],
    },
    {
      discipline: "fire",
      label: DISCIPLINE_LABEL.fire,
      elements: count((e) => e.discipline === "fire"),
      items: [
        { label: "Sprinkler pipe", value: ft(metres((e) => e.discipline === "fire" && e.kind === "Pipe")) },
        { label: "Sprinkler heads", value: count((e) => e.kind === "Sprinkler head").toLocaleString("en-US") },
      ],
    },
    {
      discipline: "electrical",
      label: DISCIPLINE_LABEL.electrical,
      elements: count((e) => e.discipline === "electrical"),
      items: [
        { label: "Cable tray", value: ft(metres((e) => e.kind === "Tray")) },
        { label: "Conduit", value: ft(metres((e) => e.kind === "Conduit")) },
        { label: "Panelboards", value: String(count((e) => e.kind === "Panelboard")) },
      ],
    },
  ];
  cached = { elements, clashes, byId: new Map(elements.map((e) => [e.id, e])), takeoff };
  return cached;
}
