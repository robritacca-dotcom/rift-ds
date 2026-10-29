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
 *     screens rule 7) instead of the mock
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
 *   - Every option the playground stage offers is on, from the same demo
 *     fixtures: the history with projects, pins and thread details, the
 *     session tabs, mentions, and the trailing seat's pair, the agent pane
 *     (closed on arrival, a header toggle away) and the artifact panel, inline beside the
 *     conversation on a wide window and a sheet on a narrow one.
 *   - People are initials (rule 4): the one person here is the profile row.
 *   - No app-frame dressing (rule 8): a chat session has no tab-bar shape on
 *     a phone, where this screen is already the full-screen chat.
 *
 * Every prompt a tile sends is one the demo script has an answer for, so
 * the screen answers in character. The board's to-do rows open the chats
 * that settle them, and each of those ends in a question card: one answer
 * (the plan, the calendar access, the invites), several (notifications), or
 * a set that holds the composer (the kickoff). The conversation is carried
 * by those quick replies, never by buttons inside a card. Nothing leaves the browser. The demo
 * data is fictional, which keeps the route out of the chat corpus (see
 * EXCLUDED_ROUTES in scripts/generate-site-corpus.mjs).
 */

import { useEffect, useMemo } from "react";
import { ModelPicker } from "rift-ds/components/ModelPicker/ModelPicker";
import { ChatWidget, useChatWidget, useTakeoverViewport } from "rift-ds/chat";
import {
  DEMO_ARTIFACT_RENDERERS,
  DEMO_MENTIONS,
  DEMO_MODELS,
  DEMO_RENDERERS,
  DEMO_THREADS,
  DemoBoard,
  createDemoTransport,
  demoAgentTabs,
} from "rift-ds/chat/demo";
import { SiteChatProvider } from "@/components/SiteChat/SiteChatProvider";
import { useStagedProductName } from "../useStagedProductName";
import styles from "./ChatHome.module.css";
import { ProductMark } from "../ProductMark/ProductMark";
import SidebarSwitchers from "../SidebarSwitchers/SidebarSwitchers";

/* ------------------------------------------------------------- the page */

export default function ChatHome() {
  /* The scripted demo transport, with the demo's cards registered so a chip
     path ends on a plan, a chart, a diff or a question to answer. Its turns carry no exchange
     id, which also keeps the provider from asking the follow-ups route. */
  const transport = useMemo(() => createDemoTransport(), []);
  return (
    <SiteChatProvider
      transport={transport}
      renderers={DEMO_RENDERERS}
      artifactRenderers={DEMO_ARTIFACT_RENDERERS}
      /* The playground stage's history, every lever on: projects, pins and
         the per-thread details. */
      threads={{ ...DEMO_THREADS, pins: true, details: true }}
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
        mentions={DEMO_MENTIONS}
        composerActions={<ModelPicker models={DEMO_MODELS} placement="top" />}
        widgets={<DemoBoard onAsk={(prompt) => send(prompt)} />}
        widgetsLayout="scroll"
        widgetsWidth="wide"
        threads
        /* The strip of open sessions, on a wide window only: a phone keeps
           the plain header, as on the playground stage. */
        tabs={!takeover}
        threadsProps={{
          /* The sheet names the product and skips the collapse (its scrim is
             the dismissal); the inline rail skips the name, since the chat
             header already says it, and offers the collapse. */
          logo: <ProductMark />,
          logoText: product,
          defaultExpanded: true,
          profile: { name: "Jordan Reyes", meta: "Pro" },
          /* The templates' shared footer, as the agent workbench carries
             it: the way back to the index above the theme controls. */
          footerSlot: <SidebarSwitchers backLink />,
        }}
        agent={{
          /* Closed on arrival, so the home screen opens on the board and the
             conversation; the header's agent toggle raises it. The trailing
             seat holds one panel at a time, so the artifact panel takes over
             when an answer makes one or its header button asks. */
          defaultOpen: false,
          tabs: demoAgentTabs(product),
          profile: {
            name: product,
            status: "Connected",
            onEdit: () => {},
            editLabel: `Edit ${product}`,
          },
        }}
        artifacts
      />
    </div>
  );
}
