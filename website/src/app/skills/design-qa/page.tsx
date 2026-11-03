import { Badge } from "rift-ds/components/Badge/Badge";
import type { TimelineItem } from "rift-ds/components/Timeline/Timeline";
import { SkillGuide, GuideCode } from "@/components/SkillGuide/SkillGuide";
import { buttonQaMap } from "./maps";

const STEPS: TimelineItem[] = [
  {
    title: "Pick the target",
    description:
      "A component, a page, or a sweep across several. With no target named, it takes what the session just built or changed.",
  },
  {
    title: "Render it in both themes",
    meta: "Makes the captures",
    description:
      "A component renders every story in Storybook. A page renders on the dev site at desktop and mobile widths. Each is captured in light and dark, with the theme checked on the root element first.",
  },
  {
    title: "Look closely",
    description:
      "Zoom into every corner, join, divider, icon seat and focus ring. Drive hover, keyboard focus, active, disabled and loading for real, then try the longest label and a narrow container.",
  },
  {
    title: "Line up the siblings",
    description: (
      <>
        Capture the same crops of the two or three nearest relatives by role. Then read the
        spec in <GuideCode>design.md</GuideCode> and the source, to name the cause of what the
        pixels showed.
      </>
    ),
  },
  {
    title: "Judge each finding",
    description:
      "Name the principle or craft check it breaks, then class it: a defect, polish, or a direction call.",
  },
  {
    title: "Fix and look again",
    meta: "Makes the fixes",
    description:
      "Fix defects and polish at the source, re-capture the same crops, and look over the changed area. Repeat until a full pass finds nothing new.",
  },
  {
    title: "Report",
    meta: "Makes the report",
    description:
      "The verdict first, then what was fixed, the open decisions with one recommendation each, and what was checked and found clean.",
  },
];

const fixed = <Badge variant="positive" label="Fixed" />;
const owner = <Badge variant="neutral" label="Owner decides" />;
const reported = <Badge variant="info" label="Reported" />;

export default function DesignQaSkillPage() {
  return (
    <SkillGuide
      slug="design-qa"
      tagline="Judged from the render, not the code"
      intro={
        <>
          The <GuideCode>design-qa</GuideCode> skill is a checklist the coding agent follows
          over rendered pixels. Code review can confirm the tokens are right; this pass decides
          whether the result looks right. It also runs as the quality gate inside{" "}
          <GuideCode>new-component</GuideCode>. Below are the steps, then one pass over Button
          traced from its stories to the report.
        </>
      }
      steps={STEPS}
      example={{
        title: "Button, one pass",
        body: (
          <>
            Button’s stories live in{" "}
            <GuideCode>src/components/Button/Button.stories.ts</GuideCode> and its showcase page
            is <GuideCode>/components/button</GuideCode>. The pass renders both in light and
            dark, then compares the same crops with the nearest buttons in the registry’s
            actions category, picked at the time of the run. Only defects and polish enter the
            loop; a direction call goes to the report for the owner.
          </>
        ),
        map: buttonQaMap,
        caption: "Rendered now, compared with siblings rendered in the same run, looped until a pass finds nothing new.",
      }}
      summary={{
        title: "Three outcomes",
        body: "Every finding names what it breaks and takes one class. A pass with no findings is a valid result.",
        caption: "What happens to each kind of finding",
        columns: [
          { key: "outcome", header: "Outcome", rowHeader: true },
          { key: "means", header: "Means" },
          { key: "result", header: "Result" },
        ],
        rows: [
          { id: "defect", cells: { outcome: "Defect", means: "Wrong against the rubric, the spec or the siblings. One right answer.", result: fixed } },
          { id: "polish", cells: { outcome: "Polish", means: "A clearly better version exists, and the change is small and safe.", result: fixed } },
          { id: "direction", cells: { outcome: "Direction", means: "More than one defensible answer, or it changes the design. One option is recommended, none applied.", result: owner } },
          { id: "clean", cells: { outcome: "Clean", means: "A full pass finds nothing. The report says what was covered.", result: reported } },
        ],
      }}
    />
  );
}
