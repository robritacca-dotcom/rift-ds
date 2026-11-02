"use client";

/**
 * The merchant sales screen's live assistant: the package's provider and widget
 * over /api/merchant-chat. A table change reaches the page as a `table-view`
 * card. The transport applies each one once as it arrives, through the bridge
 * OrdersTable keeps up to date, and swaps the card's data for the setup it
 * replaced, so the receipt in the thread can undo it. When the reply ends it
 * reports the change the way Describe does, when the table is in view: a success
 * toast carrying the reply's words and an Undo, in one stack with Describe's.
 */

import React from "react";
import {
  ChatProvider,
  ChatWidget,
  DOCK_QUERY,
  createFetchTransport,
  useChatWidget,
  pickStarters,
  useTakeoverViewport,
  type ChatTransport,
  type Starter,
} from "rift-ds/chat";
import { Button } from "rift-ds/components/Button/Button";
import { ToastProvider, useToast } from "rift-ds/components/Toast/Toast";
import { MOTION_ACTION_DISMISS_MS, MOTION_TABLE_COMMAND_SKELETON_MS } from "rift-ds/tokens/motion";
import { nextView, type LedgerViewChange } from "@/lib/order-ledger-view";
import type { TableContextValue } from "../../../../../src/components/DataTable/tableContext";
import type { TableView } from "../../../../../src/components/DataTable/views";
import styles from "./MerchantSales.module.css";

/** What the chat needs of the table: set by OrdersTable's bridge while it is mounted. */
export type TableBridge = Pick<TableContextValue, "view" | "applyView" | "setCommandLanding">;
type BridgeRef = React.RefObject<TableBridge | null>;

/* A change is undone from its receipt or its toast, so the two share the record. */
const ChangesContext = React.createContext<{ reportCovered: (covered: boolean) => void; undone: ReadonlySet<string>; undo: (id: string, before: TableView) => void } | null>(null);

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

const useDocked = () => React.useSyncExternalStore(subscribeDock, readDocked, () => false);

/**
 * Where the panel leaves the page's toasts. Docked, they sit beside it rather
 * than over its composer, as the site's stylesheet does for its own. Covering the
 * table, a change gets no toast: it would sit on the composer to repeat the reply
 * above it, and the receipt already has the way back.
 */
export function useToastsClearOfPanel() {
  const { open, view } = useChatWidget();
  const docked = useDocked();
  const clear = open && docked && view !== "full";
  const covered = open && (!docked || view === "full");
  const reportCovered = React.useContext(ChangesContext)?.reportCovered;
  React.useEffect(() => {
    reportCovered?.(covered);
  }, [reportCovered, covered]);
  React.useEffect(() => {
    if (!clear) return;
    const root = document.documentElement.style;
    root.setProperty("--ds-toast-inset-right", "calc(var(--layout-chat-width) + var(--layout-shell-inset) * 2)");
    return () => {
      root.removeProperty("--ds-toast-inset-right");
    };
  }, [clear]);
}

/** A table change in the thread: what it did, and the way back. */
function TableReceipt({ id, before }: { id: string; before: TableView }) {
  const changes = React.useContext(ChangesContext);
  const { view, setView, setOpen } = useChatWidget();
  const docked = useDocked();
  const undone = changes?.undone.has(id);
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
            onClick={() => changes?.undo(id, before)}
          />
        )}
      </span>
    </div>
  );
}

const RENDERERS = {
  "table-view": (data: unknown) => {
    const { id, before } = data as { id: string; before: TableView };
    return <TableReceipt id={id} before={before} />;
  },
};

function ChatWithToasts({ bridge, children }: { bridge: BridgeRef; children: React.ReactNode }) {
  const { toast, dismiss } = useToast();
  const [undone, setUndone] = React.useState<ReadonlySet<string>>(new Set());
  const lastToast = React.useRef<string | null>(null);
  const tableCoveredRef = React.useRef(false);

  const undo = React.useCallback(
    (id: string, before: TableView) => {
      if (!bridge.current) return;
      applyToTable(bridge.current, before);
      setUndone((current) => new Set(current).add(id));
      if (lastToast.current) dismiss(lastToast.current);
      lastToast.current = null;
    },
    [bridge, dismiss],
  );

  const transport = React.useMemo<ChatTransport>(() => {
    const inner = createFetchTransport("/api/merchant-chat", {
      getContext: () => {
        const view = bridge.current?.view;
        return view ? JSON.stringify({ ...view, columnWidths: undefined }) : null;
      },
    });
    return async function* merchantTransport(messages, signal) {
      let change: { id: string; before: TableView } | null = null;
      let landed = Promise.resolve();
      let words = "";
      try {
        for await (const event of inner(messages, signal)) {
          const table = bridge.current;
          if (event.type === "delta") words += event.text;
          if (event.type === "card" && event.card.kind === "table-view" && table) {
            const before = table.view;
            const id = `table-change-${Date.now()}-${Math.random()}`;
            /* Several in one reply share one toast, whose Undo goes back to the start of the reply. */
            change = change ? { id, before: change.before } : { id, before };
            applyToTable(table, nextView(before, event.card.data as LedgerViewChange));
            landed = new Promise((resolve) => setTimeout(resolve, MOTION_TABLE_COMMAND_SKELETON_MS));
            yield { type: "card", card: { kind: "table-view", data: { id, before } } };
          } else {
            yield event;
          }
        }
      } finally {
        if (change) {
          /* In Describe's order: the skeleton, the new rows, then the toast. */
          const { id, before } = change;
          const description = words.trim() || "Table updated";
          void landed.then(() => {
            if (tableCoveredRef.current) return;
            if (lastToast.current) dismiss(lastToast.current);
            lastToast.current = toast({
              variant: "positive",
              description,
              duration: MOTION_ACTION_DISMISS_MS,
              action: <Button variant="secondary" tone="neutral" size="compact" iconLeft="refresh" label="Undo" onClick={() => undo(id, before)} />,
            });
          });
        }
      }
    };
  }, [bridge, toast, dismiss, undo]);

  const changes = React.useMemo(
    () => ({
      reportCovered: (covered: boolean) => {
        tableCoveredRef.current = covered;
      },
      undone,
      undo,
    }),
    [undone, undo],
  );

  return (
    <ChangesContext.Provider value={changes}>
      <ChatProvider transport={transport} renderers={RENDERERS} followups={false} feedback={false}>
        {children}
      </ChatProvider>
    </ChangesContext.Provider>
  );
}

export function MerchantChatProvider({ bridge, children }: { bridge: BridgeRef; children: React.ReactNode }) {
  return (
    <ToastProvider position="bottom-right">
      <ChatWithToasts bridge={bridge}>{children}</ChatWithToasts>
    </ToastProvider>
  );
}

/** The widget, set as the launcher sets it, for TemplateAssistant to seat. */
export function MerchantChatWidget({ starters }: { starters: Starter[] }) {
  const { view, starterSeed } = useChatWidget();
  const takeover = useTakeoverViewport();
  return (
    <ChatWidget
      title="Larkspur AI"
      tagline="Ask about the orders on this page, or tell me how to change the table"
      placeholder="Ask anything"
      starters={pickStarters(starters, starterSeed, "merchant-sales")}
      startersKey={`merchant-sales-${starterSeed}`}
      contextLabel="Sales"
      disclaimer="Answers only from this page's fictional orders. Check anything important."
      fullscreenEnabled={!takeover}
      placementEnabled={false}
      compact={takeover || view !== "full"}
      phone={takeover}
    />
  );
}
