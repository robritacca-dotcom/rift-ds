"use client";

import styles from "../page.module.css";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import {
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  RadialChart,
  StackedBarChart,
  Treemap,
} from "rift-ds/charts";
import { Gauge } from "rift-ds/components/Gauge/Gauge";
import { Panel } from "rift-ds/components/Panel/Panel";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import {
  ContributionGraph,
  type ContributionDay,
} from "rift-ds/components/ContributionGraph/ContributionGraph";

const SPARK_SERIES = [
  { label: "Revenue", data: [12, 14, 13, 17, 16, 21, 24, 23, 28], tone: "accent" as const },
  { label: "Churn", data: [9, 8, 9, 7, 7, 6, 5, 6, 4], tone: "positive" as const },
  { label: "Latency", data: [3, 4, 3, 5, 6, 5, 7, 8, 9], tone: "negative" as const },
];

const TREEMAP_DATA = [
  { name: "Forms", size: 21 },
  { name: "AI", size: 26 },
  { name: "Data display", size: 18 },
  { name: "Charts", size: 16 },
  { name: "Navigation", size: 10 },
  { name: "Overlays", size: 9 },
];

/** A year of contribution days ending on a fixed date. Deterministic, so
    the server render and the client hydration agree. */
const CONTRIBUTION_DAYS: ContributionDay[] = (() => {
  const end = Date.UTC(2026, 8, 30);
  const days: ContributionDay[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(end - i * 86_400_000);
    const weekday = d.getUTCDay();
    const wave = Math.sin(i / 9) + Math.sin(i / 23) + (weekday === 0 || weekday === 6 ? -1.2 : 0.4);
    const level = Math.max(0, Math.min(4, Math.round(wave + 1.4))) as ContributionDay["level"];
    days.push({ date: d.toISOString().slice(0, 10), count: level * 3, level });
  }
  return days;
})();
const CONTRIBUTION_TOTAL = CONTRIBUTION_DAYS.reduce((sum, d) => sum + d.count, 0);

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

      <div className={styles.demoColumns}>
        <RadialChart
          data={[
            { name: "Tokens", value: 82, color: shades[0] },
            { name: "Components", value: 64, color: shades[1] },
            { name: "Docs", value: 41, color: shades[2] },
          ]}
          title="Coverage"
          subtitle="Concentric rings on the brand ramp"
          innerRadius={36}
          outerRadius={92}
          height={240}
        />

        <Treemap
          data={TREEMAP_DATA.map((item, i) => ({ ...item, color: shades[i % shades.length] }))}
          title="Components by category"
          subtitle="Labels pick whichever text colour reads on their cell"
          height={240}
        />
      </div>

      <div className={`${styles.demoColumns} ${styles.chartPair}`}>
        {/* Gauge sits bare inside a Panel beside the sparklines (design.md's
            Panel spec: charts dropped in bare, one level of chrome), so the
            two read as one pair of dashboard surfaces. */}
        <Panel>
          <Gauge
            bare
            value={68}
            label="Budget used"
            title="Monthly spend"
            subtitle="Turns warning at 70, error at 90"
            thresholds={[
              { value: 70, tone: "warning" },
              { value: 90, tone: "error" },
            ]}
            formatValue={(v) => `${v}%`}
            size={140}
          />
        </Panel>

        <Panel>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>Trends</h3>
            <p className={styles.panelSubtitle}>Sparklines in the accent and trend tones</p>
          </div>
          <div className={styles.sparkList}>
            {SPARK_SERIES.map((s) => (
              <div key={s.label} className={styles.sparkRow}>
                <span className={styles.sparkLabel}>{s.label}</span>
                <Sparkline data={s.data} tone={s.tone} variant="area" label={`${s.label} trend`} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <ContributionGraph
        days={CONTRIBUTION_DAYS}
        title="Theme edits"
        subtitle="A year of activity; the sweep-in follows the Motion lever"
        caption={`${CONTRIBUTION_TOTAL} edits in the last year`}
      />

    </section>
  );
}
