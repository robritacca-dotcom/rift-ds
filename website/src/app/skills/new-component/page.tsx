import { Badge } from "rift-ds/components/Badge/Badge";
import type { TimelineItem } from "rift-ds/components/Timeline/Timeline";
import { SkillGuide, GuideCode } from "@/components/SkillGuide/SkillGuide";
import { buttonMap } from "./maps";

const STEPS: TimelineItem[] = [
  {
    title: "Ask",
    description: "Get the component’s name and one sentence on what it is for.",
  },
  {
    title: "Study the references",
    description: (
      <>
        Read <GuideCode>Button.tsx</GuideCode> and <GuideCode>Input.tsx</GuideCode>, the two
        house examples.
      </>
    ),
  },
  {
    title: "Write the three files",
    meta: "Makes the component",
    description:
      "The code, the styles and the stories, following the house rules: every option described, every English word replaceable, tokens only, links through the shared helper.",
  },
  {
    title: "Design QA",
    description:
      "Render every story in both themes, magnify corners and states, line it up against its nearest siblings, and fix what looks off. The checks refuse to start the normal Storybook until the next step, so this pass uses a raw one.",
  },
  {
    title: "Register it",
    meta: "Makes the registry entry",
    description: (
      <>
        One entry in <GuideCode>registry.json</GuideCode>. The nav, sitemap, README and chat
        all read from it.
      </>
    ),
  },
  {
    title: "Write the spec",
    meta: "Makes the spec",
    description: (
      <>
        A short section in <GuideCode>design.md</GuideCode>: class name, tokens and behaviour.
      </>
    ),
  },
  {
    title: "Hand off the website page",
    meta: "Makes the page and preview",
    description:
      "Offer to build the showcase page with the component-doc-page skill. Once it exists, the whole build chain passes for the first time.",
  },
];

const live = <Badge variant="positive" label="Live" />;
const copy = <Badge variant="neutral" label="Copy" />;

export default function NewComponentSkillPage() {
  return (
    <SkillGuide
      slug="new-component"
      tagline="One component, written once, seen everywhere"
      intro={
        <>
          The <GuideCode>new-component</GuideCode> skill is a checklist the coding agent
          follows, not a program. The build checks are what make a skipped step impossible.
          Below are the steps, then one real component traced from its folder to every place it
          shows up.
        </>
      }
      steps={STEPS}
      example={{
        title: "Button, end to end",
        body: (
          <>
            Button is stored once, in <GuideCode>src/components/Button/</GuideCode>. Storybook
            and this site read that folder directly; everything else passes through the build
            chain and comes out as a copy.
          </>
        ),
        map: buttonMap,
        caption: "Written once, checked before every build, copied where it travels.",
      }}
      summary={{
        title: "Live or copy",
        body: "A live read changes the moment the folder does; a copy changes on the next build or release.",
        caption: "How each surface gets Button",
        columns: [
          { key: "surface", header: "Surface", rowHeader: true },
          { key: "from", header: "Gets Button from" },
          { key: "kind", header: "Kind" },
        ],
        rows: [
          { id: "storybook", cells: { surface: "Storybook", from: "The component folder, directly", kind: live } },
          { id: "site", cells: { surface: "Showcase page", from: "The package name, which points at src", kind: live } },
          { id: "npm", cells: { surface: "npm", from: "dist, built from src at release", kind: copy } },
          { id: "agents", cells: { surface: "Schema, markdown, shadcn, prop API", from: "Generators reading the component", kind: copy } },
          { id: "nav", cells: { surface: "Nav, sitemap, title, README", from: "The registry entry", kind: copy } },
        ],
      }}
    />
  );
}
