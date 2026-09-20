/**
 * Pure geometry for the architecture maps: anchor points, side picking, and
 * the cubic bezier each edge draws. No React, no DOM — the shared math both
 * the edge layer and the label layer read from one resolved list.
 */

import type { ArchMap, MapEdge, MapEdgeSide, MapNode } from "./types";

export interface Point {
  x: number;
  y: number;
}

function center(n: MapNode): Point {
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

export function anchor(n: MapNode, side: MapEdgeSide): Point {
  switch (side) {
    case "top":
      return { x: n.x + n.w / 2, y: n.y };
    case "bottom":
      return { x: n.x + n.w / 2, y: n.y + n.h };
    case "left":
      return { x: n.x, y: n.y + n.h / 2 };
    case "right":
      return { x: n.x + n.w, y: n.y + n.h / 2 };
  }
}

function outward(side: MapEdgeSide): Point {
  switch (side) {
    case "top":
      return { x: 0, y: -1 };
    case "bottom":
      return { x: 0, y: 1 };
    case "left":
      return { x: -1, y: 0 };
    case "right":
      return { x: 1, y: 0 };
  }
}

/** Pick sensible sides from the nodes' relative positions when the data doesn't say. */
export function autoSides(from: MapNode, to: MapNode): [MapEdgeSide, MapEdgeSide] {
  const a = center(from);
  const b = center(to);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? ["right", "left"] : ["left", "right"];
  }
  return dy >= 0 ? ["bottom", "top"] : ["top", "bottom"];
}

export interface EdgeGeometry {
  path: string;
  mid: Point;
}

export function edgeGeometry(edge: MapEdge, from: MapNode, to: MapNode): EdgeGeometry {
  const [autoFrom, autoTo] = autoSides(from, to);
  const fromSide = edge.fromSide ?? autoFrom;
  const toSide = edge.toSide ?? autoTo;
  const p0 = anchor(from, fromSide);
  const p3 = anchor(to, toSide);
  const dist = Math.hypot(p3.x - p0.x, p3.y - p0.y);
  const ext = Math.min(170, Math.max(48, dist * 0.4));
  const n0 = outward(fromSide);
  const n3 = outward(toSide);
  let c1 = { x: p0.x + n0.x * ext, y: p0.y + n0.y * ext };
  let c2 = { x: p3.x + n3.x * ext, y: p3.y + n3.y * ext };
  if (edge.bend) {
    /* Bow both control points perpendicular to the straight line, so two
       edges between the same pair separate instead of overlapping. */
    const len = dist || 1;
    const px = -(p3.y - p0.y) / len;
    const py = (p3.x - p0.x) / len;
    c1 = { x: c1.x + px * edge.bend, y: c1.y + py * edge.bend };
    c2 = { x: c2.x + px * edge.bend, y: c2.y + py * edge.bend };
  }
  const path = `M ${p0.x} ${p0.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p3.x} ${p3.y}`;
  /* Cubic bezier point at t = 0.5, where the label chip sits. */
  const mid = {
    x: (p0.x + 3 * c1.x + 3 * c2.x + p3.x) / 8,
    y: (p0.y + 3 * c1.y + 3 * c2.y + p3.y) / 8,
  };
  return { path, mid };
}

export interface ResolvedEdge {
  edge: MapEdge;
  geo: EdgeGeometry;
}

/** Resolve every edge of a map against its nodes, dropping any with a bad id. */
export function resolveEdges(map: ArchMap): ResolvedEdge[] {
  const nodesById = new Map(map.nodes.map((n) => [n.id, n]));
  const resolved: ResolvedEdge[] = [];
  for (const edge of map.edges) {
    const from = nodesById.get(edge.from);
    const to = nodesById.get(edge.to);
    if (!from || !to) continue;
    resolved.push({ edge, geo: edgeGeometry(edge, from, to) });
  }
  return resolved;
}
