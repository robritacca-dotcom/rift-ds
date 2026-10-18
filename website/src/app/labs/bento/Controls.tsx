"use client";

/**
 * The bento's props panel: every BentoTile option as a live control, aimed
 * at one tile or all of them, plus the grid's row height so a fixed height
 * can be forced and the overflow fade seen. Built from the library's
 * Inspector family, like the playground's rails.
 */

import React, { useState } from "react";
import type { BentoTileProps } from "rift-ds/components/BentoTile/BentoTile";
import type { BentoTileArtPattern } from "rift-ds/components/BentoTile/BentoTileArt";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { InspectorSection } from "rift-ds/components/Inspector/InspectorSection";
import { InspectorDropdown } from "rift-ds/components/Inspector/InspectorDropdown";
import { InspectorSegmentedControl } from "rift-ds/components/Inspector/InspectorSegmentedControl";
import { InspectorSlider } from "rift-ds/components/Inspector/InspectorSlider";
import { InspectorToggleSwitch } from "rift-ds/components/Inspector/InspectorToggleSwitch";
import type { Banner } from "./content";
import styles from "./Bento.module.css";

/** What the panel can change on one tile. */
export interface TileSettings {
  background: NonNullable<BentoTileProps["background"]>;
  /** A pinned pair, or "auto" to rotate by position. */
  highlight: NonNullable<BentoTileProps["highlight"]> | "auto";
  shaderOpacity: number;
  align: NonNullable<BentoTileProps["align"]>;
  expandable: boolean;
  /** The safe-area inset, in px. */
  inset: number;
  /** How far an overflowing edge fades, in px. */
  fade: number;
}

/** What the panel can change on the grid. */
export interface GridSettings {
  /** The row height, in px. */
  rowHeight: number;
  /** Rows grow to fit their tallest tile; off, every tile is held to the row height. */
  rowsGrow: boolean;
}

/** A banner's starting settings: its content entry's dress, and the component's defaults. */
export function initialSettings(b: Banner): TileSettings {
  return {
    background: b.tile.background ?? "solid",
    highlight: "auto",
    shaderOpacity: 0.5,
    align: b.tile.align ?? "center",
    expandable: true,
    inset: 20,
    fade: 40,
  };
}

const ALL = "all";

/** The art set, in the order tiles rotate through it. */
export const ART_PATTERNS: BentoTileArtPattern[] = ["dots", "lines", "rings", "grid", "waves", "rays"];

export function Controls({
  banners,
  settings,
  onSettingsChange,
  grid,
  onGridChange,
  onReset,
}: {
  banners: Banner[];
  settings: Record<string, TileSettings>;
  onSettingsChange: (next: Record<string, TileSettings>) => void;
  grid: GridSettings;
  onGridChange: (next: GridSettings) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [target, setTarget] = useState<string>(ALL);

  const ids = target === ALL ? banners.map((b) => b.id) : [target];
  // With every tile targeted, the controls show the first tile's values.
  const shown = settings[ids[0]];

  function set<K extends keyof TileSettings>(key: K, value: TileSettings[K]) {
    const next = { ...settings };
    for (const id of ids) next[id] = { ...next[id], [key]: value };
    onSettingsChange(next);
  }

  if (!open) {
    return (
      <div className={styles.controlsDock}>
        <CircularButton icon="tune" ariaLabel="Show props" variant="secondary" onClick={() => setOpen(true)} />
      </div>
    );
  }

  return (
    <aside className={styles.controls} aria-label="BentoTile props">
      <div className={styles.controlsHead}>
        <strong>BentoTile props</strong>
        <span className={styles.controlsActions}>
          <CircularButton icon="restart_alt" ariaLabel="Reset" variant="tertiary" size="compact" onClick={onReset} />
          <CircularButton icon="close" ariaLabel="Hide props" variant="tertiary" size="compact" onClick={() => setOpen(false)} />
        </span>
      </div>

      <div className={styles.controlsBody}>
        <InspectorDropdown
          label="Tile"
          value={target}
          onValueChange={setTarget}
          options={[{ value: ALL, label: "All tiles" }, ...banners.map((b) => ({ value: b.id, label: b.title }))]}
        />

        <InspectorSection title="Background" defaultOpen>
          <InspectorSegmentedControl
            label="background"
            value={shown.background}
            onValueChange={(v) => set("background", v as TileSettings["background"])}
            options={[
              { value: "solid", label: "Solid" },
              { value: "shader", label: "Shader" },
              { value: "transparent", label: "None" },
            ]}
          />
          <InspectorDropdown
            label="highlight"
            value={String(shown.highlight)}
            disabled={shown.background !== "shader"}
            onValueChange={(v) => set("highlight", v === "auto" ? "auto" : (Number(v) as TileSettings["highlight"]))}
            options={[
              { value: "auto", label: "Auto, by position" },
              ...ART_PATTERNS.map((p, i) => ({ value: String(i + 1), label: `Pair ${i + 1}: ${p}` })),
            ]}
          />
          <InspectorSlider
            label="Pair opacity"
            value={shown.shaderOpacity}
            min={0}
            max={1}
            step={0.05}
            format={(v) => `${Math.round(v * 100)}%`}
            onValueChange={(v) => set("shaderOpacity", v)}
          />
        </InspectorSection>

        <InspectorSection title="Content" defaultOpen>
          <InspectorSegmentedControl
            label="align"
            value={shown.align}
            onValueChange={(v) => set("align", v as TileSettings["align"])}
            options={[
              { value: "start", label: "Start" },
              { value: "center", label: "Center" },
              { value: "end", label: "End" },
            ]}
          />
          <InspectorSlider
            label="Inset"
            value={shown.inset}
            min={0}
            max={48}
            step={4}
            format={(v) => `${v}px`}
            onValueChange={(v) => set("inset", v)}
          />
          <InspectorSlider
            label="Fade"
            value={shown.fade}
            min={0}
            max={120}
            step={4}
            format={(v) => `${v}px`}
            onValueChange={(v) => set("fade", v)}
          />
        </InspectorSection>

        <InspectorSection title="Overlay" defaultOpen>
          <InspectorToggleSwitch
            label="expandedContent"
            checked={shown.expandable}
            onCheckedChange={(v) => set("expandable", v)}
          />
        </InspectorSection>

        <InspectorSection title="Grid" defaultOpen>
          <InspectorSlider
            label="Row height"
            value={grid.rowHeight}
            min={280}
            max={800}
            step={10}
            format={(v) => `${v}px`}
            onValueChange={(v) => onGridChange({ ...grid, rowHeight: v })}
          />
          <InspectorToggleSwitch
            label="Rows grow to fit"
            checked={grid.rowsGrow}
            onCheckedChange={(v) => onGridChange({ ...grid, rowsGrow: v })}
          />
        </InspectorSection>
      </div>
    </aside>
  );
}
