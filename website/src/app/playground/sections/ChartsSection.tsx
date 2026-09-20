"use client";

import styles from "../page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import {
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  StackedBarChart,
} from "@robr0/design-system/charts";

const CHART_DATA = [
  { label: "Mon", value: 320 },
  { label: "Tue", value: 480 },
  { label: "Wed", value: 260 },
  { label: "Thu", value: 540 },
  { label: "Fri", value: 610 },
  { label: "Sat", value: 380 },
  { label: "Sun", value: 290 },
];

const TREND_DATA = [
  { month: "Jan", sessions: 180, signups: 60 },
  { month: "Feb", sessions: 300, signups: 110 },
  { month: "Mar", sessions: 240, signups: 90 },
  { month: "Apr", sessions: 420, signups: 170 },
  { month: "May", sessions: 380, signups: 210 },
  { month: "Jun", sessions: 520, signups: 260 },
];

const USAGE_DATA = [
  { week: "W1", docs: 140, api: 90 },
  { week: "W2", docs: 210, api: 130 },
  { week: "W3", docs: 180, api: 170 },
  { week: "W4", docs: 260, api: 220 },
  { week: "W5", docs: 320, api: 240 },
  { week: "W6", docs: 300, api: 310 },
];

const CHANNEL_DATA = [
  { quarter: "Q1", organic: 220, referral: 140, direct: 90 },
  { quarter: "Q2", organic: 280, referral: 160, direct: 120 },
  { quarter: "Q3", organic: 340, referral: 150, direct: 170 },
  { quarter: "Q4", organic: 390, referral: 210, direct: 200 },
];

/** Mix a hex colour toward white (w > 0) or black (w < 0), for the
    lighter companion shades the multi-series charts need. Local to the
    section: these are demo series colours derived from the lever, not
    theme tokens. */
function shade(hex: string, w: number): string {
  const h = hex.replace("#", "");
  const channels = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const pole = w > 0 ? 255 : 0;
  const amount = Math.abs(w);
  return (
    "#" +
    channels
      .map((c) => Math.round(c + (pole - c) * amount).toString(16).padStart(2, "0"))
      .join("")
  );
}

/* The brand colour is fed from state rather than left to the charts' own
   token lookup: charts resolve CSS variables during render, before the
   effect that writes the overrides runs, so they would otherwise lag the
   brand lever by one change. */
export default function ChartsSection({ brand }: { brand: string }) {
  const shades = [brand, shade(brand, 0.35), shade(brand, 0.63)];

  return (
    <section className={styles.demoSection} aria-label="Charts">
      <SectionTitle title="Charts" />
      <p className={styles.sectionNote}>
        Series one follows the action colour, and the companions here are
        mixed from the same pick, so this demo stays on brand as you
        re-theme.
      </p>

      <BarChart
        data={CHART_DATA}
        title="Weekly views"
        subtitle="Bars follow the action colour"
        dataLabel="Views"
        barColor={brand}
        height={240}
      />

      <LineChart
        data={TREND_DATA}
        xKey="month"
        series={[
          { dataKey: "sessions", label: "Sessions", color: brand },
          { dataKey: "signups", label: "Signups", color: brand, strokeDasharray: "5 4" },
        ]}
        title="Growth"
        subtitle="Both series derive from the action colour"
        height={240}
      />

      <AreaChart
        data={USAGE_DATA}
        xKey="week"
        stacked
        series={[
          { dataKey: "docs", label: "Docs pages", color: shades[0] },
          { dataKey: "api", label: "API calls", color: shades[1] },
        ]}
        title="Usage"
        subtitle="Stacked areas in two shades of the same pick"
        height={240}
      />

      <div className={styles.demoColumns}>
        <PieChart
          data={[
            { name: "Components", value: 46, color: shades[0] },
            { name: "Tokens", value: 31, color: shades[1] },
            { name: "Docs", value: 23, color: shades[2] },
          ]}
          title="Time spent"
          subtitle="A donut on the brand ramp"
          /* The component's outerRadius default (140) assumes its 350px
             default height — at 240 with a legend the donut must fit a
             ~210px plot, so size both radii to match. */
          innerRadius={52}
          outerRadius={84}
          height={240}
        />

        <StackedBarChart
          data={CHANNEL_DATA}
          xKey="quarter"
          series={[
            { dataKey: "organic", label: "Organic", color: shades[0] },
            { dataKey: "referral", label: "Referral", color: shades[1] },
            { dataKey: "direct", label: "Direct", color: shades[2] },
          ]}
          title="Traffic by channel"
          subtitle="Three stacked shades of one colour"
          height={240}
        />
      </div>
    </section>
  );
}
