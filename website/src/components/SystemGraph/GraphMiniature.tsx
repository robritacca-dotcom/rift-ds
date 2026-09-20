// No 'use client': the miniature is a static SVG drawn from the generated
// graph data at render time, so it prerenders on the server and can never
// go stale against the instrument it previews.

import Link from "next/link";
import {
  GRAPH_EDGE_COUNT,
  GRAPH_NODE_COUNT,
  graphColumns,
  graphEdges,
  graphGroupOrder,
  graphNodes,
} from "@/data/dependency-graph";
import styles from "./GraphMiniature.module.css";

/* Drawing geometry, not spacing roles — like the cover mocks' coordinates. */
const W = 900;
const H = 430;
const TOP = 44;
const BOTTOM = 16;
const COL_STEP = (W - 210) / (graphColumns.length - 1);
const BAR_MAX = 46;

/** The node the preview arrives mid-trace on — a stable, busy library node. */
const FOCUS = "component/button";

interface MiniPlaced {
  x: number;
  y: number;
  w: number;
}

const degree = new Map<string, number>(graphNodes.map((n) => [n.id, 0]));
for (const e of graphEdges) {
  degree.set(e.s, (degree.get(e.s) ?? 0) + 1);
  degree.set(e.t, (degree.get(e.t) ?? 0) + 1);
}
const degMax = Math.max(1, ...degree.values());

const placed = new Map<string, MiniPlaced>();
const columns = graphColumns.map((c, ci) => {
  const list = graphNodes.filter((n) => n.col === c.id);
  const pref = graphGroupOrder[c.id] ?? [];
  const groups = [...new Set(list.map((n) => n.group))].sort((a, b) => {
    const ia = pref.indexOf(a);
    const ib = pref.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b);
  });
  const ordered = groups.flatMap((g) =>
    list.filter((n) => n.group === g).sort((a, b) => a.label.localeCompare(b.label))
  );
  const x = 30 + ci * COL_STEP;
  const pitch = (H - TOP - BOTTOM) / ordered.length;
  const bars = ordered.map((n, i) => {
    const p: MiniPlaced = {
      x,
      y: TOP + pitch * (i + 0.5),
      w: 10 + (BAR_MAX - 10) * Math.sqrt((degree.get(n.id) ?? 0) / degMax),
    };
    placed.set(n.id, p);
    return { id: n.id, ...p };
  });
  return { ...c, x, count: list.length, bars, barH: Math.max(1.2, Math.min(2.4, pitch - 1)) };
});

const colOf = new Map(graphNodes.map((n) => [n.id, n.col]));
const colIdx = new Map(graphColumns.map((c, i) => [c.id, i]));

function edgePath(e: { s: string; t: string }): string | null {
  const s = placed.get(e.s);
  const t = placed.get(e.t);
  const sCol = colOf.get(e.s);
  const tCol = colOf.get(e.t);
  if (!s || !t || !sCol || !tCol) return null;
  const si = colIdx.get(sCol) ?? 0;
  const ti = colIdx.get(tCol) ?? 0;
  if (si === ti) {
    const x = s.x - 2;
    const bulge = 10 + Math.abs(s.y - t.y) * 0.05;
    return `M ${x} ${s.y.toFixed(1)} C ${x - bulge} ${s.y.toFixed(1)}, ${x - bulge} ${t.y.toFixed(1)}, ${x} ${t.y.toFixed(1)}`;
  }
  const [a, b] = si > ti ? [s, t] : [t, s];
  const x1 = a.x - 2;
  const x2 = b.x + b.w + 2;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${a.y.toFixed(1)} C ${mid} ${a.y.toFixed(1)}, ${mid} ${b.y.toFixed(1)}, ${x2} ${b.y.toFixed(1)}`;
}

/* The mid-trace state: the focus node's direct edges in both directions. */
const depEdges = graphEdges.filter((e) => e.s === FOCUS);
const useEdges = graphEdges.filter((e) => e.t === FOCUS);
const lit = new Set([FOCUS, ...depEdges.map((e) => e.t), ...useEdges.map((e) => e.s)]);
/* A deterministic sample of the rest, as the faint mist. */
const mistEdges = graphEdges.filter((e, i) => i % 24 === 0 && e.s !== FOCUS && e.t !== FOCUS);

/**
 * The overview page's preview of /graph: the real columns, a sample of the
 * edge mist, and the focus node mid-trace, drawn as one SVG on the same
 * dotted surface the architecture maps use. The whole figure links to the
 * live instrument.
 */
export default function GraphMiniature() {
  const focusLabel = graphNodes.find((n) => n.id === FOCUS)?.label ?? "";
  return (
    <figure className={styles.figure}>
      <Link
        href="/graph"
        className={styles.surface}
        aria-label={`Open the system graph, the live version of this preview (${GRAPH_NODE_COUNT} nodes)`}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-hidden>
          <g className={styles.mist}>
            {mistEdges.map((e) => {
              const d = edgePath(e);
              return d ? <path key={`${e.s}|${e.t}`} d={d} /> : null;
            })}
          </g>
          <g className={styles.dep}>
            {depEdges.map((e) => {
              const d = edgePath(e);
              return d ? <path key={`${e.s}|${e.t}`} d={d} /> : null;
            })}
          </g>
          <g className={styles.use}>
            {useEdges.map((e) => {
              const d = edgePath(e);
              return d ? <path key={`${e.s}|${e.t}`} d={d} /> : null;
            })}
          </g>
          {columns.map((c) => (
            <g key={c.id} className={styles[`col_${c.id}`]}>
              <text x={c.x} y={20} className={styles.colLabel}>
                {c.label} · {c.count}
              </text>
              {c.bars.map((b) => (
                <rect
                  key={b.id}
                  x={b.x}
                  y={b.y - c.barH / 2}
                  width={b.w}
                  height={c.barH}
                  rx={1}
                  className={lit.has(b.id) ? styles.barLit : styles.bar}
                />
              ))}
            </g>
          ))}
        </svg>
      </Link>
      <figcaption className={styles.caption}>
        The live instrument, mid-trace on {focusLabel}: {GRAPH_NODE_COUNT} nodes and{" "}
        {GRAPH_EDGE_COUNT} dependencies, drawn from the same generated data. Open it to trace any
        node yourself.
      </figcaption>
    </figure>
  );
}
