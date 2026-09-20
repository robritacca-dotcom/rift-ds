"use client";

import styles from "../page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import {
  Globe,
  type GlobeArc,
  type GlobePoint,
} from "@robr0/design-system/components/Globe/Globe";
import { MapCallout } from "@robr0/design-system/components/MapCallout/MapCallout";
import { MapLegend } from "@robr0/design-system/components/MapLegend/MapLegend";

const POINTS: GlobePoint[] = [
  { id: "vancouver", lat: 49.28, lng: -123.12, label: "YVR", kind: "anchor" },
  { id: "mexico-city", lat: 19.43, lng: -99.13, label: "MEX", kind: "point" },
  { id: "sao-paulo", lat: -23.55, lng: -46.63, label: "GRU", kind: "point" },
  { id: "zurich", lat: 47.37, lng: 8.54, label: "ZRH", kind: "anchor" },
  { id: "nairobi", lat: -1.29, lng: 36.82, label: "NBO", kind: "point" },
  { id: "tokyo", lat: 35.68, lng: 139.69, label: "HND", kind: "point" },
  { id: "auckland", lat: -36.85, lng: 174.76, label: "AKL", kind: "point" },
];

const ARCS: GlobeArc[] = [
  { from: "vancouver", to: "tokyo" },
  { from: "vancouver", to: "mexico-city" },
  { from: "mexico-city", to: "sao-paulo" },
  { from: "sao-paulo", to: "zurich", altitude: 0.35 },
  { from: "zurich", to: "nairobi" },
  { from: "nairobi", to: "tokyo", altitude: 0.3 },
  { from: "tokyo", to: "auckland" },
];

/* Unlike the charts, the globe needs no brand prop: every stroke in it is
   a CSS token (graticule on the divider colour, arcs on the chart ramp,
   focus ring on the action colour), so the browser re-resolves them the
   moment the levers write new overrides. */
export default function MapsSection() {
  return (
    <section className={styles.demoSection} aria-label="Maps">
      <SectionTitle title="Maps" />
      <p className={styles.sectionNote}>
        Every stroke of the sphere is a token, so presets and the colour
        ramps re-draw it live. Drag it, steer it with the arrow keys, or
        hover a marker for its callout.
      </p>

      <div className={styles.mapsColumns}>
        <Globe
          points={POINTS}
          arcs={ARCS}
          defaultRotation={[-100, -20]}
          label="Relay points and the routes between them"
          renderCallout={(point) => (
            <MapCallout
              title={point.label ?? point.id}
              lines={[
                point.kind === "anchor" ? "Hub" : "Relay",
                `${point.lat.toFixed(2)} / ${point.lng.toFixed(2)}`,
              ]}
            />
          )}
        />
        <MapLegend
          title="Relay network"
          description="Seven points and the routes between them."
          items={[
            { glyph: "anchor", label: "Hub" },
            { glyph: "point", label: "Relay" },
            { glyph: "arc", label: "Route" },
          ]}
        />
      </div>
    </section>
  );
}
