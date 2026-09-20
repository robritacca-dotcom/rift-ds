"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import type { ShaderFieldStatus } from "@robr0/design-system/components/ShaderField/ShaderField";
import {
  shaderBackground,
  type BackgroundMode,
  type ShaderParams,
} from "@/data/shader-background";
import styles from "./ShaderTuner.module.css";

type NumericKey = keyof ShaderParams;

/* Ranges are mirrored by PARAM_RANGES in scripts/validate-shader-background.mjs,
   which fails the build on a config value outside them — so a look dialled in
   here can always be pasted back into the JSON. */
const SLIDERS: {
  key: NumericKey;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "intensity", label: "Intensity", min: 0.1, max: 1, step: 0.02 },
  { key: "warp", label: "Warp", min: 0, max: 0.5, step: 0.01 },
  { key: "streak", label: "Streak", min: 0, max: 1, step: 0.02 },
  { key: "react", label: "React", min: 0, max: 1, step: 0.02 },
  { key: "grain", label: "Grain", min: 0, max: 0.4, step: 0.01 },
  { key: "scale", label: "Scale", min: 0.5, max: 6, step: 0.1 },
  { key: "speed", label: "Speed", min: 0, max: 4, step: 0.1 },
  { key: "crop", label: "Crop", min: 0, max: 1, step: 0.05 },
];

interface FrameStats {
  fps: number;
  p95: number;
  over32: number;
}

/** Main-thread frame meter: rolling one-second window of rAF deltas. This
 *  measures what both modes cost the page, so shader vs CSS is a fair A/B. */
function useFrameStats(): FrameStats {
  const [stats, setStats] = useState<FrameStats>({ fps: 0, p95: 0, over32: 0 });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let windowStart = last;
    const deltas: number[] = [];

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      deltas.push(now - last);
      last = now;
      if (now - windowStart >= 1000) {
        const sorted = [...deltas].sort((a, b) => a - b);
        const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
        setStats({
          fps: Math.round((deltas.length * 1000) / (now - windowStart)),
          p95: Math.round(p95 * 10) / 10,
          over32: deltas.filter((d) => d > 32).length,
        });
        deltas.length = 0;
        windowStart = now;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return stats;
}

function SliderRow({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className={styles.row}>
      <span className={styles.rowLabel}>
        {label}
        <span className={styles.rowValue}>{value}</span>
      </span>
      <input
        className={styles.slider}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

export interface ShaderTunerProps {
  params: ShaderParams;
  onParamsChange: (next: ShaderParams) => void;
  mode: BackgroundMode;
  onModeChange: (next: BackgroundMode) => void;
  /** How ShaderField has resolved: still coming up, drawing, or fallen back. */
  status: ShaderFieldStatus;
}

/**
 * Dev-only tuning panel, summoned with `?tune=1` on any page.
 *
 * It never ships: BlurBackground renders it behind a NODE_ENV check and a
 * dynamic import, so the module is eliminated from the production bundle.
 *
 * Settings are deliberately not persisted. Hydrating them from storage would
 * diverge from the server-rendered markup, and the config JSON is the real
 * home for a settled look — the snippet at the bottom of the panel is how a
 * tuned look leaves here and gets pasted into it.
 */
export default function ShaderTuner({
  params,
  onParamsChange,
  mode,
  onModeChange,
  status,
}: ShaderTunerProps) {
  const [open, setOpen] = useState(true);
  const stats = useFrameStats();

  const set = (key: NumericKey) => (v: number) =>
    onParamsChange({ ...params, [key]: v });

  const dirty = SLIDERS.some(
    (s) => params[s.key] !== shaderBackground.params[s.key]
  );

  const snippet = `"params": {\n${SLIDERS.map(
    (s) => `  "${s.key}": ${params[s.key]}`
  ).join(",\n")}\n}`;

  return (
    <aside
      className={
        open ? styles.panel : `${styles.panel} ${styles.panelCollapsed}`
      }
      aria-label="Shader controls"
    >
      <div className={styles.panelHead}>
        <p className={styles.panelTitle}>Shader tuner</p>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Hide" : "Tune"}
        </button>
      </div>

      {open && (
        <div className={styles.body}>
          <div className={styles.modeRow}>
            <button
              type="button"
              className={
                mode === "shader"
                  ? `${styles.modeButton} ${styles.modeButtonActive}`
                  : styles.modeButton
              }
              onClick={() => onModeChange("shader")}
            >
              Shader
            </button>
            <button
              type="button"
              className={
                mode === "css"
                  ? `${styles.modeButton} ${styles.modeButtonActive}`
                  : styles.modeButton
              }
              onClick={() => onModeChange("css")}
            >
              CSS blobs
            </button>
          </div>

          {mode === "shader" && status === "unavailable" && (
            <p className={styles.fallbackNote}>
              WebGL2 unavailable — the CSS blobs are carrying the background.
              This is the fallback path working as intended.
            </p>
          )}

          {SLIDERS.map((s) => (
            <SliderRow
              key={s.key}
              label={s.label}
              min={s.min}
              max={s.max}
              step={s.step}
              value={params[s.key]}
              onChange={set(s.key)}
            />
          ))}

          <div className={styles.modeRow}>
            <button
              type="button"
              className={styles.modeButton}
              onClick={() => onParamsChange({ ...shaderBackground.params })}
              disabled={!dirty}
            >
              Reset to config
            </button>
          </div>

          <ThemeToggle />

          <div className={styles.stats}>
            <span>
              {stats.fps} fps · p95 {stats.p95}ms
            </span>
            <span>frames &gt;32ms: {stats.over32}/s</span>
            <span>
              mode:{" "}
              {mode === "css"
                ? "css blobs"
                : status === "active"
                  ? "shader (webgl2)"
                  : status === "unavailable"
                    ? "shader (fell back)"
                    : "shader (starting)"}
            </span>
          </div>

          {/* Click to select, then paste into shader-background.json. */}
          <pre className={styles.snippet}>{snippet}</pre>
        </div>
      )}
    </aside>
  );
}
