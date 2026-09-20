"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import {
  Globe,
  type GlobeArc,
  type GlobePoint,
} from "@robr0/design-system/components/Globe/Globe";
import { MapCallout } from "@robr0/design-system/components/MapCallout/MapCallout";
import { MapLegend } from "@robr0/design-system/components/MapLegend/MapLegend";
import { Kbd } from "@robr0/design-system/components/Kbd/Kbd";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const points: GlobePoint[] = [
  { id: "santiago", lat: -33.45, lng: -70.66, label: "SCL", kind: "point" },
  { id: "toronto", lat: 43.65, lng: -79.38, label: "YYZ", kind: "anchor" },
  { id: "london", lat: 51.5, lng: -0.12, label: "LDN", kind: "point" },
  { id: "lagos", lat: 6.52, lng: 3.37, label: "LOS", kind: "point" },
  { id: "singapore", lat: 1.35, lng: 103.82, label: "SIN", kind: "anchor" },
  { id: "sydney", lat: -33.86, lng: 151.2, label: "SYD", kind: "point" },
  { id: "reykjavik", lat: 64.14, lng: -21.94, label: "RKV", kind: "point" },
];

const arcs: GlobeArc[] = [
  { from: "santiago", to: "toronto" },
  { from: "santiago", to: "london", altitude: 0.35 },
  { from: "toronto", to: "reykjavik" },
  { from: "london", to: "lagos" },
  { from: "london", to: "singapore", altitude: 0.3 },
  { from: "singapore", to: "sydney" },
  { from: "lagos", to: "santiago", altitude: 0.4 },
];

export default function GlobePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Globe</h1>
            <PageLinks storybookPath="/?path=/docs/components-globe--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The geometry of a network, on a sphere
            </p>
            <p className={styles.introBody}>
              An orthographic globe drawn in SVG: a graticule for the shape,
              markers at latitude and longitude, great-circle arcs between
              them. No map library, no tile server, no land data. Drag it,
              steer it with the arrow keys, or let it turn slowly on its own.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="A map surface" />
            <p className={styles.sectionBody}>
              The full pattern: Globe in the middle, MapLegend in a corner,
              MapCallout beside the active point, Kbd hinting at the keys.
              Hover a marker to raise its callout.
            </p>
            <div className={styles.mapSurface}>
              <Globe
                points={points}
                arcs={arcs}
                defaultRotation={[-60, -5]}
                label="Listening points and the routes between them"
                renderCallout={(point) => (
                  <MapCallout
                    title={point.label ?? point.id}
                    lines={[
                      "Cobalt",
                      `${point.lat.toFixed(2)} / ${point.lng.toFixed(2)}`,
                    ]}
                  />
                )}
                className={styles.mapGlobe}
              />
              <div className={styles.mapLegendSlot}>
                <MapLegend
                  title="Meridian"
                  description="Where the signal was last seen."
                  items={[
                    { glyph: "point", label: "Listening point" },
                    { glyph: "anchor", label: "Fixed witness" },
                    { glyph: "arc", label: "Signal route" },
                  ]}
                />
              </div>
              <div className={styles.mapKeys} aria-hidden="true">
                <Kbd size="compact">W</Kbd>
                <Kbd size="compact">A</Kbd>
                <Kbd size="compact">S</Kbd>
                <Kbd size="compact">D</Kbd>
              </div>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Arcs" />
            <p className={styles.sectionBody}>
              Arcs lift off the surface by their <code>altitude</code> and
              draw with a cobalt-to-violet gradient from the chart series. A
              per-arc <code>color</code> swaps the gradient for a flat stroke,
              for routes that belong to one series.
            </p>
            <div className={styles.exampleRow}>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Gradient</span>
                <Globe
                  points={points}
                  arcs={arcs}
                  autoRotate={0}
                  interactive={false}
                  showLabels={false}
                  label="Routes with the default gradient"
                  className={styles.smallGlobe}
                />
              </div>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Flat colour</span>
                <Globe
                  points={points}
                  arcs={arcs.map((arc) => ({
                    ...arc,
                    color: "var(--color-chart-series-2)",
                  }))}
                  autoRotate={0}
                  interactive={false}
                  showLabels={false}
                  label="Routes in a single series colour"
                  className={styles.smallGlobe}
                />
              </div>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Markers" />
            <p className={styles.sectionBody}>
              Two kinds, one difference: <code>point</code> is a cross, for
              something that listens or moves; <code>anchor</code> is a
              square, for something fixed. Each can carry its own{" "}
              <code>color</code> (a chart series or status token), the same
              per-point channel WorldMap uses, so one dataset keys
              identically on both projections. Points on the far side dim
              rather than disappear, so the network keeps its size while it
              turns.
            </p>
            <div className={styles.exampleRow}>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Points only</span>
                <Globe
                  points={points}
                  autoRotate={0}
                  interactive={false}
                  graticuleStep={15}
                  label="Marked places with a finer graticule"
                  className={styles.smallGlobe}
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
