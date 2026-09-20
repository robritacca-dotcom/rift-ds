"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { MapCallout } from "@robr0/design-system/components/MapCallout/MapCallout";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function MapCalloutPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Map callout</h1>
            <PageLinks storybookPath="/?path=/docs/components-mapcallout--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The label a point on a map deserves
            </p>
            <p className={styles.introBody}>
              A place&apos;s name in capitals, then its readouts underneath in the
              code face, tabular, so a coordinate and a reading line up digit
              for digit. Pure markup with no client JavaScript. Its intended
              home is <code>renderCallout</code> on Globe or WorldMap, where
              it annotates the active point.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Anatomy" />
            <div className={styles.exampleRow}>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Full</span>
                <MapCallout
                  title="Santiago, CL"
                  lines={["Cobalt", "17.73 / 64 arcs", "Cinder Loop"]}
                />
              </div>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Title only</span>
                <MapCallout title="Reykjavik, IS" />
              </div>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Alignment" />
            <p className={styles.sectionBody}>
              A callout sitting left of its marker ranges <code>end</code> so
              the text hangs off the point; one sitting right ranges{" "}
              <code>start</code>. Globe and WorldMap both report which side
              the overlay chose through <code>data-side</code>.
            </p>
            <div className={styles.alignmentDemo}>
              <MapCallout
                title="Santiago, CL"
                lines={["-33.45 / -70.66"]}
                align="end"
              />
              <span className={styles.alignmentMarker} aria-hidden="true" />
              <MapCallout title="Sydney, AU" lines={["-33.86 / 151.20"]} />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
