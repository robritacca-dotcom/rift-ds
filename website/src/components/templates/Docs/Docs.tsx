"use client";

/**
 * The docs template: the Button page of Halyard, a fictional React UI kit's
 * documentation site, built from the design system alone. It is the
 * proving ground for the site pieces: SiteLayout's frame, SiteHeader on the
 * width axis, a long sectioned NavList as the sidebar, the article's code,
 * reference and guideline pieces, an on-this-page rail read from the
 * headings, and SiteFooter. Its job is to be looked at and iterated on, so
 * a fault found here is fixed in the component, never patched in this file.
 *
 * Composition calls, and the design.md rules behind them:
 *
 * - **A crisp page.** The frame sits on the theme's crispest surface (white
 *   in light mode) with the site's ambient field off, for reading.
 * - **No app shell.** A documentation site is a site, not an app, so it
 *   lays out through SiteLayout rather than TemplateShell, and takes none of
 *   the app shell modes (App shells, Site shells on /foundations/layout).
 * - **The layout levers are live.** A Layout icon button in the header, the
 *   theme picker's form, opens a menu whose radio groups set the page width,
 *   the header width and where the sidebar docks, so every combination can
 *   be seen in place, and whether the on-this-page rail floats at the edge
 *   (AnchorNav's floating minimap, the site's own) or takes a column. It
 *   opens on a full-width header over a sidebar docked to the edge, a
 *   contained article and the floating rail.
 * - **Code is highlighted on the server.** The route calls `highlight()`
 *   from `rift-ds/code/highlight` and hands the lines down, so the page ships
 *   no highlighter; the install commands are `packageManagerTabs()` with one
 *   `syncKey`, so every install block follows the reader's pick.
 * - **The stage is the article**, a component page in the order a reader
 *   needs it: installation (tabbed commands, then the manual steps), usage
 *   and variants as live examples with their source, the labelling
 *   guideline as two Figures with verdicts in a Grid, accessibility as a
 *   keyboard Table and a callout, and the API reference as a Table with
 *   code columns.
 * - The product mark is the shared ProductMark disc and the product name
 *   follows the playground's Product name lever. The title row carries a
 *   Copy page SplitButton (the page as Markdown, with a menu to view it,
 *   view the schema or open it in an assistant) and a For agents Dialog of
 *   Markdown and schema tabs, the agent surfaces every rift-ds component
 *   page carries, and Figma and Storybook icon buttons linking the page's
 *   subject to its design file and its live examples. Every control lives in the
 *   header: the theme picker and the colour mode beside the menu bar, and
 *   the way back to the templates in the Layout menu, so the sidebar is the
 *   list of pages and nothing else.
 *
 * The assistant is the family's mock (TemplateAssistant), opened from the
 * header's Ask AI button, answering canned questions over this page; at the
 * dock threshold the page gives up the panel's width, the rule TemplateShell
 * applies for the app templates. All data is fictional, so the route is
 * excluded from the chat corpus (see EXCLUDED_ROUTES in
 * generate-site-corpus.mjs).
 */

import React, { useState } from "react";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import { Alert } from "rift-ds/components/Alert/Alert";
import { useDockViewport } from "rift-ds/chat";
import { AnchorNav } from "rift-ds/components/AnchorNav/AnchorNav";
import { ArtifactPanel } from "rift-ds/components/ArtifactPanel/ArtifactPanel";
import { BackToTop } from "rift-ds/components/BackToTop/BackToTop";
import { Breadcrumb } from "rift-ds/components/Breadcrumb/Breadcrumb";
import { Button } from "rift-ds/components/Button/Button";
import { CodeBlock, type CodeLine } from "rift-ds/components/CodeBlock/CodeBlock";
import { CommandPaletteTrigger } from "rift-ds/components/CommandPaletteTrigger/CommandPaletteTrigger";
import { Dialog } from "rift-ds/components/Dialog/Dialog";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { SplitButton } from "rift-ds/components/SplitButton/SplitButton";
import { MOTION_FEEDBACK_RESET_MS } from "rift-ds/tokens/motion";
import { Figure } from "rift-ds/components/Figure/Figure";
import { Grid } from "rift-ds/components/Grid/Grid";
import { Heading } from "rift-ds/components/Heading/Heading";
import { IconButton } from "rift-ds/components/IconButton/IconButton";
import { Instructions } from "rift-ds/components/Instructions/Instructions";
import { Link } from "rift-ds/components/Link/Link";
import { DropdownMenu, type DropdownMenuEntry } from "rift-ds/components/DropdownMenu/DropdownMenu";
import { NavList, type NavListEntry } from "rift-ds/components/NavList/NavList";
import { Pagination } from "rift-ds/components/Pagination/Pagination";
import { Prose } from "rift-ds/components/Prose/Prose";
import { Rating } from "rift-ds/components/Rating/Rating";
import { SiteFooter, type SiteFooterColumn } from "rift-ds/components/SiteFooter/SiteFooter";
import { SiteHeader, type SiteHeaderSection } from "rift-ds/components/SiteHeader/SiteHeader";
import { SiteLayout } from "rift-ds/components/SiteLayout/SiteLayout";
import { Table } from "rift-ds/components/Table/Table";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Textarea } from "rift-ds/components/Textarea/Textarea";
import { ThemeToggle } from "rift-ds/components/ThemeToggle/ThemeToggle";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { packageManagerTabs } from "rift-ds/code";
import BrandSwitcher from "../../BrandSwitcher/BrandSwitcher";
import TemplateAssistant, { type TemplateAssistantSuggestion } from "../TemplateAssistant/TemplateAssistant";
import { FigmaIcon, StorybookIcon } from "../../BrandIcons/BrandIcons";
import { ProductMark } from "../ProductMark/ProductMark";
import { useIsStaged, useStagedProductName } from "../useStagedProductName";
import { BUTTON_SCHEMA, PAGE_MARKDOWN, USAGE, VARIANTS } from "./docsSamples";
import styles from "./Docs.module.css";

const PRODUCT = "Halyard";
const CURRENT = "#button";


const COMPONENT_PAGES = [
  "Accordion", "Alert", "Alert dialog", "Avatar", "Badge", "Breadcrumb", "Button", "Calendar", "Card",
  "Carousel", "Checkbox", "Code block", "Combobox", "Command", "Context menu", "Data table", "Date picker",
  "Dialog", "Drawer", "Dropdown menu", "Field", "Hover card", "Input", "Kbd", "Menubar", "Pagination",
  "Popover", "Progress", "Radio group", "Select", "Sheet", "Skeleton", "Slider", "Switch", "Table", "Tabs",
  "Textarea", "Toast", "Toggle", "Tooltip",
];
const slug = (label: string) => `#${label.toLowerCase().replace(/ /g, "-")}`;

const NAV: NavListEntry[] = [
  {
    type: "section",
    label: "Getting started",
    items: [
      { label: "Introduction", href: "#introduction" },
      { label: "Installation", href: "#installation" },
      {
        label: "Theming",
        href: "#theming",
        items: [
          { label: "Colours", href: "#theming-colours" },
          { label: "Typography", href: "#theming-typography" },
          { label: "Dark mode", href: "#theming-dark-mode" },
        ],
      },
      { label: "CLI", href: "#cli", badge: "New" },
      { label: "Changelog", href: "#changelog" },
    ],
  },
  {
    type: "section",
    label: "Components",
    items: COMPONENT_PAGES.map((label) => ({
      label,
      href: label === "Button" ? CURRENT : slug(label),
      badge: label === "Menubar" ? "New" : undefined,
    })),
  },
  {
    type: "section",
    label: "Guides",
    collapsible: true,
    items: [
      { label: "Forms", href: "#guide-forms" },
      { label: "Server rendering", href: "#guide-server-rendering" },
      { label: "Accessibility", href: "#guide-accessibility" },
    ],
  },
];

/**
 * The header's sections. Each lists its pages as drawerItems, so on a phone,
 * where the sidebar leaves the page, the header's one menu carries the same
 * pages the sidebar does.
 */
const SECTIONS: SiteHeaderSection[] = [
  {
    id: "docs",
    label: "Docs",
    href: "#introduction",
    drawerItems: [
      { label: "Introduction", href: "#introduction" },
      { label: "Installation", href: "#installation" },
      { label: "Theming", href: "#theming" },
      { label: "CLI", href: "#cli" },
      { label: "Changelog", href: "#changelog" },
    ],
  },
  {
    id: "components",
    label: "Components",
    href: CURRENT,
    drawerItems: COMPONENT_PAGES.map((label) => ({ label, href: label === "Button" ? CURRENT : slug(label) })),
  },
  { id: "blocks", label: "Blocks", href: "#blocks" },
  { id: "changelog", label: "Changelog", href: "#changelog" },
];

const FOOTER_COLUMNS: SiteFooterColumn[] = [
  {
    title: "Docs",
    links: [
      { label: "Introduction", href: "#introduction" },
      { label: "Installation", href: "#installation" },
      { label: "Theming", href: "#theming" },
      { label: "Changelog", href: "#changelog" },
    ],
  },
  {
    title: "Components",
    links: [
      { label: "Button", href: "#button" },
      { label: "Data table", href: "#data-table" },
      { label: "Menubar", href: "#menubar" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discussions", href: "https://example.com/discussions", external: true },
      { label: "Contributing", href: "#contributing" },
      { label: "Code of conduct", href: "#conduct" },
    ],
  },
];

/** The mock assistant's starters and canned answers, over this Button page. */
const CHAT_SUGGESTIONS: TemplateAssistantSuggestion[] = [
  { id: "variant", label: "Which variant for a save?" },
  { id: "icon", label: "How do I make an icon button?" },
  { id: "loading", label: "Show a button while it loads" },
];
const CHAT_REPLIES: Record<string, string> = {
  variant:
    "Use the primary variant for the save, since it is the one main action in the view, and secondary or tertiary for Cancel beside it. Keep one primary per view, so the reader always knows where the main path is.",
  icon:
    "Give the Button an icon and no text, and pass a label. The label becomes the name a screen reader announces and the tooltip a pointer sees, so the button is never a mystery shape.",
  loading:
    "Set loading while the action runs. The button shows a spinner, keeps its width so nothing shifts, and holds still so a second press cannot send the action twice.",
};
const CHAT_FALLBACK =
  "I can answer from this page: the Button's variants, sizes, labels, keyboard support and props. Try one of the suggestions to see how an answer reads.";

type Width = "contained" | "full";
type Dock = "edge" | "content";

export interface DocsProps {
  /** USAGE highlighted by the route. */
  usageLines?: CodeLine[];
  /** VARIANTS highlighted by the route. */
  variantLines?: CodeLine[];
}

export default function Docs({ usageLines, variantLines }: DocsProps) {
  const product = useStagedProductName(PRODUCT);
  const staged = useIsStaged();
  const [pageWidth, setPageWidth] = useState<Width>("contained");
  const [headerWidth, setHeaderWidth] = useState<Width>("full");
  const [dock, setDock] = useState<Dock>("edge");
  const [asidePlacement, setAsidePlacement] = useState<"edge" | "column">("edge");
  const [chatOpen, setChatOpen] = useState(false);
  // At the dock threshold the panel docks and the page gives up its width;
  // below it the panel overlays (or takes over a phone), and the page stays.
  const chatDocks = useDockViewport();
  const [helpful, setHelpful] = useState(0);
  const [sent, setSent] = useState(false);
  const [copiedPage, setCopiedPage] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const [agentsTab, setAgentsTab] = useState("markdown");

  // "Copy page" puts the page's Markdown on the clipboard, for pasting into
  // an assistant, and says so for a moment.
  const copyPage = () => {
    navigator.clipboard?.writeText(PAGE_MARKDOWN).catch(() => {});
    setCopiedPage(true);
    window.setTimeout(() => setCopiedPage(false), MOTION_FEEDBACK_RESET_MS);
  };
  const openAgents = (tab: string) => {
    setAgentsTab(tab);
    setAgentsOpen(true);
  };
  const askIn = (base: string) => {
    const prompt = `Read ${window.location.href} so I can ask questions about it.`;
    window.open(`${base}${encodeURIComponent(prompt)}`, "_blank", "noopener,noreferrer");
  };

  const radio = <T extends string>(value: T, current: T, label: string, set: (v: T) => void) => ({
    label,
    selected: value === current,
    onClick: () => set(value),
  });
  const layoutItems: DropdownMenuEntry[] = [
    {
      type: "group",
      label: "Page width",
      items: [
        radio("contained", pageWidth, "Contained", setPageWidth),
        radio("full", pageWidth, "Full width", setPageWidth),
      ],
    },
    { type: "separator" },
    {
      type: "group",
      label: "Header width",
      items: [
        radio("contained", headerWidth, "Contained", setHeaderWidth),
        radio("full", headerWidth, "Full width", setHeaderWidth),
      ],
    },
    { type: "separator" },
    {
      type: "group",
      label: "Sidebar",
      items: [
        radio("edge", dock, "Docked to the edge", setDock),
        radio("content", dock, "Beside the content", setDock),
      ],
    },
    { type: "separator" },
    {
      type: "group",
      label: "On this page",
      items: [
        radio("edge", asidePlacement, "Floating at the edge", setAsidePlacement),
        radio("column", asidePlacement, "A column beside the page", setAsidePlacement),
      ],
    },
    // The way back to the templates index, the other templates' rail footer
    // link; a staged preview in the playground draws none.
    ...(staged
      ? []
      : [
          { type: "separator" as const },
          { label: "All templates", icon: "arrow_back", onClick: () => window.location.assign("/templates") },
        ]),
  ];

  return (
    <>
    {/* The family's switch for the ambient background: this page reads on a
        flat crisp surface, with nothing behind the text. */}
    <div data-bg-hidden hidden />
    <SiteLayout
      className={[styles.layout, chatOpen && chatDocks ? styles.layoutChatOpen : ""].filter(Boolean).join(" ")}
      width={pageWidth}
      headerWidth={headerWidth}
      footerWidth={headerWidth}
      readingWidth
      sidebarDock={dock}
      asidePlacement={asidePlacement}
      mainId="docs-main"
      header={
        <SiteHeader
          brand={
            <span className={styles.brand}>
              <ProductMark />
              {product}
            </span>
          }
          sections={SECTIONS}
          currentHref={CURRENT}
          foldBelow="tablet"
          actions={
            <>
              <CommandPaletteTrigger label="Search the docs" size="compact" />
              <DropdownMenu
                align="end"
                size="compact"
                items={layoutItems}
                trigger={
                  <IconButton icon="view_quilt" label="Layout" variant="secondary" tone="neutral" size="compact" />
                }
              />
              <BrandSwitcher size="compact" />
              <ThemeToggle showLabels={false} size="compact" />
              <AiButton label="Ask AI" size="compact" onClick={() => setChatOpen(true)} />
            </>
          }
          condensedActions={
            <>
              <CommandPaletteTrigger label="Search the docs" size="compact" iconOnly />
              <ThemeToggle size="compact" cycle />
              <AiButton label="Ask AI" size="compact" iconOnly onClick={() => setChatOpen(true)} />
            </>
          }
        />
      }
      sidebar={
        <NavList
          items={NAV}
          size="compact"
          scrollable
          currentHref={CURRENT}
        />
      }
      aside={
        <AnchorNav
          fromHeadings={{ root: "#docs-main" }}
          variant={asidePlacement === "edge" ? "floating" : "list"}
        />
      }
      footer={
        <SiteFooter
          brand={
            <span className={styles.brand}>
              <ProductMark />
              {product}
            </span>
          }
          description={`Accessible React components and the guides to build with them. ${product} is fictional.`}
          columns={FOOTER_COLUMNS}
          legal={`© 2026 ${product}. Released under the MIT licence.`}
        />
      }
    >
      <div className={styles.article}>

        <header className={styles.intro}>
          <Breadcrumb items={[{ label: "Docs", href: "#introduction" }, { label: "Components", href: "#components" }, { label: "Button" }]} />
          <div className={styles.titleRow}>
            <Heading level={1} tier="display-2">
              Button
            </Heading>
            <div className={styles.titleActions}>
              <SplitButton
                label={copiedPage ? "Copied" : "Copy page"}
                iconLeft={copiedPage ? "check" : "content_copy"}
                variant="secondary"
                tone="neutral"
                size="compact"
                align="end"
                menuLabel="More ways to read this page"
                onClick={copyPage}
                items={[
                  { label: "View as Markdown", icon: "markdown", onClick: () => openAgents("markdown") },
                  { label: "View the schema", icon: "data_object", onClick: () => openAgents("schema") },
                  { type: "separator" },
                  { label: "Open in Claude", icon: "open_in_new", onClick: () => askIn("https://claude.ai/new?q=") },
                  { label: "Open in ChatGPT", icon: "open_in_new", onClick: () => askIn("https://chatgpt.com/?q=") },
                ]}
              />
              {/* Where else the page's subject lives: its design file and its
                  live examples, each opening in a new tab. */}
              <IconButton
                icon={<FigmaIcon />}
                label="Open in Figma"
                variant="secondary"
                tone="neutral"
                size="compact"
                href="https://www.figma.com/"
                target="_blank"
                rel="noopener noreferrer"
              />
              <IconButton
                icon={<StorybookIcon />}
                label="Open in Storybook"
                variant="secondary"
                tone="neutral"
                size="compact"
                href="https://storybook.js.org/"
                target="_blank"
                rel="noopener noreferrer"
              />
            </div>
          </div>
          <p className={styles.lead}>
            Starts an action: saving a form, sending a message, opening a dialog.
          </p>
          <p className={styles.introBody}>
            A Button tells the reader what will happen when they press it, and does it on this page. It comes in three
            variants that set how much it stands out, so a view can have one clear main action with quieter ones
            beside it, and two sizes that match the height of the fields and controls it sits with. It renders a
            native button element, so the keyboard and assistive technology work with no extra wiring. Use a Link
            instead when pressing it takes the reader somewhere else.
          </p>
        </header>

        <section className={styles.section}>
          <SectionTitle title="Installation" anchor />
          <CodeBlock tabs={packageManagerTabs({ run: "halyard-ui add button" })} syncKey="docs-package-manager" />
          <Prose>
            <p>Or add it by hand, if the package is already in your app:</p>
          </Prose>
          <Instructions
            steps={[
              { label: "Install the package", description: "Once per app, with your package manager." },
              { label: "Import the stylesheet", description: "Once, in your root layout, before your own CSS." },
              { label: "Import the Button", description: "From halyard-ui, wherever you need it." },
            ]}
          />
          <CodeBlock tabs={packageManagerTabs({ install: "halyard-ui" })} syncKey="docs-package-manager" />
        </section>

        <section className={styles.section}>
          <SectionTitle title="Usage" anchor />
          <Prose>
            <p>
              Give each button a verb that says what it does, and one <code>primary</code> per view for the main
              action.
            </p>
          </Prose>
          <ArtifactPanel layout="inline" viewLabel="Save bar example" code={USAGE} lines={usageLines} language="tsx">
            <Button variant="secondary">Cancel</Button>
            <Button variant="primary">Save changes</Button>
          </ArtifactPanel>
        </section>

        <section className={styles.section}>
          <SectionTitle title="Variants" anchor />
          <Prose>
            <p>
              <code>variant</code> sets how much the button stands out. Use <code>primary</code> for the one main
              action, <code>secondary</code> for an alternative to it, and <code>tertiary</code> for a quiet action
              such as Cancel.
            </p>
          </Prose>
          <ArtifactPanel layout="inline" viewLabel="Variants example" code={VARIANTS} lines={variantLines} language="tsx">
            <Button variant="primary">Publish</Button>
            <Button variant="secondary">Preview</Button>
            <Button variant="tertiary">Discard draft</Button>
          </ArtifactPanel>
        </section>

        <section className={styles.section}>
          <SectionTitle title="Writing labels" anchor />
          <Prose>
            <p>Start with a verb, and name the outcome rather than the gesture.</p>
          </Prose>
          <Grid columns={2} minColumnWidth="240px" gap="400">
            <Figure variant="positive" caption="Say what happens when it is pressed.">
              <div className={styles.specimen}>
                <Button variant="primary">Save changes</Button>
              </div>
            </Figure>
            <Figure variant="error" caption="Leave the reader guessing what it does.">
              <div className={styles.specimen}>
                <Button variant="primary">Click here</Button>
              </div>
            </Figure>
          </Grid>
        </section>

        <section className={styles.section}>
          <SectionTitle title="Accessibility" anchor />
          <Prose>
            <p>
              Button renders a native <code>button</code> element, so it is in the tab order and pressed from the
              keyboard with no extra wiring.
            </p>
          </Prose>
          <Table
            bordered
            size="compact"
            caption="Keyboard"
            captionHidden
            columns={[
              { key: "key", header: "Key", width: "24%" },
              { key: "action", header: "Action" },
            ]}
            rows={[
              { id: "tab", cells: { key: <Kbd size="compact">Tab</Kbd>, action: "Moves focus to the button." } },
              { id: "enter", cells: { key: <Kbd size="compact">Enter</Kbd>, action: "Presses the button." } },
              { id: "space", cells: { key: <Kbd size="compact">Space</Kbd>, action: "Presses the button." } },
            ]}
          />
          <Alert
            variant="info"
            title="An icon alone needs a name"
            description="A button that shows only an icon has no visible text, so give it a label that screen readers announce and a tooltip shows."
          />
        </section>

        <section className={styles.section}>
          <SectionTitle title="API reference" anchor />
          <Table
            bordered
            size="compact"
            caption="Button props"
            captionHidden
            columns={[
              { key: "prop", header: "Prop", mono: true, width: "20%", rowHeader: true },
              { key: "type", header: "Type", mono: true, width: "32%" },
              { key: "default", header: "Default", mono: true, width: "16%" },
              { key: "description", header: "Description" },
            ]}
            rows={[
              { id: "variant", cells: { prop: "variant", type: "'primary' | 'secondary' | 'tertiary'", default: "'primary'", description: "How much the button stands out." } },
              { id: "size", cells: { prop: "size", type: "'default' | 'compact'", default: "'default'", description: "The control height, matching the fields beside it." } },
              { id: "onClick", cells: { prop: "onClick", type: "(event: MouseEvent) => void", default: "\u2013", description: "Runs when the button is pressed." } },
              { id: "disabled", cells: { prop: "disabled", type: "boolean", default: "false", description: "Holds the button still." } },
              { id: "loading", cells: { prop: <>loading <Badge label="New" variant="neutral" /></>, type: "boolean", default: "false", description: "Shows a spinner and holds the button still while an action runs." } },
            ]}
          />
        </section>

        <footer className={styles.pageFooter}>
          <div className={styles.meta}>
            <Link variant="standalone" size="compact" href="#edit" iconLeft="edit">
              Edit this page
            </Link>
            <span className={styles.updated}>Last updated 12 Nov 2026</span>
          </div>
          {sent ? (
            <p className={styles.feedbackText}>Thanks for telling us.</p>
          ) : (
            <div className={styles.feedback}>
              <div className={styles.feedbackRow}>
                <span id="docs-feedback" className={styles.feedbackText}>
                  Was this page helpful?
                </span>
                <Rating
                  variant="thumbs"
                  aria-labelledby="docs-feedback"
                  upLabel="Yes"
                  downLabel="No"
                  value={helpful}
                  onValueChange={setHelpful}
                />
              </div>
              {helpful > 0 && (
                <div className={styles.feedbackNote}>
                  <Textarea
                    label={helpful === 1 ? "What helped? (optional)" : "What was missing? (optional)"}
                    size="compact"
                  />
                  <div>
                    <Button variant="secondary" size="compact" label="Send" onClick={() => setSent(true)} />
                  </div>
                </div>
              )}
            </div>
          )}
          <Pagination
            variant="adjacent"
            previous={{ href: "#breadcrumb", label: "Breadcrumb" }}
            next={{ href: "#calendar", label: "Calendar" }}
          />
        </footer>
      </div>
      <BackToTop focusTarget="docs-main" />
      {/* The family's mock assistant over this page: docked beside the page at
          the dock threshold, an overlay below it, a takeover on a phone. */}
      <TemplateAssistant
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title={`${product} AI`}
        surface="raised"
        askLine="Ask about variants, labels, keyboard support or props"
        suggestions={CHAT_SUGGESTIONS}
        replies={CHAT_REPLIES}
        fallback={CHAT_FALLBACK}
        disclaimer="A mock assistant with canned answers over this page."
      />
      {/* For agents: the page and the component it documents as the plain
          text an assistant reads, the dialog every rift-ds component page
          offers. */}
      <Dialog
        open={agentsOpen}
        onOpenChange={setAgentsOpen}
        title="For agents"
        description="This page as Markdown, and the Button's machine-readable contract. Paste either into an assistant."
        size="lg"
      >
        <CodeBlock
          tabs={[
            { value: "markdown", label: "Markdown", code: PAGE_MARKDOWN },
            { value: "schema", label: "Schema", code: BUTTON_SCHEMA },
          ]}
          value={agentsTab}
          onValueChange={setAgentsTab}
          maxHeight={420}
          tabsLabel="Formats"
        />
      </Dialog>
    </SiteLayout>
    </>
  );
}
