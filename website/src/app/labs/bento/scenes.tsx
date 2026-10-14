"use client";

/**
 * The live UI inside each banner, composed only from library components:
 * no hand-built mocks. Each scene is a small product moment that moves
 * quietly on a loop, and fills its box, so the same scene renders in the
 * card and, larger, in the overlay. The textures underneath (art.tsx) are
 * page art, not UI.
 */

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "rift-ds/components/Button/Button";
import { Swatch } from "rift-ds/components/Swatch/Swatch";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Panel } from "rift-ds/components/Panel/Panel";
import { Stat } from "rift-ds/components/Stat/Stat";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import { UsageCard } from "rift-ds/components/UsageCard/UsageCard";
import { ChatMessage } from "rift-ds/components/ChatMessage/ChatMessage";
import { StreamingText } from "rift-ds/components/StreamingText/StreamingText";
import { PromptSuggestions } from "rift-ds/components/PromptSuggestions/PromptSuggestions";
import { Composer } from "rift-ds/components/Composer/Composer";
import { LegendTile } from "rift-ds/components/LegendTile/LegendTile";
import { Globe, type GlobeArc, type GlobePoint } from "rift-ds/components/Globe/Globe";
import { ToolCall } from "rift-ds/components/ToolCall/ToolCall";
import { Widget } from "rift-ds/components/Widget/Widget";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { AvatarGroup } from "rift-ds/components/AvatarGroup/AvatarGroup";
import { ContributionGraph } from "rift-ds/components/ContributionGraph/ContributionGraph";
import { Table } from "rift-ds/components/Table/Table";
import { Badge } from "rift-ds/components/Badge/Badge";
import { AreaChart } from "rift-ds/components/Chart/AreaChart";
import { BarChart } from "rift-ds/components/Chart/BarChart";
import { PieChart } from "rift-ds/components/Chart/PieChart";
import { demoAvatar1, demoAvatar2, demoAvatar3 } from "rift-ds/components/Avatar/demoAvatars";
import { TOKEN_COUNT, TOKEN_COUNTS } from "rift-ds/tokens/registry";
import { ParticleHalo, ShaderWash, WASHES } from "./art";
import styles from "./Bento.module.css";

const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Steps 0..count-1 on an interval; parked on the last step under reduced motion. */
function useStep(count: number, ms: number) {
  const [step, setStep] = useState(0);
  const still = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
  useEffect(() => {
    if (still) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % count), ms);
    return () => window.clearInterval(id);
  }, [count, ms, still]);
  return still ? count - 1 : step;
}

/** A smooth, seeded series that drifts a little with `phase`. */
function series(n: number, phase: number, base = 50, swing = 22) {
  return Array.from({ length: n }, (_, i) =>
    Math.round(base + swing * Math.sin(i * 0.55 + phase) + swing * 0.5 * Math.sin(i * 1.3 + phase * 2) + i * 1.4),
  );
}

/* ------------------------------------------------------------ theme */

const ACCENTS = [
  { name: "Violet", token: "--color-core-accent-violet" },
  { name: "Coral", token: "--color-core-accent-coral" },
  { name: "Mint", token: "--color-core-accent-mint" },
  { name: "Cobalt", token: "--color-core-accent-cobalt" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

/**
 * A small dashboard whose accent steps through four looks. The action
 * colour and the lead chart series are re-pointed on the scene's own
 * scope, which is what a theme does to the whole page: every component
 * underneath follows with no prop changed.
 */
export function ThemeScene() {
  const step = useStep(ACCENTS.length, 2600);
  const accent = ACCENTS[step];
  const scope = {
    "--color-action-primary-bg": `var(${accent.token})`,
    "--color-action-primary-bg-hover": `var(${accent.token})`,
    "--color-chart-series-1": `var(${accent.token})`,
  } as React.CSSProperties;
  const data = useMemo(() => {
    const a = series(MONTHS.length, 0.4, 40, 14);
    const b = series(MONTHS.length, 2.1, 24, 8);
    return MONTHS.map((m, i) => ({ month: m, revenue: a[i], costs: b[i] }));
  }, []);

  return (
    <div className={styles.scene} style={scope}>
      <ShaderWash className={styles.washSweep} {...WASHES.sweep} fallback="linear-gradient(120deg, transparent 40%, var(--color-core-accent-amber), var(--color-core-accent-violet))" />

      <Panel className={`${styles.place} ${styles.themeChart}`}>
        <div className={styles.panelBar}>
          <strong>Revenue</strong>
          <SegmentedControl
            size="compact"
            activeSegment="month"
            segments={[
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ]}
          />
        </div>
        <AreaChart
          bare
          height={190}
          data={data}
          xKey="month"
          series={[
            { dataKey: "revenue", label: "Revenue", color: "var(--color-chart-series-1)" },
            { dataKey: "costs", label: "Costs", color: "var(--color-chart-series-2)" },
          ]}
        />
        <div className={styles.panelFoot}>
          <span className={styles.swatchRow}>
            {ACCENTS.map((a, i) => (
              <Swatch key={a.name} value={`var(${a.token})`} label={a.name} size="compact" selected={i === step} />
            ))}
          </span>
          <Button label={`Apply ${accent.name}`} size="compact" />
        </div>
      </Panel>

      <Panel className={`${styles.place} ${styles.themeStat}`}>
        <Stat label="Monthly revenue" value="$48,210" delta="+12.4%" trend="up" />
        <Sparkline data={data.map((d) => d.revenue)} variant="area" tone="accent" showDot width={200} height={56} label="Revenue, last ten months" />
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------ usage */

const DAYS = Array.from({ length: 30 }, (_, i) => `${i + 1}`);

/** A usage card over a month of bars that redraws every few seconds. */
export function UsageScene() {
  const step = useStep(4, 2800);
  const bars = useMemo(() => {
    const v = series(DAYS.length, step * 0.9 + 1, 60, 30);
    return DAYS.map((d, i) => ({ day: d, tokens: Math.max(6, v[i] + ((i * 7 + step * 5) % 11 === 0 ? 50 : 0)) }));
  }, [step]);

  return (
    <div className={styles.scene}>
      <ShaderWash className={styles.washRise} {...WASHES.rise} fallback="linear-gradient(to bottom, transparent 30%, var(--color-core-accent-violet))" />
      <div className={`${styles.place} ${styles.usageStack}`}>
        <UsageCard
          title="Pro plan"
          subtitle="Billed monthly"
          items={[
            { label: "Model calls", value: 62 + step * 7, max: 100, valueText: `${62 + step * 7}% of quota` },
            { label: "Seats", value: 8, max: 10, valueText: "8 of 10" },
          ]}
        />
        <BarChart
          title="Tokens, last 30 days"
          subtitle={`${(2010569010 + step * 41893).toLocaleString("en-US")} in total`}
          data={bars}
          xKey="day"
          yKey="tokens"
          dataLabel="Tokens"
          barColor="var(--color-chart-series-5)"
          height={150}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- chat */

const REPLY =
  "Run npx rift-ds init chat. It scaffolds the route, the mount and an env example, and never overwrites a file you already have.";

/**
 * A conversation in a halo of motes: the question lands, the answer
 * streams in while the composer's AI ring turns, then follow-ups appear.
 */
export function ChatScene() {
  const step = useStep(5, 2200);
  const streaming = step === 2;
  return (
    <div className={styles.scene}>
      <ParticleHalo />
      <div className={`${styles.place} ${styles.chatStack}`}>
        <div className={styles.revealed} data-on={step >= 1}>
          <ChatMessage role="user" size="compact">How do I add a chat to my docs site?</ChatMessage>
        </div>
        <div className={styles.revealed} data-on={step >= 2}>
          <ChatMessage role="assistant" size="compact" showAvatar={false}>
            {step >= 2 && <StreamingText text={REPLY} streaming={streaming} />}
          </ChatMessage>
        </div>
        <div className={styles.revealed} data-on={step >= 3}>
          <PromptSuggestions
            size="compact"
            layout="wrap"
            suggestions={[
              { id: "keys", label: "Which key do I need?" },
              { id: "limits", label: "How are limits set?" },
            ]}
          />
        </div>
        <Composer aiGlow streaming={streaming} value="" onValueChange={() => {}} placeholder="Ask anything" />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- tokens */

const TOKEN_SLICES: Array<{ key: keyof typeof TOKEN_COUNTS; name: string; color: string }> = [
  { key: "colour", name: "Colour", color: "var(--color-chart-series-5)" },
  { key: "typography", name: "Type", color: "var(--color-chart-series-4)" },
  { key: "spacing", name: "Spacing", color: "var(--color-chart-series-6)" },
  { key: "motion", name: "Motion", color: "var(--color-chart-series-2)" },
];

/**
 * The token registry itself, read live: every semantic token by category,
 * so the numbers here are the build's own, never typed.
 */
export function TokensScene() {
  const step = useStep(TOKEN_SLICES.length, 1800);
  const rest = TOKEN_COUNT - TOKEN_SLICES.reduce((n, s) => n + (TOKEN_COUNTS[s.key] ?? 0), 0);
  const data = [
    ...TOKEN_SLICES.map((s) => ({ name: s.name, value: TOKEN_COUNTS[s.key] ?? 0, color: s.color })),
    { name: "Other", value: rest, color: "var(--color-chart-series-7)" },
  ];
  return (
    <div className={styles.scene}>
      <ShaderWash className={styles.washFoil} {...WASHES.foil} fallback="radial-gradient(80% 60% at 50% 100%, var(--color-core-accent-coral), transparent)" />
      <div className={`${styles.place} ${styles.tokenStack}`}>
        <PieChart
          title="Semantic tokens"
          subtitle="Read from the registry at build"
          summaryItems={[{ label: "Total", value: TOKEN_COUNT }]}
          data={data}
          height={170}
          innerRadius={52}
          outerRadius={78}
          showLegend={false}
        />
        <div className={styles.legendGrid}>
          {TOKEN_SLICES.map((s, i) => (
            <LegendTile
              key={s.key}
              label={s.name}
              value={TOKEN_COUNTS[s.key] ?? 0}
              swatch={s.color}
              className={i === step ? styles.legendOn : styles.legendOff}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- mcp */

const PLACES: GlobePoint[] = [
  { id: "lis", lat: 38.7, lng: -9.1, label: "Lisbon" },
  { id: "nyc", lat: 40.7, lng: -74, label: "New York" },
  { id: "tor", lat: 43.7, lng: -79.4, label: "Toronto" },
  { id: "ber", lat: 52.5, lng: 13.4, label: "Berlin" },
  { id: "lag", lat: 6.5, lng: 3.4, label: "Lagos" },
  { id: "sao", lat: -23.5, lng: -46.6, label: "São Paulo" },
];
const ROUTES: GlobeArc[] = [
  { from: "nyc", to: "lis" },
  { from: "tor", to: "ber" },
  { from: "sao", to: "lag" },
];
const TOOLS = [
  { name: "get_component", summary: "Button: props and usage" },
  { name: "list_tokens", summary: "Colour: semantic roles" },
  { name: "get_setup", summary: "Next.js install steps" },
];

/** A turning globe, with tool calls resolving one after another beside it. */
export function McpScene() {
  const step = useStep(TOOLS.length * 2 + 1, 1300);
  const at = Math.floor(step / 2);
  return (
    <div className={styles.scene}>
      <div className={styles.globeWrap}>
        <Globe points={PLACES} arcs={ROUTES} autoRotate={6} defaultRotation={[30, -18]} interactive={false} label="A globe with arcs between six cities" />
      </div>
      <div className={`${styles.place} ${styles.toolStack}`}>
        {TOOLS.map((t, i) => {
          const status = i < at ? "success" : i === at ? (step % 2 ? "success" : "running") : "pending";
          return (
            <div key={t.name} className={styles.revealed} data-on={i <= at}>
              <ToolCall name={t.name} status={status} summary={t.summary} duration={status === "success" ? `${120 + i * 40}ms` : undefined} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------- templates */

const TEAMS = [
  ["Northwind", "Design", "12", "Active"],
  ["Halcyon", "Payroll", "48", "Active"],
  ["Meridian", "Support", "9", "Review"],
  ["Lumen", "Growth", "23", "Active"],
  ["Basalt", "Platform", "31", "Active"],
];

/** Twenty weeks of activity, seeded so it is the same on every visit. */
function activity() {
  const start = Date.UTC(2026, 4, 25);
  return Array.from({ length: 20 * 7 }, (_, i) => {
    const v = (Math.sin(i * 0.37) + Math.sin(i * 0.11 + 1) + 2) / 4;
    const level = Math.min(4, Math.floor(v * 5)) as 0 | 1 | 2 | 3 | 4;
    return { date: new Date(start + i * 864e5).toISOString().slice(0, 10), count: level * 3, level };
  });
}

/**
 * A team console: a members widget, an activity graph and a table whose
 * status column keeps updating, each a library component as shipped.
 */
export function TemplatesScene() {
  const step = useStep(TEAMS.length, 1500);
  const days = useMemo(() => activity(), []);
  return (
    <div className={styles.scene}>
      <div className={styles.hairlines} aria-hidden="true" />
      <ShaderWash className={styles.washCorner} {...WASHES.rise} fallback="radial-gradient(60% 80% at 0% 100%, var(--color-core-accent-violet), transparent)" />

      <Panel className={`${styles.place} ${styles.templatesMain}`}>
        <ContributionGraph bare days={days} title="Team activity" showMonthLabels />
        <Table
          size="compact"
          columns={[
            { key: "team", header: "Team" },
            { key: "area", header: "Area" },
            { key: "seats", header: "Seats", align: "right" },
            { key: "status", header: "Status", align: "right" },
          ]}
          rows={TEAMS.map(([team, area, seats, status], i) => ({
            id: team,
            cells: {
              team,
              area,
              seats,
              status: <Badge label={i === step ? "Syncing" : status} variant={i === step ? "info" : status === "Active" ? "positive" : "warning"} />,
            },
          }))}
        />
      </Panel>

      <Widget title="Members" count={48} className={`${styles.place} ${styles.templatesSide}`}>
        <AvatarGroup max={4} size="md">
          <Avatar src={demoAvatar1} name="Ada Moreno" />
          <Avatar src={demoAvatar2} name="Kofi Mensah" />
          <Avatar src={demoAvatar3} name="Ines Duarte" />
          <Avatar name="Sam Okafor" />
          <Avatar name="Lee Park" />
        </AvatarGroup>
        <Stat label="Active this week" value="41" delta="+6" trend="up" />
      </Widget>
    </div>
  );
}
