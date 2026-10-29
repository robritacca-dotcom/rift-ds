"use client";

/**
 * What the home bento draws: a small scene inside each tile, and a larger,
 * working showcase inside each tile's overlay. Everything is a library
 * component as shipped. The people and figures are fictional demo data;
 * every count is a registry import.
 */

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { AvatarGroup } from "rift-ds/components/AvatarGroup/AvatarGroup";
import { demoAvatar1, demoAvatar2, demoAvatar3 } from "rift-ds/components/Avatar/demoAvatars";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Button } from "rift-ds/components/Button/Button";
import { Checkbox } from "rift-ds/components/Checkbox/Checkbox";
import { Chip } from "rift-ds/components/Chip/Chip";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Input } from "rift-ds/components/Input/Input";
import { Panel } from "rift-ds/components/Panel/Panel";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import { Stat } from "rift-ds/components/Stat/Stat";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
import { ToolCall } from "rift-ds/components/ToolCall/ToolCall";
import { AreaChart } from "rift-ds/components/Chart/AreaChart";
import { PACKAGE_NAME, REPOSITORY_URL, SITE_URL, BIN_NAME } from "@/config/brand.generated";
import { MCP_CLIENTS } from "@/lib/mcp-clients";
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
  const [email, setEmail] = useState("ada@northwind.example");
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
            aria-label="Range"
            value={range}
            onValueChange={setRange}
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
        const status = i < at ? "success" : i === at ? (step % 2 ? "success" : "running") : "pending";
        return (
          <div key={name} className={styles.revealed} data-on={i <= at}>
            <ToolCall name={name} status={status} duration={status === "success" ? `${120 + i * 40}ms` : undefined} />
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
        aria-label="MCP client"
        value={client}
        onValueChange={setClient}
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
  return (
    <CodeBlock
      className={styles.installLines}
      code={INSTALL_PATHS.map((p) => p.code).join("\n")}
      language="bash"
      showCopy={false}
    />
  );
}

/** One install path at a time, each copyable. */
export function InstallShowcase() {
  const [path, setPath] = useState(INSTALL_PATHS[0].id);
  const current = INSTALL_PATHS.find((p) => p.id === path) ?? INSTALL_PATHS[0];
  return (
    <div className={styles.snippets}>
      <Tabs
        size="compact"
        aria-label="Install path"
        value={path}
        onValueChange={setPath}
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
