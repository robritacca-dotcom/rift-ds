"use client";

import { useState } from "react";
import Link from "next/link";
import MegaNav from "@/components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "@/components/Sidebar/ComponentsSidebar";
import PageLinks from "@/components/PageLinks/PageLinks";
import PropsTable from "@/components/PropsTable/PropsTable";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { Table } from "rift-ds/components/Table/Table";
import { ModelPicker } from "rift-ds/components/ModelPicker/ModelPicker";
import type { AttachmentItem } from "rift-ds/components/Attachment/fileTypes";
import { componentMetadata } from "rift-ds/components/registry";
import {
  CHAT_PLACEMENTS,
  DOCK_MAX_WIDTH,
  DOCK_MIN_WIDTH,
  DOCK_QUERY,
  FLOAT_MAX_SCALE,
  SUGGESTION_MAX_CHARS,
  TAKEOVER_QUERY,
  THREADS_RAIL_MIN_WIDTH,
  ASIDE_RAIL_MIN_WIDTH,
  ARTIFACT_CARD_KIND,
  artifactCard,
  chatWidget,
} from "rift-ds/chat";
import {
  DEMO_MENTIONS,
  DEMO_MODELS,
  DEMO_PAGE_ARTIFACT,
  DEMO_WELCOME_OPTIONS,
  DemoWelcome,
  demoAgentTabs,
  type DemoChartCard,
  type DemoPlanCard,
} from "rift-ds/chat/demo";
import { componentApi } from "@/data/component-api.generated";
import { ChatStage, type ChatStageSetup } from "./ChatStage";
import styles from "./page.module.css";

/* The chat widget's component page: every option it takes, stated and
   shown on the chat itself, then the props. Each example is the whole
   widget on the scripted demo transport, configured for its section; the
   parts it is built from have pages of their own. The Desktop and Mobile
   tabs restage every example, the way the foundations pages switch their
   viewport. How to add it lives on /docs/chat. The placements and every
   threshold derive from the package; the props from the generated
   component API; nothing countable is typed here. */

const widgetApi = componentApi.find((entry) => entry.kind === "widget" && entry.name === chatWidget.name);

const parts = chatWidget.parts
  .map((name) => componentMetadata.find((component) => component.name === name))
  .filter((component): component is NonNullable<typeof component> => Boolean(component));

/* The welcome slot's fillings, from the demo's own list, none first: the
   starters alone, then links, cards and the dashboard in their place, the
   dashboard running wide. */
const WELCOME_ORDER = ["none", "links", "cards", "dashboard"];
const WELCOME_VARIANTS = WELCOME_ORDER.map((value) => {
  const option = DEMO_WELCOME_OPTIONS.find((candidate) => candidate.value === value);
  if (!option) throw new Error(`DEMO_WELCOME_OPTIONS has no "${value}" variant`);
  return { ...option, wide: value === "dashboard" };
});

const viewportTabs = [
  { value: "desktop", label: "Desktop", icon: "desktop_windows" },
  { value: "mobile", label: "Mobile", icon: "smartphone" },
];

const strip = (query: string) => query.replace(/[()]/g, "");

const SCREENS = [
  { id: "wide", screen: "Wide", where: "Docked beside the page. The page makes room for it.", width: strip(DOCK_QUERY) },
  { id: "tablet", screen: "Tablet", where: "Over the page, with the page dimmed behind it.", width: "Between the two" },
  { id: "phone", screen: "Phone", where: "The whole screen. The page is hidden until the chat closes.", width: strip(TAKEOVER_QUERY) },
];

/* One line per placement, keyed by the package's roster so a placement added
   there shows up here. */
const PLACEMENT_LINES: Record<string, string> = {
  right: "Docked to the right edge of the page.",
  left: "Docked to the left edge of the page.",
  floating: "Popped out as a card over the page, moved by its header and sized from its edges.",
};

const PLACEMENTS = [
  ...CHAT_PLACEMENTS.map((placement) => ({ id: placement.id, label: placement.label, what: PLACEMENT_LINES[placement.id] ?? "" })),
  { id: "fullscreen", label: "Full screen", what: "The panel fills the viewport. Opening and closing it is animated." },
  {
    id: "resize",
    label: "Adjustable width",
    what: `A docked panel is dragged between ${DOCK_MIN_WIDTH}px and ${DOCK_MAX_WIDTH}px wide. A floating card grows to ${FLOAT_MAX_SCALE} times its resting size.`,
  },
];

/* The cards and files the staged turns carry. Invented, like everything in the demo. */
const SIGNUPS_CARD: DemoChartCard = {
  type: "area",
  title: "Trial signups",
  meta: "Last six weeks",
  data: [
    { week: "W1", signups: 320 },
    { week: "W2", signups: 410 },
    { week: "W3", signups: 380 },
    { week: "W4", signups: 520 },
    { week: "W5", signups: 610 },
    { week: "W6", signups: 720 },
  ],
  xKey: "week",
  yKey: "signups",
  label: "Signups",
};

const PLAN_CARD: DemoPlanCard = {
  steps: [
    { label: "Check the workspace quota", status: "completed" },
    { label: "Create the shared project", status: "completed", detail: "acme-design / launch" },
    { label: "Invite the three teammates", status: "active" },
    { label: "Post the welcome note", status: "pending" },
  ],
};

/* One picture on its own: the tile keeps the photo's ratio rather than cropping it square. */
const ONE_PICTURE: AttachmentItem[] = [
  {
    id: "hero",
    name: "launch-hero.jpg",
    kind: "image",
    size: 1_240_000,
    status: "ready",
    previewSrc: "/images/attachments/photo-wide.jpg",
    previewAlt: "The launch hero shot",
  },
];

const ONE_FILE: AttachmentItem[] = [{ id: "brief", name: "Launch brief.docx", kind: "document", size: 412_000, status: "ready" }];

const MANY_FILES: AttachmentItem[] = [
  { id: "plan", name: "Q3 launch plan.pdf", kind: "pdf", size: 2_400_000, status: "ready" },
  { id: "budget", name: "Budget by phase.xlsx", kind: "spreadsheet", size: 96_000, status: "ready" },
  { id: "deck", name: "Kickoff deck.pptx", kind: "presentation", size: 5_100_000, status: "ready" },
  { id: "config", name: "workspace.config.ts", kind: "code", size: 2_100, status: "ready" },
  { id: "notes", name: "Standup notes.txt", kind: "text", size: 4_800, status: "ready" },
];

/* What each example stages at mount. Injected turns are stage dressing:
   they never reach a transport. */
const stageQuickReplies: ChatStageSetup = (chat) => {
  chat.injectTurn({ role: "user", text: "How do I get started?" });
  chat.injectTurn({
    role: "assistant",
    text: "Create a workspace from the dashboard, then invite your team from Settings. Everyone you add sees the shared projects the moment they join.",
    tracePoints: ["The question maps to the first-run flow."],
    durationSeconds: 2,
    followups: ["Set it all up for me", "What do the plans include?", "How is the trial going?"],
  });
};

/* The questions example: a scripted prompt whose reply asks, so the card is
   live and answering it plays the branch written for that answer. */
const stageQuestions: ChatStageSetup = (chat) => {
  chat.send("Help me pick a plan");
};

/* The flow example: the same short exchange as the quick replies, in the
   classic bottom-up thread, so the two layouts read side by side. */
const stageFlow: ChatStageSetup = (chat) => {
  stageQuickReplies(chat);
};

/* The artifact example: a reply that made a page, already open beside the
   chat where the stage is wide enough to seat it there. */
const stageArtifact =
  (openIt: boolean): ChatStageSetup =>
  (chat) => {
    chat.injectTurn({ role: "user", text: "Draft the launch page" });
    chat.injectTurn({
      role: "assistant",
      text: "A first draft of the launch page is up beside the chat. The source is behind the Code view.",
      tracePoints: ["One document, its own styles, no scripts."],
      durationSeconds: 3,
      card: artifactCard(DEMO_PAGE_ARTIFACT),
    });
    if (openIt) chat.openArtifact(DEMO_PAGE_ARTIFACT);
  };

const stageRichContent: ChatStageSetup = (chat) => {
  chat.injectTurn({ role: "user", text: "How is the trial going?" });
  chat.injectTurn({
    role: "assistant",
    text: "Signups have climbed for five of the six weeks since the trial opened.",
    tracePoints: ["Six weeks of signup data since the trial opened."],
    durationSeconds: 3,
    card: { kind: "chart", data: SIGNUPS_CARD },
  });
  chat.injectTurn({
    role: "assistant",
    text: "While you were away the workspace setup carried on. Two steps are done; the invites are going out now.",
    card: { kind: "plan", data: PLAN_CARD },
  });
};

const stageStatus: ChatStageSetup = (chat) => {
  chat.send("How is the trial going?");
};

const stageThreads: ChatStageSetup = (chat) => {
  chat.send("How do I get started?");
};

const stageDocuments: ChatStageSetup = (chat) => {
  chat.injectTurn({ role: "user", text: "Here is the hero shot for launch week.", attachments: ONE_PICTURE });
  chat.injectTurn({
    role: "assistant",
    text: "Looks right for the landing page. The crop leaves room for the headline on the left.",
  });
  chat.injectTurn({ role: "user", text: "Here is the brief we are working from.", attachments: ONE_FILE });
  chat.injectTurn({
    role: "assistant",
    text: "Read it. The brief names three phases, and most of the budget sits behind launch week.",
    tracePoints: ["Fourteen pages; read it before answering."],
    durationSeconds: 4,
  });
  chat.injectTurn({ role: "user", text: "And everything else from the launch folder.", attachments: MANY_FILES });
  chat.injectTurn({
    role: "assistant",
    text: "Got all five. The budget sheet and the config agree on twelve seats; the deck still says five.",
    tracePoints: ["Five files, two of them spreadsheets."],
    durationSeconds: 3,
  });
};

/* A slower script for the one example that should be seen thinking. */
const SLOW_TIMING = { statusMs: 2200, handoffMs: 500, streamMs: 45 } as const;

export default function AiChatPage() {
  const [viewport, setViewport] = useState("desktop");
  const phone = viewport === "mobile";
  const stageHeight = phone ? 760 : 720;

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />

          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>{chatWidget.label}</h1>
            <PageLinks storybookPath="/?path=/docs/chat-chatwidget--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>The whole chat, assembled, set up with props</p>
            <p className={styles.introBody}>
              Three components make it: a provider that holds the conversation, the chat surface,
              and a launcher that is the button and the panel. Everything below is a prop on one of
              them, shown on the chat itself, running on a written conversation with no model
              behind it. How to add it, from one command to the headless engine, is on{" "}
              <Link href="/docs/chat" className={styles.inlineLink}>
                the AI chat docs page
              </Link>
              , and{" "}
              <Link href="/playground?view=chat" className={styles.inlineLink}>
                the playground
              </Link>{" "}
              stages the same chat with every option on a lever.
            </p>
          </div>

          <div className={`${styles.viewportToggle} animate-in animate-delay-2`}>
            <Tabs tabs={viewportTabs} value={viewport} onValueChange={setViewport} aria-label="Examples by viewport" />
            <p className={styles.viewportNote}>
              {phone
                ? `Under ${strip(TAKEOVER_QUERY)} the chat is the whole screen, with the welcome stacked for a handset.`
                : "On a wide panel the rails sit inline and the welcome spreads out."}
            </p>
          </div>

          <section id="live" className={`${styles.section} animate-in animate-delay-2`} data-anchor-ignore>
            <SectionTitle title="Live" />
            <p className={styles.sectionNote}>
              Everything on, the way the playground stages it: threads and tabs, the agent panel,
              the artifact panel, files, mentions and the model picker. Pick a question to see a reply arrive with its
              reasoning, a card and the follow-up chips.
            </p>
            <ChatStage
              key={`live-${viewport}`}
              phone={phone}
              height={phone ? 800 : 820}
              widget={{
                threads: !phone,
                threadsProps: { defaultExpanded: false, logoText: "Acme Assistant", profile: { name: "Jordan Reyes", meta: "Pro" } },
                tabs: !phone,
                agent: { tabs: demoAgentTabs("Acme Assistant") },
                artifacts: true,
                fileAttachments: true,
                mentions: DEMO_MENTIONS,
                placeholder: "Ask anything, @ for entities or / for commands",
                composerActions: <ModelPicker models={DEMO_MODELS} placement="top" />,
              }}
            />
          </section>

          <section id="responsive" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Responsive forms" />
            <p className={styles.sectionNote}>
              The launcher picks one of three forms from the viewport; nothing to set. Inside the
              panel, the thread rail and the agent pane sit inline when the panel is at least{" "}
              {THREADS_RAIL_MIN_WIDTH}px and {ASIDE_RAIL_MIN_WIDTH}px wide and open as sheets below
              that, judged by the panel&apos;s own width rather than the screen&apos;s. The{" "}
              <code>phone</code> prop on the surface stacks the welcome screen for a handset, which
              is what the Mobile tab above switches on.
            </p>
            <Table
              bordered
              size="compact"
              caption="Where the chat sits on each screen"
              captionHidden
              columns={[
                { key: "screen", header: "Screen", width: "18%" },
                { key: "where", header: "Form" },
                { key: "width", header: "Viewport", width: "24%" },
              ]}
              rows={SCREENS.map((row) => ({ id: row.id, cells: { screen: row.screen, where: row.where, width: row.width } }))}
            />
          </section>

          <section id="placement" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Placement" />
            <p className={styles.sectionNote}>
              <code>defaultPlacement</code> on the provider sets where the panel starts. With{" "}
              <code>placementEnabled</code> on the surface, the header carries a menu the visitor
              moves it from. <code>fullscreenEnabled</code> and <code>closeEnabled</code> add or
              remove those two controls. A phone has neither the menu nor the resize grips. The
              chat in the corner of this page has all of them on.
            </p>
            <Table
              bordered
              size="compact"
              caption="Placements"
              captionHidden
              columns={[
                { key: "label", header: "Placement", width: "24%" },
                { key: "what", header: "What it does" },
              ]}
              rows={PLACEMENTS.map((row) => ({ id: row.id, cells: { label: row.label, what: row.what } }))}
            />
          </section>

          <section id="welcome" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Welcome screen" />
            <p className={styles.sectionNote}>
              An empty chat shows a greeting for the time of day, the <code>title</code> and{" "}
              <code>tagline</code>, and the <code>starters</code>. The <code>widgets</code> slot
              puts anything under the composer: links, cards or a whole dashboard, held to one
              screen or scrolling as a page with <code>widgetsLayout</code>, and as wide as the
              composer or the panel with <code>widgetsWidth</code>. It all leaves with the first
              message. The four fillings, side by side in the compact layout: the starters alone,
              then links, cards and a dashboard in their place, the dashboard running wide.
            </p>
            <div className={styles.stageGrid}>
              {WELCOME_VARIANTS.map((variant) => (
                <figure key={`welcome-${variant.value}-${viewport}`} className={styles.stageCell}>
                  <ChatStage
                    phone={phone}
                    height={780}
                    widget={(chat) => ({
                      compact: true,
                      showStarters: variant.value === "none",
                      /* No slot at all for the bare welcome: an element that renders nothing
                         would still reserve the slot's room and lift the greeting off centre. */
                      widgets: variant.value === "none" ? undefined : <DemoWelcome variant={variant.value} onAsk={chat.send} />,
                      widgetsLayout: variant.wide || phone ? "scroll" : "fit",
                      widgetsWidth: variant.wide ? "wide" : "column",
                    })}
                  />
                  <figcaption className={styles.stageCaption}>{variant.label}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section id="threads" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Threads and tabs" />
            <p className={styles.sectionNote}>
              <code>threads</code> turns the history rail on. Every chat is kept and a new chat is
              named after its first reply; a chat can be pinned, renamed or deleted from its row.{" "}
              <code>threadsProps</code> sets the rail&apos;s brand, profile and whether it starts
              expanded; the provider&apos;s <code>threads</code> option seeds the history, switches
              the detail lines and pins, and takes the rename, delete and pin callbacks.{" "}
              <code>tabs</code> is a separate switch: a tab per open chat, in sync with the rail,
              closing back to the welcome screen when the last one goes. On a phone the rail opens
              as a sheet from the header.
            </p>
            <ChatStage
              key={`threads-${viewport}`}
              phone={phone}
              height={phone ? 780 : 780}
              widget={{
                threads: true,
                threadsProps: { defaultExpanded: !phone, logoText: "Acme Assistant", profile: { name: "Jordan Reyes", meta: "Pro" } },
                tabs: true,
              }}
              setup={stageThreads}
            />
          </section>

          <section id="agent-panel" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Agent panel" />
            <p className={styles.sectionNote}>
              <code>agent</code> turns the pane on and names its tabs; here, what the agent has
              done, what is waiting for approval, what is scheduled, and the person&apos;s profile.{" "}
              <code>defaultOpen</code> opens it at mount; otherwise the header button does. The tabs
              and their contents are the host&apos;s own. <code>aside</code> takes a render function
              instead, for a pane of your own. On a phone it opens as a sheet.
            </p>
            <ChatStage
              key={`agent-${viewport}`}
              phone={phone}
              height={phone ? 780 : 780}
              widget={{ agent: { tabs: demoAgentTabs("Acme Assistant"), defaultOpen: !phone } }}
              setup={stageQuickReplies}
            />
          </section>

          <section id="artifact-panel" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Artifact panel" />
            <p className={styles.sectionNote}>
              <code>artifacts</code> turns the panel on, for a reply that makes something too big
              for a turn: a dashboard, a page, a file. The artifact arrives as a card of kind{" "}
              <code>{ARTIFACT_CARD_KIND}</code>, so the server sends it like any other card. The
              thread shows it as a tile, and the tile or the header button opens it beside the
              conversation. An HTML document or a URL is drawn in a sandboxed frame, with the
              source behind the Code view; the provider&apos;s <code>artifactRenderers</code> draw
              a kind of your own as live components. Drag the panel&apos;s left edge to size it, or
              expand it to fill the chat. The panel sits beside the conversation from{" "}
              {ASIDE_RAIL_MIN_WIDTH}px of chat width, and opens as a sheet below that and on a
              phone. It shares its seat with the agent panel, one at a time.
            </p>
            <ChatStage
              key={`artifact-${viewport}`}
              phone={phone}
              height={phone ? 780 : 720}
              widget={{ artifacts: true }}
              setup={stageArtifact(!phone)}
            />
          </section>

          <section id="quick-replies" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Quick replies" />
            <p className={styles.sectionNote}>
              <code>starters</code> open an empty chat, with <code>startersKey</code> deciding when a
              fresh set is drawn. The provider&apos;s <code>followups</code> option names the
              endpoint or function that writes follow-up questions from each answer, shown under
              it with a shimmer while they are on their way; <code>fallbackFollowups</code> covers
              a miss. A chip holds {SUGGESTION_MAX_CHARS} characters; a longer one is dropped rather
              than cut. Once a chip is sent, its row stays as the record: the sent chip outlined,
              the rest faded, none of them tappable.
            </p>
            <ChatStage key={`replies-${viewport}`} phone={phone} height={stageHeight} setup={stageQuickReplies} />
          </section>

          <section id="questions" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Questions" />
            <p className={styles.sectionNote}>
              When a reply needs a decision before it can go on, it ends in a question with the
              answers to pick, drawn as a question card under the prose in place of the follow-up
              chips. One answer is a tap, several are ticked and sent together, and a short set is
              asked a step at a time. The answer is sent as the next message, plain text for the
              model, and the card stays as the record of the choice. A set of more than one question
              holds the composer under <code>questionsPlaceholder</code> until it is answered or
              skipped. On the server, <code>askUser</code> gives the model the tool it asks through;
              a script attaches a <code>question</code> to a reply, with the replies its answers
              lead to.
            </p>
            <ChatStage key={`questions-${viewport}`} phone={phone} height={stageHeight} setup={stageQuestions} />
          </section>

          <section id="flow" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Flow" />
            <p className={styles.sectionNote}>
              <code>flow</code> sets which way the conversation reads. The default,{" "}
              <code>top-down</code>, floats each new message to the top of the thread and streams
              the answer in below it. <code>bottom-up</code> is the classic message thread: turns
              stack from the bottom, the newest just above the composer, and the view follows the
              answer down until you scroll up to reread.
            </p>
            <ChatStage
              key={`flow-${viewport}`}
              phone={phone}
              height={stageHeight}
              widget={{ flow: "bottom-up" }}
              setup={stageFlow}
            />
          </section>

          <section id="rich-content" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Rich content" />
            <p className={styles.sectionNote}>
              A reply can carry a card as well as text. The server sends the card as data with a
              kind, and the provider&apos;s <code>renderers</code> map each kind to a component, so
              any component in this library can sit inside a reply. The demo subpath ships
              renderers for a chart, a plan, a tool call, a diff, an approval, a source list and a
              product card; here a chart and a plan.
            </p>
            <ChatStage key={`cards-${viewport}`} phone={phone} height={phone ? 800 : 860} setup={stageRichContent} />
          </section>

          <section id="status" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Live status and reasoning" />
            <p className={styles.sectionNote}>
              Built in, driven by the transport&apos;s status events. While the model works, its
              current step shows as a live status above the reply and its reasoning collects
              underneath, open. When the first words arrive the reasoning folds into one line that
              says how long it took. The reply streams in at an even pace whatever rate the model
              sends it at; reduced motion turns the pacing off. This example asks its question over
              and over, slowed down so the thinking can be read.
            </p>
            <ChatStage key={`status-${viewport}`} phone={phone} height={stageHeight} timing={SLOW_TIMING} setup={stageStatus} loopAfterMs={4000} />
          </section>

          <section id="documents" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Documents" />
            <p className={styles.sectionNote}>
              <code>fileAttachments</code> turns files on: the composer&apos;s attach button, a
              paste, or a drop anywhere on the chat, with <code>maxAttachments</code> and{" "}
              <code>maxAttachmentBytes</code> as the limits. A long paste becomes a file of its own.
              Previews are built in the browser and nothing is uploaded unless the host&apos;s
              transport sends it. In the thread, a sent file is a tile above the message: a picture
              keeps its own ratio, a document wears its type; several form a grid, and past a limit
              the rest collapse behind a count. Pressing a tile opens the viewer. <code>mentions</code> supplies the people, files and commands typed with
              @ and /, and <code>models</code> the picker&apos;s list, with{" "}
              <code>lockedModelDescription</code> for one the budget has locked.
            </p>
            <ChatStage
              key={`documents-${viewport}`}
              phone={phone}
              height={phone ? 800 : 920}
              widget={{
                fileAttachments: true,
                mentions: DEMO_MENTIONS,
                placeholder: "Ask anything, @ for entities or / for commands",
                composerActions: <ModelPicker models={DEMO_MODELS} placement="top" />,
              }}
              setup={stageDocuments}
            />
          </section>

          <section id="props" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Props" />
            <p className={styles.sectionNote}>
              Read from the same JSDoc that ships in the package&apos;s types. Copy for agents hands
              your coding agent the same contract.
            </p>
            {widgetApi?.exports.map((exported) => (
              <div key={exported.component} className={styles.propsBlock}>
                <h3 className={styles.propsHeading}>{exported.component}</h3>
                <PropsTable exported={exported} />
              </div>
            ))}
          </section>

          <section id="parts" className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Parts" />
            <p className={styles.sectionNote}>The chat is built from these components, each with a page of its own.</p>
            <ul className={styles.parts}>
              {parts.map((component) => (
                <li key={component.slug}>
                  <Link href={`/components/${component.slug}`} className={styles.partChip}>
                    {component.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <ComponentInstallStrip slug="ai-chat" />
        </main>
      </div>
    </>
  );
}
