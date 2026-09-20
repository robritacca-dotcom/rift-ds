/**
 * One cell of an architecture map: a node card (icon or logo chip, title,
 * sub) or a zone container, absolutely positioned in map space. Pure and
 * presentational — everything it shows comes from the MapNode data, so the
 * same component can draw any map, and could graduate into the library
 * with its types unchanged.
 */

import Image from "next/image";
import type { MapNode as MapNodeData } from "./types";
import styles from "./MapNode.module.css";

export function MapNode({ node }: { node: MapNodeData }) {
  const kind = node.kind ?? "core";
  if (kind === "zone") {
    return (
      <div
        className={styles.zone}
        style={{ left: node.x, top: node.y, width: node.w, height: node.h }}
      >
        <span className={styles.zoneTitle}>{node.title}</span>
        {node.sub ? <span className={styles.zoneSub}>{node.sub}</span> : null}
      </div>
    );
  }
  const chipRole = node.chip ?? "neutral";
  return (
    <div
      className={`${styles.node} ${styles[`node-${kind}`]}`}
      style={{ left: node.x, top: node.y, width: node.w, height: node.h }}
    >
      {node.logo ? (
        <span className={`${styles.chip} ${styles.chipLogo}`} aria-hidden="true">
          <Image
            src={node.logo}
            alt=""
            width={22}
            height={22}
            className={node.logoDark ? styles.logoLight : undefined}
          />
          {node.logoDark ? (
            <Image src={node.logoDark} alt="" width={22} height={22} className={styles.logoDark} />
          ) : null}
        </span>
      ) : node.icon ? (
        <span className={`${styles.chip} ${styles[`chip-${chipRole}`]}`} aria-hidden="true">
          <span className={`material-symbols-rounded ${styles.chipIcon}`}>{node.icon}</span>
        </span>
      ) : null}
      <span className={styles.nodeText}>
        <span className={styles.nodeTitle}>{node.title}</span>
        {node.sub ? <span className={styles.nodeSub}>{node.sub}</span> : null}
      </span>
    </div>
  );
}
