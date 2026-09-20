/**
 * Syncs the WorldMap component's land shapes from Natural Earth.
 *
 * Run deliberately — `node scripts/sync-worldmap-land.mjs` — never in the
 * build: like the essay sync, the build never touches the network, and the
 * generated module is committed. It fetches the 50m land polygons
 * (Natural Earth is public domain, so the shapes ship in the npm package
 * with no licence burden), projects every ring into the component's Web
 * Mercator drawing space, and writes `src/components/WorldMap/land.ts`.
 *
 * The drawing space matches the projection helpers in WorldMap.tsx: x runs
 * 0..360 linearly in longitude, y runs 0..360 through the Mercator formula
 * with latitude clamped to ±85.05°, so a degree of longitude and a degree
 * of projected latitude share one unit and a bounds box can become an SVG
 * viewBox directly. Antarctica is dropped (Mercator inflates it into a
 * shelf that dominates any world framing, and no marker will ever sit on
 * it), as are islands too small to survive a hairline stroke.
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(repoRoot, 'src', 'components', 'WorldMap', 'land.ts');

/* geojson.xyz serves Natural Earth as GeoJSON; the GitHub raw copy is the
   same data from the upstream natural-earth-vector repository. The 50m
   edition, not 110m: a region-framed or zoomed map magnifies the
   coastline, and 110m facets span whole countries at that zoom. The
   simplification pass below keeps the module small. */
const SOURCES = [
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson',
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_land.geojson',
];

/* Mirrors the constants in WorldMap.tsx — the module it generates states
   the pairing in its header so a projection change cannot drift silently. */
const MAX_LAT = 85.0511;
const R = 180 / Math.PI;

const projX = (lng) => lng + 180;
const projY = (lat) => {
  const clamped = Math.max(-MAX_LAT, Math.min(MAX_LAT, lat));
  return 180 - R * Math.log(Math.tan(Math.PI / 4 + (clamped * Math.PI) / 180 / 2));
};

/* A ring whose every vertex sits south of this is Antarctica (or one of
   its shelf islands). */
const ANTARCTICA_LAT = -59;
/* Rings whose projected bounding box is smaller than this (square units,
   one unit ≈ one degree of longitude) disappear at hairline stroke widths
   and only add bytes. Corsica spans about 0.5, and stays. */
const MIN_RING_AREA = 0.2;
/* Radial simplification: a vertex closer than this to the last kept one is
   dropped. 0.12 units ≈ 13 km — invisible at world zoom, about two pixels
   at a Europe framing on a wide stage. The resulting module lands around
   300 KB (a third of that after gzip), which is small next to the icon
   font the package already ships. */
const SIMPLIFY_TOLERANCE = 0.12;

const round = (n) => Math.round(n * 10) / 10;

async function fetchLand() {
  let lastError;
  for (const url of SOURCES) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      console.warn(`  … ${url} failed (${err.message}), trying the next source`);
    }
  }
  throw lastError;
}

function ringToPath(ring) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let allAntarctic = true;
  const parts = [];
  let prev = null;
  for (const [lng, lat] of ring) {
    if (lat >= ANTARCTICA_LAT) allAntarctic = false;
    const rawX = projX(lng);
    const rawY = projY(lat);
    if (prev && Math.hypot(rawX - prev[2], rawY - prev[3]) < SIMPLIFY_TOLERANCE) continue;
    const x = round(rawX);
    const y = round(rawY);
    if (prev && prev[0] === x && prev[1] === y) continue;
    prev = [x, y, rawX, rawY];
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    parts.push(`${parts.length === 0 ? 'M' : 'L'}${x} ${y}`);
  }
  if (allAntarctic) return null;
  if ((maxX - minX) * (maxY - minY) < MIN_RING_AREA) return null;
  return `${parts.join('')}Z`;
}

const geojson = await fetchLand();

const rings = [];
for (const feature of geojson.features) {
  const { type, coordinates } = feature.geometry;
  const polygons = type === 'Polygon' ? [coordinates] : coordinates;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      const path = ringToPath(ring);
      if (path) rings.push(path);
    }
  }
}

const path = rings.join('');

const module_ = `/**
 * GENERATED-ONCE DATA — the WorldMap component's land shapes.
 *
 * Source: Natural Earth 50m land polygons (public domain), projected into
 * the component's Web Mercator drawing space (x 0..360 in longitude,
 * y 0..360 in projected latitude, ±85.05° clamp) with Antarctica and
 * sub-hairline islands dropped. Regenerate with
 * \`node scripts/sync-worldmap-land.mjs\` — a deliberate network fetch, never
 * part of the build — which owns the projection constants this data was
 * baked with; WorldMap.tsx states the same constants for markers, and the
 * two must move together.
 */

/** Every landmass as one SVG path in the component's drawing space. */
export const LAND_PATH =
  '${path}';
`;

writeFileSync(outPath, module_);
const kb = (Buffer.byteLength(module_) / 1024).toFixed(1);
console.log(`✓ Wrote ${rings.length} land rings (${kb} KB) to src/components/WorldMap/land.ts`);
