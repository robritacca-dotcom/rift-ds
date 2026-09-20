"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import {
  WorldMap,
  type WorldMapPoint,
} from "@robr0/design-system/components/WorldMap/WorldMap";
import { MapCallout } from "@robr0/design-system/components/MapCallout/MapCallout";
import { MapLegend } from "@robr0/design-system/components/MapLegend/MapLegend";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const SERIES = [
  "var(--color-chart-series-1)",
  "var(--color-chart-series-2)",
  "var(--color-chart-series-3)",
];

const points: WorldMapPoint[] = [
  { id: "toronto", lat: 43.65, lng: -79.38, label: "Toronto", kind: "anchor" },
  { id: "london", lat: 51.5, lng: -0.12, label: "London", kind: "anchor" },
  { id: "reykjavik", lat: 64.15, lng: -21.94, label: "Reykjavík", color: SERIES[0] },
  { id: "oslo", lat: 59.91, lng: 10.75, label: "Oslo", color: SERIES[0] },
  { id: "lisbon", lat: 38.72, lng: -9.14, label: "Lisbon", color: SERIES[0] },
  { id: "amsterdam", lat: 52.37, lng: 4.9, label: "Amsterdam", color: SERIES[1] },
  { id: "milan", lat: 45.46, lng: 9.19, label: "Milan", color: SERIES[1] },
  { id: "berlin", lat: 52.52, lng: 13.4, label: "Berlin", color: SERIES[2] },
  { id: "athens", lat: 37.98, lng: 23.73, label: "Athens", color: SERIES[2] },
];

const worldPoints: WorldMapPoint[] = [
  ...points,
  { id: "santiago", lat: -33.45, lng: -70.66, label: "Santiago", color: SERIES[0] },
  { id: "nairobi", lat: -1.29, lng: 36.82, label: "Nairobi", color: SERIES[0] },
  { id: "singapore", lat: 1.35, lng: 103.82, label: "Singapore", kind: "anchor" },
  { id: "tokyo", lat: 35.68, lng: 139.69, label: "Tokyo", color: SERIES[2] },
  { id: "sydney", lat: -33.87, lng: 151.21, label: "Sydney", color: SERIES[1] },
];

export default function WorldMapPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>World map</h1>
            <PageLinks storybookPath="/?path=/docs/components-worldmap--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The geography, flat and at a glance
            </p>
            <p className={styles.introBody}>
              The companion to Globe for when the map should read without
              turning: real land shapes from Natural Earth, baked into the
              package as one SVG path and coloured entirely by the tokens.
              Still no map library and no tile server: frame a window with
              bounds, plot markers by latitude and longitude, and give each
              one its own colour.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="A map surface" />
            <p className={styles.sectionBody}>
              The full pattern: the map covering the stage, MapLegend in a
              corner, MapCallout beside the active marker, and the zoom pill
              floating at the bottom centre, where every diagram on this
              site keeps it. Hover or focus a marker to raise its callout
              (every marker is a real button), drag the map anywhere on the
              world at any zoom, and hold ctrl or ⌘ with the scroll wheel (a
              trackpad pinch) to zoom at the pointer. On a touchscreen a
              finger only pans once zoomed in, so the page keeps its scroll.
            </p>
            <div className={styles.mapSurface}>
              {/* The map fills its container — the wrapper owns the height,
                  never a class on the component root (its own fill rule
                  would tie with it at equal specificity). */}
              <div className={styles.mapStage}>
                <WorldMap
                  points={points}
                  bounds={[-30, 35, 32, 66]}
                  fit="cover"
                  showZoomControls
                  label="Sites across Europe"
                  renderCallout={(point) => (
                    <MapCallout
                      title={point.label ?? point.id}
                      lines={[
                        point.kind === "anchor" ? "Hub" : "Site",
                        `${point.lat.toFixed(2)} / ${point.lng.toFixed(2)}`,
                      ]}
                    />
                  )}
                />
              </div>
              <div className={styles.mapLegendSlot}>
                <MapLegend
                  title="Meridian"
                  description="Where the network touches ground."
                  items={[
                    { glyph: <span className={styles.legendSquare} />, label: "Hub" },
                    { glyph: <span className={styles.legendDot} />, label: "Site" },
                  ]}
                />
              </div>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Framing" />
            <p className={styles.sectionBody}>
              <code>bounds</code> is a window in degrees (west, south, east,
              north) and becomes the drawing&apos;s viewBox directly.
              <code>fit</code> decides how the window meets the container:
              <code>contain</code> letterboxes the whole window in,
              <code>cover</code> fills the box and crops the edges.
            </p>
            <div className={styles.exampleRow}>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>The whole world</span>
                <div className={styles.worldFrame}>
                  <WorldMap
                    points={worldPoints}
                    interactive={false}
                    label="Sites worldwide"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Markers" />
            <p className={styles.sectionBody}>
              Two kinds, the family&apos;s vocabulary: a filled dot for
              something plotted, an outlined square for something fixed. Each
              point can carry its own <code>color</code> (typically a chart
              series token), the channel for colour-coding a category; Globe
              carries the same <code>color</code> on its points, so one
              dataset keys identically on both projections.
              <code>showLabels</code> names the markers in the code face.
            </p>
            <div className={styles.exampleRow}>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Labelled, by series</span>
                <div className={styles.regionFrame}>
                  <WorldMap
                    points={points}
                    bounds={[-32, 34, 36, 68]}
                    showLabels
                    interactive={false}
                    graticuleStep={0}
                    label="Labelled sites by series"
                  />
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
