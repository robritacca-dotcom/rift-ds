/**
 * Accessor for the generated dependency graph — the data behind /graph.
 *
 * The generated file stores edges as node-index triples to keep it small;
 * this module expands them to id-keyed edges and exports the counts, so a
 * displayed number always derives from the same pass that drew the graph.
 * Regenerate with `npm run graph` (scripts/generate-dependency-graph.mjs,
 * also run by predev/prebuild); validate-dependency-graph.mjs keeps the
 * generated file honest.
 */
import { graphSource } from "./dependency-graph.generated";
import type { GraphColumnId, GraphSourceNode } from "./dependency-graph.generated";

export type { GraphColumnId };
export type GraphNode = GraphSourceNode;

export interface GraphEdge {
  /** The dependent (the node that uses). */
  s: string;
  /** The dependency (the node being used). */
  t: string;
  /** Use count — how many times the reference occurs in the source. */
  w: number;
}

export const graphColumns = graphSource.columns;
export const graphGroupOrder = graphSource.groupOrder;
export const graphNodes: GraphNode[] = graphSource.nodes;

export const graphEdges: GraphEdge[] = graphSource.edges.map(([s, t, w]) => ({
  s: graphSource.nodes[s].id,
  t: graphSource.nodes[t].id,
  w,
}));

export const GRAPH_NODE_COUNT = graphNodes.length;
export const GRAPH_EDGE_COUNT = graphEdges.length;
