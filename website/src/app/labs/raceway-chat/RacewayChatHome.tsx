"use client";

/**
 * Labs: raceway-chat, the chat-first version of the raceway idea.
 * The chat is the product: the full chat shell, as the chat home template
 * draws it (ChatWidget as the page, the history rail, the template footer's
 * theme, mode and shell switches), with the project's board on the welcome
 * screen. The model is a building the product (Riser) generated with every MEP trade in
 * it (_lib/building.ts), and it is not a screen of its own: it is an
 * artifact the assistant opens beside the conversation (ModelArtifact.tsx),
 * whose camera, trades and storeys the assistant drives with the same view
 * commands the toolbar uses.
 *
 * The assistant is live, over /api/raceway-chat. Each message
 * carries whether the model is open and what it shows. A view command
 * arriving with no model open opens the artifact first and waits for the
 * building to finish generating. Everything here is fictional.
 */

import React, { useEffect, useMemo } from "react";
import {
  ChatProvider,
  ChatWidget,
  artifactCard,
  createFetchTransport,
  useChatWidget,
  useTakeoverViewport,
  type ChatTransport,
  type ThreadsOptions,
} from "rift-ds/chat";
import { ProductMark } from "@/components/templates/ProductMark/ProductMark";
import SidebarSwitchers, { CollapsedSidebarSwitchers } from "@/components/templates/SidebarSwitchers/SidebarSwitchers";
import { useChatBackdrop, useTemplateLayout } from "@/components/templates/TemplateShell/useTemplateLayout";
import { DISCIPLINE_LABEL, levelName } from "./_lib/building";
import type { ViewCommand } from "./_lib/view";
import MepBoard from "./MepBoard";
import ModelArtifact, { ModelStore, ModelStoreContext } from "./ModelArtifact";
import { ASSISTANT_NAME, MODEL_ARTIFACT, PRODUCT_NAME, PROJECT, REVIT_MODEL } from "./_data/project";
import { quickLinkFor } from "./_data/quick-links";
import styles from "./RacewayChatHome.module.css";

const THREADS: ThreadsOptions = {
  groups: [
    {
      label: "This week",
      threads: [
        { id: "riser", title: "Sprinkler main at SR-1", description: "Level 5, fire against mechanical", status: "waiting", icon: "warning", meta: "1h" },
        { id: "plenum", title: "Plenum stack for the labs", description: "Duct, tray, sprinkler, water", status: "idle", icon: "stacks", meta: "3h" },
        { id: "gen3", title: "Why generation 3 clashed", description: "Trades routed alone", status: "idle", icon: "compare_arrows", meta: "2d" },
      ],
    },
    {
      label: "Earlier",
      threads: [
        { id: "rules", title: "Rules for the lab exhaust", description: "Clearances and slopes", status: "idle", icon: "rule_settings", meta: "Oct 28" },
        { id: "takeoff", title: "Takeoff format for estimating", description: "Columns by trade", status: "idle", icon: "table", meta: "Oct 24" },
      ],
    },
  ],
  projects: [
    { id: "alder", label: PROJECT.name, meta: "Now" },
    { id: "riverside", label: "Riverside clinic fit-out", meta: "3w" },
  ],
  homeGroup: "This week",
  nameThread: (index) => ["Coordinate the MEP trades", "Clear the level 2 clashes", "Plan the coordination meeting"][index % 3],
};

const PRESET_NAME = { iso: "3D", top: "plan", front: "front", side: "side" } as const;
const trade = (c: ViewCommand) => (c.discipline ? DISCIPLINE_LABEL[c.discipline].toLowerCase() : "the trade");

const RECEIPT: Record<ViewCommand["action"], { icon: string; text: (c: ViewCommand) => string }> = {
  frame_building: { icon: "fit_screen", text: () => "Framed the building" },
  camera: { icon: "3d_rotation", text: (c) => `Turned to the ${PRESET_NAME[c.preset ?? "iso"]} view` },
  focus_clash: { icon: "warning", text: (c) => `Flew to clash ${c.clash}` },
  show_discipline: { icon: "visibility", text: (c) => `Showed ${trade(c)}` },
  hide_discipline: { icon: "visibility_off", text: (c) => `Hid ${trade(c)}` },
  isolate_discipline: { icon: "filter_center_focus", text: (c) => `Showing ${trade(c)} only` },
  show_all_disciplines: { icon: "layers", text: () => "Showed every trade" },
  show_level: { icon: "stacks", text: (c) => `Showing ${levelName(c.level ?? 0).toLowerCase()} only` },
  show_all_levels: { icon: "stacks", text: () => "Showed every storey" },
  set_architecture: { icon: "domain", text: (c) => (c.visible ? "Showed the architecture" : "Hid the architecture") },
  clear_selection: { icon: "deselect", text: () => "Cleared the selection" },
};

function ViewReceipt({ command }: { command: ViewCommand }) {
  const receipt = RECEIPT[command.action] ?? RECEIPT.frame_building;
  return (
    <div className={styles.receipt}>
      <span className="material-symbols-rounded" aria-hidden="true">{receipt.icon}</span>
      {receipt.text(command)}
    </div>
  );
}

/* The composer's standing context: the Revit model the project syncs from,
   repeated above each message so the thread keeps what it was about. */
const REVIT_CONTEXT = {
  label: REVIT_MODEL.file,
  note: `Looking at ${REVIT_MODEL.file} · synced ${REVIT_MODEL.synced}`,
  icon: "deployed_code",
  sent: true,
};

/** The files the reader has attached so far, as names, kinds and sizes only:
    the transport never sends a file, so this is all the assistant can know
    of one. Read from the thread at each send. */
class AttachedFiles {
  files: { name: string; kind: string; size?: number }[] = [];

  read(messages: Parameters<ChatTransport>[0]) {
    this.files = messages.flatMap((m) => m.attachments ?? []).slice(-10).map(({ name, kind, size }) => ({ name, kind, size }));
  }
}

const RENDERERS = { view: (data: unknown) => <ViewReceipt command={data as ViewCommand} /> };
const ARTIFACT_RENDERERS = { [MODEL_ARTIFACT.kind]: () => <ModelArtifact /> };

export default function RacewayChatHome() {
  const store = useMemo(() => new ModelStore(), []);
  const attached = useMemo(() => new AttachedFiles(), []);

  const transport = useMemo<ChatTransport>(() => {
    const inner = createFetchTransport("/api/raceway-chat", {
      getContext: () => JSON.stringify({ revitModel: REVIT_MODEL.file, files: attached.files, modelOpen: store.open, view: store.state }),
    });
    return async function* racewayTransport(messages, signal) {
      attached.read(messages);
      /* A line sent from one of the board's quick links is answered here:
         the model opens on its view at once, with no model call, and the
         thread keeps the exchange like any other. */
      /* The viewer can outlive the conversation that opened it (New chat
         clears the stage while the panel glides shut), so a conversation's
         first message always brings the model card of its own. */
      const onStage = store.open && messages.length > 1;
      const last = messages[messages.length - 1];
      const link = last?.role === "user" ? quickLinkFor(last.content) : undefined;
      if (link) {
        if (!onStage) yield { type: "card", card: artifactCard(MODEL_ARTIFACT) };
        for (const next of link.commands) {
          store.send(next);
          yield { type: "card", card: { kind: "view", data: next } };
        }
        yield { type: "delta", text: link.reply };
        yield { type: "done" };
        return;
      }
      let opened = onStage;
      for await (const event of inner(messages, signal)) {
        if (event.type === "card" && event.card.kind === "artifact") opened = true;
        if (event.type === "card" && event.card.kind === "view") {
          /* A view change with no model open brings the model up first; the command waits for it. */
          if (!opened) {
            opened = true;
            yield { type: "card", card: artifactCard(MODEL_ARTIFACT) };
          }
          store.send(event.card.data as ViewCommand);
        }
        yield event;
      }
    };
  }, [store, attached]);

  return (
    <ModelStoreContext.Provider value={store}>
      <ChatProvider transport={transport} renderers={RENDERERS} artifactRenderers={ARTIFACT_RENDERERS} threads={THREADS} followups={false} feedback={false}>
        <Home />
      </ChatProvider>
    </ModelStoreContext.Provider>
  );
}

function Home() {
  const { setOpen, send } = useChatWidget();
  const takeover = useTakeoverViewport();
  const layout = useTemplateLayout("chat");
  const backdrop = useChatBackdrop();

  /* The chat is the page, so it is open for as long as the page is mounted. */
  useEffect(() => {
    setOpen(true);
  }, [setOpen]);

  return (
    <div className={styles.shell}>
      <div data-bg-hidden hidden />
      <div className={styles.ground}>
      <ChatWidget
        layout={layout}
        backdrop={backdrop}
        fullscreenEnabled={false}
        closeEnabled={false}
        placementEnabled={false}
        compact={takeover}
        phone={takeover}
        title={PRODUCT_NAME}
        tagline={`${PROJECT.name} · ${PROJECT.client}`}
        greetings={{ morning: "Morning, Dana", afternoon: "Afternoon, Dana", evening: "Evening, Dana" }}
        placeholder="Ask about the MEP, or open the model"
        showStarters={false}
        widgets={<MepBoard onAsk={(prompt) => send(prompt)} />}
        widgetsLayout="scroll"
        widgetsWidth="wide"
        threads
        threadsProps={{
          logo: <ProductMark />,
          logoText: PRODUCT_NAME,
          defaultExpanded: true,
          profile: { name: "Dana Okafor", meta: "dana@northline.example" },
          footerSlot: <SidebarSwitchers showLayout backLink scope="chat" />,
          collapsedFooterSlot: <CollapsedSidebarSwitchers showLayout scope="chat" />,
        }}
        context={REVIT_CONTEXT}
        fileAttachments
        maxAttachments={5}
        artifacts
        artifactPanelTitle="Models"
        artifactEmptyTitle="No model open"
        artifactEmptyDescription="Ask to open the model and it opens here."
        disclaimer={`${ASSISTANT_NAME} answers only from this project's generated mock and the model on screen.`}
      />
      </div>
    </div>
  );
}
