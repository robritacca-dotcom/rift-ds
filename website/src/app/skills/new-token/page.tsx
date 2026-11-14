import { Badge } from "rift-ds/components/Badge/Badge";
import type { TimelineItem } from "rift-ds/components/Timeline/Timeline";
import { SkillGuide, GuideCode } from "@/components/SkillGuide/SkillGuide";
import { actionColourMap } from "./maps";

const STEPS: TimelineItem[] = [
  {
    title: "Read the checklist",
    description: (
      <>
        The How to Add a New Token section of <GuideCode>CLAUDE.md</GuideCode> is the list. The
        skill adds the detail it leaves out.
      </>
    ),
  },
  {
    title: "Decide the tier",
    description:
      "A primitive is a raw value. A semantic token is a role, and it points at a primitive through var(). Add a primitive only when no existing one fits.",
  },
  {
    title: "Put it in its category’s file",
    meta: "Makes the token",
    description: (
      <>
        Colour goes in both <GuideCode>tokens-light.css</GuideCode> and{" "}
        <GuideCode>tokens-dark.css</GuideCode>. Spacing, radius and the other sizes go in the light
        file alone. A colour that carries a state, such as a checked fill, also gets a system
        colour in <GuideCode>tokens-forced-colors.css</GuideCode>.
      </>
    ),
  },
  {
    title: "Check the prefix",
    description: (
      <>
        An existing prefix needs nothing. A new one fails generation until it is added to{" "}
        <GuideCode>CATEGORY_PREFIXES</GuideCode>, so the new category gets a home on the same day.
      </>
    ),
  },
  {
    title: "Give it its documentation homes",
    meta: "Makes the swatch, story and spec",
    description:
      "A row on the matching foundations page, an entry in the Storybook token docs, and a sentence in design.md on its role. The sentence never states a colour value, since design.md holds for every theme.",
  },
  {
    title: "Package a TypeScript token",
    description: (
      <>
        Only for a shared constant like the timings in <GuideCode>motion.ts</GuideCode>: a
        published subpath, or an entry saying why it stays internal.
      </>
    ),
  },
  {
    title: "Verify",
    description: (
      <>
        Run <GuideCode>npm run validate-registry</GuideCode>, then the build. Commit every file the
        chain rewrites. Counts update themselves.
      </>
    ),
  },
];

const build = <Badge variant="positive" label="Build" />;
const audit = <Badge variant="neutral" label="Audit" />;

export default function NewTokenSkillPage() {
  return (
    <SkillGuide
      slug="new-token"
      tagline="A token that exists only in CSS is incomplete"
      intro={
        <>
          The <GuideCode>new-token</GuideCode> skill is a checklist the coding agent follows when
          it adds or changes a design token. A token has to reach several homes, and most of them
          are held in place by the build. Below are the steps, then one real token traced from its
          raw value to every place it shows up.
        </>
      }
      steps={STEPS}
      example={{
        title: "The action colour, end to end",
        body: (
          <>
            <GuideCode>--color-action-primary-bg</GuideCode> is the action colour. Its light value
            points at a primitive, its dark value at another step of the same ramp, and its forced colors value at the system highlight. Button’s CSS uses
            the semantic token, never the primitive. The registry, the resolved values and the DTCG
            files are written from the CSS on every build.
          </>
        ),
        map: actionColourMap,
        caption: "Three tiers by hand, documented by hand, everything else written by the build.",
      }}
      summary={{
        title: "What holds each home",
        body: "A build check fails the build the moment a home drifts. An audit home is checked when a drift audit runs.",
        caption: "How each home of the action colour stays true",
        columns: [
          { key: "home", header: "Home", rowHeader: true },
          { key: "held", header: "Held by" },
          { key: "kind", header: "Kind" },
        ],
        rows: [
          { id: "chain", cells: { home: "Semantic value to primitive", held: "validate-token-references.mjs", kind: build } },
          { id: "parity", cells: { home: "Light and dark values", held: "validate-token-registry.mjs", kind: build } },
          { id: "usage", cells: { home: "Button.css", held: "validate-token-usage.mjs", kind: build } },
          { id: "swatch", cells: { home: "Swatch and its caption", held: "validate-website-surfaces.mjs and validate-foundation-mirrors.mjs", kind: build } },
          { id: "generated", cells: { home: "Values and DTCG files", held: "validate-generated-files.mjs and validate-token-values.mjs", kind: build } },
          { id: "docs", cells: { home: "Storybook doc and design.md", held: "The drift-audit skill", kind: audit } },
        ],
      }}
    />
  );
}
