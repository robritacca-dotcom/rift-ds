import Link from "next/link";
import MegaNav from "@/components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "@/components/Sidebar/Sidebar";
import { FigmaIcon } from "@/components/BrandIcons/BrandIcons";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import { BRAND_NAME, FIGMA_URL, SITE_URL } from "@/config/brand.generated";
import { Accordion } from "rift-ds/components/Accordion/Accordion";
import { Button } from "rift-ds/components/Button/Button";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Table } from "rift-ds/components/Table/Table";
import { COMPONENT_COUNT } from "rift-ds/components/registry";
import { SYSTEM_THEME_COUNT, assertKitThemes, figmaThemes } from "./kit";
import { VariablesPanel } from "./VariablesPanel";
import { KitWindow } from "./KitWindow";
import s from "./page.module.css";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/docs/figma");

/* The Figma kit's page: the one place on the site that says what the kit
   is, how it lines up with the code and what it does not do, so the site
   chat answers Figma questions from one home. Counts and theme names derive
   from the registries; the kit's own facts live in ./kit.ts. */

/* Which themes are modes of the kit's Theme collection: the one home of
   the list. Edit it when a theme joins or leaves the kit's Theme
   collection (the figma-tokens skill does). Literal so the chat reads it;
   assertKitThemes holds each label to the theme registry. */
/* corpus-facts(Themes that are modes in the Figma kit): published on /docs/figma */
const KIT_THEMES = [
  { id: "tide", label: "Tide" },
  { id: "mono", label: "Smoke" },
  { id: "contrast", label: "Blueprint" },
  { id: "plum", label: "Signal" },
  { id: "forest", label: "Forest" },
];
assertKitThemes(KIT_THEMES);

const KIT_THEME_IDS = KIT_THEMES.map((t) => t.id);
const KIT_THEME_LABELS = figmaThemes(KIT_THEME_IDS, "light").map((t) => t.label);
const themeList = (labels: string[]) =>
  labels.length > 1 ? `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}` : labels.join("");

const KIT_PAGES = [
  {
    icon: "widgets",
    title: "A page per component",
    body: "Every component has its own page: the component set, one sticker sheet of every state, the parts it is built from, and buttons to its docs page and Storybook.",
  },
  {
    icon: "palette",
    title: "Colour",
    body: "The primitives and the semantic colours, with every swatch bound to its variable.",
  },
  {
    icon: "text_fields",
    title: "Typography",
    body: "Every style on the type scale, set in the theme's own faces.",
  },
  {
    icon: "interests",
    title: "Icons",
    body: "The Material Symbols the components use, as components you can swap into any icon slot.",
  },
  {
    icon: "contrast",
    title: "Themes",
    body: "A card for each theme in the kit, linking to its page on this site and to the playground. Figma caps how many modes a collection holds, so the kit carries some of the system's themes, not all of them.",
  },
  {
    icon: "forum",
    title: "AI chat",
    body: "The chat widget docked, as an overlay and full screen, its placements, and a reply with its follow-ups.",
  },
  {
    icon: "dashboard",
    title: "Templates",
    body: "Product screens from this site rebuilt from kit components at web and phone sizes, with each AI step of a flow as its own frame.",
  },
  {
    icon: "blur_on",
    title: "Backgrounds",
    body: "The ambient field and every shader scene as real Figma shader fills, in light and dark.",
  },
];

const CODE_MAP = [
  { figma: "Variable bg/container-primary", code: "Token --color-bg-container-primary" },
  { figma: "Component set Button", code: "Component Button" },
  { figma: "Component description", code: "The import line, how to use it and every prop" },
  { figma: "A page's Docs and Storybook buttons", code: "The component's docs page and its Storybook story" },
  { figma: "A component's frame", code: "The Figma button on that component's docs page" },
];

/* How each kind of prop reaches a component set. The new-figma-component
   skill's conventions are the rule the kit is built to; this is its
   public statement. */
const PROP_MAP = [
  { prop: "An enum prop, such as variant, tone or size", figma: "A variant property with the same name and the same values" },
  { prop: "A boolean state prop, such as disabled", figma: "A boolean property with the same name" },
  { prop: "The label, or other visible text", figma: "A text property" },
  { prop: "An icon, such as iconLeft or iconRight", figma: "An instance-swap property" },
  { prop: "Hover, pressed and focus, which are CSS states and not props", figma: "A State property at most, never a prop the code lacks" },
  { prop: "Callbacks, links, refs and accessible names, which have no look", figma: "Not a property; the component's description lists them" },
];

const TIERS = [
  { figma: "Primitives", code: "tokens-primitives.css", note: "Raw values" },
  { figma: "Theme collection", code: "A theme's stylesheet", note: "One mode per theme" },
  { figma: "Mode collection", code: "tokens-light.css and tokens-dark.css", note: "Light and Dark" },
  { figma: "Component layers", code: "Component CSS", note: "Bound to Mode variables" },
];

const DTCG_SNIPPET = `${SITE_URL}/schema/tokens/<theme>.<mode>.tokens.json

# for example
${SITE_URL}/schema/tokens/${KIT_THEME_IDS[0]}.light.tokens.json`;

export default function FigmaKitPage() {
  return (
    <>
      <MegaNav />

      <div className={s.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={s.dsContent} id="main-content">
          <PageBreadcrumb />

          <div className={`${s.pageHeader} animate-in`}>
            <h1 className={s.pageTitle}>Figma kit</h1>
            <Button
              label="Duplicate the kit"
              variant="tertiary"
              size="compact"
              iconLeft={<FigmaIcon />}
              iconRight="open_in_new"
              href={FIGMA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={s.headerAction}
            />
          </div>

          <div className={`${s.introSection} animate-in animate-delay-1`}>
            <p className={s.subDisplay}>The whole system, drawn for designers</p>
            <p className={s.introBody}>
              The {BRAND_NAME} kit is a free Figma file with a page for every one of the{" "}
              {COMPONENT_COUNT} components, built on variables named after the code&apos;s tokens.
              Themes and light and dark are variable modes, so one switch re-themes a whole page.
              Duplicate it from the Figma Community to start.
            </p>
          </div>

          <figure className={`${s.window} animate-in animate-delay-2`}>
            <KitWindow />
            <figcaption className={s.figureCaption}>
              The kit&apos;s Button page as it looks in Figma: the component set&apos;s variants
              are the component&apos;s props, its properties sit in the Design panel, and every
              colour is a variable named after its token.
            </figcaption>
          </figure>

          <section id="inside" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="What is in the kit" />
            <div className={s.cardGrid}>
              {KIT_PAGES.map((page) => (
                <div key={page.title} className={s.card}>
                  <span className={`material-symbols-rounded ${s.cardIcon}`} aria-hidden="true">
                    {page.icon}
                  </span>
                  <h3 className={s.cardTitle}>{page.title}</h3>
                  <p className={s.cardBody}>{page.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="themes" className={s.section}>
            <SectionTitle title="Themes and modes" />
            <p className={s.sectionNote}>
              The kit has three variable collections. <strong>Primitives</strong> holds each
              theme&apos;s raw values and is hidden. <strong>Mode</strong> holds the semantic colours
              every component binds to, in Light and Dark. <strong>Theme</strong> holds each
              theme&apos;s colours, corner radii, sizes and typefaces, one mode per theme:{" "}
              {themeList(KIT_THEME_LABELS)}, of the {SYSTEM_THEME_COUNT} themes the system ships.
              Frames are left on Auto, so setting the two modes on a
              page re-themes everything on it. The table shows what the variables hold in the
              theme and mode this site is in now.
            </p>
            <VariablesPanel themeIds={KIT_THEME_IDS} />
          </section>

          <section id="code" className={s.section}>
            <SectionTitle title="How it lines up with code" />
            <p className={s.sectionNote}>
              Names are shared on purpose. A variable is its token without the{" "}
              <code>--color-</code> prefix, a component set is named after its React component, and
              its variant properties are the component&apos;s props.
            </p>
            <Table
              bordered
              size="compact"
              caption="What each part of the kit matches in code"
              captionHidden
              columns={[
                { key: "figma", header: "In Figma", width: "45%", rowHeader: true },
                { key: "code", header: "In code" },
              ]}
              rows={CODE_MAP.map((row) => ({ id: row.figma, cells: row }))}
            />
            <p className={s.sectionNote}>
              Every prop that changes how a component looks is a property in the kit. Each enum prop
              is a variant property with the same name and values, each boolean state prop such as{" "}
              <code>disabled</code> is a boolean property, the label is a text property and icons are
              instance-swap properties. Hover, pressed and focus are CSS states rather than props, so
              they are a State property at most. Props that only change behaviour, such as callbacks,
              links and accessible names, have no look and are not properties; each component set&apos;s
              description lists every prop with the import line, and the component&apos;s docs page has
              the full contract.
            </p>
            <Table
              bordered
              size="compact"
              caption="How each kind of prop appears in the kit"
              captionHidden
              columns={[
                { key: "prop", header: "In code", width: "45%", rowHeader: true },
                { key: "figma", header: "In Figma" },
              ]}
              rows={PROP_MAP.map((row) => ({ id: row.prop, cells: row }))}
            />
            <div className={s.tiers} role="list" aria-label="The token tiers in Figma and in code">
              {TIERS.map((tier, i) => (
                <div key={tier.figma} className={s.tier} role="listitem">
                  <span className={s.tierStep}>{i + 1}</span>
                  <span className={s.tierFigma}>{tier.figma}</span>
                  <code className={s.tierCode}>{tier.code}</code>
                  <span className={s.tierNote}>{tier.note}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="source-of-truth" className={s.section}>
            <SectionTitle title="The code leads" />
            <p className={s.sectionNote}>
              The code is the source of truth, and the kit follows it. When a component or a token
              changes, two agent skills bring the file in step:{" "}
              <Link href="/skills#figma-parity" className={s.inlineLink}>figma-parity</Link>{" "}
              compares the whole kit with the library and fixes the Figma side, and{" "}
              <Link href="/skills#figma-tokens" className={s.inlineLink}>figma-tokens</Link> carries
              a token or theme change into the variables. A new component gets its page through{" "}
              <Link href="/skills#new-figma-component" className={s.inlineLink}>new-figma-component</Link>.
              Nothing in Figma flows back into the code.
            </p>
          </section>

          <section id="your-tokens" className={s.section}>
            <SectionTitle title="Any theme in your own file" />
            <p className={s.sectionNote}>
              Every theme, in or out of the kit, is published as DTCG token files, one per theme and
              mode, with semantic tokens kept as aliases of their primitives. Import one with a
              plugin that reads DTCG, such as Tokens Studio, to bring a theme the kit does not carry
              into your own file. The <Link href="/docs/schemas" className={s.inlineLink}>Schemas</Link>{" "}
              page lists every published file.
            </p>
            <CodeBlock code={DTCG_SNIPPET} language="bash" showCopy />
          </section>

          <section id="questions" className={s.section}>
            <SectionTitle title="Questions" />
            <Accordion
              items={[
                {
                  id: "free",
                  title: "Is the kit free?",
                  content: (
                    <p className={s.sectionNote}>
                      Yes. Open it on the Figma Community and duplicate it into your own drafts at no
                      cost. Your copy is yours to change.
                    </p>
                  ),
                },
                {
                  id: "fonts",
                  title: "Which fonts do I need?",
                  content: (
                    <p className={s.sectionNote}>
                      None to install. Every face the kit&apos;s themes use, and the Material Symbols
                      icons, are Google Fonts, which Figma has built in.
                    </p>
                  ),
                },
                {
                  id: "switch",
                  title: "How do I switch theme or light and dark?",
                  content: (
                    <p className={s.sectionNote}>
                      With nothing selected, the right panel shows the page&apos;s variable modes. Set
                      Theme to a theme and Mode to Light or Dark. Every frame is left on Auto, so the
                      whole page follows. Set the modes on a single frame to theme just that frame.
                    </p>
                  ),
                },
                {
                  id: "match",
                  title: "Does the kit match the code?",
                  content: (
                    <p className={s.sectionNote}>
                      It is drawn from the code: the variables from the tokens, the variants from the
                      props. Nothing syncs the two automatically: the kit is brought in step by hand
                      after a change, so if they ever disagree, the code and the docs pages on this
                      site are right.
                    </p>
                  ),
                },
                {
                  id: "props",
                  title: "Are all the props in the Figma kit?",
                  content: (
                    <p className={s.sectionNote}>
                      Every prop that changes how a component looks is. Enum props are variant
                      properties with the same names and values, boolean state props such as{" "}
                      <code>disabled</code> are boolean properties, the label is a text property and
                      icons are instance-swap properties. Props with no look, such as callbacks, links
                      and accessible names, are not properties. Each component set&apos;s description in
                      the kit lists every prop with its import line, and the component&apos;s docs page
                      on this site has the full contract.
                    </p>
                  ),
                },
                {
                  id: "code-connect",
                  title: "Does the kit use Code Connect?",
                  content: (
                    <p className={s.sectionNote}>
                      No. Code Connect needs a Figma Organization or Enterprise plan, so the kit has
                      none. Each component&apos;s description in the kit carries its usage and props
                      instead.
                    </p>
                  ),
                },
                {
                  id: "all-themes",
                  title: "Is every theme in the kit?",
                  content: (
                    <p className={s.sectionNote}>
                      No. Figma caps how many modes a variable collection can hold, so the kit carries
                      some of the system&apos;s themes as Theme modes, the ones listed under Themes and
                      modes. Every other theme comes into Figma through its token files.
                    </p>
                  ),
                },
                {
                  id: "sticker-sheets",
                  title: "Why is each sticker sheet in one theme?",
                  content: (
                    <p className={s.sectionNote}>
                      Sticker sheets are drawn once, in the default theme, because the variables do
                      the rest. Switch the page&apos;s Theme and Mode and every sheet redraws in that
                      look.
                    </p>
                  ),
                },
                {
                  id: "handoff",
                  title: "How do I get from a design to code?",
                  content: (
                    <p className={s.sectionNote}>
                      A component in the kit has the same name as its React component, and its variant
                      properties are its props, so a design reads straight across. The
                      component&apos;s docs page has the code, and every docs page has a Figma button
                      that opens that component&apos;s frame.
                    </p>
                  ),
                },
                {
                  id: "other-themes",
                  title: "Can I use a theme the kit does not carry?",
                  content: (
                    <p className={s.sectionNote}>
                      Yes. Import that theme&apos;s DTCG token files into your file with a plugin
                      such as Tokens Studio. Every theme is listed on the{" "}
                      <Link href="/foundations/themes" className={s.inlineLink}>Themes</Link> page.
                    </p>
                  ),
                },
              ]}
            />
          </section>
        </main>
      </div>
    </>
  );
}
