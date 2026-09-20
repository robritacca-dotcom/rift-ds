import data from "./loops.json";

export interface LoopInfo {
  slug: string;
  /** Material Symbols icon name shown beside the loop's name */
  icon: string;
  /** What the loop does each run, in plain first-person prose */
  description: string;
  /** e.g. "Weekly, Monday mornings" */
  cadence: string;
  /** How a run starts, e.g. "Scheduled task; also runs on demand" */
  trigger: string;
  /** The run's steps, in order, as short chip labels */
  stages: string[];
  guardrails: string[];
  /** Skill slugs the loop is built on — each registered in .claude/skills/registry.json */
  skills: string[];
  status: "active" | "paused";
}

/**
 * Single source of truth for the recurring agent loops (/loops). Validated by
 * scripts/validate-loops.mjs — structure, skill references, and prose rules.
 * Never hardcode a loop count — import LOOP_COUNT instead.
 */
export const loops: LoopInfo[] = data.loops as LoopInfo[];

export const LOOP_COUNT = loops.length;
