import { Badge } from "rift-ds/components/Badge/Badge";
import type { TimelineItem } from "rift-ds/components/Timeline/Timeline";
import { Table, type TableColumn } from "rift-ds/components/Table/Table";
import { SkillGuide, GuideCode, GuideGroup, GuideSection } from "@/components/SkillGuide/SkillGuide";
import { QUALITY_GATE } from "@/data/quality-gate.generated";
import { superShipMap } from "./maps";

const STEPS: TimelineItem[] = [
  {
    title: "Check the change is structural",
    description:
      "A moved folder, a new build step, a renamed surface. For a copy fix or a single component, the skill says so and offers plain ship instead.",
  },
  {
    title: "Run the drift audit",
    description: (
      <>
        Every section of <GuideCode>drift-audit</GuideCode>, not a lighter pass. If any section
        was skipped or narrowed, the flow stops and asks before going on.
      </>
    ),
  },
  {
    title: "Run the API audit",
    description: (
      <>
        <GuideCode>api-consistency</GuideCode> over each component the diff touched, plus its
        family. It widens to the whole library only for a library-wide change.
      </>
    ),
  },
  {
    title: "Fix what is broken or stale",
    meta: "Makes the drift fix commit",
    description:
      "Drift is repaired in the session. A rename, a new prop or a new deprecation changes the published contract, so it stops and asks. Gaps and judgement calls are reported, not acted on.",
  },
  {
    title: "Re-check the fixes",
    description: (
      <>
        Run <GuideCode>npm run validate-registry</GuideCode> again, so a fix cannot add a broken
        reference, and repeat the API audit over any component a fix changed.
      </>
    ),
  },
  {
    title: "Sweep every page",
    meta: "Makes the sweep fix commit",
    description: (
      <>
        <GuideCode>responsive-sweep</GuideCode> runs against a build of the combined tree, every
        route at every width. A break with one right answer is fixed. A proposed acceptance
        waits for the owner.
      </>
    ),
  },
  {
    title: "Ship",
    description:
      "The ship flow from its first step: the full verify, separate commits for the work and each set of fixes, the merge into main, the push, CI watched to green, and the live site proven rendering.",
  },
  {
    title: "Report",
    description:
      "One message: the audit with its coverage table, the API findings, the sweep, what shipped and what is left as a follow-up.",
  },
];

const GATE_COLUMNS: TableColumn[] = [
  { key: "check", header: "Check", rowHeader: true },
  { key: "text", header: "What it holds" },
];

const fixed = <Badge variant="positive" label="Fixed" />;
const asks = <Badge variant="warning" label="Asks" />;
const reported = <Badge variant="neutral" label="Reported" />;
const stops = <Badge variant="error" label="Stops" />;

export default function SuperShipSkillPage() {
  return (
    <SkillGuide
      slug="super-ship"
      tagline="Audit, fix, sweep, then ship it all at once"
      intro={
        <>
          The <GuideCode>super-ship</GuideCode> skill chains four others:{" "}
          <GuideCode>drift-audit</GuideCode>, <GuideCode>api-consistency</GuideCode>,{" "}
          <GuideCode>responsive-sweep</GuideCode> and <GuideCode>ship</GuideCode>. It owns only
          the rules for how they connect. Asking for it is the owner’s yes to fix drift and
          deploy, but not to change the published contract. Below are the steps, then one
          structural change traced from its branch to the live site, then every check the ship runs.
        </>
      }
      steps={STEPS}
      example={{
        title: "A structural change, end to end",
        body: (
          <>
            The work waits on its branch while the audits read the repo. The fixes join it before
            the full verify, so the push carries the change and everything that describes it.
          </>
        ),
        map: superShipMap,
        caption: "Audited, repaired and swept, then shipped as one result.",
      }}
      summary={{
        title: "What each finding does",
        body: "Invoking the skill approves repairs and the deploy. Anything past that waits for the owner.",
        caption: "How super-ship treats each kind of finding",
        columns: [
          { key: "finding", header: "Finding", rowHeader: true },
          { key: "handling", header: "What happens" },
          { key: "result", header: "Result" },
        ],
        rows: [
          { id: "drift", cells: { finding: "Broken or stale prose", handling: "Repaired in the session", result: fixed } },
          { id: "api-drift", cells: { finding: "API drift, such as a stale description", handling: "Repaired, since no consumer’s code changes", result: fixed } },
          { id: "layout", cells: { finding: "Layout break with one right answer", handling: "Repaired at its source", result: fixed } },
          { id: "contract", cells: { finding: "Rename, new prop or new deprecation", handling: "Waits, since the version is the owner’s call", result: asks } },
          { id: "coverage", cells: { finding: "Skipped audit section", handling: "Waits for the owner to accept a narrow audit", result: asks } },
          { id: "acceptance", cells: { finding: "Proposed sweep acceptance", handling: "Waits, since it hides the finding for good", result: asks } },
          { id: "judgement", cells: { finding: "Judgement call", handling: "Waits rather than resolving it silently", result: asks } },
          { id: "gap", cells: { finding: "Gap or new validator", handling: "Listed as a follow-up", result: reported } },
          { id: "chain", cells: { finding: "The validator chain itself broken", handling: "Ends the whole flow with a report", result: stops } },
        ],
      }}
    >
      <GuideSection
        title="Every check a ship runs"
        body={
          <>
            This is the whole gate, in the order it runs: the{" "}
            <GuideCode>validate-registry</GuideCode> chain, the rest of{" "}
            <GuideCode>npm run verify</GuideCode>, then what CI adds. The list is built from{" "}
            <GuideCode>scripts/chain.mjs</GuideCode>, <GuideCode>package.json</GuideCode> and the CI workflow on every build, so a new
            validator cannot join the chain without a line here. After the push, the hydration
            smoke runs once more against the live site.
          </>
        }
      >
        {QUALITY_GATE.map((group) => (
          <GuideGroup key={group.id} title={group.title} body={group.body}>
            <Table
              columns={GATE_COLUMNS}
              rows={group.checks.map((check) => ({
                id: check.name,
                cells: { check: <GuideCode>{check.name}</GuideCode>, text: check.text },
              }))}
              bordered
              caption={group.title}
              captionHidden
            />
          </GuideGroup>
        ))}
      </GuideSection>
    </SkillGuide>
  );
}
