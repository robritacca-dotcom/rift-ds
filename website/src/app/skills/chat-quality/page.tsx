import { Badge } from "rift-ds/components/Badge/Badge";
import type { TimelineItem } from "rift-ds/components/Timeline/Timeline";
import { SkillGuide, GuideCode } from "@/components/SkillGuide/SkillGuide";
import { chatQualityMap } from "./maps";

const STEPS: TimelineItem[] = [
  {
    title: "Close the last loop",
    description:
      "Read the previous run’s report and check whether its branch was merged, so a case already written is not proposed twice.",
  },
  {
    title: "Pull the verdicts and the log",
    description:
      "Read the thumbs verdicts and the logged exchanges from the live store, and join each verdict to the exchange it rates by its id. The agent only reads; it never writes there. Without read access it stops and asks.",
  },
  {
    title: "Triage",
    description:
      "Every thumbs down is a candidate. The unrated answers get a skim too, for silent failures such as an invented path or a limit notice where a real answer was possible. A window with no real failures is a valid result, and the loop stops there.",
  },
  {
    title: "Write the cases first",
    meta: "Makes the golden-set cases",
    description: (
      <>
        Each failure becomes a case in <GuideCode>evals/chat/golden-set.json</GuideCode> before
        it is fixed: the question in other words, the facts a good answer needs, the cheapest
        check that would have caught it, and the rules it covers in{" "}
        <GuideCode>evals/chat/SPEC.md</GuideCode>. A fact missing from the chat’s sources is the
        real bug, and the source is what gets fixed.
      </>
    ),
  },
  {
    title: "Run the eval once",
    description: (
      <>
        <GuideCode>npm run eval:chat</GuideCode> runs the whole set through the real chat route
        on a local dev server. It spends real API budget, so it runs once per loop. The
        answers are read one by one: the new cases should fail before the fix and pass after,
        and nothing that passed before should break.
      </>
    ),
  },
  {
    title: "Fix on a branch",
    meta: "Makes the local branch",
    description:
      "The new cases and the fixes they called for go on one fresh local branch. Fixes stay inside the chat’s answer pipeline: page prose, the persona and the lookup tools. A fix in the package’s chat engine changes every consumer’s chat, so it is flagged as such.",
  },
  {
    title: "Report and hand off",
    meta: "Makes the report",
    description:
      "A plain-English report: the window, the verdict counts, each disliked answer and its cause, what was encoded and the eval result. Merging the branch approves it; deleting it rejects it. Nothing is pushed or deployed.",
  },
];

const readOnly = <Badge variant="info" label="Read only" />;
const local = <Badge variant="neutral" label="Stays local" />;
const branch = <Badge variant="positive" label="On a branch" />;
const flagged = <Badge variant="warning" label="Flagged" />;
const off = <Badge variant="error" label="Off limits" />;

export default function ChatQualitySkillPage() {
  return (
    <SkillGuide
      slug="chat-quality"
      tagline="Every disliked answer becomes a test"
      intro={
        <>
          The <GuideCode>chat-quality</GuideCode> skill is the loop that reads the thumbs
          visitors leave on the site chat’s answers. It is set to run twice a month, runs on demand for now, and
          ends with changes waiting on a branch for the owner. Below are the steps, then one
          pass of the loop traced from a verdict to that branch.
        </>
      }
      steps={STEPS}
      example={{
        title: "One loop, end to end",
        body: (
          <>
            A visitor rates an answer with a thumb. <GuideCode>/api/chat/feedback</GuideCode>{" "}
            stores the verdict in Redis under the exchange’s id, beside the exchange that{" "}
            <GuideCode>/api/chat</GuideCode> logged, and both are deleted after 30 days. The
            agent reads the two and joins them. The disliked answer becomes a golden-set case
            written in other words, the eval runs against a dev server, and the fix waits on a
            local branch. The visitor’s own words stay in a local report that is never
            committed.
          </>
        ),
        map: chatQualityMap,
        caption: "Read from the live site, encoded as a test, fixed on a branch.",
      }}
      summary={{
        title: "What the loop may touch",
        body: "The live data is read, never written. Only a paraphrase of the failure and its fix reach the repo, and only on a branch the owner approves.",
        caption: "What each part of the loop may touch",
        columns: [
          { key: "part", header: "Part", rowHeader: true },
          { key: "what", header: "What the loop does" },
          { key: "access", header: "Access" },
        ],
        rows: [
          { id: "store", cells: { part: "Verdicts and exchange log", what: "Reads and joins them", access: readOnly } },
          { id: "report", cells: { part: "Visitors’ own words", what: "Quotes them in the local report only", access: local } },
          { id: "golden", cells: { part: "Golden set and spec", what: "Adds paraphrased cases and any new rule", access: branch } },
          { id: "pipeline", cells: { part: "Page prose, persona, lookup tools", what: "Fixes the cause a case found", access: branch } },
          { id: "engine", cells: { part: "The package’s chat engine", what: "Fixes it only when the site cannot", access: flagged } },
          { id: "ui", cells: { part: "UI, components, spend limits", what: "Proposes, never edits", access: off } },
        ],
      }}
    />
  );
}
