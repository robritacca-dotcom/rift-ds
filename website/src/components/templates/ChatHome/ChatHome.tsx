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
 *   - The screen's subject is the chat, so it hosts the package's ChatWidget
 *     on the scripted demo transport inside its own provider (Template
 *     screens rule 7, the payroll console's precedent) instead of the mock
 *     TemplateAssistant. Here the chat is the page, not a panel beside one:
 *     it has no close and no full-screen toggle, and it fills the viewport
 *     at every width, which is the chat's takeover mode held permanently.
 *   - The history rail is the widget's built-in threads rail over the
 *     provider's thread lifecycle, so it is an inline rail on a wide window
 *     and a sheet behind the header's menu on a narrow one, with no
 *     breakpoint of this screen's own. Projects wear their generated
 *     PixelAvatars, the panel's default mark.
 *   - The board is the demo's Widget board in the widget slot, on the wide
 *     scrolling layout: the stage earns the viewport (rule 3), so the tiles
 *     run past the composer's column and below the fold.
 *   - People are initials (rule 4): the one person here is the profile row.
 *   - No app-frame dressing (rule 8): a chat session has no tab-bar shape on
 *     a phone, where this screen is already the full-screen chat.
 *
 * Every prompt a tile sends is one the demo script has an answer for, so
 * the screen answers in character. Nothing leaves the browser. The demo
 * data is fictional, which keeps the route out of the chat corpus (see
 * EXCLUDED_ROUTES in scripts/generate-site-corpus.mjs).
 */

import { useEffect, useMemo } from "react";
import { ModelPicker, type ModelPickerModel } from "rift-ds/components/ModelPicker/ModelPicker";
import type { ThreadPanelGroup, ThreadPanelProject } from "rift-ds/components/ThreadPanel/ThreadPanel";
import { ChatWidget, useChatWidget, useTakeoverViewport } from "rift-ds/chat";
import { DEMO_RENDERERS, DemoBoard, createDemoTransport } from "rift-ds/chat/demo";
import { SiteChatProvider } from "@/components/SiteChat/SiteChatProvider";
import { useStagedProductName } from "../useStagedProductName";
import styles from "./ChatHome.module.css";

/* ------------------------------------------------------------- the rail */

const PROJECTS: ThreadPanelProject[] = [
  { id: "workspace-revamp", label: "Workspace revamp", meta: "1m" },
  { id: "billing-cleanup", label: "Billing cleanup", meta: "3d" },
  { id: "launch-week", label: "Launch week", meta: "5d" },
];

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

/* ------------------------------------------------------------- the page */

export default function ChatHome() {
  /* The scripted demo transport, with the demo's cards registered so a chip
     path ends on a plan, a chart or an approval. Its turns carry no exchange
     id, which also keeps the provider from asking the follow-ups route. */
  const transport = useMemo(() => createDemoTransport(), []);
  return (
    <SiteChatProvider
      transport={transport}
      renderers={DEMO_RENDERERS}
      threads={{ groups: THREADS, projects: PROJECTS, pinnedGroup: "Pinned", homeGroup: "This week", details: false }}
    >
      <ChatHomeShell />
    </SiteChatProvider>
  );
}

function ChatHomeShell() {
  const product = useStagedProductName("Acme Corp");
  const { setOpen, send } = useChatWidget();
  const takeover = useTakeoverViewport();

  /* The chat's state machine reads `open` for everything a visible chat
     does (composer focus, the welcome's reveal). Here the chat is the page,
     so it is open for as long as the page is mounted. */
  useEffect(() => {
    setOpen(true);
  }, [setOpen]);

  return (
    /* data-bg-hidden is the layout's own switch for the ambient background:
       the screen sits on the flat page colour, like the rest of the family. */
    <div className={styles.shell} data-bg-hidden="">
      <ChatWidget
        fullscreenEnabled={false}
        closeEnabled={false}
        compact={takeover}
        phone={takeover}
        title={product}
        tagline="How can we help you today?"
        showStarters={false}
        fileAttachments
        composerActions={<ModelPicker models={MODELS} placement="top" />}
        widgets={<DemoBoard onAsk={(prompt) => send(prompt)} />}
        widgetsLayout="scroll"
        widgetsWidth="wide"
        threads
        threadsProps={{
          /* The sheet names the product and skips the collapse (its scrim is
             the dismissal); the inline rail skips the name, since the chat
             header already says it, and offers the collapse. */
          logo: <span className={styles.logoDot} />,
          logoText: product,
          defaultExpanded: true,
          profile: { name: "Jordan Reyes", meta: "Pro" },
        }}
      />
    </div>
  );
}
