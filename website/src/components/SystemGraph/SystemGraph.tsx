"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@robr0/design-system/components/Button/Button";
import { Chip } from "@robr0/design-system/components/Chip/Chip";
import { CodeBlock } from "@robr0/design-system/components/CodeBlock/CodeBlock";
import { Input } from "@robr0/design-system/components/Input/Input";
import { Panel } from "@robr0/design-system/components/Panel/Panel";
import {
  GRAPH_EDGE_COUNT,
  GRAPH_NODE_COUNT,
  graphColumns,
  graphEdges,
  graphGroupOrder,
  graphNodes,
} from "@/data/dependency-graph";
import type { GraphEdge, GraphNode } from "@/data/dependency-graph";
import styles from "./SystemGraph.module.css";

/* ============================================
   Static graph shape — built once at module load
   ============================================ */

const nodeById = new Map(graphNodes.map((n) => [n.id, n]));
const outEdges = new Map<string, GraphEdge[]>();
const inEdges = new Map<string, GraphEdge[]>();
for (const n of graphNodes) {
  outEdges.set(n.id, []);
  inEdges.set(n.id, []);
}
for (const e of graphEdges) {
  outEdges.get(e.s)?.push(e);
  inEdges.get(e.t)?.push(e);
}
const degree = new Map(
  graphNodes.map((n) => [n.id, (outEdges.get(n.id)?.length ?? 0) + (inEdges.get(n.id)?.length ?? 0)])
);
const degMax = Math.max(1, ...degree.values());
const colIndex = new Map(graphColumns.map((c, i) => [c.id, i]));

/* ============================================
   Layout — placed bars, group labels, column heads
   ============================================ */

const HEAD_H = 48;
const LABEL_H = 15;
const BOTTOM = 24;

interface Placed {
  node: GraphNode;
  x: number;
  y: number;
  w: number;
  h: number;
}
interface GroupLabel {
  x: number;
  y: number;
  text: string;
}
interface Layout {
  width: number;
  height: number;
  placed: Placed[];
  byId: Map<string, Placed>;
  labels: GroupLabel[];
  colX: number[];
}

function computeLayout(width: number, viewportHeight: number): Layout {
  const usable = width - 130; // room for the widest bars in the last column
  const colX = graphColumns.map((_, i) => 8 + (usable / graphColumns.length) * i);
  const barMax = Math.min(112, usable / graphColumns.length - 14);

  const ordered = graphColumns.map((c) => {
    const list = graphNodes.filter((n) => n.col === c.id);
    const groups = [...new Set(list.map((n) => n.group))];
    const pref = graphGroupOrder[c.id] ?? [];
    groups.sort((a, b) => {
      const ia = pref.indexOf(a);
      const ib = pref.indexOf(b);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      return a.localeCompare(b);
    });
    return groups.map((g) => ({
      group: g,
      items: list.filter((n) => n.group === g).sort((a, b) => a.label.localeCompare(b.label)),
    }));
  });

  const need = ordered.map((gs) => gs.reduce((s, g) => s + LABEL_H + g.items.length * 3.4, 0));
  const height = Math.max(viewportHeight, Math.ceil(Math.max(...need)) + HEAD_H + BOTTOM);

  const placed: Placed[] = [];
  const labels: GroupLabel[] = [];
  ordered.forEach((gs, ci) => {
    const count = gs.reduce((s, g) => s + g.items.length, 0);
    const avail = height - HEAD_H - BOTTOM - gs.length * LABEL_H;
    const pitch = Math.min(13, avail / Math.max(count, 1));
    let y = HEAD_H;
    gs.forEach((g) => {
      if (g.group !== "site") labels.push({ x: colX[ci], y: y + 2, text: g.group });
      y += LABEL_H;
      g.items.forEach((n) => {
        const deg = degree.get(n.id) ?? 0;
        placed.push({
          node: n,
          x: colX[ci],
          y: y + pitch / 2,
          h: Math.max(2, Math.min(4.5, pitch - 1.4)),
          w: 14 + (barMax - 14) * Math.sqrt(deg / degMax),
        });
        y += pitch;
      });
    });
  });

  return { width, height, placed, byId: new Map(placed.map((p) => [p.node.id, p])), labels, colX };
}

/* ============================================
   Tracing — the transitive closure in both directions
   ============================================ */

interface Trace {
  origin: string;
  lit: Set<string>;
  depEdges: GraphEdge[];
  useEdges: GraphEdge[];
}

function computeTrace(id: string): Trace {
  const lit = new Set([id]);
  const walk = (adj: Map<string, GraphEdge[]>, next: (e: GraphEdge) => string, kept: GraphEdge[]) => {
    const queue = [id];
    const seen = new Set([id]);
    while (queue.length) {
      const cur = queue.shift() as string;
      for (const e of adj.get(cur) ?? []) {
        kept.push(e);
        const n = next(e);
        lit.add(n);
        if (!seen.has(n)) {
          seen.add(n);
          queue.push(n);
        }
      }
    }
  };
  const depEdges: GraphEdge[] = [];
  const useEdges: GraphEdge[] = [];
  walk(outEdges, (e) => e.t, depEdges);
  walk(inEdges, (e) => e.s, useEdges);
  return { origin: id, lit, depEdges, useEdges };
}

/* ============================================
   Component
   ============================================ */

export default function SystemGraph() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mistRef = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null);

  const [layout, setLayout] = useState<Layout | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pinned, setPinned] = useState(false);
  const [themeTick, setThemeTick] = useState(0);
  const [query, setQuery] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const trace = useMemo(() => (selectedId ? computeTrace(selectedId) : null), [selectedId]);

  // Layout after mount and on resize; the server renders only the shell.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const measure = () => {
      const stage = stageRef.current;
      if (!stage) return;
      setLayout(computeLayout(stage.clientWidth, Math.max(560, window.innerHeight - 170)));
    };
    measure();
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // The canvas reads its colours from the computed tokens, so a theme flip
  // must invalidate the cached mist and redraw.
  useEffect(() => {
    const observer = new MutationObserver(() => setThemeTick((t) => t + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinned(false);
        setSelectedId(null);
        setResultsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Edge drawing.
  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root || !layout) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const computed = getComputedStyle(root);
    const colour = (prop: string) => computed.getPropertyValue(prop).trim();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = layout.width * dpr;
    canvas.height = layout.height * dpr;
    canvas.style.width = `${layout.width}px`;
    canvas.style.height = `${layout.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const path = (c: CanvasRenderingContext2D, e: GraphEdge) => {
      const s = layout.byId.get(e.s);
      const t = layout.byId.get(e.t);
      if (!s || !t) return;
      const sCol = colIndex.get(s.node.col) ?? 0;
      const tCol = colIndex.get(t.node.col) ?? 0;
      if (sCol === tCol) {
        const x = s.x - 3;
        const bulge = 26 + Math.abs(s.y - t.y) * 0.06;
        c.moveTo(x, s.y);
        c.bezierCurveTo(x - bulge, s.y, x - bulge, t.y, x, t.y);
        return;
      }
      const [a, b] = sCol > tCol ? [s, t] : [t, s];
      const x1 = a.x - 3;
      const x2 = b.x + b.w + 3;
      const mid = (x1 + x2) / 2;
      c.moveTo(x1, a.y);
      c.bezierCurveTo(mid, a.y, mid, b.y, x2, b.y);
    };

    // The faint pass over every edge is expensive, so it is drawn once per
    // layout and theme and blitted on every trace change.
    const mistKey = `${layout.width}x${layout.height}:${themeTick}`;
    if (!mistRef.current || mistRef.current.key !== mistKey) {
      const off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const oc = off.getContext("2d");
      if (oc) {
        oc.setTransform(dpr, 0, 0, dpr, 0, 0);
        oc.strokeStyle = colour("--graph-mist");
        oc.globalAlpha = 0.05;
        oc.lineWidth = 0.6;
        oc.beginPath();
        for (const e of graphEdges) path(oc, e);
        oc.stroke();
      }
      mistRef.current = { key: mistKey, canvas: off };
    }

    ctx.clearRect(0, 0, layout.width, layout.height);
    ctx.drawImage(mistRef.current.canvas, 0, 0, layout.width, layout.height);

    if (trace) {
      const drawSet = (edges: GraphEdge[], strokeColour: string) => {
        ctx.strokeStyle = strokeColour;
        ctx.globalAlpha = 0.65;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        for (const e of edges) path(ctx, e);
        ctx.stroke();
        ctx.globalAlpha = 1;
      };
      drawSet(trace.depEdges, colour("--graph-dep"));
      drawSet(trace.useEdges, colour("--graph-use"));
    }
  }, [layout, trace, themeTick]);

  const select = (id: string | null, pin: boolean) => {
    setSelectedId(id);
    setPinned(pin && id !== null);
  };

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return graphNodes
      .filter((n) => n.label.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          a.label.toLowerCase().indexOf(q) - b.label.toLowerCase().indexOf(q) ||
          (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0)
      )
      .slice(0, 9);
  }, [query]);

  const onSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!matches.length) return;
      setActiveIdx((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length);
    } else if (e.key === "Enter" && matches.length) {
      select(matches[Math.max(activeIdx, 0)].id, true);
      setResultsOpen(false);
    }
  };

  const selected = selectedId ? nodeById.get(selectedId) : undefined;

  return (
    <div ref={rootRef} className={styles.root}>
      <header className={styles.topbar}>
        <div className={styles.searchWrap}>
          <Input
            type="search"
            size="compact"
            value={query}
            placeholder="Find a token or component"
            aria-label="Find a token or component"
            autoComplete="off"
            iconLeft="search"
            className={styles.search}
            onValueChange={(value) => {
              setQuery(value);
              setActiveIdx(-1);
              setResultsOpen(true);
            }}
            onKeyDown={onSearchKey}
            onFocus={() => setResultsOpen(true)}
            onBlur={() => setTimeout(() => setResultsOpen(false), 120)}
          />
          {resultsOpen && matches.length > 0 && (
            <div className={styles.results}>
              {matches.map((n, i) => (
                <button
                  key={n.id}
                  type="button"
                  className={i === activeIdx ? `${styles.result} ${styles.resultActive}` : styles.result}
                  onMouseDown={() => {
                    select(n.id, true);
                    setResultsOpen(false);
                  }}
                >
                  <span>{n.label}</span>
                  <span className={`${styles.resultCol} ${styles[`text_${n.col}`]}`}>{n.col}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={styles.legend}>
          <span>
            <i className={styles.legendDep} aria-hidden />{" "}
            depends on
          </span>
          <span>
            <i className={styles.legendUse} aria-hidden />{" "}
            used by
          </span>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.stageScroll}>
          <div
            ref={stageRef}
            className={trace ? `${styles.stage} ${styles.tracing}` : styles.stage}
            style={{ height: layout ? layout.height : 560 }}
            onMouseLeave={() => {
              if (!pinned) select(null, false);
            }}
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest(`.${styles.bar}`)) select(null, false);
            }}
          >
            <canvas ref={canvasRef} className={styles.canvas} aria-hidden />
            {layout &&
              graphColumns.map((c, i) => (
                <div
                  key={c.id}
                  className={styles.colHead}
                  style={{ left: layout.colX[i], maxWidth: (layout.colX[1] ?? 160) - (layout.colX[0] ?? 0) - 12 }}
                >
                  <b className={styles[`text_${c.id}`]}>{c.label}</b>
                  <small>
                    {c.sub} · {graphNodes.filter((n) => n.col === c.id).length}
                  </small>
                </div>
              ))}
            {layout &&
              layout.labels.map((l) => (
                <span key={`${l.x}:${l.y}`} className={styles.groupLabel} style={{ left: l.x, top: l.y }}>
                  {l.text}
                </span>
              ))}
            {layout &&
              layout.placed.map((p) => {
                const lit = trace?.lit.has(p.node.id);
                const origin = trace?.origin === p.node.id;
                let cls = `${styles.bar} ${styles[`col_${p.node.col}`]}`;
                if (lit) cls += ` ${styles.lit}`;
                if (origin) cls += ` ${styles.origin}`;
                return (
                  <button
                    key={p.node.id}
                    type="button"
                    className={cls}
                    style={{ left: p.x, top: p.y - p.h / 2, width: p.w, height: p.h }}
                    aria-label={p.node.label}
                    title={p.node.label}
                    onMouseEnter={() => {
                      if (!pinned) select(p.node.id, false);
                    }}
                    onClick={() => select(p.node.id, true)}
                  />
                );
              })}
          </div>
        </div>

        <aside className={styles.panelSlot}>
          <Panel padding="default" className={styles.panelSurface}>
            <div className={styles.panelBody}>
              {selected ? (
                <NodePanel node={selected} onSelect={(id) => select(id, true)} onClear={() => select(null, false)} />
              ) : (
                <OverviewPanel />
              )}
            </div>
          </Panel>
        </aside>
      </div>

      <p className={styles.meta}>
        {GRAPH_NODE_COUNT} nodes · {GRAPH_EDGE_COUNT} dependencies, read from the source at build time.
      </p>
    </div>
  );
}

/* ============================================
   Panels
   ============================================ */

function OverviewPanel() {
  return (
    <>
      <div className={styles.panelHead}>
        <span className={styles.panelKind}>system graph</span>
      </div>
      <p className={styles.panelName}>What breaks?</p>
      <p className={styles.panelDesc}>
        Every dependency in the system, read from the source. Hover a bar to trace it:{" "}
        <span className={styles.depWord}>orange</span> is everything it depends on,{" "}
        <span className={styles.useWord}>blue</span> is everything that would feel a change to it. Click to
        pin, Esc to clear.
      </p>
      <h2 className={styles.panelSection}>Nodes</h2>
      {graphColumns.map((c) => (
        <div key={c.id} className={styles.swatchRow}>
          <i className={`${styles.swatchDot} ${styles[`col_${c.id}`]}`} aria-hidden />{" "}
          {c.label} <small>· {graphNodes.filter((n) => n.col === c.id).length}</small>
        </div>
      ))}
      <h2 className={styles.panelSection}>Regenerate</h2>
      <CodeBlock className={styles.cliBlock} language="bash" code="npm run graph" />
    </>
  );
}

function NodeChip({ id, count, onSelect }: { id: string; count?: number; onSelect: (id: string) => void }) {
  const n = nodeById.get(id);
  if (!n) return null;
  return (
    <Chip
      size="compact"
      className={styles.nodeChip}
      label={
        <>
          {n.label}
          {count !== undefined && count > 1 && <small className={styles.chipCount}> ×{count}</small>}
        </>
      }
      onClick={() => onSelect(id)}
    />
  );
}

function Chips({
  title,
  edges,
  pick,
  onSelect,
}: {
  title: string;
  edges: GraphEdge[];
  pick: (e: GraphEdge) => string;
  onSelect: (id: string) => void;
}) {
  if (!edges.length) return null;
  const shown = edges.slice(0, 40);
  return (
    <>
      <h2 className={styles.panelSection}>
        {title} · {edges.length}
      </h2>
      <div className={styles.chips}>
        {shown.map((e) => (
          <NodeChip key={pick(e)} id={pick(e)} count={e.w} onSelect={onSelect} />
        ))}
        {edges.length > shown.length && (
          <Chip size="compact" className={styles.nodeChip} label={`+${edges.length - shown.length} more`} />
        )}
      </div>
    </>
  );
}

function NodePanel({
  node,
  onSelect,
  onClear,
}: {
  node: GraphNode;
  onSelect: (id: string) => void;
  onClear: () => void;
}) {
  const deps = outEdges.get(node.id) ?? [];
  const uses = inEdges.get(node.id) ?? [];
  const tokenDeps = deps.filter((e) => nodeById.get(e.t)?.col === "tokens");
  const primDeps = deps.filter((e) => nodeById.get(e.t)?.col === "primitives");
  const compDeps = deps.filter((e) => {
    const col = nodeById.get(e.t)?.col;
    return col !== "tokens" && col !== "primitives";
  });
  const tokenUseTotal = tokenDeps.reduce((s, e) => s + e.w, 0);
  const byCategory = new Map<string, GraphEdge[]>();
  for (const e of tokenDeps) {
    const cat = nodeById.get(e.t)?.group ?? "";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)?.push(e);
  }
  const columnLabel = graphColumns.find((c) => c.id === node.col)?.label.toLowerCase();

  return (
    <>
      <div className={styles.panelHead}>
        <span className={styles.panelKind}>
          <i className={`${styles.swatchDot} ${styles[`col_${node.col}`]}`} aria-hidden />{" "}
          {columnLabel}
        </span>
        <Button label="Clear" variant="tertiary" size="compact" onClick={onClear} />
      </div>
      <p className={styles.panelName}>{node.label}</p>
      {node.description && <p className={styles.panelDesc}>{node.description}</p>}
      {node.col === "tokens" && (node.light || node.dark) && (
        <>
          <h2 className={styles.panelSection}>Resolves to</h2>
          {node.light && (
            <div className={styles.swatchRow}>
              <i className={styles.swatch} style={{ background: node.light }} aria-hidden />{" "}
              {node.light} <small>light</small>
            </div>
          )}
          {node.dark && node.dark !== node.light && (
            <div className={styles.swatchRow}>
              <i className={styles.swatch} style={{ background: node.dark }} aria-hidden />{" "}
              {node.dark} <small>dark</small>
            </div>
          )}
        </>
      )}
      {node.col === "primitives" && node.value && (
        <>
          <h2 className={styles.panelSection}>Value</h2>
          <div className={styles.swatchRow}>
            <i className={styles.swatch} style={{ background: node.value }} aria-hidden />{" "}
            {node.value}
          </div>
        </>
      )}
      <Chips title="Used by" edges={uses} pick={(e) => e.s} onSelect={onSelect} />
      <Chips title="Composes" edges={compDeps} pick={(e) => e.t} onSelect={onSelect} />
      {tokenDeps.length > 0 && (
        <>
          <h2 className={styles.panelSection}>
            Tokens · {tokenDeps.length} ({tokenUseTotal} uses)
          </h2>
          {[...byCategory.entries()].map(([cat, list]) => (
            <React.Fragment key={cat}>
              <h3 className={styles.panelCategory}>{cat}</h3>
              <div className={styles.chips}>
                {[...list]
                  .sort((a, b) => b.w - a.w)
                  .map((e) => (
                    <NodeChip key={e.t} id={e.t} count={e.w} onSelect={onSelect} />
                  ))}
              </div>
            </React.Fragment>
          ))}
        </>
      )}
      <Chips title="Primitives" edges={primDeps} pick={(e) => e.t} onSelect={onSelect} />
      <h2 className={styles.panelSection}>CLI</h2>
      <CodeBlock
        className={styles.cliBlock}
        language="bash"
        code={`npm run graph -- tree ${node.label}\nnpm run graph -- who-uses ${node.label}`}
      />
    </>
  );
}
