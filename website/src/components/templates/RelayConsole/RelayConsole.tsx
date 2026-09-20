"use client";

/**
 * The relay console template: the network screen for Meridian, a fictional
 * relay network, built from the design system alone. The shell is the
 * marketing dashboard's (floating AppSidebar, slim top bar, docked mock
 * assistant); the page is one instrument with two projections of the same
 * network, flipped by the SegmentedControl floating on the stage's top-left:
 * the Globe for the geometry (stations, relays, and the links between them)
 * and the flat WorldMap for status at a glance (stations coloured through
 * the status roles, covering the stage full-bleed with the library's
 * HoverCard carrying each marker's readings and the zoom pill for moving
 * around). The stage carries its own toolbar along its top edge: the flip
 * on the left, and three matching default-size selects on the right (the
 * stage-toolbar carve-out in design.md's Template screens rule 2) — the
 * region steer drives both projections, the globe's rotation and the map's
 * framing, and the status and marker filters thin both at once, with the
 * headline numbers deriving from the filtered set so the figures and the
 * markers can never disagree. The stage's other furniture
 * rides its bottom corners — the name, key, and per-view legend on the
 * left, the numbers and the steering hint on the right — and the content
 * column runs the full viewport width, because a map earns it (the
 * convergence that retired the standalone portfolio-map template). Every
 * colour, radius, space, and type style is a semantic token; every control
 * is a library component.
 *
 * All data is fictional, so the route is excluded from the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs). The assistant is the shared
 * TemplateAssistant mock, answering over this page's own numbers.
 */

import React from "react";
import { AiButton } from "@robr0/design-system/components/AiButton/AiButton";
import {
  AppSidebar,
  type AppSidebarSection,
} from "@robr0/design-system/components/AppSidebar/AppSidebar";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import {
  Dropdown,
  type DropdownOption,
} from "@robr0/design-system/components/Dropdown/Dropdown";
import {
  Globe,
  type GlobeArc,
  type GlobePoint,
  type GlobeRotation,
} from "@robr0/design-system/components/Globe/Globe";
import { Input } from "@robr0/design-system/components/Input/Input";
import { Kbd } from "@robr0/design-system/components/Kbd/Kbd";
import { MapCallout } from "@robr0/design-system/components/MapCallout/MapCallout";
import { MapLegend } from "@robr0/design-system/components/MapLegend/MapLegend";
import { SegmentedControl } from "@robr0/design-system/components/SegmentedControl/SegmentedControl";
import {
  WorldMap,
  type WorldMapBounds,
  type WorldMapPoint,
} from "@robr0/design-system/components/WorldMap/WorldMap";
import ThemeToggle from "../../ThemeToggle/ThemeToggle";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import styles from "./RelayConsole.module.css";

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    items: [
      { key: "network", icon: "public", label: "Network" },
      { key: "stations", icon: "cell_tower", label: "Stations" },
      { key: "traffic", icon: "monitoring", label: "Traffic" },
      { key: "alerts", icon: "notifications", label: "Alerts", badge: 2 },
      { key: "reports", icon: "description", label: "Reports" },
    ],
  },
  {
    items: [
      { key: "support", icon: "headset_mic", label: "Support" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

type StationStatus = "operational" | "degraded" | "maintenance";

type Station = {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  status: StationStatus;
  latencyMs: number;
  throughput: number;
};

const STATIONS: Station[] = [
  { id: "yyz", name: "Toronto", code: "YYZ-1", lat: 43.65, lng: -79.38, status: "operational", latencyMs: 71, throughput: 6.8 },
  { id: "sea", name: "Seattle", code: "SEA-2", lat: 47.61, lng: -122.33, status: "operational", latencyMs: 64, throughput: 5.9 },
  { id: "gru", name: "São Paulo", code: "GRU-1", lat: -23.55, lng: -46.63, status: "maintenance", latencyMs: 118, throughput: 0.9 },
  { id: "kef", name: "Reykjavík", code: "KEF-1", lat: 64.15, lng: -21.94, status: "operational", latencyMs: 59, throughput: 7.4 },
  { id: "fra", name: "Frankfurt", code: "FRA-3", lat: 50.11, lng: 8.68, status: "operational", latencyMs: 61, throughput: 8.2 },
  { id: "sin", name: "Singapore", code: "SIN-1", lat: 1.35, lng: 103.82, status: "degraded", latencyMs: 143, throughput: 9.6 },
  { id: "syd", name: "Sydney", code: "SYD-1", lat: -33.87, lng: 151.21, status: "operational", latencyMs: 88, throughput: 4.4 },
  { id: "lax", name: "Los Angeles", code: "LAX-1", lat: 34.05, lng: -118.24, status: "operational", latencyMs: 66, throughput: 7.1 },
  { id: "mex", name: "Mexico City", code: "MEX-2", lat: 19.43, lng: -99.13, status: "operational", latencyMs: 79, throughput: 4.9 },
  { id: "scl", name: "Santiago", code: "SCL-1", lat: -33.45, lng: -70.66, status: "operational", latencyMs: 96, throughput: 3.8 },
  { id: "bog", name: "Bogotá", code: "BOG-1", lat: 4.71, lng: -74.07, status: "maintenance", latencyMs: 121, throughput: 0.7 },
  { id: "lis", name: "Lisbon", code: "LIS-2", lat: 38.72, lng: -9.14, status: "operational", latencyMs: 63, throughput: 5.2 },
  { id: "lon", name: "London", code: "LON-4", lat: 51.5, lng: -0.12, status: "operational", latencyMs: 58, throughput: 8.9 },
  { id: "sto", name: "Stockholm", code: "STO-2", lat: 59.33, lng: 18.07, status: "operational", latencyMs: 62, throughput: 6.3 },
  { id: "ath", name: "Athens", code: "ATH-1", lat: 37.98, lng: 23.73, status: "degraded", latencyMs: 131, throughput: 2.4 },
  { id: "cai", name: "Cairo", code: "CAI-1", lat: 30.04, lng: 31.24, status: "operational", latencyMs: 92, throughput: 3.5 },
  { id: "lag", name: "Lagos", code: "LOS-1", lat: 6.52, lng: 3.37, status: "operational", latencyMs: 98, throughput: 4.1 },
  { id: "nbo", name: "Nairobi", code: "NBO-2", lat: -1.29, lng: 36.82, status: "operational", latencyMs: 104, throughput: 2.9 },
  { id: "cpt", name: "Cape Town", code: "CPT-1", lat: -33.92, lng: 18.42, status: "operational", latencyMs: 109, throughput: 2.6 },
  { id: "dxb", name: "Dubai", code: "DXB-3", lat: 25.2, lng: 55.27, status: "operational", latencyMs: 84, throughput: 7.6 },
  { id: "bom", name: "Mumbai", code: "BOM-2", lat: 19.08, lng: 72.88, status: "degraded", latencyMs: 137, throughput: 5.4 },
  { id: "hkg", name: "Hong Kong", code: "HKG-1", lat: 22.32, lng: 114.17, status: "operational", latencyMs: 81, throughput: 8.4 },
  { id: "tyo", name: "Tokyo", code: "TYO-2", lat: 35.68, lng: 139.69, status: "operational", latencyMs: 76, throughput: 7.9 },
  { id: "akl", name: "Auckland", code: "AKL-1", lat: -36.85, lng: 174.76, status: "operational", latencyMs: 101, throughput: 3.2 },
];

type Relay = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  route: string;
  loadPct: number;
  handoff: string;
};

const RELAYS: Relay[] = [
  { id: "k7", name: "Relay K-7", lat: 45, lng: -35, route: "YYZ-1 to KEF-1", loadPct: 58, handoff: "Handoff to KEF-1 in 22 min" },
  { id: "k9", name: "Relay K-9", lat: 38, lng: -165, route: "SEA-2 to SYD-1", loadPct: 41, handoff: "Handoff to SYD-1 in 54 min" },
  { id: "k4", name: "Relay K-4", lat: -8, lng: 78, route: "FRA-3 to SIN-1", loadPct: 83, handoff: "Handoff to SIN-1 in 9 min" },
  { id: "k2", name: "Relay K-2", lat: 15, lng: -40, route: "LIS-2 to SCL-1", loadPct: 47, handoff: "Handoff to SCL-1 in 38 min" },
  { id: "k5", name: "Relay K-5", lat: -25, lng: 68, route: "CPT-1 to BOM-2", loadPct: 61, handoff: "Handoff to BOM-2 in 17 min" },
  { id: "k11", name: "Relay K-11", lat: 8, lng: 140, route: "HKG-1 to AKL-1", loadPct: 36, handoff: "Handoff to AKL-1 in 41 min" },
];

/* Links feeding a degraded station carry the warning colour; the backbone
   keeps the default gradient. GRU-1 and BOG-1 have no links while drained,
   which is the point: the missing lines are the maintenance story. */
const DEGRADED_LINK = "var(--color-status-warning-border)";
const ARCS: GlobeArc[] = [
  { from: "yyz", to: "k7", altitude: 0.18 },
  { from: "k7", to: "kef", altitude: 0.18 },
  { from: "kef", to: "fra", altitude: 0.1 },
  { from: "sea", to: "yyz", altitude: 0.12 },
  { from: "sea", to: "k9", altitude: 0.22 },
  { from: "k9", to: "syd", altitude: 0.22 },
  { from: "fra", to: "k4", altitude: 0.2 },
  { from: "k4", to: "sin", altitude: 0.14, color: DEGRADED_LINK },
  { from: "sin", to: "syd", altitude: 0.16, color: DEGRADED_LINK },
  { from: "sea", to: "lax", altitude: 0.08 },
  { from: "lax", to: "mex", altitude: 0.08 },
  { from: "mex", to: "scl", altitude: 0.16 },
  { from: "lis", to: "k2", altitude: 0.2 },
  { from: "k2", to: "scl", altitude: 0.2 },
  { from: "lon", to: "kef", altitude: 0.1 },
  { from: "lon", to: "fra", altitude: 0.06 },
  { from: "lis", to: "lon", altitude: 0.08 },
  { from: "fra", to: "sto", altitude: 0.08 },
  { from: "fra", to: "ath", altitude: 0.1, color: DEGRADED_LINK },
  { from: "cai", to: "dxb", altitude: 0.1 },
  { from: "lag", to: "lis", altitude: 0.14 },
  { from: "nbo", to: "cai", altitude: 0.1 },
  { from: "cpt", to: "k5", altitude: 0.18 },
  { from: "k5", to: "bom", altitude: 0.18, color: DEGRADED_LINK },
  { from: "hkg", to: "sin", altitude: 0.08 },
  { from: "hkg", to: "tyo", altitude: 0.1 },
  { from: "tyo", to: "sea", altitude: 0.22 },
  { from: "hkg", to: "k11", altitude: 0.16 },
  { from: "k11", to: "akl", altitude: 0.16 },
  { from: "syd", to: "akl", altitude: 0.08 },
];

const STATUS_LABEL: Record<StationStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  maintenance: "Maintenance",
};

/* On the flat map, station status is the colour channel — the status roles
   doing their day job, where the globe puts the warning on its links. */
const STATUS_COLOR: Record<StationStatus, string> = {
  operational: "var(--color-status-positive-border)",
  degraded: "var(--color-status-warning-border)",
  maintenance: "var(--color-status-neutral-border)",
};

/* The region steer drives both projections: the globe turns to `rotation`,
   the map reframes to `bounds` — the roadmap planner's window-select
   convention applied to a camera. Every frame covers the stage edge to
   edge (no letterbox bands: the map holds the full height), and whatever
   the crop hides is a grab away, since panning roams the whole world. */
const REGIONS: {
  value: string;
  label: string;
  rotation: GlobeRotation;
  bounds: WorldMapBounds;
}[] = [
  { value: "global", label: "Global view", rotation: [-30, 25], bounds: [-180, -56, 180, 78] },
  { value: "americas", label: "Americas", rotation: [-90, 15], bounds: [-135, -56, -30, 62] },
  { value: "emea", label: "Europe & Africa", rotation: [15, 15], bounds: [-27, -38, 56, 66] },
  { value: "apac", label: "Asia-Pacific", rotation: [120, 5], bounds: [60, -48, 179, 62] },
];

const REGION_OPTIONS: DropdownOption[] = REGIONS.map(({ value, label }) => ({
  value,
  label,
  icon: value === "global" ? "public" : "travel_explore",
}));

const STATUS_ICON: Record<StationStatus, string> = {
  operational: "check_circle",
  degraded: "warning",
  maintenance: "build",
};

const STATUS_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All statuses", icon: "filter_alt" },
  ...(Object.keys(STATUS_LABEL) as StationStatus[]).map((s) => ({
    value: s,
    label: STATUS_LABEL[s],
    icon: STATUS_ICON[s],
  })),
];

const KIND_OPTIONS: DropdownOption[] = [
  { value: "all", label: "Stations & relays", icon: "hub" },
  { value: "stations", label: "Stations only", icon: "cell_tower" },
  { value: "relays", label: "Relays only", icon: "satellite_alt" },
];

const CHAT_SUGGESTIONS = [
  { id: "sin", label: "Why is Singapore degraded?" },
  { id: "health", label: "Summarise network health" },
  { id: "relay", label: "What does a relay do?" },
];

const CHAT_REPLIES: Record<string, string> = {
  sin: "SIN-1 is running at 91% capacity, and its latency is up 38 ms since the 09:12 queue-depth alert. The console has already rerouted 18% of its traffic to SYD-1; if the queue keeps growing, the next step is draining the K-4 link.",
  health: "Twenty-two of twenty-four stations are online: nineteen operational, and three degraded, with SIN-1 at 91% capacity and ATH-1 and BOM-2 on reduced service. GRU-1 and BOG-1 are drained for maintenance. The thirty active links carry 128.1 Gb/s at a median latency of 88 ms, and thirty-day uptime holds at 99.982%.",
  relay: "A relay is the moving half of the network: the six relays in transit carry traffic between ground stations across ocean segments no cable serves. Each one carries its current route and the next handoff in its callout, drawn as a cross on the globe and a dot on the map.",
};

const CHAT_FALLBACK =
  "This assistant is a mock, so only the suggested questions have real answers. In the live product this reply would come from the network telemetry behind the globe.";

/* ------------------------------------------------------------- helpers */

/** Formats a coordinate pair the way MapCallout's readout expects. */
function coordinates(lat: number, lng: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}° ${ns} · ${Math.abs(lng).toFixed(2)}° ${ew}`;
}

/* ---------------------------------------------------------------- page */

export default function RelayConsole() {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [hoverId, setHoverId] = React.useState<string | null>(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [view, setView] = React.useState("globe");
  const [region, setRegion] = React.useState(REGIONS[0].value);
  const [rotation, setRotation] = React.useState<GlobeRotation>(
    REGIONS[0].rotation,
  );
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [kindFilter, setKindFilter] = React.useState("all");

  const activeRegion = REGIONS.find((r) => r.value === region) ?? REGIONS[0];

  const steerToRegion = (value: string) => {
    setRegion(value);
    const target = REGIONS.find((r) => r.value === value);
    if (target) setRotation(target.rotation);
  };

  /* The filters thin both projections at once; an arc whose endpoint is
     filtered out disappears with it (both drawings skip unknown ids). */
  const visibleStations = STATIONS.filter(
    (s) =>
      kindFilter !== "relays" &&
      (statusFilter === "all" || s.status === statusFilter),
  );
  const visibleRelays = kindFilter === "stations" ? [] : RELAYS;

  const points: GlobePoint[] = [
    ...visibleStations.map((s) => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      label: s.code,
      kind: "anchor" as const,
      color: STATUS_COLOR[s.status],
    })),
    ...visibleRelays.map((r) => ({
      id: r.id,
      lat: r.lat,
      lng: r.lng,
      label: r.name.replace("Relay ", ""),
      kind: "point" as const,
    })),
  ];

  const mapPoints: WorldMapPoint[] = [
    ...visibleStations.map((s) => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      label: s.code,
      kind: "anchor" as const,
      color: STATUS_COLOR[s.status],
    })),
    ...visibleRelays.map((r) => ({
      id: r.id,
      lat: r.lat,
      lng: r.lng,
      label: r.name,
    })),
  ];

  /* The console's headline numbers, derived from the filtered set so the
     figures and the markers can never disagree. */
  const visibleIds = new Set(points.map((p) => p.id));
  const activeLinks = ARCS.filter(
    (a) => visibleIds.has(a.from) && visibleIds.has(a.to),
  ).length;
  const onlineCount = visibleStations.filter(
    (s) => s.status !== "maintenance",
  ).length;
  const sortedLatencies = visibleStations
    .map((s) => s.latencyMs)
    .sort((a, b) => a - b);
  const medianLatency =
    sortedLatencies.length > 0
      ? sortedLatencies[Math.floor(sortedLatencies.length / 2)]
      : null;
  const totalThroughput = visibleStations.reduce(
    (sum, s) => sum + s.throughput,
    0,
  );

  const metrics = [
    { label: "Stations online", value: `${onlineCount} of ${visibleStations.length}` },
    { label: "Active links", value: `${activeLinks}` },
    { label: "Median latency", value: medianLatency === null ? "—" : `${medianLatency} ms` },
    { label: "Throughput", value: `${totalThroughput.toFixed(1)} Gb/s` },
  ];

  /* Clicking a globe marker pins its callout; clicking it again lets it go.
     The globe drifts on its own until something is pinned; a filter that
     removes the pinned marker clears the pin with it. */
  const handlePointClick = (point: GlobePoint) => {
    setSelectedId((current) => (current === point.id ? null : point.id));
  };

  const activeCandidate = hoverId ?? selectedId ?? undefined;
  const activePointId =
    activeCandidate && visibleIds.has(activeCandidate) ? activeCandidate : undefined;

  const renderCallout = (point: GlobePoint) => {
    const station = STATIONS.find((s) => s.id === point.id);
    if (station) {
      return (
        <MapCallout
          title={station.code}
          lines={[
            STATUS_LABEL[station.status],
            `${station.latencyMs} ms · ${station.throughput.toFixed(1)} Gb/s`,
            coordinates(station.lat, station.lng),
          ]}
        />
      );
    }
    const relay = RELAYS.find((r) => r.id === point.id);
    if (!relay) return null;
    return (
      <MapCallout
        title={relay.name}
        lines={[
          relay.route,
          `${relay.loadPct}% load · ${relay.handoff.toLowerCase()}`,
          coordinates(relay.lat, relay.lng),
        ]}
      />
    );
  };

  /* The flat map's hover cards, through the library's HoverCard (the map
     composes it around the marker). Spans only — the panel is a <span>. */
  const renderHoverCard = (point: WorldMapPoint) => {
    const station = STATIONS.find((s) => s.id === point.id);
    if (station) {
      return (
        <span className={styles.card}>
          <span className={styles.cardName}>{station.code}</span>
          <span className={styles.cardCity}>{station.name}</span>
          <span className={styles.cardMeta}>
            <span
              className={styles.legendDot}
              style={{ color: STATUS_COLOR[station.status] }}
              aria-hidden="true"
            />
            {STATUS_LABEL[station.status]}
          </span>
          <span className={styles.cardBook}>
            {station.latencyMs} ms · {station.throughput.toFixed(1)} Gb/s
          </span>
        </span>
      );
    }
    const relay = RELAYS.find((r) => r.id === point.id);
    if (!relay) return null;
    return (
      <span className={styles.card}>
        <span className={styles.cardName}>{relay.name}</span>
        <span className={styles.cardCity}>{relay.route}</span>
        <span className={styles.cardBook}>
          {relay.loadPct}% load · {relay.handoff.toLowerCase()}
        </span>
      </span>
    );
  };

  return (
    // data-bg-hidden: the console sits on the flat page colour, the same
    // switch the marketing dashboard uses.
    <div className={styles.shell} data-bg-hidden="">
      <div className={styles.sidebar}>
        <AppSidebar
          sections={NAV_SECTIONS}
          profile={{ name: "Noor Haddad", email: "noor@meridian.net" }}
          activeKey="network"
          expanded={sidebarExpanded}
          onExpandedChange={setSidebarExpanded}
          logoText="Meridian"
          floating
          footerSlot={<ThemeToggle />}
        />
      </div>

      <main
        className={`${styles.main} ${
          sidebarExpanded ? styles.mainExpanded : ""
        } ${chatOpen ? styles.mainChatOpen : ""}`}
      >
        <div className={styles.content}>
          <div className={styles.topBar}>
            <div className={styles.search}>
              <Input
                placeholder="Search stations"
                iconLeft="search"
                aria-label="Search stations"
              />
              <span className={styles.searchKbd} aria-hidden="true">
                <Kbd size="compact">⌘</Kbd>
                <Kbd size="compact">K</Kbd>
              </span>
            </div>
            <div className={styles.topBarActions}>
              <AiButton
                label="Ask AI"
                size="compact"
                onClick={() => setChatOpen(true)}
              />
              <CircularButton
                icon="notifications"
                variant="secondary"
                size="compact"
                ariaLabel="Notifications"
              />
            </div>
          </div>

          {/* ------------------------------------------------- the stage */}
          <section className={styles.stage} aria-label="Network view">
            {/* The stage's own toolbar, floating along its top edge: the
                projection flip on the left, and the three matching selects
                on the right (the stage-toolbar carve-out in design.md's
                Template screens rule 2) — the region steer drives both
                projections, the two filters thin them. */}
            <div className={styles.stageBar}>
              {/* Default-size controls across the bar — one size per row. */}
              <div className={styles.viewToggle}>
                <SegmentedControl
                  segments={[
                    { value: "globe", label: "Globe", icon: "public" },
                    { value: "map", label: "Map", icon: "map" },
                  ]}
                  activeSegment={view}
                  onSegmentChange={setView}
                  ariaLabel="Network projection"
                />
              </div>
              <div className={styles.filters}>
                <Dropdown
                  options={REGION_OPTIONS}
                  value={region}
                  onValueChange={steerToRegion}
                  aria-label="Steer the view to a region"
                  className={styles.filterSelect}
                />
                <Dropdown
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  aria-label="Filter stations by status"
                  className={styles.filterSelect}
                />
                <Dropdown
                  options={KIND_OPTIONS}
                  value={kindFilter}
                  onValueChange={setKindFilter}
                  aria-label="Filter by marker kind"
                  className={styles.filterSelect}
                />
              </div>
            </div>

            {view === "globe" ? (
              <div className={styles.globeBox}>
                <Globe
                  points={points}
                  arcs={ARCS}
                  rotation={rotation}
                  onRotationChange={setRotation}
                  autoRotate={selectedId ? 0 : 0.4}
                  interactive
                  showLabels
                  activePointId={activePointId}
                  onPointHover={(point) => setHoverId(point ? point.id : null)}
                  onPointClick={handlePointClick}
                  renderCallout={renderCallout}
                  label="Meridian relay network: stations, relays, and links"
                  className={styles.globe}
                />
              </div>
            ) : (
              <div className={styles.mapBox}>
                <WorldMap
                  points={mapPoints}
                  bounds={activeRegion.bounds}
                  fit="cover"
                  showZoomControls
                  renderHoverCard={renderHoverCard}
                  label="Meridian relay network: stations and relays by status"
                />
              </div>
            )}

            {/* The screen's identity and key, in the readout voice, on the
                corner the sphere leaves empty. */}
            <div className={styles.metaLeft}>
              <h1 className={styles.metaTitle}>Meridian</h1>
              <p className={styles.metaTagline}>
                Ground stations, relays in transit, and the links carrying
                tonight&apos;s traffic.
              </p>
              {/* One key for one dataset: stations carry their status colour
                  on both projections, so the legend never changes with the
                  view — the globe simply adds the links the flat map does
                  not draw. */}
              <MapLegend
                className={styles.legend}
                items={[
                  ...(Object.keys(STATUS_LABEL) as StationStatus[]).map(
                    (status) => ({
                      glyph: (
                        <span
                          className={styles.legendAnchor}
                          style={{ color: STATUS_COLOR[status] }}
                        />
                      ),
                      label: `Station ${STATUS_LABEL[status].toLowerCase()}`,
                    }),
                  ),
                  {
                    glyph: <span className={styles.legendDot} />,
                    label: "Relay in transit",
                  },
                  { glyph: "arc" as const, label: "Backbone link" },
                  {
                    glyph: "line" as const,
                    color: DEGRADED_LINK,
                    label: "Degraded link",
                  },
                ]}
              />
            </div>

            {/* The headline numbers and the steering hint on the other
                corner, right-ragged toward the edge. */}
            <div className={styles.metaRight}>
              <div className={styles.metricsRow} aria-label="Network summary">
                <span className={styles.liveDot} aria-hidden="true" />
                {metrics.map((metric) => (
                  <div key={metric.label} className={styles.metric}>
                    <span className={styles.metricValue}>{metric.value}</span>
                    <span className={styles.metricLabel}>{metric.label}</span>
                  </div>
                ))}
              </div>
              {view === "globe" ? (
                <p className={styles.kbdHint}>
                  <span className={styles.kbdRow} aria-hidden="true">
                    <Kbd size="compact">W</Kbd>
                    <Kbd size="compact">A</Kbd>
                    <Kbd size="compact">S</Kbd>
                    <Kbd size="compact">D</Kbd>
                  </span>
                  Drag the globe, or steer with the keys
                </p>
              ) : (
                <p className={styles.kbdHint}>
                  <span className={styles.kbdRow} aria-hidden="true">
                    <Kbd size="compact">←</Kbd>
                    <Kbd size="compact">↑</Kbd>
                    <Kbd size="compact">↓</Kbd>
                    <Kbd size="compact">→</Kbd>
                  </span>
                  Drag the map, or pan with the keys
                </p>
              )}
            </div>
          </section>
        </div>
      </main>

      <TemplateAssistant
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Meridian AI"
        askLine="Ask about stations, links, latency, or capacity"
        suggestions={CHAT_SUGGESTIONS}
        replies={CHAT_REPLIES}
        fallback={CHAT_FALLBACK}
        disclaimer="A mock assistant with canned answers over this network's numbers."
      />
    </div>
  );
}
