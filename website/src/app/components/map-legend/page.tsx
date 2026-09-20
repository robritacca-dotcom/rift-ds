"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { MapLegend } from "@robr0/design-system/components/MapLegend/MapLegend";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function MapLegendPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Map legend</h1>
            <PageLinks storybookPath="/?path=/docs/components-maplegend--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The corner block that explains the map
            </p>
            <p className={styles.introBody}>
              A name, a line on what the map shows, and the key to its
              markers. The built-in glyphs are drawn on the same geometry
              Globe draws its markers with; WorldMap&apos;s dot and outlined
              square are its own, so a flat-map key passes its glyphs as
              nodes. Pure markup, no client JavaScript, and the key itself
              is a definition list.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Full block" />
            <div className={styles.exampleRow}>
              <MapLegend
                title="Meridian"
                description="A listening surface for machines agreeing on where the signal was last seen."
                items={[
                  { glyph: "point", label: "Listening point" },
                  { glyph: "anchor", label: "Fixed witness" },
                  { glyph: "arc", label: "Signal route" },
                ]}
              />
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Key only" />
            <p className={styles.sectionBody}>
              Title and description are optional, so the key can sit alone
              beside a chart or a smaller map.
            </p>
            <div className={styles.exampleRow}>
              <MapLegend
                items={[
                  { glyph: "point", label: "Listening point" },
                  { glyph: "anchor", label: "Fixed witness" },
                ]}
              />
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Flat colours" />
            <p className={styles.sectionBody}>
              The <code>line</code> glyph takes a series colour for coverage
              and boundary keys, and a <code>color</code> on <code>arc</code>{" "}
              replaces its gradient. Any React node renders as given, for
              custom swatches.
            </p>
            <div className={styles.exampleRow}>
              <MapLegend
                title="Coverage"
                description="Regions by reporting network."
                items={[
                  {
                    glyph: "line",
                    label: "Primary network",
                    color: "var(--color-chart-series-1)",
                  },
                  {
                    glyph: "line",
                    label: "Partner network",
                    color: "var(--color-chart-series-3)",
                  },
                  {
                    glyph: "arc",
                    label: "Relay route",
                    color: "var(--color-chart-series-4)",
                  },
                ]}
              />
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
