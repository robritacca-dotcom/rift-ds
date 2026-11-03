import { Badge } from "rift-ds/components/Badge/Badge";
import type { TimelineItem } from "rift-ds/components/Timeline/Timeline";
import { SkillGuide, GuideCode } from "@/components/SkillGuide/SkillGuide";
import { driftAuditMap } from "./maps";

const STEPS: TimelineItem[] = [
  {
    title: "Establish what is true now",
    description: (
      <>
        Run <GuideCode>npm run validate-registry</GuideCode>, list the scripts and the exports
        map, and read the recent commits. The chain writes generated files, so check{" "}
        <GuideCode>git status</GuideCode> before and after. If the chain fails, stop and report
        that first.
      </>
    ),
  },
  {
    title: "Run the mechanical cross-checks",
    description:
      "Every script a doc names exists, in the right workspace. Every path exists. Every import matches the exports map. Every internal link reaches a real page. Counts come from registries. Retired wording has left the generated files. Config still sits where its tool reads it.",
  },
  {
    title: "Read the prose surfaces",
    description: (
      <>
        README first, since it ships to npm. Then the registries that ship as prose,{" "}
        <GuideCode>CLAUDE.md</GuideCode>, <GuideCode>design.md</GuideCode>,{" "}
        <GuideCode>content-design.md</GuideCode>, the other root specs and the pages that say how
        the system is built. The test: would a stranger who followed this succeed, and believe
        only true things?
      </>
    ),
  },
  {
    title: "Follow the change-type playbook",
    description:
      "The recent commits say what kind of change landed. An API change, a token change and a route change each have surfaces that must have moved with it, and the audit checks all of them.",
  },
  {
    title: "Audit every skill",
    description:
      "Read every skill, not just the related ones. Where a skill scripts a recipe with several steps, run it in a throwaway place and clean up. Then look for a repeated workflow that has no skill yet.",
  },
  {
    title: "Check what ships and what is public",
    description:
      "Inspect the built package: its manifest, its files, its size and the docs inside it. Sweep for secrets, personal data and local paths, and say which public identifiers are public on purpose.",
  },
  {
    title: "Report, then ask",
    meta: "Makes the report",
    description:
      "Findings grouped by severity, each with its path, what it says, why that is wrong now and the fix. A coverage table marks each section as executed, read or skipped. Then the audit asks whether to apply the fixes.",
  },
];

const broken = <Badge variant="error" label="Broken" />;
const stale = <Badge variant="warning" label="Stale" />;
const gap = <Badge variant="info" label="Gap" />;
const verified = <Badge variant="positive" label="Verified" />;
const skipped = <Badge variant="neutral" label="Skipped" />;

export default function DriftAuditSkillPage() {
  return (
    <SkillGuide
      slug="drift-audit"
      tagline="Every self-description, checked against the repo"
      intro={
        <>
          The build checks catch what a script can check. The{" "}
          <GuideCode>drift-audit</GuideCode> skill covers the layer beneath them: prose that
          makes a claim about the system, and instructions that only fail when someone follows
          them. It changes nothing on its own. <GuideCode>super-ship</GuideCode> runs it as its
          first audit and repairs what it finds. Below are the steps, then one renamed route
          traced from the change to the report.
        </>
      }
      steps={STEPS}
      example={{
        title: "A renamed route, end to end",
        body: (
          <>
            A route change is one of the playbook’s kinds. The audit reads the nav, the sitemap,{" "}
            <GuideCode>llms.txt</GuideCode>, the page summaries and the corpus route lists for
            it, and every skill and spec as it always does. Each finding is sorted into one class
            and goes into the report before anything is fixed.
          </>
        ),
        map: driftAuditMap,
        caption: "Read everywhere, sorted by class, reported before any fix.",
      }}
      summary={{
        title: "What each class means",
        body: "The report is the deliverable. Some findings are judgement calls, so the owner decides which fixes to apply.",
        caption: "The finding classes in a drift-audit report",
        columns: [
          { key: "finding", header: "Finding", rowHeader: true },
          { key: "means", header: "What it means" },
          { key: "next", header: "What happens next" },
          { key: "class", header: "Class" },
        ],
        rows: [
          { id: "broken", cells: { finding: "A skill names a script that no longer exists", means: "Following it would fail", next: "Fixed at the source once the owner agrees", class: broken } },
          { id: "stale", cells: { finding: "A doc describes a folder that moved", means: "Inaccurate, so it would mislead", next: "Fixed at the source once the owner agrees", class: stale } },
          { id: "gap", cells: { finding: "A repeated workflow with no skill", means: "Missing coverage", next: "Reported, since it may be deliberate scope", class: gap } },
          { id: "verified", cells: { finding: "A surface that still matches", means: "Checked and found correct", next: "Named, so the reader knows the scope", class: verified } },
          { id: "skipped", cells: { finding: "A section not run in full", means: "Weaker evidence than a run", next: "Marked in the coverage table with a reason", class: skipped } },
        ],
      }}
    />
  );
}
