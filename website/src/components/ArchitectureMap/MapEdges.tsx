/**
 * The connective tissue of an architecture map, in two layers that read one
 * resolved-edge list (see geometry.ts): MapEdgeLayer draws the SVG beziers
 * and arrowhead markers underneath the nodes, and MapEdgeLabels places the
 * HTML label chips at each curve's midpoint on top of them. They are split
 * because SVG cannot host the token-styled HTML chips, but they must agree
 * on geometry — so both take the same pre-resolved list.
 */

import type { ResolvedEdge } from "./geometry";
import styles from "./MapEdges.module.css";

const EDGE_KINDS = ["flow", "external", "accent"] as const;

interface EdgeLayerProps {
  edges: ResolvedEdge[];
  /** Map width/height, for the SVG canvas. */
  width: number;
  height: number;
  /** Unique per rendered instance, so two viewports of one map keep their marker ids apart. */
  markerPrefix: string;
}

export function MapEdgeLayer({ edges, width, height, markerPrefix }: EdgeLayerProps) {
  return (
    <svg
      className={styles.edges}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <defs>
        {EDGE_KINDS.map((kind) => (
          <marker
            key={kind}
            id={`${markerPrefix}-${kind}`}
            viewBox="0 0 10 10"
            refX="8.5"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" className={styles[`marker-${kind}`]} />
          </marker>
        ))}
      </defs>
      {edges.map(({ edge, geo }) => (
        <path
          key={edge.id}
          d={geo.path}
          className={`${styles.edge} ${styles[`edge-${edge.kind ?? "flow"}`]}`}
          markerEnd={`url(#${markerPrefix}-${edge.kind ?? "flow"})`}
        />
      ))}
    </svg>
  );
}

export function MapEdgeLabels({ edges }: { edges: ResolvedEdge[] }) {
  return (
    <>
      {edges.map(({ edge, geo }) =>
        edge.label ? (
          <span
            key={`${edge.id}-label`}
            className={`${styles.edgeLabel} ${edge.kind === "accent" ? styles.edgeLabelAccent : ""}`}
            style={{ left: geo.mid.x, top: geo.mid.y }}
          >
            {edge.label}
          </span>
        ) : null,
      )}
    </>
  );
}
