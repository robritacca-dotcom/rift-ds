/**
 * Data model for the architecture maps on /overview.
 *
 * The maps are hardcoded data for now, but the shapes are written as if the
 * parts were already components: a node knows nothing about which map it is
 * in, an edge addresses nodes by id, and a map is a plain serialisable
 * object. If the node graph ever graduates into the library (or a template),
 * these types move with it unchanged.
 */

export type MapNodeKind = "core" | "external" | "state" | "zone";

export type MapChipRole = "action" | "info" | "positive" | "warning" | "neutral";

export interface MapNode {
  id: string;
  /** Top-left corner and size, in map-space pixels. */
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  /**
   * core: a part that lives in the repo. external: a third-party service
   * (dashed). state: a resting state rather than a part (tinted, used by the
   * operator map). zone: a translucent grouping container drawn behind its
   * members.
   */
  kind?: MapNodeKind;
  /** Material Symbols name for the icon chip. Ignored when a logo is set. */
  icon?: string;
  /** Logo asset path (from /public). Wins over icon. */
  logo?: string;
  /** Dark-theme variant for marks that ship as a light/dark pair. */
  logoDark?: string;
  /** Colour role for the icon chip. Defaults to neutral. */
  chip?: MapChipRole;
}

export type MapEdgeSide = "top" | "right" | "bottom" | "left";

export interface MapEdge {
  id: string;
  from: string;
  to: string;
  /** Which side of each node the edge leaves and enters. Auto-picked from relative position when omitted. */
  fromSide?: MapEdgeSide;
  toSide?: MapEdgeSide;
  label?: string;
  /**
   * flow: the default solid connector. external: dashed, for edges that
   * cross out to a third party. accent: the teal edges the page is making a
   * point about.
   */
  kind?: "flow" | "external" | "accent";
  /** Perpendicular bow, in px. Separates parallel edges between the same pair. */
  bend?: number;
}

export interface ArchMap {
  id: string;
  /** Short display name, shown in the expanded view's title bar. */
  title: string;
  /** Accessible one-sentence description of what the map shows. */
  label: string;
  /** Map-space canvas size. Generous on purpose: the viewport pans and zooms, so nothing needs to squish. */
  width: number;
  height: number;
  nodes: MapNode[];
  edges: MapEdge[];
}
