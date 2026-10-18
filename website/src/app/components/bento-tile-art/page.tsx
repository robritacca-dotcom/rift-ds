import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { BentoTileArt } from "rift-ds/components/BentoTile/BentoTileArt";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import styles from "./page.module.css";

const PATTERNS = ["dots", "lines", "rings", "grid", "waves", "rays"] as const;

/* ============================================
   PAGE
   ============================================ */

export default function BentoTileArtPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Bento tile art</h1>
            <PageLinks storybookPath="/?path=/docs/components-bentotileart--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>The texture half of a shader pair</p>
            <p className={styles.introBody}>
              Six fine line patterns in one vocabulary, each easing in around the bottom-left corner and drifting
              slowly. A bento tile with a shader background lays one over its wash; on its own it textures any
              positioned surface.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Patterns" />
            <div className={styles.grid3}>
              {PATTERNS.map((pattern) => (
                <div key={pattern} className={styles.surface}>
                  <BentoTileArt pattern={pattern} />
                  <span className={styles.label}>{pattern}</span>
                </div>
              ))}
            </div>
          </section>

          <ComponentInstallStrip slug="bento-tile-art" />
        </main>
      </div>
    </>
  );
}
