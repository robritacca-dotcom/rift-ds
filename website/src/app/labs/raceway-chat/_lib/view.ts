/**
 * The chat-first lab's view vocabulary: what the assistant and the toolbar
 * can ask the generated building's view to do. The page, MepViewer and
 * /api/raceway-chat read this one file, so a command the route
 * can send is one the viewer knows how to run. Every command moves the
 * camera or shows and hides things; none edits the design.
 */

import { MEP_DISCIPLINES, type MepDiscipline } from "./building";

export const CAMERA_PRESETS = ["iso", "top", "front", "side"] as const;
export type CameraPreset = (typeof CAMERA_PRESETS)[number];

/** Where each preset looks from (the eye's direction from the target) and
    which way is up: the 3D viewer's camera and the board's stills share
    these, so a still is the view it opens. */
export const CAMERA_DIRECTION: Record<CameraPreset, { dir: [number, number, number]; up: [number, number, number] }> = {
  iso: { dir: [-1, 0.75, 1.1], up: [0, 1, 0] },
  top: { dir: [0, 1, 0], up: [0, 0, -1] },
  front: { dir: [0, 0.08, 1], up: [0, 1, 0] },
  side: { dir: [1, 0.08, 0], up: [0, 1, 0] },
};

/** The box the camera frames for a clash: this far either side of its centre, in metres. */
export const CLASH_FRAME = 6;

export const VIEW_ACTIONS = [
  "frame_building",
  "camera",
  "focus_clash",
  "show_discipline",
  "hide_discipline",
  "isolate_discipline",
  "show_all_disciplines",
  "show_level",
  "show_all_levels",
  "set_architecture",
  "clear_selection",
] as const;
export type ViewAction = (typeof VIEW_ACTIONS)[number];

export { MEP_DISCIPLINES };

export type ViewCommand = {
  action: ViewAction;
  /** For `camera`. */
  preset: CameraPreset | null;
  /** For `focus_clash`: the clash's number, from 1. */
  clash: number | null;
  /** For the discipline actions. */
  discipline: MepDiscipline | null;
  /** For `show_level`: 0 is the ground floor, the top number the roof. */
  level: number | null;
  /** For `set_architecture`. */
  visible: boolean | null;
};

/** A command with only the fields it uses set. */
export const command = (action: ViewAction, fields: Partial<Omit<ViewCommand, "action">> = {}): ViewCommand => ({
  action,
  preset: null,
  clash: null,
  discipline: null,
  level: null,
  visible: null,
  ...fields,
});

/** What the view shows right now, for the toolbar, the legend and the assistant. */
export type ViewState = {
  disciplines: Record<MepDiscipline, boolean>;
  level: number | null;
  architecture: boolean;
  preset: CameraPreset;
  selected: { name: string; kind: string; system: string; discipline: string; level: string } | null;
  focusedClash: number | null;
};
