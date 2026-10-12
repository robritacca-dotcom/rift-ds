"use client";

import Link from "next/link";
import MegaNav from "@/components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import PageLinks from "@/components/PageLinks/PageLinks";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getSidebarLinks, chatSidebarLinks } from "@/config/navigation";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Table } from "rift-ds/components/Table/Table";
import { ChatMessage } from "rift-ds/components/ChatMessage/ChatMessage";
import { Reasoning } from "rift-ds/components/Reasoning/Reasoning";
import { AgentStatus } from "rift-ds/components/AgentStatus/AgentStatus";
import { ThreadPanel } from "rift-ds/components/ThreadPanel/ThreadPanel";
import { ThreadTabs } from "rift-ds/components/ThreadTabs/ThreadTabs";
import { AgentRail } from "rift-ds/components/AgentRail/AgentRail";
import { PromptSuggestions } from "rift-ds/components/PromptSuggestions/PromptSuggestions";
import { Composer } from "rift-ds/components/Composer/Composer";
import { ModelPicker } from "rift-ds/components/ModelPicker/ModelPicker";
import { AttachmentGroup } from "rift-ds/components/Attachment/AttachmentGroup";
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
  chatWidget,
} from "rift-ds/chat";
import {
  DEMO_MENTIONS,
  DEMO_MODELS,
  DEMO_RENDERERS,
  DEMO_STARTERS,
  DEMO_THREAD_GROUPS,
  DemoWelcome,
  demoAgentTabs,
  type DemoChartCard,
  type DemoPlanCard,
  type DemoToolCallCard,
} from "rift-ds/chat/demo";
import { HeroDemo } from "./HeroDemo";
import s from "../section.module.css";

const { sidebarLinks } = getSidebarLinks(chatSidebarLinks, "/chat/overview");

/* The overview: one section per capability, each a title, a plain statement
   of what the chat does, and the thing itself, the way a component page
   shows its examples. The parts list, the placements and every threshold
   derive from the package; nothing countable is typed here. The props that
   switch each capability on are on the install page. */

const parts = chatWidget.parts
  .map((name) => componentMetadata.find((component) => component.name === name))
  .filter((component): component is NonNullable<typeof component> => Boolean(component));

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

/* The cards and files the examples carry. Invented, like everything in the demo. */
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

const INVITE_CARD: DemoToolCallCard = {
  name: "invite_teammates",
  summary: "3 editors to acme-design",
  status: "success",
  duration: "0.6s",
  args: ['{', '  "workspace": "acme-design",', '  "role": "editor",', '  "emails": 3', '}'].join("\n"),
};

const COMPOSER_FILES: AttachmentItem[] = [
  { id: "plan", name: "Q3 launch plan.pdf", kind: "pdf", size: 2_400_000, status: "ready" },
  { id: "hero", name: "hero-draft.png", kind: "image", size: 860_000, status: "uploading", progress: 62 },
  { id: "note", name: "Pasted text", kind: "pasted", size: 3_200, status: "ready" },
];

const ONE_FILE: AttachmentItem[] = [{ id: "brief", name: "Launch brief.docx", kind: "document", size: 412_000, status: "ready" }];

const MANY_FILES: AttachmentItem[] = [
  { id: "plan", name: "Q3 launch plan.pdf", kind: "pdf", size: 2_400_000, status: "ready" },
  { id: "budget", name: "Budget by phase.xlsx", kind: "spreadsheet", size: 96_000, status: "ready" },
  { id: "deck", name: "Kickoff deck.pptx", kind: "presentation", size: 5_100_000, status: "ready" },
  { id: "config", name: "workspace.config.ts", kind: "code", size: 2_100, status: "ready" },
  { id: "notes", name: "Standup notes.txt", kind: "text", size: 4_800, status: "ready" },
];

const agentTabs = demoAgentTabs("Acme Assistant");

const THREAD_TABS = DEMO_THREAD_GROUPS.flatMap((group) => group.threads)
  .slice(0, 3)
  .map((thread, index) => ({ id: thread.id, label: thread.title, status: index === 1 ? ("working" as const) : undefined }));

export default function ChatOverviewPage() {
  return (
    <>
      <MegaNav />

      <div className={s.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={s.dsContent} id="main-content">
          <PageBreadcrumb />

          <div className={`${s.pageHeader} animate-in`}>
            <h1 className={s.pageTitle}>Overview</h1>
            <PageLinks storybookPath="/?path=/docs/chat-chatwidget--docs" />
          </div>

          <div className={`${s.introSection} animate-in animate-delay-1`}>
            <p className={s.subDisplay}>An AI chat for your app</p>
            <p className={s.introBody}>
              A complete chat: the panel, the streaming replies, the cards a reply can carry, the
              history, the composer and the server behind it. It is added with one command and set
              up with props. The chat in the corner of this page is the same one. Each section
              below states one capability and shows it.
            </p>
          </div>

          <section id="preview" className={`${s.section} animate-in animate-delay-2`} data-anchor-ignore>
            <SectionTitle title="A working preview" />
            <p className={s.sectionNote}>
              The chat on a written conversation, with no model behind it. Pick a question to see a
              reply arrive with its reasoning, a card and the follow-up chips. Switch to Phone to
              see the same chat as a full screen.
            </p>
            <HeroDemo />
          </section>

          <section id="responsive" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Fully responsive" />
            <p className={s.sectionNote}>
              The chat has three forms and picks one from the viewport. Inside the panel, the thread
              rail and the agent pane sit inline when the panel is at least {THREADS_RAIL_MIN_WIDTH}px
              and {ASIDE_RAIL_MIN_WIDTH}px wide and open as sheets below that, judged by the
              panel&apos;s own width rather than the screen&apos;s. On a phone the keyboard never
              covers the reply.
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

          <section id="placement" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Flexible placement" />
            <p className={s.sectionNote}>
              The host chooses where the panel starts, and can let the visitor move it from a menu
              in the chat&apos;s header. Placement is an option on top of the responsive forms: a
              phone has neither the menu nor the resize grips.
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

          <section id="welcome" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Welcome screen" />
            <p className={s.sectionNote}>
              An empty chat shows a greeting for the time of day, the host&apos;s title and
              tagline, and starter questions. Below the composer the host can place anything:
              links, cards or a whole dashboard, held to one screen or scrolling as a page. It all
              leaves with the first message. The preview above shows the starters; these are the
              links and the dashboard.
            </p>
            <div className={s.stack}>
              <DemoWelcome variant="links" onAsk={() => {}} />
            </div>
            <DemoWelcome variant="dashboard" onAsk={() => {}} />
          </section>

          <section id="threads" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Threads panel" />
            <p className={s.sectionNote}>
              The threads panel is on or off. With it on, every chat is kept and a new chat is
              named after its first reply; a chat can be pinned, renamed or deleted from its row.
              The detail line under each title, the last known state of that chat, is on or off
              too. Chat tabs are a separate switch: a tab per open chat, in sync with the panel,
              closing back to the welcome screen when the last one goes.
            </p>
            <div className={s.stack}>
              <ThreadTabs tabs={THREAD_TABS} activeId={THREAD_TABS[0]?.id} onTabClose={() => {}} onAdd={() => {}} ariaLabel="Open chats" />
            </div>
            <div className={`${s.stack} ${s.stackNarrow}`}>
              <ThreadPanel
                groups={DEMO_THREAD_GROUPS}
                activeThreadId={DEMO_THREAD_GROUPS[1]?.threads[0]?.id}
                logoText="Acme Assistant"
                newThreadLabel="New chat"
                aria-label="Past chats"
              />
            </div>
          </section>

          <section id="agent-panel" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Agent panel" />
            <p className={s.sectionNote}>
              The agent panel is on or off. With it on, a pane on the other side of the thread
              carries the host&apos;s tabs: here, what the agent has done, what is waiting for
              approval, what is scheduled, and the person&apos;s profile. The tabs and their
              contents are the host&apos;s own.
            </p>
            <div className={`${s.stack} ${s.stackNarrow}`}>
              <AgentRail
                tabs={agentTabs}
                activeTab={agentTabs[0]?.id ?? ""}
                profile={{ name: "Acme Assistant", status: "Online", statusTone: "positive" }}
              />
            </div>
          </section>

          <section id="quick-replies" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Quick replies" />
            <p className={s.sectionNote}>
              Starter questions open an empty chat, drawn from the host&apos;s pools so a page
              shows a different set each visit. After each answer, follow-up questions are written
              from it and shown underneath, with a shimmer while they are on their way. A chip
              holds {SUGGESTION_MAX_CHARS} characters; a longer one is dropped rather than cut.
            </p>
            <div className={s.stack}>
              <PromptSuggestions suggestions={DEMO_STARTERS} layout="wrap" />
              <PromptSuggestions suggestions={[]} pending pendingCount={3} layout="wrap" />
            </div>
          </section>

          <section id="rich-content" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Rich content" />
            <p className={s.sectionNote}>
              A reply can carry a card as well as text: a chart, a plan, a tool call, a diff, an
              approval, a product card. The server sends the card as data with a kind, and the
              host maps each kind to a component, so any component in this library can sit inside
              a reply.
            </p>
            <div className={s.stack}>
              <ChatMessage role="assistant" author="Acme Assistant">
                <p>Signups have climbed for five of the six weeks since the trial opened.</p>
                {DEMO_RENDERERS.chart(SIGNUPS_CARD)}
              </ChatMessage>
              <ChatMessage role="assistant" author="Acme Assistant">
                <p>On it. Two steps are done already, and the invites are going out now.</p>
                {DEMO_RENDERERS.plan(PLAN_CARD)}
              </ChatMessage>
              <ChatMessage role="assistant" author="Acme Assistant">
                <p>All three invites are out. Everyone lands in the workspace with editor access.</p>
                {DEMO_RENDERERS["tool-call"](INVITE_CARD)}
              </ChatMessage>
            </div>
          </section>

          <section id="status" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Live status and reasoning" />
            <p className={s.sectionNote}>
              While the model works, its current step shows as a live status above the reply and
              its reasoning collects underneath, open. When the first words of the reply arrive
              the reasoning folds into one line that says how long it took, and can be opened
              again. The reply itself streams in at an even pace whatever rate the model sends
              it at; reduced motion turns the pacing off.
            </p>
            <div className={s.stack}>
              <ChatMessage role="assistant" author="Acme Assistant">
                <Reasoning streaming defaultOpen summary={<AgentStatus state="thinking" label="Pulling the signup numbers" />}>
                  <p>Six weeks of signup data since the trial opened.</p>
                  <p>One series tells it; chart it in the card.</p>
                </Reasoning>
              </ChatMessage>
              <ChatMessage role="assistant" author="Acme Assistant">
                <Reasoning duration={3} defaultOpen={false}>
                  <p>Six weeks of signup data since the trial opened.</p>
                  <p>One series tells it; chart it in the card.</p>
                </Reasoning>
                <p>Signups have climbed for five of the six weeks since the trial opened, and last week was the strongest yet.</p>
              </ChatMessage>
            </div>
          </section>

          <section id="documents" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Documents" />
            <p className={s.sectionNote}>
              Files reach the chat three ways: the composer&apos;s attach button, a paste, or a
              drop anywhere on the chat, which shows a drop zone while the file is over it. A long
              paste becomes a file of its own. Previews are built in the browser and nothing is
              uploaded unless the host&apos;s server asks for it.
            </p>
            <div className={s.stack}>
              <Composer
                placeholder="Ask anything, @ for entities or / for commands"
                mentions={DEMO_MENTIONS}
                files={COMPOSER_FILES}
                attachButton
                onFilesSelected={() => {}}
                onFileRemove={() => {}}
                actions={<ModelPicker models={DEMO_MODELS} placement="top" />}
              />
            </div>
            <p className={s.sectionNote}>
              In the thread, a sent file shows as a tile above the message. One file is one tile;
              several form a grid, and past a limit the rest collapse behind a count. Pressing a
              tile opens the viewer, which steps through the group and draws what it can: pictures
              inline, and anything else through a preview the host supplies.
            </p>
            <div className={s.stack}>
              <ChatMessage role="user" bubble attachments={<AttachmentGroup items={ONE_FILE} align="end" label="Attached file" />}>
                Here is the brief we are working from.
              </ChatMessage>
              <ChatMessage role="user" bubble attachments={<AttachmentGroup items={MANY_FILES} align="end" max={4} label="Attached files" />}>
                And everything else from the launch folder.
              </ChatMessage>
            </div>
          </section>

          <section id="parts" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Parts" />
            <p className={s.sectionNote}>The chat is built from these components, each with a page of its own.</p>
            <ul className={s.parts}>
              {parts.map((component) => (
                <li key={component.slug}>
                  <Link href={`/components/${component.slug}`} className={s.partChip}>
                    {component.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </>
  );
}
