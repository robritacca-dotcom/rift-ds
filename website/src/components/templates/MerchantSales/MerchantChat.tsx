"use client";

/**
 * The merchant sales screen's live assistant: the package's provider and widget
 * over /api/merchant-chat. A table change reaches the page as a `table-view`
 * card. The transport applies each one once as it arrives, through the bridge
 * OrdersTable keeps up to date, and swaps the card's data for the setup it
 * replaced, so the receipt in the thread can undo it. When the reply ends it
 * reports the change the way Describe does, when the table is in view: a success
 * toast carrying the reply's words and an Undo, in one stack with Describe's.
 *
 * The chat also follows what the reader is looking at (chatFocus.tsx): the
 * composer's note names it, the welcome chips ask about it, each message sent
 * over it carries it as a chip that brings it back, and the request carries it,
 * so "this order" is answered about the thing in view. The rows a reply names
 * pulse in the table when it ends.
 */

import React from "react";
import {
  ChatProvider,
  ChatWidget,
  DOCK_QUERY,
  createFetchTransport,
  useChatWidget,
  useTurnAwaiting,
  pickStarters,
  useTakeoverViewport,
  type ChatTransport,
  type Starter,
} from "rift-ds/chat";
import { ActionCard } from "rift-ds/components/ActionCard/ActionCard";
import { ActionReadout as ActionReadoutCard } from "rift-ds/components/ActionReadout/ActionReadout";
import { Button } from "rift-ds/components/Button/Button";
import { ToastProvider, useToast } from "rift-ds/components/Toast/Toast";
import { MOTION_ACTION_DISMISS_MS, MOTION_TABLE_COMMAND_SKELETON_MS } from "rift-ds/tokens/motion";
import { nextView, type LedgerViewChange } from "@/lib/order-ledger-view";
import type { TableContextValue } from "../../../../../src/components/DataTable/tableContext";
import type { TableView } from "../../../../../src/components/DataTable/views";
import { ChatFocusProvider, SentFocusChip, flashRows, focusForRequest, focusLabel, useFocusStarters, namedOrders, useChatFocus } from "./chatFocus";
import { useOrderEdits } from "./orderEdits";
import { ORDER_ACTIONS, readoutFor, theseOrders, undoReadoutFor, type ActionPlan, type ActionReadout } from "@/lib/order-actions";
import styles from "./MerchantSales.module.css";

/* As many of a confirmed change's ids as its request carries, for the server to say what could be done next. */
const MAX_CONFIRMED_IDS = 500;

/* The latest changes the chat is told about; older ones are already in the edits it is sent. */
const MAX_LOGGED = 10;

/** What the chat needs of the table: set by OrdersTable's bridge while it is mounted. */
export type TableBridge = Pick<TableContextValue, "view" | "applyView" | "setCommandLanding" | "matchingIds" | "matchingCount" | "setSelectedIds">;
type BridgeRef = React.RefObject<TableBridge | null>;

/* A change is undone from its receipt or its toast, so the two share the record. */
const ChangesContext = React.createContext<{
  reportCovered: (covered: boolean) => void;
  undone: ReadonlySet<string>;
  undo: (id: string, before: TableView) => void;
  /** Holds a confirmed change's record for the reply its confirmation message is about to get. */
  stageRecord: (data: OrderCardData) => void;
  /** Stages the readout an undo's reply opens with. */
  stageReadout: (readout: ActionReadout) => void;
  /** Turns the table to these orders alone, so a change shows its result rather than a filter it emptied. */
  showOrders: (ids: string[]) => void;
} | null>(null);

const subscribeDock = (onChange: () => void) => {
  const media = window.matchMedia(DOCK_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};
const readDocked = () => window.matchMedia(DOCK_QUERY).matches;

export function applyToTable(table: TableBridge, view: TableView) {
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
            variant="tertiary"
            size="compact"
            label="Undo"
            iconLeft="undo"
            onClick={() => changes?.undo(id, before)}
          />
        )}
      </span>
    </div>
  );
}

/** A readout card from a thread written before the proposal carried its own facts. */
const ReadoutBlock = ({ readout }: { readout: ActionReadout }) => (
  <ActionReadoutCard title={readout.title} facts={readout.facts.map(([label, value]) => ({ label, value }))} />
);

const factsOf = (readout: ActionReadout) => readout.facts.map(([label, value]) => ({ label, value }));

type OrderCardData = ActionPlan & { id: string };

/**
 * A change the assistant proposed, as the library's ActionCard, carrying the
 * readout of what it will do over Confirm, planned against the page as it is
 * now, so a change made in between is counted. Confirming runs it through the
 * same action the selection bar uses, sends the reader's confirmation as their
 * message, and stages the record for the reply it gets: this card settles to
 * one row, and the reply opens with the same card as the readout of what was
 * done (`record`), a lead card standing under the thinking line, so nothing
 * moves it while the model works out its sentence. Undo is the record's, and waits for that sentence,
 * which describes the change it would reverse. Undo follows the same recipe as Confirm: the change is
 * reversed on the page, the press is sent as the reader's message, marked so the route knows it is
 * made, and the reply says so under its own status line.
 */
function OrderActionCard({ id, action, ids, skipped, record = false }: OrderCardData & { record?: boolean }) {
  const { plan, run, valuesOf, cards, setCard, markConfirmation, markUndo } = useOrderEdits();
  const { send, streaming } = useChatWidget();
  /* A press made while the reply that carries this card is still arriving waits for it to end:
     the chat takes one message at a time, and a press must never go unsaid. */
  const queued = React.useRef<string | null>(null);
  const say = (text: string) => {
    if (streaming) queued.current = text;
    else send(text);
  };
  React.useEffect(() => {
    if (streaming || queued.current === null) return;
    const text = queued.current;
    queued.current = null;
    send(text);
  }, [streaming, send]);
  const changes = React.useContext(ChangesContext);
  const state = cards[id] as (typeof cards)[string] | undefined;
  const definition = ORDER_ACTIONS[action];
  const count = (n: number) => `${n.toLocaleString("en-US")} ${n === 1 ? "order" : "orders"}`;
  const title = `${definition.label}: ${count(ids.length)}`;
  const status = state?.status === "cancelled" ? "dismissed" : (state?.status ?? "proposed");
  /* A change still to confirm holds its reply's status line on "Waiting for approval". */
  useTurnAwaiting(status === "proposed", id);
  const proposed = status === "proposed" ? plan(action, ids) : null;
  const preview = proposed ? readoutFor(proposed, proposed.ids.map((orderId) => valuesOf(orderId) ?? {}), "will") : null;
  const confirmed = state?.status === "confirmed" ? state : null;
  const facts = preview ? factsOf(preview) : record && confirmed ? factsOf(confirmed.readout) : undefined;

  return (
    <ActionCard
      title={title}
      /* What the change does, in the action's own words: the bar's confirm says the same. What it leaves alone is a fact. */
      detail={definition.effect?.(ids.length)}
      facts={facts}
      icon={definition.icon}
      tone={definition.destructive ? "destructive" : "default"}
      status={status}
      receipt={
        record && confirmed ? (
          confirmed.readout.title
        ) : (
          <>
            {title}
            <span className={styles.recordNote}>Confirmed</span>
          </>
        )
      }
      onConfirm={() => {
        const now = plan(action, ids);
        /* Read before the change lands: the readout says what the orders were and what they became. */
        const readout = readoutFor(now, now.ids.map((orderId) => valuesOf(orderId) ?? {}));
        const undo = run(now, "chat");
        setCard(id, { status: "confirmed", undo, readout });
        changes?.showOrders(now.ids);
        /* The confirmation is the reader's own message, so the reply answers it, opening with the record. */
        changes?.stageRecord({ id, action, ids, skipped });
        /* The request says this message was confirmed on its card; a typed "yes" never is. */
        markConfirmation({ action, count: now.ids.length, ids: now.ids.slice(0, MAX_CONFIRMED_IDS) });
        say(definition.confirm(theseOrders(now.ids.length)));
      }}
      onDismiss={() => {
        setCard(id, { status: "cancelled" });
        /* The way out is an action too, so it is the reader's message and gets its reply, marked so the model knows the card is already put away. */
        markUndo({ action, count: ids.length, dismissed: true });
        say(`No, leave ${theseOrders(ids.length)} as ${ids.length === 1 ? "it is" : "they are"}`);
      }}
      onUndo={
        record && confirmed && !streaming
          ? () => {
              /* Read either side of the undo: the reply opens with what the orders were and what they are again. */
              const before = ids.map((orderId) => valuesOf(orderId) ?? {});
              confirmed.undo();
              setCard(id, { status: "undone" });
              changes?.stageReadout(undoReadoutFor(before, ids.map((orderId) => valuesOf(orderId) ?? {})));
              /* Undo takes Confirm's path: the press is the reader's own message, marked on the request it
                 sends, and the reply answers it under its own status line. */
              markUndo({ action, count: ids.length });
              say("Undo that change");
            }
          : undefined
      }
    />
  );
}

const RENDERERS = {
  "table-view": (data: unknown) => {
    const { id, before } = data as { id: string; before: TableView };
    return <TableReceipt id={id} before={before} />;
  },
  "order-action": (data: unknown) => <OrderActionCard {...(data as OrderCardData)} />,
  "order-record": (data: unknown) => <OrderActionCard {...(data as OrderCardData)} record />,
  "action-readout": (data: unknown) => <ReadoutBlock readout={data as ActionReadout} />,
};

function ChatWithToasts({ bridge, children }: { bridge: BridgeRef; children: React.ReactNode }) {
  const { getFocus } = useChatFocus();
  const { getEdits, getLog, takeConfirmation, takeUndo } = useOrderEdits();
  const { toast, dismiss } = useToast();
  const [undone, setUndone] = React.useState<ReadonlySet<string>>(new Set());
  const lastToast = React.useRef<string | null>(null);
  const tableCoveredRef = React.useRef(false);
  const stagedRecord = React.useRef<OrderCardData | null>(null);
  const stagedReadout = React.useRef<ActionReadout | null>(null);

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
        return view ? JSON.stringify({ ...view, columnWidths: undefined, focus: focusForRequest(getFocus()), edits: getEdits(), changes: getLog().slice(-MAX_LOGGED), confirmation: takeConfirmation(), undo: takeUndo() }) : null;
      },
    });
    return async function* merchantTransport(messages, signal) {
      /* A confirmation's reply opens with the change's record, worked out on the page, as a lead card under the model's thinking line. */
      const record = stagedRecord.current;
      stagedRecord.current = null;
      if (record) yield { type: "card", card: { kind: "order-record", data: record, lead: true } };
      /* An undo's reply opens the same way, with the readout of what went back. */
      const readout = stagedReadout.current;
      stagedReadout.current = null;
      if (readout) yield { type: "card", card: { kind: "action-readout", data: readout, lead: true } };
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
        flashRows(namedOrders(words));
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
              action: <Button variant="secondary" tone="neutral" size="compact" iconLeft="undo" label="Undo" onClick={() => undo(id, before)} />,
            });
          });
        }
      }
    };
  }, [bridge, getFocus, getEdits, getLog, takeConfirmation, takeUndo, toast, dismiss, undo]);

  const changes = React.useMemo(
    () => ({
      reportCovered: (covered: boolean) => {
        tableCoveredRef.current = covered;
      },
      undone,
      undo,
      stageRecord: (data: OrderCardData) => {
        stagedRecord.current = data;
      },
      stageReadout: (readout: ActionReadout) => {
        stagedReadout.current = readout;
      },
      showOrders: (ids: string[]) => {
        if (!bridge.current) return;
        applyToTable(bridge.current, nextView(bridge.current.view, {
          search: "",
          filters: [{ column: "orderId", operator: "isAnyOf", value: ids }],
          sorts: null,
          visibleColumns: null,
          pinnedColumns: null,
          grouping: [],
          density: null,
        }));
      },
    }),
    [undone, undo, bridge],
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
    <ChatFocusProvider bridge={bridge}>
      <ToastProvider position="bottom-right">
        <ChatWithToasts bridge={bridge}>{children}</ChatWithToasts>
      </ToastProvider>
    </ChatFocusProvider>
  );
}

/** The widget, set as the launcher sets it, for TemplateAssistant to seat. */
export function MerchantChatWidget({ starters }: { starters: Starter[] }) {
  const { view, starterSeed, open, turns } = useChatWidget();
  const { focus, setFocus, pageView } = useChatFocus();
  const takeover = useTakeoverViewport();
  const { label, note, icon } = focusLabel(focus, pageView);
  /* Written for the focus by a model while the welcome screen shows; the page's pool otherwise. */
  const generated = useFocusStarters(focus, open && turns.length === 0);
  const shownStarters = generated.starters ?? pickStarters(starters, starterSeed, "merchant-sales");
  return (
    <ChatWidget
      title="Larkspur AI"
      tagline="Ask about the orders on this page, or tell me how to change the table"
      placeholder="Ask anything"
      starters={shownStarters}
      startersKey={generated.key ? `merchant-sales-${generated.key}` : `merchant-sales-${starterSeed}`}
      startersPending={generated.pending}
      context={{
        label,
        note,
        icon,
        onClear: focus ? () => setFocus(null) : undefined,
        sent: focus ? () => <SentFocusChip focus={focus} /> : false,
      }}
      contextClearLabel="Back to the whole page"
      disclaimer="Answers may be wrong. Fictional orders only."
      fullscreenEnabled={!takeover}
      placementEnabled={false}
      compact={takeover || view !== "full"}
      phone={takeover}
    />
  );
}
