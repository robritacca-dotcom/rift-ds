"use client";

/**
 * The chat home template: an assistant product whose first screen is a home
 * page rather than a blank prompt. The greeting and composer open the
 * viewport, and a board of tiles runs on below the fold: what the agent is
 * doing now, the numbers, the projects, and what is waiting on the person.
 * The fictional product is a workspace app, named Acme Corp unless the
 * playground's Product name lever says otherwise.
 *
 * Composition calls, and the design.md rules behind them:
 *
 *   - The screen's subject is the chat, so it hosts the real SiteChat on the
 *     simulated transport inside its own provider (Template screens rule 7,
 *     the payroll console's precedent) instead of the mock TemplateAssistant.
 *     Here the chat is the page, not a panel beside one: it has no close and
 *     no full-screen toggle, and it fills the viewport at every width, which
 *     is the site chat's takeover mode held permanently.
 *   - The history rail is ThreadPanel in SiteChat's `threads` slot, so it is
 *     an inline rail on a wide window and a sheet behind the header's menu
 *     on a narrow one, with no breakpoint of this screen's own. Projects
 *     wear their generated PixelAvatars, the panel's default mark.
 *   - The board is the Widget family in SiteChat's widget slot, on the wide
 *     scrolling layout: the stage earns the viewport (rule 3), so the tiles
 *     run past the composer's column and below the fold.
 *   - People are initials (rule 4): the one person here is the profile row.
 *   - No app-frame dressing (rule 8): a chat session has no tab-bar shape on
 *     a phone, where this screen is already the full-screen chat.
 *
 * Every prompt a tile sends is one the simulated transport has a scripted
 * answer for, so the screen answers in character. Nothing leaves the
 * browser. The demo data is fictional, which keeps the route out of the
 * chat corpus (see EXCLUDED_ROUTES in scripts/generate-site-corpus.mjs).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart } from "rift-ds/components/Chart/BarChart";
import { ModelPicker, type ModelPickerModel } from "rift-ds/components/ModelPicker/ModelPicker";
import { PixelAvatar, distinctPixelInks } from "rift-ds/components/PixelAvatar/PixelAvatar";
import { Spinner } from "rift-ds/components/Spinner/Spinner";
import { StatusDot } from "rift-ds/components/StatusDot/StatusDot";
import {
  ThreadPanel,
  type ThreadPanelGroup,
  type ThreadPanelProject,
} from "rift-ds/components/ThreadPanel/ThreadPanel";
import { Widget, WidgetGrid, WidgetGroup, WidgetRow } from "rift-ds/components/Widget/Widget";
import { SiteChat } from "@/components/SiteChat/SiteChat";
import {
  SiteChatProvider,
  useSiteChat,
  useTakeoverViewport,
} from "@/components/SiteChat/ChatContext";
import { createSimTransport } from "@/lib/chat-sim";
import { useStagedProductName } from "../useStagedProductName";
import styles from "./ChatHome.module.css";

/* ------------------------------------------------------------- the rail */

const PROJECTS: ThreadPanelProject[] = [
  { id: "workspace-revamp", label: "Workspace revamp", meta: "1m" },
  { id: "billing-cleanup", label: "Billing cleanup", meta: "3d" },
  { id: "launch-week", label: "Launch week", meta: "5d" },
];

/* The same spread the rail gives its project rows, keyed by label, so a
   project keeps its colour where the board draws it again. */
const PROJECT_INKS = new Map(
  distinctPixelInks(PROJECTS.map((project) => project.label)).map(
    (ink, index) => [PROJECTS[index].label, ink] as const
  )
);

const THREADS: ThreadPanelGroup[] = [
  {
    label: "Pinned",
    threads: [{ id: "pricing", title: "Compare the plan limits", pinned: true }],
  },
  {
    label: "This week",
    threads: [
      { id: "beta", title: "Plan the beta invite list" },
      { id: "launch", title: "Plan the launch week" },
      { id: "onboarding", title: "Rework the onboarding email" },
    ],
  },
  {
    label: "Earlier",
    threads: [
      { id: "import", title: "Import last year’s invoices" },
      { id: "roles", title: "Set up roles for the team" },
      { id: "notify", title: "Quiet the mention notifications" },
    ],
  },
];

/* A working mock: the pill follows the choice, and nothing routes anywhere. */
const MODELS: ModelPickerModel[] = [
  { label: "Sonnet 5", value: "sonnet-5", description: "Fast and capable, the everyday pick." },
  { label: "Fable 5", value: "fable-5", description: "Slower and more thorough, for the hard ones." },
];

/* ------------------------------------------------------------- the board */

const SIGNUPS = [
  { label: "W1", value: 320 },
  { label: "W2", value: 410 },
  { label: "W3", value: 380 },
  { label: "W4", value: 520 },
  { label: "W5", value: 560 },
  { label: "W6", value: 640 },
];

const PROJECT_STATE: Record<string, string> = {
  "Workspace revamp": "4 open tasks",
  "Billing cleanup": "Waiting on finance",
  "Launch week": "Plan attached",
};

function Board({ onAsk }: { onAsk: (prompt: string) => void }) {
  return (
    <WidgetGrid>
      <Widget title="Working now" count={1}>
        <WidgetRow
          leading={<Spinner size="sm" />}
          title="Importing last year’s invoices"
          description="212 of 340 matched"
          meta="2m 13s"
        />
      </Widget>

      <Widget
        title="Trial signups"
        action={<span className={styles.widgetNote}>Last six weeks</span>}
      >
        <BarChart data={SIGNUPS} dataLabel="Signups" height={160} bare />
        <WidgetRow
          title="How is the trial going?"
          meta="Ask"
          onClick={() => onAsk("How is the trial going?")}
        />
      </Widget>

      <Widget title="Projects" count={PROJECTS.length}>
        {PROJECTS.map((project) => (
          <WidgetRow
            key={project.id}
            leading={<PixelAvatar name={project.label} ink={PROJECT_INKS.get(project.label)} />}
            title={project.label}
            description={PROJECT_STATE[project.label]}
            meta={project.meta}
          />
        ))}
      </Widget>

      <Widget title="To do" count={4}>
        <WidgetGroup label="Waiting on you">
          <WidgetRow
            leading={<StatusDot variant="warning" size="sm" aria-hidden="true" />}
            title="Invite the other three"
            description="2 of 5 seats filled"
            meta="Today"
            onClick={() => onAsk("Go ahead and invite the other three")}
          />
          <WidgetRow
            leading={<StatusDot variant="info" size="sm" aria-hidden="true" />}
            title="Choose a plan"
            description="Trial ends in 9 days"
            meta="Oct 19"
            onClick={() => onAsk("Which plan fits a team of five?")}
          />
        </WidgetGroup>
        <WidgetGroup label="In progress">
          <WidgetRow
            leading={<StatusDot variant="positive" size="sm" aria-hidden="true" />}
            title="Shared calendar"
            description="Synced an hour ago"
            meta="On"
          />
          <WidgetRow
            leading={<StatusDot variant="neutral" size="sm" aria-hidden="true" />}
            title="Mention notifications"
            description="Quiet hours, 6pm to 8am"
            meta="Paused"
          />
        </WidgetGroup>
      </Widget>

      <Widget title="This week">
        <WidgetRow title="Signups" meta="640" />
        <WidgetRow title="Seats in use" meta="5 of 12" />
        <WidgetRow title="Messages sent" meta="1,284" />
      </Widget>
    </WidgetGrid>
  );
}

/* ------------------------------------------------------------- the page */

export default function ChatHome() {
  /* The scripted transport the playground's Simulated mode runs on. Its
     turns carry no exchange id, which also keeps the provider from asking
     the follow-ups route about them. */
  const transport = useMemo(() => createSimTransport({}), []);
  return (
    <SiteChatProvider transport={transport}>
      <ChatHomeShell />
    </SiteChatProvider>
  );
}

function ChatHomeShell() {
  const product = useStagedProductName("Acme Corp");
  const { setOpen, reset, setDraft, send } = useSiteChat();
  const takeover = useTakeoverViewport();
  const [activeThread, setActiveThread] = useState("");
  const [railExpanded, setRailExpanded] = useState(true);
  const [projects, setProjects] = useState(PROJECTS);
  const [activeProject, setActiveProject] = useState(PROJECTS[0].id);
  const projectSeq = useRef(0);

  /* The chat's state machine reads `open` for everything a visible chat
     does (composer focus, the welcome's reveal). Here the chat is the page,
     so it is open for as long as the page is mounted. */
  useEffect(() => {
    setOpen(true);
  }, [setOpen]);

  const newChat = () => {
    reset();
    setDraft("");
    setActiveThread("");
  };

  return (
    /* data-bg-hidden is the layout's own switch for the ambient background:
       the screen sits on the flat page colour, like the rest of the family. */
    <div className={styles.shell} data-bg-hidden="">
      <SiteChat
        fullscreenEnabled={false}
        closeEnabled={false}
        compact={takeover}
        phone={takeover}
        title={product}
        logo={null}
        /* The staged product's assistant is not reading one of this site's
           pages, so it says nothing rather than naming the template. */
        contextLabel={null}
        tagline="How can we help you today?"
        showStarters={false}
        fileAttachments
        composerActions={<ModelPicker models={MODELS} placement="top" />}
        widgets={<Board onAsk={(prompt) => send(prompt)} />}
        widgetsLayout="scroll"
        widgetsWidth="wide"
        threads={({ overlay, close }) => (
          <ThreadPanel
            groups={THREADS}
            activeThreadId={activeThread}
            onThreadSelect={(id) => {
              setActiveThread(id);
              close();
            }}
            newThreadLabel="New chat"
            onNewThread={() => {
              newChat();
              close();
            }}
            projects={projects}
            activeProjectId={activeProject}
            onProjectSelect={setActiveProject}
            onProjectCreate={() => {
              projectSeq.current += 1;
              const id = `project-${projectSeq.current}`;
              setProjects((list) => [
                ...list,
                { id, label: `New project ${projectSeq.current}`, meta: "now" },
              ]);
              setActiveProject(id);
            }}
            historyLabel="Chat history"
            /* The sheet names the product and skips the collapse (its scrim
               is the dismissal); the inline rail skips the name, since the
               chat header already says it, and offers the collapse. */
            logo={<span className={styles.logoDot} />}
            logoText={overlay ? product : undefined}
            expanded={overlay ? true : railExpanded}
            onExpandedChange={overlay ? undefined : setRailExpanded}
            profile={{ name: "Jordan Reyes", meta: "Pro" }}
          />
        )}
      />
    </div>
  );
}
