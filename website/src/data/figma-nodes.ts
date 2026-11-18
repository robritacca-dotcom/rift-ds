import { FIGMA_FILE_URL, FIGMA_URL } from "@/config/brand.generated";
import data from "./figma-nodes.json";

/**
 * Where a docs page lives in the Rift DS Figma kit. figma-nodes.json is the
 * one home of the map: a component slug, or a page route, to the node id of
 * the frame that documents it. scripts/validate-figma-nodes.mjs reports
 * gaps against the registries as advice and never fails a build, so the map
 * may lag the code. A route with no entry (a component not drawn yet, an
 * overview, a section landing) or with an entry that is not a node id links
 * the kit's Figma community page instead: only a page with a frame of its
 * own deep-links into the design file.
 */
const COMPONENT_NODES: Record<string, string> = data.components ?? {};
const PAGE_NODES: Record<string, string> = data.pages ?? {};
const NODE_ID = /^\d+-\d+$/;

/** The deep link into the Figma file for a node id ("88-96"). */
export function figmaNodeUrl(nodeId: string): string {
  return `${FIGMA_FILE_URL}?node-id=${nodeId}`;
}

/** The Figma link for a site route: its frame in the design file, or the community page when it has none. */
export function figmaUrlForPath(pathname: string | null | undefined): string {
  if (!pathname) return FIGMA_URL;
  const path = pathname.replace(/\/$/, "") || "/";
  const slug = path.match(/^\/components\/([a-z0-9-]+)$/)?.[1];
  const nodeId = (slug && COMPONENT_NODES[slug]) || PAGE_NODES[path];
  return nodeId && NODE_ID.test(nodeId) ? figmaNodeUrl(nodeId) : FIGMA_URL;
}
