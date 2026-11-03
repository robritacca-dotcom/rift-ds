import type { ArchMap } from "@/components/ArchitectureMap/types";

/**
 * One drift-audit run after a renamed route, from the change to the report.
 * The accent edges are the page's one point: every finding lands in the
 * report first, and nothing is fixed until the owner says yes.
 */
export const driftAuditMap: ArchMap = {
  id: "drift-audit-end-to-end",
  title: "A renamed route, end to end",
  label:
    "A renamed route sets off a drift audit. The audit runs the validator chain and reads the script list, then follows the route-change playbook and reads every skill, the root specs and README, page prose, the nav and sitemap, llms.txt and page summaries, and the corpus route lists. Each finding is sorted as broken, stale, a gap or verified, and all of them go into one report. The audit then asks before fixing anything; fixes go to the source, and a recurring check is recommended as a new validator.",
  width: 1900,
  height: 1000,
  nodes: [
    /* 1 · The change */
    { id: "z-change", x: 60, y: 120, w: 400, h: 520, kind: "zone", title: "1 · The change", sub: "what is true right now" },
    { id: "route", x: 95, y: 200, w: 330, h: 76, title: "Renamed route", sub: "a page folder in website/src/app/", icon: "commit", chip: "info" },
    { id: "chain", x: 95, y: 330, w: 330, h: 76, title: "Chain and scripts", sub: "npm run validate-registry · package.json", icon: "checklist", chip: "info" },
    { id: "playbook", x: 95, y: 460, w: 330, h: 76, title: "Change-type playbook", sub: "route change: the surfaces that must move", icon: "menu_book", chip: "info" },

    /* 2 · Every description */
    { id: "z-read", x: 540, y: 120, w: 420, h: 820, kind: "zone", title: "2 · Every description", sub: "read, and run where it prescribes" },
    { id: "skills", x: 575, y: 200, w: 350, h: 76, title: "Every skill", sub: ".claude/skills/", icon: "auto_awesome", chip: "warning" },
    { id: "specs", x: 575, y: 305, w: 350, h: 76, title: "README and root specs", sub: "the list in scripts/validate-doc-refs.mjs", icon: "description", chip: "warning" },
    { id: "prose", x: 575, y: 410, w: 350, h: 76, title: "Page prose", sub: "cross-links in website/src/app/", icon: "web", chip: "warning" },
    { id: "nav", x: 575, y: 515, w: 350, h: 76, title: "Nav and sitemap", sub: "navigation.ts · sitemap.ts", icon: "account_tree", chip: "warning" },
    { id: "summaries", x: 575, y: 620, w: 350, h: 76, title: "llms.txt and summaries", sub: "llms.txt · page-summaries.json", icon: "list_alt", chip: "warning" },
    { id: "corpus", x: 575, y: 725, w: 350, h: 76, title: "Corpus route lists", sub: "EXCLUDED_ROUTES · generate-site-corpus.mjs", icon: "storage", chip: "warning" },

    /* 3 · Sorted */
    { id: "z-sort", x: 1040, y: 120, w: 380, h: 600, kind: "zone", title: "3 · Sorted", sub: "the skill’s own classes" },
    { id: "broken", x: 1075, y: 200, w: 310, h: 76, title: "Broken", sub: "following it would fail", icon: "error", chip: "warning" },
    { id: "stale", x: 1075, y: 330, w: 310, h: 76, title: "Stale", sub: "inaccurate, would mislead", icon: "history", chip: "warning" },
    { id: "gaps", x: 1075, y: 460, w: 310, h: 76, title: "Gaps", sub: "missing coverage", icon: "help", chip: "neutral" },
    { id: "verified", x: 1075, y: 590, w: 310, h: 76, title: "Verified accurate", sub: "named, so the scope is clear", icon: "check_circle", chip: "positive" },

    /* 4 · Report */
    { id: "z-report", x: 1500, y: 120, w: 360, h: 600, kind: "zone", title: "4 · Report", sub: "the deliverable" },
    { id: "report", x: 1535, y: 200, w: 290, h: 76, title: "Report", sub: "by severity · coverage table", icon: "fact_check", chip: "info" },
    { id: "ask", x: 1535, y: 330, w: 290, h: 76, title: "Asks first", sub: "no silent fixes", kind: "state", icon: "front_hand" },
    { id: "fix", x: 1535, y: 460, w: 290, h: 76, title: "Fix at the source", sub: "then regenerate", icon: "build", chip: "positive" },
    { id: "validator", x: 1535, y: 590, w: 290, h: 76, title: "New validator", sub: "for a check that keeps recurring", icon: "rule", chip: "neutral" },
  ],
  edges: [
    { id: "route-chain", from: "route", to: "chain" },
    { id: "chain-playbook", from: "chain", to: "playbook" },
    { id: "chain-skills", from: "chain", to: "skills" },
    { id: "playbook-nav", from: "playbook", to: "nav", label: "route change" },
    { id: "playbook-corpus", from: "playbook", to: "corpus", bend: 30 },
    { id: "skills-broken", from: "skills", to: "broken", label: "a recipe that fails" },
    { id: "specs-stale", from: "specs", to: "stale" },
    { id: "skills-gaps", from: "skills", to: "gaps", bend: -40 },
    { id: "nav-verified", from: "nav", to: "verified" },
    { id: "broken-report", from: "broken", to: "report" },
    { id: "stale-report", from: "stale", to: "report" },
    { id: "gaps-report", from: "gaps", to: "report" },
    { id: "verified-report", from: "verified", to: "report" },
    { id: "report-ask", from: "report", to: "ask", label: "then asks", kind: "accent" },
    { id: "ask-fix", from: "ask", to: "fix", kind: "accent" },
    { id: "fix-validator", from: "fix", to: "validator" },
  ],
};
