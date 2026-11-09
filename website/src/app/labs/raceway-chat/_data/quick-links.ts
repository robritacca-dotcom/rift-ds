/**
 * The board's ways into the model: each is a preview, the line the reader
 * sends, and the view the model opens on. The page's transport answers
 * these lines itself (RacewayChatHome.tsx), opening the artifact and
 * running the commands with no model call, so a quick link is instant and
 * the thread still records it. Counts and names come from the generator.
 */

import { DISCIPLINE_LABEL, generateBuilding, levelName } from "../_lib/building";
import type { PreviewSpec } from "../_lib/preview";
import { command, type ViewCommand } from "../_lib/view";

export type QuickLink = {
  id: string;
  label: string;
  meta: string;
  /** What the reader sends, and the key the transport answers. */
  prompt: string;
  preview: PreviewSpec;
  commands: ViewCommand[];
  reply: string;
};

const plural = (n: number, one: string) => `${n} ${n === 1 ? one : `${one}es`}`;

export function quickLinks(): { hero: QuickLink; links: QuickLink[] } {
  const { clashes, elements } = generateBuilding();
  const onLevel = (level: number) => clashes.filter((c) => c.level === level).length;
  const mechanical = elements.filter((e) => e.discipline === "mechanical").length;
  /* The clash the board's first thread is about: the highest, on the riser. */
  const flagged = clashes[clashes.length - 1];

  const hero: QuickLink = {
    id: "building",
    label: "Open the model",
    meta: "Every trade · 3D",
    prompt: "Open the model",
    preview: { view: "iso" },
    commands: [command("frame_building")],
    reply: `The model is open with every trade on show, and the ${plural(clashes.length, "clash")} flagged in amber.`,
  };

  const links: QuickLink[] = [
    {
      id: "level-3",
      label: "Level 3 plan",
      meta: plural(onLevel(3), "clash"),
      prompt: "Open the model on the level 3 plan",
      preview: { view: "top", level: 3 },
      commands: [command("show_level", { level: 3 }), command("camera", { preset: "top" })],
      reply: `Here is level 3 in plan, every trade on show, with its ${plural(onLevel(3), "clash")} flagged.`,
    },
    {
      id: "mechanical",
      label: `${DISCIPLINE_LABEL.mechanical} only`,
      meta: `${new Intl.NumberFormat("en-US").format(mechanical)} elements`,
      prompt: "Open the model with mechanical only",
      preview: { view: "iso", disciplines: ["mechanical"] },
      commands: [command("isolate_discipline", { discipline: "mechanical" })],
      reply: "The model is open with mechanical alone: the ductwork, the VAV boxes and the plant on the roof.",
    },
    {
      id: "clash",
      label: `Clash ${flagged.number}`,
      meta: levelName(flagged.level),
      prompt: `Open the model at clash ${flagged.number}`,
      preview: { view: "iso", level: flagged.level, clash: flagged.number, framedOnClash: true },
      /* Its storey alone, then the clash framed and selected: the still's look. */
      commands: [command("show_level", { level: flagged.level }), command("focus_clash", { clash: flagged.number })],
      reply: `Here is clash ${flagged.number} on ${levelName(flagged.level).toLowerCase()}, selected. ${flagged.description}.`,
    },
    {
      id: "front",
      label: "Front elevation",
      meta: "Every storey",
      prompt: "Open the model on the front elevation",
      preview: { view: "front" },
      commands: [command("camera", { preset: "front" })],
      reply: "The model is open on the front elevation, every storey and every trade on show.",
    },
  ];

  return { hero, links };
}

/** The quick link a line was sent from, if it was. */
export function quickLinkFor(prompt: string): QuickLink | undefined {
  const { hero, links } = quickLinks();
  return [hero, ...links].find((link) => link.prompt === prompt.trim());
}
