"use client";

/**
 * The generated building as a chat artifact: MepViewer drawn live in the
 * artifact panel. On top of it, the four trades as filter chips (each in
 * its own colour) and a menu of the clashes the generator's coordination
 * check found, grouped by storey; below, the picked element and the
 * floating toolbar for the camera and the storey. While the building generates, a status line says which
 * trade and storey is being routed.
 *
 * The chat drives it through the model store: a view command that arrives
 * before the viewer is up waits in the store and runs once it is.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "rift-ds/components/Button/Button";
import { Chip } from "rift-ds/components/Chip/Chip";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { DropdownMenu, type DropdownMenuEntry } from "rift-ds/components/DropdownMenu/DropdownMenu";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Toolbar, ToolbarSeparator } from "rift-ds/components/Toolbar/Toolbar";
import MepViewer, { type BuildProgress, type MepControls } from "./MepViewer";
import { DISCIPLINE_LABEL, LEVELS, MEP_DISCIPLINES, generateBuilding, levelName, type MepDiscipline } from "./_lib/building";
import { command, type CameraPreset, type ViewCommand, type ViewState } from "./_lib/view";
import styles from "./RacewayChatHome.module.css";

const CAMERA_SEGMENTS = [
  { value: "iso", label: "3D", icon: "view_in_ar" },
  { value: "top", label: "Plan", icon: "grid_view" },
  { value: "front", label: "Front", icon: "crop_portrait" },
  { value: "side", label: "Side", icon: "crop_landscape" },
];


const SWATCH: Record<MepDiscipline, string> = {
  mechanical: styles.swatchMechanical,
  plumbing: styles.swatchPlumbing,
  fire: styles.swatchFire,
  electrical: styles.swatchElectrical,
};

/** The stage width, in px, below which the toolbar's camera segments show icons only. */
const NARROW_STAGE = 760;

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/* ------------------------------------------------------------ the store */

/** What the chat and the artifact share: the live viewer, if any, and what it shows. */
export class ModelStore {
  run: ((command: ViewCommand) => void) | null = null;
  state: ViewState | null = null;
  private pending: ViewCommand[] = [];

  /** Runs a command now, or holds it until the viewer is ready. */
  send(next: ViewCommand) {
    if (this.run) this.run(next);
    else this.pending.push(next);
  }

  attach(run: (command: ViewCommand) => void) {
    this.run = run;
    for (const next of this.pending.splice(0)) run(next);
  }

  detach() {
    this.run = null;
    this.state = null;
  }

  setState(next: ViewState) {
    this.state = next;
  }

  get open() {
    return this.run !== null;
  }
}

/** The viewer's handle, and whether anything has moved the view yet, so a late resize never undoes it. */
class ViewHandles {
  controls: React.RefObject<MepControls | null> = { current: null };
  moved = false;

  /** Runs a view command from the toolbar, the menus or the chat; any of them counts as moving the view. */
  run = (next: ViewCommand) => {
    this.moved = true;
    this.controls.current?.run(next);
  };
}

export const ModelStoreContext = React.createContext<ModelStore | null>(null);

/* --------------------------------------------------------- the artifact */

export default function ModelArtifact() {
  const store = React.useContext(ModelStoreContext);
  /* Held in one stable object rather than refs, because the menus' items close over them. */
  const [handles] = useState(() => new ViewHandles());
  const { controls } = handles;
  const stageRef = useRef<HTMLDivElement>(null);
  const [build, setBuild] = useState<BuildProgress | null>(null);
  const [view, setView] = useState<ViewState | null>(null);
  const [zoom, setZoom] = useState(100);
  /* Under this width the camera segments drop to icons, their names kept as tips. */
  const [narrow, setNarrow] = useState(false);
  const ready = Boolean(build?.done);
  const { clashes, elements } = generateBuilding();

  const { run } = handles;

  const onState = useCallback(
    (next: ViewState) => {
      setView(next);
      store?.setState(next);
    },
    [store],
  );

  useEffect(() => {
    if (!store || !ready) return;
    store.attach(run);
    return () => store.detach();
  }, [store, ready, run]);

  /* The panel opens with a motion, so the first framing is made on a stage
     still growing; once it settles, frame the building again, unless the
     reader or the chat has already moved the view. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let width = stage.clientWidth;
    const observer = new ResizeObserver(() => {
      setNarrow(stage.clientWidth < NARROW_STAGE);
      if (handles.moved || stage.clientWidth === width) return;
      width = stage.clientWidth;
      controls.current?.run(command("frame_building"));
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [handles, controls]);

  const storeyItems: DropdownMenuEntry[] = [
    {
      label: "All storeys",
      description: "The whole building",
      selected: view?.level === null || view?.level === undefined,
      onClick: () => run(command("show_all_levels")),
    },
    { type: "separator" },
    ...Array.from({ length: LEVELS }, (_, i) => LEVELS - 1 - i).map((level) => {
      const onStorey = clashes.filter((c) => c.level === level).length;
      return {
        label: levelName(level),
        description: onStorey ? `${onStorey} ${onStorey === 1 ? "clash" : "clashes"}` : "No clashes",
        selected: view?.level === level,
        onClick: () => run(command("show_level", { level })),
      };
    }),
  ];

  const clashStoreys = [...new Set(clashes.map((c) => c.level))].sort((a, b) => a - b);
  const clashItems: DropdownMenuEntry[] = clashStoreys.map((level) => ({
    type: "group" as const,
    label: levelName(level),
    items: clashes
      .filter((c) => c.level === level)
      .map((clash) => ({
        label: `${clash.number}. ${clash.trades}`,
        description: clash.description,
        icon: "warning",
        selected: view?.focusedClash === clash.number,
        onClick: () => run(command("focus_clash", { clash: clash.number })),
      })),
  }));

  const counts = Object.fromEntries(MEP_DISCIPLINES.map((d) => [d, elements.filter((e) => e.discipline === d).length])) as Record<MepDiscipline, number>;

  return (
    <div ref={stageRef} className={styles.model}>
      <MepViewer onBuild={setBuild} onState={onState} onZoom={setZoom} controlsRef={controls} />

      {!ready && (
        <div className={styles.generating} aria-live="polite">
          <span className={styles.generatingText}>
            {build
              ? build.discipline === "architecture"
                ? "Laying out the building"
                : `Routing ${DISCIPLINE_LABEL[build.discipline].toLowerCase()} · ${levelName(build.level)}`
              : "Generating the building"}
          </span>
          <ProgressBar className={styles.generatingBar} value={Math.round((build?.share ?? 0) * 100)} size="compact" ariaLabel="Generation" />
        </div>
      )}

      <div className={styles.overlayTop}>
        {/* Filter chips, one per trade: pressed is shown, and the swatch is the trade's colour in the model. */}
        <div className={styles.legend} role="group" aria-label="Trades shown">
          {MEP_DISCIPLINES.map((d) => {
            const on = view?.disciplines[d] ?? true;
            return (
              <Chip
                key={d}
                size="compact"
                tone="neutral"
                selected={on}
                disabled={!ready}
                icon={<span className={`${styles.swatch} ${SWATCH[d]}`} aria-hidden="true" />}
                label={
                  <>
                    {DISCIPLINE_LABEL[d]} <span className={styles.legendCount}>{integer.format(counts[d])}</span>
                  </>
                }
                onClick={() => run(command(on ? "hide_discipline" : "show_discipline", { discipline: d }))}
              />
            );
          })}
        </div>

        {/* The clashes, grouped by storey: a menu scales to a building with hundreds. */}
        <DropdownMenu
          align="end"
          size="compact"
          items={clashItems}
          trigger={
            <Button
              variant="secondary"
              tone="neutral"
              size="compact"
              iconLeft="warning"
              iconRight="expand_more"
              label={`${integer.format(clashes.length)} clashes`}
              disabled={!ready}
            />
          }
        />
      </div>

      {view?.selected && (
        <div className={styles.picked} aria-live="polite">
          <span className={styles.pickedType}>
            {view.selected.discipline} · {view.selected.system} · {view.selected.level}
          </span>
          <span className={styles.pickedName}>{view.selected.name}</span>
        </div>
      )}

      <Toolbar className={styles.toolbar} label="View" variant="floating">
        <SegmentedControl
          size="compact"
          aria-label="Camera"
          showLabels={!narrow}
          segments={CAMERA_SEGMENTS}
          value={view?.preset ?? "iso"}
          onValueChange={(value) => run(command("camera", { preset: value as CameraPreset }))}
        />
        <ToolbarSeparator />
        <DropdownMenu
          size="compact"
          items={storeyItems}
          trigger={
            <Button
              variant="tertiary"
              tone="neutral"
              size="compact"
              iconLeft="stacks"
              iconRight="unfold_more"
              label={view?.level === null || view?.level === undefined ? "All storeys" : levelName(view.level)}
              aria-label="Storey"
              disabled={!ready}
            />
          }
        />
        <span className={styles.zoomGroup}>
          <ToolbarSeparator />
          <CircularButton icon="remove" variant="tertiary" size="compact" ariaLabel="Zoom out" disabled={!ready} onClick={() => controls.current?.zoomOut()} />
          <span className={styles.zoomValue} aria-live="polite">{integer.format(zoom)}%</span>
          <CircularButton icon="add" variant="tertiary" size="compact" ariaLabel="Zoom in" disabled={!ready} onClick={() => controls.current?.zoomIn()} />
        </span>
        <ToolbarSeparator />
        <CircularButton icon="fit_screen" variant="tertiary" size="compact" ariaLabel="Frame the building" disabled={!ready} onClick={() => run(command("frame_building"))} />
        <CircularButton
          icon={view?.architecture === false ? "domain_disabled" : "domain"}
          variant={view?.architecture === false ? "tertiary" : "secondary"}
          size="compact"
          ariaLabel="Show the architecture"
          aria-pressed={view?.architecture !== false}
          disabled={!ready}
          onClick={() => run(command("set_architecture", { visible: view?.architecture === false }))}
        />
      </Toolbar>
    </div>
  );
}
