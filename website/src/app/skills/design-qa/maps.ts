import type { ArchMap } from "@/components/ArchitectureMap/types";

const NEXTJS_LOGO = { logo: "/logos/nextjs black.svg", logoDark: "/logos/nextjs white.svg" };

/**
 * One design-qa pass over Button, from its stories to the report. The top
 * row renders, looks and judges; the bottom lane is the polish loop (accent
 * edges), which runs under the judging zone and back up into the crops.
 */
export const buttonQaMap: ArchMap = {
  id: "button-design-qa",
  title: "Button, one pass",
  label:
    "A design-qa pass over Button renders its stories and showcase page in both themes, magnifies the details, compares the same crops with its nearest siblings, and sorts each finding. Defects and polish loop through a fix and a fresh capture until a pass finds nothing new; direction calls go to the report.",
  width: 1900,
  height: 1000,
  nodes: [
    /* 1 · Render */
    { id: "z-render", x: 60, y: 120, w: 400, h: 560, kind: "zone", title: "1 · Render", sub: "the real thing, never a memory" },
    { id: "stories", x: 95, y: 200, w: 330, h: 76, title: "Button stories", sub: "src/components/Button/Button.stories.ts", icon: "code", chip: "info" },
    { id: "storybook", x: 95, y: 310, w: 330, h: 76, title: "Storybook", sub: "storybook in .claude/launch.json", logo: "/logos/storybook.svg" },
    { id: "themes", x: 95, y: 420, w: 330, h: 76, title: "Both themes", sub: "data-theme light, then dark", icon: "palette", chip: "info" },
    { id: "page", x: 95, y: 530, w: 330, h: 76, title: "Showcase page", sub: "/components/button", ...NEXTJS_LOGO },

    /* 2 · Look closely */
    { id: "z-look", x: 540, y: 120, w: 400, h: 820, kind: "zone", title: "2 · Look closely", sub: "every variant and state" },
    { id: "states", x: 575, y: 200, w: 330, h: 76, title: "Driven states", sub: "hover · focus by keyboard · disabled · loading", icon: "toggle_on" },
    { id: "stress", x: 575, y: 310, w: 330, h: 76, title: "Stressed content", sub: "longest label · narrow container", icon: "fact_check" },
    { id: "crops", x: 575, y: 420, w: 330, h: 76, title: "Magnified crops", sub: "corners · icon seat · focus ring", icon: "search", chip: "info" },
    { id: "recapture", x: 575, y: 830, w: 330, h: 76, title: "Re-capture", sub: "the same crops, before and after", icon: "autorenew", chip: "positive" },

    /* 3 · Judge */
    { id: "z-judge", x: 1020, y: 120, w: 400, h: 620, kind: "zone", title: "3 · Judge", sub: "against what is rendered now" },
    { id: "spec", x: 1055, y: 200, w: 330, h: 76, title: "Spec", sub: "design.md · Button · Composition", icon: "description" },
    { id: "rubric", x: 1055, y: 310, w: 330, h: 76, title: "Rubric", sub: "design principles · craft checks", icon: "rule" },
    { id: "siblings", x: 1055, y: 420, w: 330, h: 76, title: "Rendered siblings", sub: "SplitButton · ButtonGroup · CircularButton", icon: "grid_view" },
    { id: "source", x: 1055, y: 530, w: 330, h: 76, title: "Source", sub: "Button.css · Button.tsx, read last", icon: "code" },

    /* 4 · Outcome */
    { id: "z-out", x: 1500, y: 120, w: 360, h: 820, kind: "zone", title: "4 · Outcome", sub: "every finding gets one class" },
    { id: "direction", x: 1530, y: 200, w: 300, h: 76, title: "Direction", sub: "recommend one option, apply none", icon: "call_split", chip: "neutral" },
    { id: "report", x: 1530, y: 310, w: 300, h: 76, title: "Report", sub: "verdict · fixed · open · clean", icon: "checklist" },
    { id: "fixable", x: 1530, y: 530, w: 300, h: 76, title: "Defect or polish", sub: "one right answer, or small and safe", icon: "rule", chip: "warning" },
    { id: "fix", x: 1530, y: 830, w: 300, h: 76, title: "Fix at the source", sub: "Button.css · Button.tsx", icon: "edit_note", chip: "warning" },
  ],
  edges: [
    { id: "stories-storybook", from: "stories", to: "storybook" },
    { id: "storybook-themes", from: "storybook", to: "themes" },
    { id: "page-themes", from: "page", to: "themes" },
    { id: "themes-crops", from: "themes", to: "crops" },
    { id: "crops-siblings", from: "crops", to: "siblings", label: "same crops of each" },
    { id: "rubric-direction", from: "rubric", to: "direction" },
    { id: "siblings-fixable", from: "siblings", to: "fixable" },
    { id: "direction-report", from: "direction", to: "report" },
    { id: "fixable-fix", from: "fixable", to: "fix", kind: "accent" },
    { id: "fix-recapture", from: "fix", to: "recapture", label: "before and after", kind: "accent" },
    { id: "recapture-crops", from: "recapture", to: "crops", label: "until nothing new", kind: "accent" },
  ],
};
