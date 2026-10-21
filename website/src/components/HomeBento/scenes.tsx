"use client";

/**
 * What the home bento draws: a small scene inside each tile, and a larger,
 * working showcase inside each tile's overlay. Everything is a library
 * component as shipped. The people and figures are fictional demo data;
 * every count is a registry import.
 */

import React, { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { AvatarGroup } from "rift-ds/components/AvatarGroup/AvatarGroup";
import { demoAvatar1, demoAvatar2, demoAvatar3 } from "rift-ds/components/Avatar/demoAvatars";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Button } from "rift-ds/components/Button/Button";
import { Checkbox } from "rift-ds/components/Checkbox/Checkbox";
import { Chip } from "rift-ds/components/Chip/Chip";
import { ChatMessage } from "rift-ds/components/ChatMessage/ChatMessage";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Composer } from "rift-ds/components/Composer/Composer";
import { Input } from "rift-ds/components/Input/Input";
import { Panel } from "rift-ds/components/Panel/Panel";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { PromptSuggestions } from "rift-ds/components/PromptSuggestions/PromptSuggestions";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Slider } from "rift-ds/components/Slider/Slider";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import { Stat } from "rift-ds/components/Stat/Stat";
import { StreamingText } from "rift-ds/components/StreamingText/StreamingText";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
import { ToolCall } from "rift-ds/components/ToolCall/ToolCall";
import { ContributionGraph } from "rift-ds/components/ContributionGraph/ContributionGraph";
import { InspectorSection } from "rift-ds/components/Inspector/InspectorSection";
import { InspectorSegmentedControl } from "rift-ds/components/Inspector/InspectorSegmentedControl";
import { InspectorToggleSwitch } from "rift-ds/components/Inspector/InspectorToggleSwitch";
import { Table } from "rift-ds/components/Table/Table";
import { Widget } from "rift-ds/components/Widget/Widget";
import { AreaChart } from "rift-ds/components/Chart/AreaChart";
import { BarChart } from "rift-ds/components/Chart/BarChart";
import { Reasoning } from "rift-ds/components/Reasoning/Reasoning";
import { PACKAGE_NAME, REPOSITORY_URL, SITE_URL, BIN_NAME } from "@/config/brand.generated";
import { MCP_CLIENTS } from "@/lib/mcp-clients";
import { templatesSidebarLinks } from "@/config/navigation";
import { DEVICES, TemplateFrame, type DeviceKey } from "@/components/TemplateFrame/TemplateFrame";
import { THEME_SELECTOR_ORDER, themeSelectorTiles } from "@/lib/theme/presets";
import { applyBrand, BASE_THEME_ID, readBrand, SERVED_THEME_ID, subscribeBrand } from "@/lib/theme/brand";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import styles from "./HomeBento.module.css";

/* ------------------------------------------------------------ motion */

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

/** A smooth, seeded series, the same on every visit. */
function series(n: number, phase: number, base = 50, swing = 22) {
  return Array.from({ length: n }, (_, i) =>
    Math.round(base + swing * Math.sin(i * 0.55 + phase) + swing * 0.5 * Math.sin(i * 1.3 + phase * 2) + i * 1.4),
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const TREND = series(MONTHS.length, 0.4, 40, 14);

/* -------------------------------------------------------- components */

/** The tile's picture: a stat beside a handful of controls. */
export function ComponentsTileScene() {
  return (
    <div className={styles.sampler}>
      <div className={styles.samplerStat}>
        <Stat label="Monthly revenue" value="$48,210" delta="+12.4%" trend="up" />
        <Sparkline data={TREND} variant="area" tone="accent" width={200} height={40} label="Revenue, last ten months" />
      </div>
      <div className={styles.samplerControls}>
        <Button label="Primary" variant="primary" size="compact" />
        <Button label="Secondary" variant="secondary" size="compact" />
        <ToggleSwitch checked label="Alerts" />
        <Badge label="Positive" variant="positive" />
        <Chip label="Filter" icon="tune" />
      </div>
    </div>
  );
}

/** The overlay's showcase: a settings panel that actually works. */
export function ComponentsShowcase() {
  const [name, setName] = useState("Northwind");
  const [plan, setPlan] = useState("team");
  const [seats, setSeats] = useState(12);
  const [alerts, setAlerts] = useState(true);
  const [digest, setDigest] = useState(false);
  const price = seats * (plan === "team" ? 12 : plan === "pro" ? 24 : 0);

  return (
    <Panel className={styles.workbench}>
      <div className={styles.workbenchHead}>
        <strong>Workspace</strong>
        <Badge label={alerts ? "Alerts on" : "Alerts off"} variant={alerts ? "positive" : "neutral"} />
      </div>
      <Input label="Name" value={name} onValueChange={setName} size="compact" />
      <SegmentedControl
        size="compact"
        fullWidth
        ariaLabel="Plan"
        activeSegment={plan}
        onSegmentChange={setPlan}
        segments={[
          { value: "free", label: "Free" },
          { value: "team", label: "Team" },
          { value: "pro", label: "Pro" },
        ]}
      />
      <Slider label="Seats" value={seats} min={1} max={50} onValueChange={setSeats} showValue size="compact" />
      <ToggleSwitch label="Usage alerts" checked={alerts} onCheckedChange={setAlerts} size="compact" />
      <Checkbox label="Weekly digest" checked={digest} onCheckedChange={setDigest} size="compact" />
      <div className={styles.workbenchFoot}>
        <Stat label="Per month" value={`$${price.toLocaleString("en-US")}`} />
        <Button label="Save" variant="primary" size="compact" />
      </div>
    </Panel>
  );
}

/* -------------------------------------------------------------- chat */

const THOUGHT =
  "Group this week's card transactions by category, then lead with the largest so the chart answers at a glance.";
const REPLY = "Dining led the week at $142, about a third of the total.";

/* Fictional spending for the chart the answer draws. */
const SPEND = [
  { category: "Dining", amount: 142 },
  { category: "Groceries", amount: 118 },
  { category: "Transport", amount: 64 },
  { category: "Shopping", amount: 58 },
  { category: "Bills", amount: 40 },
];
const SPEND_TOTAL = SPEND.reduce((n, d) => n + d.amount, 0);

/**
 * An agent turn on a loop: the question lands, the reasoning streams live,
 * a tool call runs, the answer streams in and draws a chart, then
 * follow-ups appear. The composer's ring turns while the agent works.
 */
export function ChatScene() {
  const step = useStep(8, 1800);
  const thinking = step === 2;
  const working = step >= 2 && step <= 4;
  return (
    <div className={styles.chatStack}>
      <div className={styles.revealed} data-on={step >= 1}>
        <ChatMessage role="user" size="compact">Chart my spending this week</ChatMessage>
      </div>
      <div className={styles.revealed} data-on={step >= 2}>
        <Reasoning size="compact" streaming={thinking} duration={3} open={thinking}>
          {step >= 2 && <StreamingText text={THOUGHT} streaming={thinking} />}
        </Reasoning>
      </div>
      <div className={styles.revealed} data-on={step >= 3}>
        <ToolCall name="query_transactions" status={step >= 4 ? "completed" : "active"} duration={step >= 4 ? "240ms" : undefined} />
      </div>
      <div className={styles.revealed} data-on={step >= 4}>
        <ChatMessage role="assistant" size="compact" showAvatar={false}>
          {step >= 4 && <StreamingText text={REPLY} streaming={step === 4} />}
        </ChatMessage>
      </div>
      <div className={styles.revealed} data-on={step >= 5}>
        <BarChart
          title="Spending by category"
          subtitle={`$${SPEND_TOTAL} this week`}
          data={SPEND}
          xKey="category"
          yKey="amount"
          dataLabel="Spent"
          barColor="var(--color-chart-series-1)"
          height={96}
        />
      </div>
      <div className={styles.revealed} data-on={step >= 6}>
        <PromptSuggestions
          size="compact"
          layout="wrap"
          suggestions={[
            { id: "compare", label: "Compare with last week" },
            { id: "budget", label: "Set a dining budget" },
          ]}
        />
      </div>
      <Composer aiGlow streaming={working} value="" onValueChange={() => {}} placeholder="Ask anything" />
    </div>
  );
}

/* ------------------------------------------------------------ themes */

/** The first shipped preset after the base theme, named in the snippet. */
const SAMPLE_PRESET = THEME_SELECTOR_ORDER.find((id) => id !== BASE_THEME_ID) ?? BASE_THEME_ID;

function useSwatches() {
  const theme = useSiteTheme();
  return themeSelectorTiles(theme === "dark" ? "dark" : "light");
}

/** The tile's picture: every theme's colour, and the one line that applies one. */
export function ThemesTileScene() {
  const swatches = useSwatches();
  return (
    <div className={styles.themeStack}>
      <div className={styles.swatches} aria-hidden="true">
        {swatches.map((tile) => (
          <span key={tile.value} className={styles.swatch} style={{ backgroundColor: tile.color }} />
        ))}
      </div>
      <CodeBlock code={`<html data-brand="${SAMPLE_PRESET}">`} language="html" showCopy={false} />
    </div>
  );
}

/** A small dashboard on the site's own tokens, so a theme pick redraws it. */
export function ThemesShowcase() {
  const [range, setRange] = useState("month");
  const [email, setEmail] = useState("ada@northwind.dev");
  const [admin, setAdmin] = useState(false);
  const [note, setNote] = useState(true);
  const [tag, setTag] = useState("Design");
  const data = useMemo(() => {
    const b = series(MONTHS.length, 2.1, 24, 8);
    return MONTHS.map((m, i) => ({ month: m, revenue: TREND[i], costs: b[i] }));
  }, []);
  return (
    <div className={styles.themeDash}>
      <Panel className={styles.themeDashStat}>
        <Stat label="Monthly revenue" value="$48,210" delta="+12.4%" trend="up" />
        <Sparkline data={TREND} variant="area" tone="accent" showDot width={180} height={48} label="Revenue, last ten months" />
        <div className={styles.buttonRow}>
          <Button label="Export" variant="primary" size="compact" />
          <Button label="Share" variant="secondary" size="compact" />
        </div>
      </Panel>
      <Panel className={styles.themeDashChart}>
        <div className={styles.panelBar}>
          <strong>Revenue</strong>
          <SegmentedControl
            size="compact"
            ariaLabel="Range"
            activeSegment={range}
            onSegmentChange={setRange}
            segments={[
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ]}
          />
        </div>
        <AreaChart
          bare
          height={180}
          data={data}
          xKey="month"
          series={[
            { dataKey: "revenue", label: "Revenue", color: "var(--color-chart-series-1)" },
            { dataKey: "costs", label: "Costs", color: "var(--color-chart-series-2)" },
          ]}
        />
      </Panel>
      <Panel className={styles.themeDashForm}>
        <strong>Invite a teammate</strong>
        <Input label="Email" value={email} onValueChange={setEmail} size="compact" iconLeft="mail" />
        <ToggleSwitch label="Admin access" checked={admin} onCheckedChange={setAdmin} size="compact" />
        <Checkbox label="Send a welcome note" checked={note} onCheckedChange={setNote} size="compact" />
        <Button label="Send invite" variant="primary" size="compact" iconLeft="send" />
      </Panel>
      <Panel className={styles.themeDashTeam}>
        <div className={styles.panelBar}>
          <strong>Launch checklist</strong>
          <AvatarGroup max={3} size="sm">
            <Avatar src={demoAvatar1} name="Ada Moreno" />
            <Avatar src={demoAvatar2} name="Kofi Mensah" />
            <Avatar src={demoAvatar3} name="Ines Duarte" />
            <Avatar name="Sam Okafor" />
          </AvatarGroup>
        </div>
        <ProgressBar value={68} showLabel ariaLabel="Checklist progress" />
        <div className={styles.badgeRow}>
          <Badge label="Shipped" variant="positive" />
          <Badge label="In review" variant="info" />
          <Badge label="Blocked" variant="error" />
          <Badge label="At risk" variant="warning" />
          <Badge label="Draft" variant="neutral" />
        </div>
        <div className={styles.badgeRow}>
          {["Design", "Docs", "QA"].map((c) => (
            <Chip key={c} label={c} size="compact" selected={tag === c} onClick={() => setTag(c)} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

// Matches the SSR value of data-brand on <html> in layout.tsx.
const getServerBrand = () => SERVED_THEME_ID;

/** The overlay's side panel: every shipped theme, applied to the whole site on click. */
export function ThemePicker() {
  const swatches = useSwatches();
  const active = useSyncExternalStore(subscribeBrand, readBrand, getServerBrand);
  return (
    <div className={styles.picker} role="group" aria-label="Theme">
      {swatches.map((tile) => (
        <button
          key={tile.value}
          type="button"
          className={styles.pickerRow}
          aria-pressed={active === tile.value}
          onClick={() => applyBrand(tile.value)}
        >
          <span className={styles.swatch} style={{ backgroundColor: tile.color }} aria-hidden="true" />
          <span className={styles.pickerText}>
            <span className={styles.pickerName} style={{ fontFamily: tile.headingFont }}>{tile.label}</span>
            <span className={styles.pickerFont}>{tile.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ agents */

const TOOL_CALLS = ["get_component", "list_tokens", "get_setup"];

/** Tool calls resolving one after another. */
export function AgentsTileScene() {
  const step = useStep(TOOL_CALLS.length * 2 + 1, 1300);
  const at = Math.floor(step / 2);
  return (
    <div className={styles.toolStack}>
      {TOOL_CALLS.map((name, i) => {
        const status = i < at ? "completed" : i === at ? (step % 2 ? "completed" : "active") : "pending";
        return (
          <div key={name} className={styles.revealed} data-on={i <= at}>
            <ToolCall name={name} status={status} duration={status === "completed" ? `${120 + i * 40}ms` : undefined} />
          </div>
        );
      })}
    </div>
  );
}

/** How to connect, per client, then the skills installer. */
export function AgentsShowcase() {
  const [client, setClient] = useState(MCP_CLIENTS[0].id);
  const current = MCP_CLIENTS.find((c) => c.id === client) ?? MCP_CLIENTS[0];
  return (
    <div className={styles.snippets}>
      <p className={styles.snippetLabel}>Connect the MCP endpoint</p>
      <Tabs
        size="compact"
        ariaLabel="MCP client"
        activeTab={client}
        onTabChange={setClient}
        tabs={MCP_CLIENTS.map((c) => ({ value: c.id, label: c.label }))}
      />
      <CodeBlock code={current.snippet} language={current.language} filename={current.filename} />
      <p className={styles.snippetLabel}>Install the agent skills</p>
      <CodeBlock code={`npx ${BIN_NAME} init`} language="bash" />
    </div>
  );
}

/* ----------------------------------------------------------- install */

const INSTALL_PATHS = [
  {
    id: "npm",
    label: "npm",
    code: `npm install ${PACKAGE_NAME}`,
    note: "The whole library as a package. Import the tokens once, then any component by name.",
  },
  {
    id: "shadcn",
    label: "shadcn CLI",
    code: `npx shadcn@latest add ${SITE_URL}/r/button.json`,
    note: "One component's source copied into your project, with the components it imports.",
  },
  {
    id: "clone",
    label: "Clone",
    code: `git clone ${REPOSITORY_URL}`,
    note: "Everything: the library, this site, the validators and the skills.",
  },
];

/** The tile's picture: the three install lines. */
export function InstallTileScene() {
  return <CodeBlock code={INSTALL_PATHS.map((p) => p.code).join("\n")} language="bash" showCopy={false} />;
}

/** One install path at a time, each copyable. */
export function InstallShowcase() {
  const [path, setPath] = useState(INSTALL_PATHS[0].id);
  const current = INSTALL_PATHS.find((p) => p.id === path) ?? INSTALL_PATHS[0];
  return (
    <div className={styles.snippets}>
      <Tabs
        size="compact"
        ariaLabel="Install path"
        activeTab={path}
        onTabChange={setPath}
        tabs={INSTALL_PATHS.map((p) => ({ value: p.id, label: p.label }))}
      />
      <CodeBlock code={current.code} language="bash" />
      <p className={styles.snippetNote}>{current.note}</p>
      {path === "npm" && (
        <CodeBlock
          filename="app/layout.tsx"
          language="tsx"
          code={`import "${PACKAGE_NAME}/tokens/tokens.css";\nimport { Button } from "${PACKAGE_NAME}";`}
        />
      )}
    </div>
  );
}

/* --------------------------------------------------------- templates */

const TEAMS = [
  ["Northwind", "Design", "12", "Active"],
  ["Halcyon", "Payroll", "48", "Active"],
  ["Meridian", "Support", "9", "Review"],
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

/** The tile's picture: a slice of a team console whose status column keeps moving. */
export function TemplatesTileScene({ full = false }: { full?: boolean }) {
  const step = useStep(TEAMS.length, 1500);
  const days = useMemo(() => activity(), []);
  return (
    <div className={styles.console}>
      <Widget title="Members" count={48} className={styles.consoleSide}>
        <AvatarGroup max={4} size="md">
          <Avatar src={demoAvatar1} name="Ada Moreno" />
          <Avatar src={demoAvatar2} name="Kofi Mensah" />
          <Avatar src={demoAvatar3} name="Ines Duarte" />
          <Avatar name="Sam Okafor" />
          <Avatar name="Lee Park" />
        </AvatarGroup>
        <Stat label="Active this week" value="41" delta="+6" trend="up" />
      </Widget>
      <Panel className={styles.consoleMain}>
        {full && <ContributionGraph bare days={days} title="Team activity" showMonthLabels />}
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
              status: (
                <Badge
                  label={i === step ? "Syncing" : status}
                  variant={i === step ? "info" : status === "Active" ? "positive" : "warning"}
                />
              ),
            },
          }))}
        />
      </Panel>
    </div>
  );
}

/** Every template screen, from the nav config that owns the list. */
const TEMPLATES = templatesSidebarLinks.filter((t) => t.href !== "/templates");

type TemplatePick = { href: string; setHref: (href: string) => void };
const TemplatePickContext = createContext<TemplatePick | null>(null);

/** Holds the overlay's template pick, shared by the frame and the list beside it. */
export function TemplatesProvider({ children }: { children: React.ReactNode }) {
  const [href, setHref] = useState(TEMPLATES.find((t) => !t.mobileOnly)?.href ?? TEMPLATES[0].href);
  return <TemplatePickContext.Provider value={{ href, setHref }}>{children}</TemplatePickContext.Provider>;
}

function useTemplatePick() {
  const pick = useContext(TemplatePickContext);
  if (!pick) throw new Error("TemplatesProvider is missing");
  return pick;
}

/** The picked template, live, behind a device toggle. */
export function TemplatesShowcase() {
  const { href } = useTemplatePick();
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const template = TEMPLATES.find((t) => t.href === href) ?? TEMPLATES[0];
  const frameDevice = template.mobileOnly ? "mobile" : device;
  return (
    <div className={styles.templateStage}>
      <div className={styles.templateBar}>
        <Link href={template.href} className={styles.templateName}>
          {template.label}
          <span className="material-symbols-rounded" aria-hidden="true">arrow_outward</span>
        </Link>
        <SegmentedControl
          size="compact"
          ariaLabel="Preview device size"
          activeSegment={frameDevice}
          onSegmentChange={(v) => setDevice(v as DeviceKey)}
          segments={Object.entries(DEVICES).map(([value, d]) => ({ value, label: d.label, icon: d.icon }))}
        />
      </div>
      <TemplateFrame
        key={template.href}
        href={template.href}
        title={template.label}
        device={frameDevice}
        className={frameDevice === "mobile" ? styles.phoneShell : ""}
      />
    </div>
  );
}

/** The side list: pick a screen to preview. */
export function TemplatesList() {
  const { href, setHref } = useTemplatePick();
  return (
    <div className={styles.picker} role="group" aria-label="Template">
      {TEMPLATES.map((t) => (
        <button
          key={t.href}
          type="button"
          className={styles.pickerRow}
          aria-pressed={href === t.href}
          onClick={() => setHref(t.href)}
        >
          <span className={styles.pickerText}>
            <span className={styles.pickerName}>{t.label}</span>
            <span className={styles.pickerFont}>{t.description}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------- playground */

const LEVER_ACCENTS = [
  { value: "violet", label: "Violet", token: "--color-core-accent-violet" },
  { value: "coral", label: "Coral", token: "--color-core-accent-coral" },
  { value: "mint", label: "Mint", token: "--color-core-accent-mint" },
];

/* Each shape re-points the three radius roles at steps of the radius scale. */
const LEVER_SHAPES: Record<string, { pill: string; input: string; card: string }> = {
  square: { pill: "--radius-100", input: "--radius-050", card: "--radius-100" },
  soft: { pill: "--radius-300", input: "--radius-200", card: "--radius-300" },
  round: { pill: "--radius-pill", input: "--radius-300", card: "--radius-600" },
};

/**
 * Lever values written onto a preview's own scope: the same re-pointing a
 * theme does to the whole page, applied to one panel.
 */
function leverScope(accent: string, shape: string, flat: boolean) {
  const token = LEVER_ACCENTS.find((a) => a.value === accent)?.token ?? LEVER_ACCENTS[0].token;
  const r = LEVER_SHAPES[shape] ?? LEVER_SHAPES.round;
  return {
    "--color-action-primary-bg": `var(${token})`,
    "--color-action-primary-bg-hover": `var(${token})`,
    "--color-action-primary-bg-active": `var(${token})`,
    "--color-action-primary-border": `var(${token})`,
    "--color-action-primary-border-secondary": `var(${token})`,
    "--color-chart-series-1": `var(${token})`,
    "--radius-pill": `var(${r.pill})`,
    "--radius-300": `var(${r.input})`,
    "--radius-400": `var(${r.card})`,
    ...(flat ? { "--shadow-floating": "none" } : {}),
  } as React.CSSProperties;
}

function LeverPreview({ scope, full = false }: { scope: React.CSSProperties; full?: boolean }) {
  return (
    <div className={styles.leverPreview} style={scope}>
      <Panel className={styles.leverCard}>
        <Stat label="Monthly revenue" value="$48,210" delta="+12.4%" trend="up" />
        <Sparkline data={TREND} variant="area" tone="accent" width={200} height={40} label="Revenue, last ten months" />
        {full && <Input label="Search" value="" onValueChange={() => {}} placeholder="Find a report" iconLeft="search" size="compact" />}
        <div className={styles.buttonRow}>
          <Button label="Publish" variant="primary" size="compact" />
          <Button label="Preview" variant="secondary" size="compact" />
          <ToggleSwitch checked label="Live" size="compact" />
        </div>
      </Panel>
    </div>
  );
}

const SHAPE_ORDER = ["round", "soft", "square"];

/** The tile's picture: levers moving on their own, and a panel answering them. */
export function PlaygroundTileScene() {
  const step = useStep(LEVER_ACCENTS.length * SHAPE_ORDER.length, 1600);
  const accent = LEVER_ACCENTS[step % LEVER_ACCENTS.length].value;
  const shape = SHAPE_ORDER[Math.floor(step / LEVER_ACCENTS.length) % SHAPE_ORDER.length];
  return (
    <div className={styles.lever}>
      <div className={styles.leverRail}>
        <InspectorSection title="Look" defaultOpen>
          <InspectorSegmentedControl
            label="Accent"
            size="compact"
            value={accent}
            options={LEVER_ACCENTS.map((a) => ({ value: a.value, label: a.label }))}
          />
          <InspectorSegmentedControl
            label="Shape"
            size="compact"
            value={shape}
            options={SHAPE_ORDER.map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))}
          />
        </InspectorSection>
      </div>
      <LeverPreview scope={leverScope(accent, shape, false)} />
    </div>
  );
}

/** Working levers over a preview, scoped to the overlay. */
export function PlaygroundShowcase() {
  const [accent, setAccent] = useState("violet");
  const [shape, setShape] = useState("round");
  const [flat, setFlat] = useState(false);
  return (
    <div className={styles.lever}>
      <div className={styles.leverRail}>
        <InspectorSection title="Look" defaultOpen>
          <InspectorSegmentedControl
            label="Accent"
            size="compact"
            value={accent}
            onValueChange={setAccent}
            options={LEVER_ACCENTS.map((a) => ({ value: a.value, label: a.label }))}
          />
          <InspectorSegmentedControl
            label="Shape"
            size="compact"
            value={shape}
            onValueChange={setShape}
            options={SHAPE_ORDER.map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))}
          />
          <InspectorToggleSwitch label="Flat surfaces" checked={flat} onCheckedChange={setFlat} size="compact" />
        </InspectorSection>
      </div>
      <LeverPreview scope={leverScope(accent, shape, flat)} full />
    </div>
  );
}
