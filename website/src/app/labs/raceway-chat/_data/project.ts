/**
 * The chat-first raceway lab's project: everything the welcome board shows
 * and the assistant knows before the model is open. The building and every
 * count in it come from the generator (../_lib/building.ts); the rest (the
 * people, the dates, the generation runs) is fictional. The page and
 * /api/raceway-chat both read this file, so the board and the
 * answers can never disagree.
 */

import { BUILDING, DISCIPLINE_LABEL, LEVELS, generateBuilding, levelName } from "../_lib/building";

export const PRODUCT_NAME = "Riser";
export const ASSISTANT_NAME = "Riser AI";
export const PROJECT = { name: BUILDING.name, client: "Northline Building Systems", today: "Mon, Nov 9 2026" };

/** The Revit model the project is synced from: the chat's standing context, named on the composer's chip. Fictional, like the rest. */
export const REVIT_MODEL = {
  file: "ASL_MEP_Central_R26.rvt",
  version: "Revit 2026",
  synced: "Nov 9, 8:40 AM",
  note: "the architect's central model, linked; the shell and grid the generator routes against",
};

/** The one artifact this lab makes: the generated building, drawn live by the page's renderer for `kind`. */
export const MODEL_ARTIFACT = {
  id: "alder-street-mep-r4",
  title: `${BUILDING.name}, full MEP`,
  kind: "raceway-mep-model",
  meta: "Generation 4 · all trades",
  icon: "view_in_ar",
};

/** The generation runs: the fourth is the one with a model behind it. */
export const RUNS = [
  { number: 4, label: "All trades, coordinated", status: "review" as const, when: "18m", note: "Every trade routed together" },
  { number: 3, label: "All trades, independent", status: "superseded" as const, when: "2d", note: "Each trade routed alone, 41 clashes" },
  { number: 2, label: "Mechanical and fire", status: "superseded" as const, when: "4d", note: "Electrical and plumbing left out" },
];

export type Task = { id: string; title: string; detail: string; due: string; tone: "warning" | "info" | "positive" | "neutral"; prompt: string };

export function tasks(): Task[] {
  const { clashes } = generateBuilding();
  return [
    { id: "clashes", title: `Resolve ${clashes.length} clashes`, detail: "Generation 4, across four trades", due: "Today", tone: "warning", prompt: "Walk me through the clashes" },
    { id: "riser", title: "Check the level 5 riser", detail: "Sprinkler main through SR-1", due: "Today", tone: "warning", prompt: "Show me the clash at the supply riser" },
    { id: "plenum", title: "Confirm the plenum stack", detail: "Ceiling at 3.0 m, slab at 4.2 m", due: "Nov 12", tone: "info", prompt: "How is the ceiling space stacked?" },
    { id: "takeoff", title: "Send the takeoff to estimating", detail: "After the clashes close", due: "Nov 13", tone: "neutral", prompt: "Summarize the takeoff by trade" },
  ];
}

export const MILESTONES = [
  { title: "MEP coordination meeting", when: "Nov 12" },
  { title: "Issue for construction", when: "Nov 20" },
  { title: "Level 1 rough-in", when: "Dec 1" },
];

/** The project and the generated building, written for the assistant's prompt. */
export function projectFacts() {
  const { elements, clashes, takeoff } = generateBuilding();
  const lines = [
    `Project: ${PROJECT.name}, a ${LEVELS}-storey ${BUILDING.use.toLowerCase()} building, ${BUILDING.footprint} on plan, for ${PROJECT.client}. Today is ${PROJECT.today}.`,
    `${PRODUCT_NAME} generated the full MEP design: mechanical (supply and return air, AHUs, a chiller, exhaust fans), plumbing (domestic cold and hot water, sanitary waste and vent), fire protection (a standpipe, cross mains, branch lines and heads) and electrical (busway, switchboard, panelboards, cable tray and conduit). ${elements.length.toLocaleString("en-US")} elements in all.`,
    "Storeys: the ground floor is 0, then levels 1 to 5, and the roof. Each storey is 4.2 m slab to slab, the ceiling at 3.0 m. The plenum is stacked by trade: duct mains lowest, then cable tray and conduit, then sprinkler pipe, then domestic water just under the slab, with waste in the plenum below.",
    "Risers run in the shaft east of the core: supply riser SR-1, return riser RR-1, cold and hot water risers, the waste and vent stacks and busway BW-1. The standpipe runs in the stair.",
    "Generation runs:",
    ...RUNS.map((r) => `- Generation ${r.number}, ${r.label} (${r.status}, ${r.when} ago): ${r.note}.`),
    "Takeoff for generation 4:",
    ...takeoff.map((t) => `- ${t.label}, ${t.elements} elements: ${t.items.map((i) => `${i.label} ${i.value}`).join(", ")}.`),
    `Clashes in generation 4, found by the coordination check (numbered as in the viewer):`,
    ...clashes.map((c) => `- Clash ${c.number}, ${levelName(c.level)}, ${c.trades}: ${c.description}.`),
    "Open tasks:",
    ...tasks().map((t) => `- ${t.title} (${t.detail}), due ${t.due}.`),
    "Milestones:",
    ...MILESTONES.map((m) => `- ${m.title}, ${m.when}.`),
    `The trades are named ${Object.values(DISCIPLINE_LABEL).slice(1).join(", ")}.`,
  ];
  return lines.join("\n");
}
