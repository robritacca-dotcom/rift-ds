"use client";

/**
 * The generated building in 3D: every element of _lib/building.ts drawn as
 * an instance of one unit box or one unit cylinder in a xeokit SceneModel,
 * so nothing is downloaded and nothing comes from a real project. The
 * architecture is x-rayed to its edges; each MEP trade is opaque in its own
 * chart series colour (mechanical the first, plumbing the second, fire
 * protection the third, electrical the fourth), the clashing pairs carry
 * the warning colour, and a pick the info one. Every colour is read from
 * the live cascade and repainted when the theme or the mode changes.
 *
 * On first draw the building generates in front of the reader: the shell,
 * then each trade storey by storey, one group a frame, reported through
 * `onBuild` so the screen can say what is being routed.
 */

import React, { useEffect, useRef } from "react";
import type { Entity, NavCubePlugin, PickResult, Viewer } from "@xeokit/xeokit-sdk";
import { DISCIPLINE_LABEL, FLOOR, LEVELS, MEP_DISCIPLINES, generateBuilding, levelName, type Discipline, type Element, type MepDiscipline } from "./_lib/building";
import { CAMERA_DIRECTION, CLASH_FRAME, type CameraPreset, type ViewCommand, type ViewState } from "./_lib/view";
import styles from "./RacewayChatHome.module.css";

export type BuildProgress = { done: boolean; discipline: Discipline; level: number; share: number };

export interface MepControls {
  zoomIn(): void;
  zoomOut(): void;
  run(command: ViewCommand): void;
}

type Props = {
  onBuild: (progress: BuildProgress) => void;
  onState: (state: ViewState) => void;
  onZoom: (percent: number) => void;
  controlsRef: React.RefObject<MepControls | null>;
};

type Sdk = typeof import("@xeokit/xeokit-sdk");
type Rgb = [number, number, number];
/** What the geometry builders return, which their published types leave out. */
type Arrays = { positions: number[]; normals: number[]; indices: number[] };

const COLOUR_TOKEN: Record<MepDiscipline, string> = {
  mechanical: "--color-chart-series-1",
  plumbing: "--color-chart-series-2",
  fire: "--color-chart-series-3",
  electrical: "--color-chart-series-4",
};

const ZOOM_STEP = 0.18;
const FIT_FOV = 48;
/** How many frames each generated group holds before the next appears. */
const FRAMES_PER_GROUP = 2;
const THEME_ATTRIBUTES = ["data-theme", "data-brand", "style", "class"];

function readToken(host: HTMLElement, token: string): Rgb {
  const probe = document.createElement("span");
  probe.style.display = "none";
  probe.style.color = `var(${token})`;
  host.appendChild(probe);
  const dot = document.createElement("canvas");
  dot.width = 1;
  dot.height = 1;
  const ctx = dot.getContext("2d", { willReadFrequently: true });
  let rgb: Rgb = [128, 128, 128];
  if (ctx) {
    ctx.fillStyle = getComputedStyle(probe).color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    rgb = [r, g, b];
  }
  probe.remove();
  return rgb;
}

const unit = (c: Rgb) => c.map((v) => v / 255) as Rgb;
const hex = (c: Rgb) => `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
const distance = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** A riser runs through every storey, so it stays in any one-storey view. */
const isRiser = (e: Element) => e.shape !== "box" ? e.axis === "y" && e.length > FLOOR : e.size[1] > FLOOR;

export default function MepViewer({ onBuild, onState, onZoom, controlsRef }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cubeRef = useRef<HTMLCanvasElement>(null);
  const callbacks = useRef({ onBuild, onState, onZoom });
  useEffect(() => {
    callbacks.current = { onBuild, onState, onZoom };
  }, [onBuild, onState, onZoom]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const cube = cubeRef.current;
    if (!host || !canvas || !cube) return;
    let disposed = false;
    let viewer: Viewer | null = null;
    let navCube: NavCubePlugin | null = null;
    let themeObserver: MutationObserver | null = null;
    let raf = 0;

    (async () => {
      const sdk = (await import("@xeokit/xeokit-sdk")) as Sdk;
      if (disposed) return;
      const building = generateBuilding();
      viewer = new sdk.Viewer({ canvasElement: canvas, transparent: true, saoEnabled: false, antialias: true });
      const v = viewer;
      const { scene, camera, cameraControl, cameraFlight } = v;
      cameraControl.navMode = "orbit";
      cameraControl.followPointer = true;
      cameraControl.smartPivot = true;
      cameraControl.doublePickFlyTo = false;

      /* One unit box and one unit cylinder (along Y), instanced for every element. */
      const model = new sdk.SceneModel(scene, { id: "mep-building", isModel: true, edges: true } as never) as InstanceType<Sdk["SceneModel"]>;
      const boxGeometry = sdk.buildBoxGeometry({ xSize: 0.5, ySize: 0.5, zSize: 0.5 }) as unknown as Arrays;
      const tubeGeometry = sdk.buildCylinderGeometry({ radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 10, heightSegments: 1, openEnded: false }) as unknown as Arrays;
      model.createGeometry({ id: "unit-box", primitive: "triangles", positions: boxGeometry.positions, normals: boxGeometry.normals, indices: boxGeometry.indices } as never);
      model.createGeometry({ id: "unit-tube", primitive: "triangles", positions: tubeGeometry.positions, normals: tubeGeometry.normals, indices: tubeGeometry.indices } as never);
      for (const e of building.elements) {
        const tube = e.shape === "cylinder";
        const rotation = tube ? (e.axis === "x" ? [0, 0, 90] : e.axis === "z" ? [90, 0, 0] : [0, 0, 0]) : [0, 0, 0];
        model.createMesh({ id: `${e.id}-mesh`, geometryId: tube ? "unit-tube" : "unit-box", position: e.centre, scale: e.size, rotation } as never);
        model.createEntity({ id: e.id, meshIds: [`${e.id}-mesh`], isObject: true } as never);
      }
      model.finalize();
      if (disposed) return;

      const ids = (filter: (e: Element) => boolean) => building.elements.filter(filter).map((e) => e.id);
      const architectureIds = ids((e) => e.discipline === "architecture");
      const tradeIds = Object.fromEntries(MEP_DISCIPLINES.map((d) => [d, ids((e) => e.discipline === d)])) as Record<MepDiscipline, string[]>;
      const clashIds = [...new Set(building.clashes.flatMap((c) => [c.a, c.b]))];

      /* ----------------------------------------------------------- paint */
      const paint = () => {
        const wire = unit(readToken(host, "--color-text-tertiary"));
        scene.xrayMaterial.fillColor = wire;
        scene.xrayMaterial.fillAlpha = 0.025;
        scene.xrayMaterial.edgeColor = wire;
        scene.xrayMaterial.edgeAlpha = 0.35;
        scene.edgeMaterial.edgeColor = wire;
        scene.edgeMaterial.edgeAlpha = 0.25;
        const flag = unit(readToken(host, "--color-status-warning-icon"));
        scene.highlightMaterial.fillColor = flag;
        scene.highlightMaterial.fillAlpha = 1;
        scene.highlightMaterial.edgeColor = flag;
        scene.highlightMaterial.edgeAlpha = 1;
        const pick = unit(readToken(host, "--color-status-info-icon"));
        scene.selectedMaterial.fillColor = pick;
        scene.selectedMaterial.fillAlpha = 1;
        scene.selectedMaterial.edgeColor = pick;
        scene.selectedMaterial.edgeAlpha = 1;
        for (const d of MEP_DISCIPLINES) scene.setObjectsColorized(tradeIds[d], unit(readToken(host, COLOUR_TOKEN[d])));
        navCube?.destroy();
        navCube = new sdk.NavCubePlugin(v, {
          canvasElement: cube,
          visible: true,
          shadowVisible: false,
          color: hex(readToken(host, "--color-bg-container-secondary")),
          textColor: hex(readToken(host, "--color-text-primary")),
          hoverColor: hex(readToken(host, "--color-chart-series-1")),
          cameraFly: true,
          cameraFitFOV: 45,
          fitVisible: true,
        });
      };

      scene.setObjectsVisible(scene.objectIds, false);
      scene.setObjectsXRayed(architectureIds, true);
      scene.setObjectsEdges(Object.values(tradeIds).flat(), false);
      paint();
      let frame = 0;
      themeObserver = new MutationObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(paint);
      });
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: THEME_ATTRIBUTES });

      /* ---------------------------------------------------------- camera */
      const buildingAabb = [0, 0, 0, 63, (LEVELS + 1) * FLOOR, 36];
      let preset: CameraPreset = "iso";
      let framed = buildingAabb;
      const flyTo = (aabb: number[], to: CameraPreset, jump = false) => {
        framed = aabb;
        const look = [(aabb[0] + aabb[3]) / 2, (aabb[1] + aabb[4]) / 2, (aabb[2] + aabb[5]) / 2];
        const span = Math.max(aabb[3] - aabb[0], aabb[4] - aabb[1], aabb[5] - aabb[2]) || 1;
        const { dir, up } = CAMERA_DIRECTION[to];
        const n = Math.hypot(dir[0], dir[1], dir[2]);
        const eye = look.map((c, i) => c + (dir[i] / n) * span * 1.5);
        if (jump) {
          camera.look = look;
          camera.eye = eye;
          camera.up = up;
          cameraFlight.jumpTo({ aabb, fitFOV: FIT_FOV });
        } else {
          cameraFlight.flyTo({ eye, look, up }, () => cameraFlight.flyTo({ aabb, fitFOV: FIT_FOV }));
        }
      };
      flyTo(buildingAabb, "iso", true);
      const homeDistance = distance(camera.eye, camera.look);
      camera.on("viewMatrix", () => callbacks.current.onZoom(Math.round((homeDistance / distance(camera.eye, camera.look)) * 100)));

      /* ------------------------------------------------------ visibility */
      const state: ViewState = {
        disciplines: { mechanical: true, plumbing: true, fire: true, electrical: true },
        level: null,
        architecture: true,
        preset: "iso",
        selected: null,
        focusedClash: null,
      };
      const report = () => callbacks.current.onState({ ...state, disciplines: { ...state.disciplines } });

      const applyVisibility = () => {
        const shown: string[] = [];
        const hidden: string[] = [];
        for (const e of building.elements) {
          const trade = e.discipline === "architecture" ? state.architecture : state.disciplines[e.discipline];
          const storey = state.level === null || e.level === state.level || (e.discipline !== "architecture" && isRiser(e)) || (e.discipline === "architecture" && e.kind === "Slab" && e.level === state.level);
          (trade && storey ? shown : hidden).push(e.id);
        }
        scene.setObjectsVisible(hidden, false);
        scene.setObjectsVisible(shown, true);
      };

      let selected: Entity | null = null;
      const select = (id: string | null) => {
        if (selected) selected.selected = false;
        selected = id ? (scene.objects[id] ?? null) : null;
        const e = id ? building.byId.get(id) : undefined;
        if (selected) selected.selected = true;
        state.selected = e ? { name: e.name, kind: e.kind, system: e.system, discipline: DISCIPLINE_LABEL[e.discipline], level: isRiser(e) ? "Every storey" : levelName(e.level) } : null;
        if (!id) state.focusedClash = null;
        report();
      };
      cameraControl.on("picked", (result: PickResult) => select(result.entity ? String(result.entity.id) : null));
      cameraControl.on("pickedNothing", () => select(null));

      const levelAabb = (level: number) => [0, level * FLOOR, 0, 63, level * FLOOR + FLOOR, 36];

      controlsRef.current = {
        zoomIn: () => camera.zoom(-distance(camera.eye, camera.look) * ZOOM_STEP),
        zoomOut: () => camera.zoom(distance(camera.eye, camera.look) * ZOOM_STEP),
        run: (cmd) => {
          switch (cmd.action) {
            case "frame_building":
              flyTo(state.level === null ? buildingAabb : levelAabb(state.level), preset);
              break;
            case "camera":
              preset = cmd.preset ?? "iso";
              state.preset = preset;
              flyTo(framed, preset);
              break;
            case "focus_clash": {
              const clash = building.clashes.find((c) => c.number === cmd.clash);
              if (!clash) return;
              if (state.level !== null && state.level !== clash.level) state.level = clash.level;
              for (const id of [clash.a, clash.b]) {
                const d = building.byId.get(id)?.discipline;
                if (d && d !== "architecture") state.disciplines[d] = true;
              }
              applyVisibility();
              select(clash.a);
              state.focusedClash = clash.number;
              const pad = CLASH_FRAME;
              const [x, y, z] = clash.at;
              flyTo([x - pad, y - pad, z - pad, x + pad, y + pad, z + pad], preset === "top" ? "iso" : preset);
              break;
            }
            case "show_discipline":
            case "hide_discipline":
              if (cmd.discipline) state.disciplines[cmd.discipline] = cmd.action === "show_discipline";
              applyVisibility();
              break;
            case "isolate_discipline":
              for (const d of MEP_DISCIPLINES) state.disciplines[d] = d === cmd.discipline;
              applyVisibility();
              break;
            case "show_all_disciplines":
              for (const d of MEP_DISCIPLINES) state.disciplines[d] = true;
              applyVisibility();
              break;
            case "show_level":
              state.level = cmd.level === null ? null : Math.max(0, Math.min(LEVELS - 1, cmd.level));
              applyVisibility();
              flyTo(state.level === null ? buildingAabb : levelAabb(state.level), preset);
              break;
            case "show_all_levels":
              state.level = null;
              applyVisibility();
              flyTo(buildingAabb, preset);
              break;
            case "set_architecture":
              state.architecture = cmd.visible ?? true;
              applyVisibility();
              break;
            case "clear_selection":
              select(null);
              return;
          }
          report();
        },
      };

      /* -------------------------------------------------- the generation */
      const groups: { discipline: Discipline; level: number; ids: string[] }[] = [];
      groups.push({ discipline: "architecture", level: LEVELS, ids: architectureIds });
      for (const d of MEP_DISCIPLINES) {
        for (let level = 0; level <= LEVELS; level++) {
          const group = building.elements.filter((e) => e.discipline === d && e.level === level).map((e) => e.id);
          if (group.length) groups.push({ discipline: d, level, ids: group });
        }
      }
      let step = 0;
      let tick = 0;
      const grow = () => {
        if (disposed) return;
        if (tick++ % FRAMES_PER_GROUP === 0) {
          const group = groups[step++];
          scene.setObjectsVisible(group.ids, true);
          const done = step >= groups.length;
          callbacks.current.onBuild({ done, discipline: group.discipline, level: group.level, share: step / groups.length });
          if (done) {
            scene.setObjectsHighlighted(clashIds, true);
            report();
            return;
          }
        }
        raf = requestAnimationFrame(grow);
      };
      raf = requestAnimationFrame(grow);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      themeObserver?.disconnect();
      controlsRef.current = null;
      viewer?.destroy();
      viewer = null;
    };
  }, [controlsRef]);

  return (
    <div ref={hostRef} className={styles.viewer}>
      <canvas ref={canvasRef} className={styles.canvas} aria-label="The generated building, with its mechanical, plumbing, fire protection and electrical systems in colour" role="img" />
      <canvas ref={cubeRef} className={styles.cube} aria-label="View cube: click a face to turn the model" role="img" />
    </div>
  );
}

