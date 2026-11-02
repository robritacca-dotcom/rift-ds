"use client";

/**
 * The merchant sales screen's live assistant: the package's provider and widget
 * over /api/merchant-chat. A table change reaches the page as a `table-view`
 * card. The transport applies each one once as it arrives, through the bridge
 * OrdersTable keeps up to date, and swaps the card's data for the setup it
 * replaced, so the receipt in the thread can undo it.
 */

import React from "react";
import {
  ChatProvider,
  ChatWidget,
  DOCK_QUERY,
  createFetchTransport,
  useChatWidget,
  useTakeoverViewport,
  type ChatTransport,
} from "rift-ds/chat";
import { Button } from "rift-ds/components/Button/Button";
import { MOTION_TABLE_COMMAND_SKELETON_MS } from "rift-ds/tokens/motion";
import { nextView, type LedgerViewChange } from "@/lib/order-ledger-view";
import type { TableContextValue } from "../../../../../src/components/DataTable/tableContext";
import type { TableView } from "../../../../../src/components/DataTable/views";
import styles from "./MerchantSales.module.css";

/** What the chat needs of the table: set by OrdersTable's bridge while it is mounted. */
export type TableBridge = Pick<TableContextValue, "view" | "applyView" | "setCommandLanding">;
type BridgeRef = React.RefObject<TableBridge | null>;

const BridgeContext = React.createContext<BridgeRef | null>(null);

const CHAT_SUGGESTIONS = [
  { id: "best", label: "What sold best in October?" },
  { id: "late", label: "Which carrier runs latest?" },
  { id: "overdue", label: "How much is overdue?" },
];

const subscribeDock = (onChange: () => void) => {
  const media = window.matchMedia(DOCK_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const readDocked = () => window.matchMedia(DOCK_QUERY).matches;

function applyToTable(table: TableBridge, view: TableView) {
  table.setCommandLanding(true);
  table.applyView(view);
  setTimeout(() => table.setCommandLanding(false), MOTION_TABLE_COMMAND_SKELETON_MS);
}

/** A table change in the thread: what it did, and the way back. */
function TableReceipt({ before }: { before: TableView }) {
  const bridge = React.useContext(BridgeContext);
  const { view, setView, setOpen } = useChatWidget();
  const docked = React.useSyncExternalStore(subscribeDock, readDocked, () => false);
  const [undone, setUndone] = React.useState(false);
  const covered = view === "full" || !docked;

  return (
    <div className={styles.receipt}>
      <span className={styles.receiptText}>
        <span className="material-symbols-rounded" aria-hidden="true">table_chart</span>
        {undone ? "Table change undone" : "Table updated"}
      </span>
      <span className={styles.receiptActions}>
        {covered && (
          <Button
            variant="secondary"
            tone="neutral"
            size="compact"
            label="Show table"
            onClick={() => {
              setView("panel");
              if (!docked) setOpen(false);
            }}
          />
        )}
        {!undone && (
          <Button
            variant="secondary"
            tone="neutral"
            size="compact"
            label="Undo"
            iconLeft="refresh"
            onClick={() => {
              if (!bridge?.current) return;
              applyToTable(bridge.current, before);
              setUndone(true);
            }}
          />
        )}
      </span>
    </div>
  );
}

const RENDERERS = {
  "table-view": (data: unknown) => <TableReceipt before={(data as { before: TableView }).before} />,
};

export function MerchantChatProvider({ bridge, children }: { bridge: BridgeRef; children: React.ReactNode }) {
  const transport = React.useMemo<ChatTransport>(() => {
    const inner = createFetchTransport("/api/merchant-chat", {
      getContext: () => {
        const view = bridge.current?.view;
        return view ? JSON.stringify({ ...view, columnWidths: undefined }) : null;
      },
    });
    return async function* merchantTransport(messages, signal) {
      for await (const event of inner(messages, signal)) {
        const table = bridge.current;
        if (event.type === "card" && event.card.kind === "table-view" && table) {
          const before = table.view;
          applyToTable(table, nextView(before, event.card.data as LedgerViewChange));
          yield { type: "card", card: { kind: "table-view", data: { before } } };
        } else {
          yield event;
        }
      }
    };
  }, [bridge]);

  return (
    <BridgeContext.Provider value={bridge}>
      <ChatProvider transport={transport} renderers={RENDERERS} followups={false} feedback={false}>
        {children}
      </ChatProvider>
    </BridgeContext.Provider>
  );
}

/** The widget, set as the launcher sets it, for TemplateAssistant to seat. */
export function MerchantChatWidget() {
  const { view } = useChatWidget();
  const takeover = useTakeoverViewport();
  return (
    <ChatWidget
      title="Larkspur AI"
      tagline="Ask about the orders on this page, or tell me how to change the table"
      placeholder="Ask anything"
      starters={CHAT_SUGGESTIONS}
      disclaimer="Answers only from this page's fictional orders. Check anything important."
      fullscreenEnabled={!takeover}
      placementEnabled={false}
      compact={takeover || view !== "full"}
      phone={takeover}
    />
  );
}
