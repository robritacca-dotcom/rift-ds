import { Badge } from "rift-ds/components/Badge/Badge";
import type { TimelineItem } from "rift-ds/components/Timeline/Timeline";
import { SkillGuide, GuideCode } from "@/components/SkillGuide/SkillGuide";
import { hexCodeMap } from "./maps";

const STEPS: TimelineItem[] = [
  {
    title: "Study the references",
    description: (
      <>
        Read the Registries section of <GuideCode>CLAUDE.md</GuideCode>, then one script of each
        shape: <GuideCode>validate-doc-refs.mjs</GuideCode> on its own, <GuideCode>generate-component-md.mjs</GuideCode> with its{" "}
        <GuideCode>surface()</GuideCode>, and{" "}
        <GuideCode>validate-rendered-spacing.mjs</GuideCode> for built HTML.
      </>
    ),
  },
  {
    title: "Decide the shape",
    description:
      "A validator checks a rule and fails the build. A generator writes a derived file and exports its surface, which the one freshness check holds to its source. A countable fact usually wants a registry as well.",
  },
  {
    title: "Decide where it runs",
    description:
      "What the script reads decides the slot. Source files go in the chain that runs before every build. Built HTML goes after the website build. A check against an earlier release needs the git tags. Anything that reads the network runs by hand, in no chain.",
  },
  {
    title: "Write the doc block",
    meta: "Makes the script",
    description:
      "The script opens with its filename, what it guards and why a failure matters, and why it runs where it runs. Any exception lives there or in a named constant beside it, with a reason a stranger could check.",
  },
  {
    title: "Follow the house conventions",
    description:
      "Collect every error, then end through the shared finish helper, never by exiting the process, and make each error name its fix. Normalise Windows line endings once, on the read. Build paths from the script’s own location and compare them with forward slashes.",
  },
  {
    title: "For a generator, export its surface",
    description:
      "The generator exports its assemble function, writes from an exported main that runs only when the script is run directly, and exports a surface listing what it writes. One check, validate-generated-files.mjs, rebuilds every surface in memory and compares it with the disk, so a hand edit or a stale file fails.",
  },
  {
    title: "Wire it in",
    meta: "Makes the chain entry",
    description: (
      <>
        Add a row to the chain in <GuideCode>scripts/chain.mjs</GuideCode>, generators ahead of
        validators. A website check also takes the row’s site mark. A post-build check joins{" "}
        <GuideCode>verify</GuideCode> and CI in the same change.
      </>
    ),
  },
  {
    title: "Close the loop and prove it fails",
    meta: "Makes the CLAUDE.md line",
    description:
      "Give the rule its line in CLAUDE.md. Run the script, break the rule on purpose to see the message, keep that break as a plant for the chain self-test, restore it, then run the whole chain. A check that cannot be made to fail is not guarding anything.",
  },
];

const allowed = <Badge variant="positive" label="Allowed" />;
const fails = <Badge variant="error" label="Fails" />;
const sanctioned = <Badge variant="neutral" label="Sanctioned" />;

export default function NewValidatorSkillPage() {
  return (
    <SkillGuide
      slug="new-validator"
      tagline="One rule, held by the build"
      intro={
        <>
          The <GuideCode>new-validator</GuideCode> skill is a checklist the coding agent follows
          to turn a rule written in prose into a script the build runs. Once the script is in the
          chain, breaking the rule stops the build. Below are the steps, then one real validator
          traced from the files it reads to the result a build sees.
        </>
      }
      steps={STEPS}
      example={{
        title: "A hex code, end to end",
        body: (
          <>
            A hex code like <GuideCode>#1A2B3C</GuideCode> may live in one file,{" "}
            <GuideCode>tokens-primitives.css</GuideCode>. Every other tier reaches it through a
            token, so a theme can swap the value in one place. Two validators hold that line.{" "}
            <GuideCode>validate-token-references.mjs</GuideCode> fails a semantic token written as
            a hex instead of a <GuideCode>var()</GuideCode>.{" "}
            <GuideCode>validate-raw-values.mjs</GuideCode> reads every stylesheet the package
            ships and fails a hex in component CSS. Say one is typed into a component’s
            stylesheet. The next build fails with the file, the line and the value, and says
            what to do: use the token that owns it, or mark it{" "}
            <GuideCode>ds-allow(color)</GuideCode> with a reason when it is deliberately off the
            scale.
          </>
        ),
        map: hexCodeMap,
        caption: "One file may hold a hex; a hex anywhere else stops the build with the fix named.",
      }}
      summary={{
        title: "Where a hex may live",
        body: "Each tier has one answer, and a script holds it. A var() fallback is a consumer’s override hook, so the raw values check reads past it.",
        caption: "Where a hex code may live, and what holds each rule",
        columns: [
          { key: "where", header: "Where", rowHeader: true },
          { key: "held", header: "Held by" },
          { key: "result", header: "A hex there" },
        ],
        rows: [
          { id: "primitives", cells: { where: "Primitives file", held: "The tier rule itself", result: allowed } },
          { id: "semantic", cells: { where: "Semantic token", held: <GuideCode>validate-token-references.mjs</GuideCode>, result: fails } },
          { id: "component", cells: { where: "Component CSS", held: <GuideCode>validate-raw-values.mjs</GuideCode>, result: fails } },
          { id: "allow", cells: { where: "Component CSS under ds-allow(color)", held: <GuideCode>validate-raw-values.mjs</GuideCode>, result: sanctioned } },
          { id: "fallback", cells: { where: "A var() fallback", held: <GuideCode>validate-raw-values.mjs</GuideCode>, result: sanctioned } },
        ],
      }}
    />
  );
}
