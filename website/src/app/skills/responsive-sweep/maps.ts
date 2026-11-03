import type { ArchMap } from "@/components/ArchitectureMap/types";

/**
 * One sweep of record traced from the built site to where each finding
 * lands. The accent edges are the point the page makes: every finding goes
 * through its screenshot and a verdict before anything changes.
 */
export const sweepMap: ArchMap = {
  id: "responsive-sweep-run",
  title: "One sweep, end to end",
  label:
    "The sweep script loads every static route of the built site at every width the breakpoint modules declare, groups what it measures into findings with marked screenshots, and each finding is judged by eye as a defect, by design or an instrument error before it becomes a fix, a proposed acceptance or a script change.",
  width: 1900,
  height: 900,
  nodes: [
    /* 1 · What it reads */
    { id: "z-read", x: 60, y: 120, w: 420, h: 680, kind: "zone", title: "1 · What it reads", sub: "the tree under review" },
    { id: "build", x: 95, y: 200, w: 350, h: 76, title: "Built site", sub: "website/.next/", icon: "deployed_code", chip: "info" },
    { id: "routes", x: 95, y: 310, w: 350, h: 76, title: "Every static route", sub: "staticSiteRoutes() · scripts/site-routes.mjs", icon: "route", chip: "info" },
    { id: "ladder", x: 95, y: 420, w: 350, h: 90, title: "Width ladder", sub: "src/tokens/breakpoints.ts · website/src/config/breakpoints.ts", icon: "straighten", chip: "info" },

    /* 2 · The sweep */
    { id: "z-sweep", x: 560, y: 120, w: 400, h: 680, kind: "zone", title: "2 · The sweep", sub: "measures geometry only" },
    { id: "script", x: 595, y: 200, w: 330, h: 76, title: "Sweep script", sub: "scripts/check-responsive-layout.mjs", icon: "terminal", chip: "warning" },
    { id: "findings", x: 595, y: 310, w: 330, h: 76, title: "Grouped findings", sub: "offscreen · clipped · spill · overlap · truncated", icon: "data_object", chip: "warning" },
    { id: "shots", x: 595, y: 420, w: 330, h: 76, title: "Marked screenshots", sub: "element outlined in red, in the scratchpad", icon: "photo_camera", chip: "warning" },

    /* 3 · Judged by eye */
    { id: "z-judge", x: 1040, y: 120, w: 400, h: 680, kind: "zone", title: "3 · Judged by eye", sub: "one verdict per finding" },
    { id: "defect", x: 1075, y: 200, w: 330, h: 76, title: "Defect", sub: "a person would see it broken", icon: "bug_report", chip: "warning" },
    { id: "design", x: 1075, y: 420, w: 330, h: 76, title: "By design", sub: "the code says so beside the rule", icon: "check_circle", chip: "neutral" },
    { id: "instrument", x: 1075, y: 640, w: 330, h: 76, title: "Instrument error", sub: "nothing amiss on screen", icon: "tune", chip: "neutral" },

    /* 4 · Where it lands */
    { id: "z-land", x: 1520, y: 120, w: 340, h: 680, kind: "zone", title: "4 · Where it lands", sub: "in the working tree" },
    { id: "fix", x: 1550, y: 200, w: 280, h: 76, title: "Fix at the source", sub: "component + story, or page CSS", icon: "build", chip: "positive" },
    { id: "rerun", x: 1550, y: 310, w: 280, h: 76, title: "Rebuild and re-run", sub: "--routes on what changed", icon: "replay", chip: "positive" },
    { id: "accepted", x: 1550, y: 420, w: 280, h: 76, title: "Proposed acceptance", sub: "ACCEPTED, after the owner says yes", icon: "playlist_add_check", chip: "positive" },
    { id: "inspect", x: 1550, y: 640, w: 280, h: 76, title: "Script fix", sub: "inspect(), then re-run", icon: "code", chip: "positive" },
  ],
  edges: [
    { id: "build-script", from: "build", to: "script" },
    { id: "routes-script", from: "routes", to: "script" },
    { id: "ladder-script", from: "ladder", to: "script", label: "every route, every width" },
    { id: "script-findings", from: "script", to: "findings" },
    { id: "findings-shots", from: "findings", to: "shots" },
    { id: "shots-defect", from: "shots", to: "defect", kind: "accent" },
    { id: "shots-design", from: "shots", to: "design", label: "each one opened", kind: "accent" },
    { id: "shots-instrument", from: "shots", to: "instrument", kind: "accent" },
    { id: "defect-fix", from: "defect", to: "fix", label: "where it starts" },
    { id: "fix-rerun", from: "fix", to: "rerun" },
    { id: "design-accepted", from: "design", to: "accepted" },
    { id: "instrument-inspect", from: "instrument", to: "inspect" },
  ],
};
