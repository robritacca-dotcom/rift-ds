import { HiddenBackground } from "@/components/BlurBackground/BlurBackground";
import DotBackground from "@/components/DotBackground/DotBackground";
import StageToolbar from "@/components/StageToolbar/StageToolbar";
import SystemGraph from "@/components/SystemGraph/SystemGraph";
import styles from "./page.module.css";

// The dependency graph instrument: the whole system as one traceable graph,
// on the dotted working canvas the immersive surfaces share, under the same
// slim StageToolbar (breadcrumb trail, X out) as the canvas and the expanded
// architecture maps. The data is generated from the source at build time
// (see website/src/data/dependency-graph.ts).
export default function GraphPage() {
  return (
    <main className={styles.page}>
      {/* The stage has no visible title; this names the page for screen
          readers and search. */}
      <h1 className={styles.visuallyHidden}>System graph</h1>
      <HiddenBackground />
      <DotBackground />
      <StageToolbar />
      <SystemGraph />
    </main>
  );
}
