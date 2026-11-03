import { Badge } from "rift-ds/components/Badge/Badge";
import type { TimelineItem } from "rift-ds/components/Timeline/Timeline";
import { SkillGuide, GuideCode } from "@/components/SkillGuide/SkillGuide";
import { forestMap } from "./maps";

const STEPS: TimelineItem[] = [
  {
    title: "Read two presets",
    description: (
      <>
        Open two existing entries in <GuideCode>presets.ts</GuideCode> before writing one.
        They are the worked examples of when an override is warranted.
      </>
    ),
  },
  {
    title: "Set every lever",
    meta: "Makes the preset entry",
    description: (
      <>
        One entry in <GuideCode>THEME_PRESETS</GuideCode>. The <GuideCode>ThemePreset</GuideCode>{" "}
        type is the checklist: the action key, the neutral tint, corners, density, type, motion,
        elevation, weights, icons, tones, faces and the six accents. Each one is a decision, even
        when it lands on the shipped position.
      </>
    ),
  },
  {
    title: "Write the tagline",
    meta: "Makes the tagline",
    description: (
      <>
        One sentence in <GuideCode>THEME_TAGLINES</GuideCode> on the theme’s character, shown
        on its specimen page. The gate fails a theme without one.
      </>
    ),
  },
  {
    title: "Place it in the row",
    description: (
      <>
        Add the id to <GuideCode>HUE_ORDER</GuideCode>. Every picker walks the order derived
        from it, so there is nothing else to wire. Making it the served theme is a separate call
        for the owner.
      </>
    ),
  },
  {
    title: "Generate the stylesheet",
    meta: "Makes the stylesheet",
    description:
      "The generator writes the preset’s data-brand stylesheet and refreshes the aggregate that imports them all. A face no preset has shipped before needs its font files fetched by hand first.",
  },
  {
    title: "Pass the gate",
    description: (
      <>
        Every action fill is checked against what components draw on it, resting, hover and
        pressed, in both themes. A failure moves the key or an override. Pinning a gap in{" "}
        <GuideCode>SANCTIONED_AA_GAPS</GuideCode> needs the owner’s sign-off.
      </>
    ),
  },
  {
    title: "Write its DESIGN.md",
    meta: "Makes the DESIGN.md",
    description:
      "A generator writes the theme’s own DESIGN.md, and a validator reads it back through the playground’s importer to prove it lands on the same levers.",
  },
  {
    title: "Look at it",
    description:
      "Pick the theme on the home page and walk a component page, a chart and the chat in light and dark, then its specimen page. The gate proves every token resolves. Only a person can say the look holds together.",
  },
];

const hand = <Badge variant="info" label="By hand" />;
const generated = <Badge variant="neutral" label="Generated" />;

export default function NewPresetSkillPage() {
  return (
    <SkillGuide
      slug="new-preset"
      tagline="A complete theme behind one attribute"
      intro={
        <>
          The <GuideCode>new-preset</GuideCode> skill adds a theme, not a tint: every lever holds
          a saved position, and the completeness gate refuses one that is missing or fails AA.
          Below are the steps, then one real preset traced from its entry to every place it can be
          picked.
        </>
      }
      steps={STEPS}
      example={{
        title: "Forest, end to end",
        body: (
          <>
            The <GuideCode>forest</GuideCode> preset is one entry in{" "}
            <GuideCode>website/src/lib/theme/presets.ts</GuideCode>. Its action key is dark enough
            that one key serves both themes, so it declares no separate dark key and moves a single
            role in dark mode, the up-trend colour. It passes the gate with nothing pinned.{" "}
            <GuideCode>presetOverrides</GuideCode> turns the entry into tokens for each theme, and
            the generators write <GuideCode>src/tokens/presets/forest.css</GuideCode> and{" "}
            <GuideCode>website/public/themes/forest/DESIGN.md</GuideCode> from it.
          </>
        ),
        map: forestMap,
        caption: "Declared once, checked before every build, offered wherever a theme is picked.",
      }}
      summary={{
        title: "By hand or generated",
        body: "Only the entry is written by hand, and the font files are fetched by hand. A hand edit to the stylesheet fails its byte compare on the next build.",
        caption: "Where each part of Forest comes from",
        columns: [
          { key: "part", header: "Part", rowHeader: true },
          { key: "from", header: "Comes from" },
          { key: "kind", header: "Kind" },
        ],
        rows: [
          { id: "entry", cells: { part: "Entry, tagline, place in the row", from: "presets.ts, edited by the agent", kind: hand } },
          { id: "fonts", cells: { part: "Font files", from: "sync-preset-fonts.mjs, run once for a new face", kind: hand } },
          { id: "css", cells: { part: "forest.css and presets.css", from: "generate-preset-stylesheets.mjs", kind: generated } },
          { id: "shadcn", cells: { part: "shadcn base item", from: "generate-shadcn-registry.mjs", kind: generated } },
          { id: "designmd", cells: { part: "Theme DESIGN.md", from: "generate-theme-design-md.mjs", kind: generated } },
          { id: "specimen", cells: { part: "Specimen page", from: "One route per id in the selector order", kind: generated } },
        ],
      }}
    />
  );
}
