import { Badge } from "rift-ds/components/Badge/Badge";
import type { TimelineItem } from "rift-ds/components/Timeline/Timeline";
import { SkillGuide, GuideCode } from "@/components/SkillGuide/SkillGuide";
import { sweepMap } from "./maps";

const STEPS: TimelineItem[] = [
  {
    title: "Build",
    description: (
      <>
        The sweep reads <GuideCode>website/.next/</GuideCode>, so the build must be of the tree
        under review. A build already made from this tree in the same session can be reused.
      </>
    ),
  },
  {
    title: "Sweep",
    meta: "Makes the findings and screenshots",
    description: (
      <>
        Run <GuideCode>scripts/check-responsive-layout.mjs</GuideCode> in the background, with
        its screenshots and JSON kept in the scratchpad, outside the repo. A page that fails to
        load is reported first, and the run stops there.
      </>
    ),
  },
  {
    title: "Judge every finding by eye",
    description:
      "Open each screenshot, where the measured element is outlined in red, and give it one verdict: defect, by design or instrument error. A finding is a lead until it has been looked at.",
  },
  {
    title: "Fix at the source",
    description: (
      <>
        A component class breaking on several routes is the component’s defect: fix it in{" "}
        <GuideCode>src/components/</GuideCode> and add a story at the width that broke it. A
        page’s own class is the page’s. Rebuild, then re-run on the affected routes to prove it.
      </>
    ),
  },
  {
    title: "Record what is by design",
    description: (
      <>
        Propose an entry in the script’s <GuideCode>ACCEPTED</GuideCode> list for each one, with
        its reason, and wait for the owner’s yes. An accepted finding is never reported again.
      </>
    ),
  },
  {
    title: "Report",
    description:
      "The routes and widths swept, the findings by kind, each fix and its story, the proposed acceptances, and anything left for the owner. No layout breaks at any width is a valid outcome.",
  },
];

const fixed = <Badge variant="positive" label="Fixed" />;
const waits = <Badge variant="warning" label="Waits for a yes" />;
const script = <Badge variant="info" label="Script changed" />;
const owner = <Badge variant="neutral" label="Left for the owner" />;

export default function ResponsiveSweepSkillPage() {
  return (
    <SkillGuide
      slug="responsive-sweep"
      tagline="Every page, every width, judged by eye"
      intro={
        <>
          The checks in <GuideCode>verify</GuideCode> look at only a width or two, so most
          breaks at other sizes reach none of them. The{" "}
          <GuideCode>responsive-sweep</GuideCode> skill closes that gap: a script measures, and
          the agent judges what it finds and fixes the real breaks. It never commits, pushes or
          deploys. Below are the steps, then one sweep traced from the build to where each
          finding lands.
        </>
      }
      steps={STEPS}
      example={{
        title: "One sweep, end to end",
        body: (
          <>
            The script takes every static route from{" "}
            <GuideCode>scripts/site-routes.mjs</GuideCode> and every width step the breakpoint
            modules declare, starting with <GuideCode>src/tokens/breakpoints.ts</GuideCode>, so a
            new page or breakpoint is swept the day it exists. It measures geometry only: content
            running off the screen, text cut off or spilling out of its box, and controls drawn
            on top of each other. One break in shared chrome reads as one finding, with every
            route and width it shows at.
          </>
        ),
        map: sweepMap,
        caption: "Measured by the script, judged from the screenshot, fixed where it starts.",
      }}
      summary={{
        title: "What each verdict changes",
        body: "Quieter is not the goal; true is. Nothing is accepted, loosened or dropped to make the sweep pass without the owner’s yes.",
        caption: "What each verdict on a finding leads to",
        columns: [
          { key: "verdict", header: "Verdict", rowHeader: true },
          { key: "means", header: "What the screenshot shows" },
          { key: "change", header: "What changes" },
          { key: "outcome", header: "Outcome" },
        ],
        rows: [
          { id: "defect", cells: { verdict: "Defect", means: "Something a person would see as broken", change: "The component or page CSS, plus a story at that width", outcome: fixed } },
          { id: "design", cells: { verdict: "By design", means: "A deliberate crop, spill or floating layer", change: "A proposed ACCEPTED entry citing the code", outcome: waits } },
          { id: "instrument", cells: { verdict: "Instrument error", means: "Nothing amiss and nothing deliberate", change: "The script’s inspect function", outcome: script } },
          { id: "decision", cells: { verdict: "Needs a design call", means: "A layout that needs a new arrangement at a width", change: "Nothing, until the owner decides", outcome: owner } },
        ],
      }}
    />
  );
}
