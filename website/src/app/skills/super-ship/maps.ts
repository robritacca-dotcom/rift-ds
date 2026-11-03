import type { ArchMap } from "@/components/ArchitectureMap/types";

const VERCEL_LOGO = { logo: "/logos/vercel black.svg", logoDark: "/logos/vercel white.svg" };

/**
 * One super-ship run of a structural change, from the branch to the live
 * site. The accent edges are the page's one point: the audit and sweep
 * fixes reach verify together with the session work, so they ship as one
 * result or not at all.
 */
export const superShipMap: ArchMap = {
  id: "super-ship-end-to-end",
  title: "A structural change, end to end",
  label:
    "A structural change on a branch passes the drift audit, the coverage gate and a scoped API audit, gets its drift fixed and re-checked, then a responsive sweep of every page. The fixes reach the full verify with the session work, which is committed, merged into main and pushed; CI runs, Vercel deploys, and the live hydration smoke proves the site renders.",
  width: 1900,
  height: 1000,
  nodes: [
    /* 1 · Audit */
    { id: "z-audit", x: 60, y: 120, w: 400, h: 820, kind: "zone", title: "1 · Audit", sub: "reads, changes nothing" },
    { id: "work", x: 95, y: 200, w: 330, h: 76, title: "Session work", sub: "a structural change on a branch", icon: "commit", chip: "info" },
    { id: "drift", x: 95, y: 330, w: 330, h: 76, title: "Drift audit", sub: "every section · .claude/skills/drift-audit/", icon: "fact_check", chip: "warning" },
    { id: "gate", x: 95, y: 460, w: 330, h: 76, title: "Coverage gate", sub: "a skipped section stops the flow", icon: "rule", chip: "warning" },
    { id: "api", x: 95, y: 590, w: 330, h: 76, title: "API audit", sub: "api-consistency · components the diff touched", icon: "tune", chip: "warning" },
    { id: "followups", x: 95, y: 790, w: 330, h: 76, title: "Follow-ups", sub: "gaps and new validators, reported only", kind: "state", icon: "list_alt" },

    /* 2 · Fix and sweep */
    { id: "z-fix", x: 540, y: 120, w: 420, h: 820, kind: "zone", title: "2 · Fix and sweep", sub: "pre-approved repairs" },
    { id: "fixes", x: 575, y: 200, w: 350, h: 76, title: "Drift fixes", sub: "broken and stale findings", icon: "build", chip: "positive" },
    { id: "recheck", x: 575, y: 330, w: 350, h: 76, title: "Re-check", sub: "npm run validate-registry", icon: "checklist", chip: "info" },
    { id: "sweep", x: 575, y: 460, w: 350, h: 76, title: "Responsive sweep", sub: "scripts/check-responsive-layout.mjs", icon: "devices", chip: "warning" },
    { id: "sweepfix", x: 575, y: 590, w: 350, h: 76, title: "Sweep fixes", sub: "breaks with one right answer", icon: "build", chip: "positive" },
    { id: "ask", x: 575, y: 790, w: 350, h: 76, title: "Stops to ask", sub: "contract changes · judgement calls · acceptances", kind: "state", icon: "front_hand" },

    /* 3 · Ship */
    { id: "z-ship", x: 1040, y: 120, w: 380, h: 520, kind: "zone", title: "3 · Ship", sub: "the ship flow, from its step 0" },
    { id: "verify", x: 1075, y: 200, w: 310, h: 76, title: "Full verify", sub: "npm run verify", icon: "checklist", chip: "positive" },
    { id: "commits", x: 1075, y: 330, w: 310, h: 76, title: "Separate commits", sub: "work · drift fixes · sweep fixes", icon: "commit", chip: "info" },
    { id: "merge", x: 1075, y: 460, w: 310, h: 76, title: "Merge into main", sub: "then push", logo: "/logos/Git.svg" },

    /* 4 · Live */
    { id: "z-live", x: 1500, y: 120, w: 360, h: 650, kind: "zone", title: "4 · Live", sub: "proven, not assumed" },
    { id: "ci", x: 1535, y: 200, w: 290, h: 76, title: "GitHub Actions CI", sub: ".github/workflows/ci.yml", kind: "external", logo: "/logos/Git.svg" },
    { id: "vercel", x: 1535, y: 330, w: 290, h: 76, title: "Vercel", sub: "a push to main deploys", kind: "external", ...VERCEL_LOGO },
    { id: "smoke", x: 1535, y: 460, w: 290, h: 76, title: "Live hydration smoke", sub: "scripts/smoke-hydration.mjs", icon: "monitor_heart", chip: "positive" },
    { id: "report", x: 1535, y: 590, w: 290, h: 76, title: "Combined report", sub: "audit · API · sweep · ship", icon: "description", chip: "info" },
  ],
  edges: [
    { id: "work-drift", from: "work", to: "drift" },
    { id: "drift-gate", from: "drift", to: "gate" },
    { id: "gate-api", from: "gate", to: "api" },
    { id: "api-followups", from: "api", to: "followups" },
    { id: "api-fixes", from: "api", to: "fixes" },
    { id: "api-ask", from: "api", to: "ask", label: "contract changes" },
    { id: "fixes-recheck", from: "fixes", to: "recheck" },
    { id: "recheck-sweep", from: "recheck", to: "sweep" },
    { id: "sweep-sweepfix", from: "sweep", to: "sweepfix" },
    { id: "fixes-verify", from: "fixes", to: "verify", label: "with the session work", kind: "accent" },
    { id: "sweepfix-verify", from: "sweepfix", to: "verify", kind: "accent" },
    { id: "verify-commits", from: "verify", to: "commits" },
    { id: "commits-merge", from: "commits", to: "merge" },
    { id: "merge-ci", from: "merge", to: "ci", kind: "external" },
    { id: "merge-vercel", from: "merge", to: "vercel", label: "push to main", kind: "external" },
    { id: "vercel-smoke", from: "vercel", to: "smoke" },
    { id: "smoke-report", from: "smoke", to: "report" },
  ],
};
