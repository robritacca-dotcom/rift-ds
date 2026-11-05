"use client";

/**
 * The merchant sales page's edits, for the visit: what the reader has changed
 * through an order action (lib/order-actions.ts), laid over the seeded ledger.
 * The table draws the rows through them, the chat sends them with every request
 * so its answers count them, and a reload, or Reset demo data, starts over.
 *
 * `run` makes a change and hands back its undo, from the selection bar or a
 * confirmed action card alike, and logs both, so the chat is told what has been
 * done since it last spoke; `cards` remembers what became of each card the
 * chat proposed, so a thread re-rendering never offers a confirmed one again.
 */

import React from "react";
import { ledgerRows } from "@/data/order-ledger";
import { editsFor, planAction, withEdit, type ActionPlan, type ChangeLogEntry, type OrderActionId, type OrderEdits } from "@/lib/order-actions";

let byId: Map<string, Record<string, unknown>> | null = null;
const baseValues = (id: string) => (byId ??= new Map(ledgerRows().map((row) => [row.id, row.values]))).get(id);

export type Confirmation = { action: OrderActionId; count: number };

export type CardState = { status: "confirmed"; undo: () => void } | { status: "cancelled" } | { status: "undone" };

type EditsValue = {
  edits: OrderEdits;
  getEdits: () => OrderEdits;
  /** What an action would do to these orders now, edits included. */
  plan: (action: OrderActionId, ids: string[]) => ActionPlan;
  /** An order's values now, edits included. */
  valuesOf: (id: string) => Record<string, unknown> | undefined;
  /** Makes the change and returns its undo. */
  run: (plan: ActionPlan, source: ChangeLogEntry["source"]) => () => void;
  getLog: () => ChangeLogEntry[];
  /** Marks the next chat message as confirmed on a card, for the request it sends. */
  markConfirmation: (confirmation: Confirmation) => void;
  /** The mark, taken once by the request that carries it, so a later typed "yes" is never taken for a click. */
  takeConfirmation: () => Confirmation | null;
  reset: () => void;
  cards: Record<string, CardState>;
  setCard: (id: string, state: CardState) => void;
};

const EditsContext = React.createContext<EditsValue | null>(null);

export function useOrderEdits() {
  const value = React.useContext(EditsContext);
  if (!value) throw new Error("useOrderEdits needs OrderEditsProvider");
  return value;
}

export function OrderEditsProvider({ children }: { children: React.ReactNode }) {
  const [edits, setEditsState] = React.useState<OrderEdits>({});
  const [cards, setCards] = React.useState<Record<string, CardState>>({});
  /* The transport reads the edits at send time, so they ride a ref beside the state the table draws from. */
  const editsRef = React.useRef<OrderEdits>({});
  const setEdits = React.useCallback((next: OrderEdits) => {
    editsRef.current = next;
    setEditsState(next);
  }, []);
  const getEdits = React.useCallback(() => editsRef.current, []);
  const logRef = React.useRef<ChangeLogEntry[]>([]);
  const getLog = React.useCallback(() => logRef.current, []);
  const confirmationRef = React.useRef<Confirmation | null>(null);
  const markConfirmation = React.useCallback((confirmation: Confirmation) => {
    confirmationRef.current = confirmation;
  }, []);
  const takeConfirmation = React.useCallback(() => {
    const confirmation = confirmationRef.current;
    confirmationRef.current = null;
    return confirmation;
  }, []);
  const valuesOf = React.useCallback((id: string) => {
    const values = baseValues(id);
    return values && withEdit(values, editsRef.current[id]);
  }, []);

  const plan = React.useCallback(
    (action: OrderActionId, ids: string[]) =>
      planAction(
        action,
        ids.flatMap((id) => {
          const values = baseValues(id);
          return values ? [{ id, values: withEdit(values, editsRef.current[id]) }] : [];
        }),
      ),
    [],
  );

  const run = React.useCallback(
    (next: ActionPlan, source: ChangeLogEntry["source"]) => {
      const before = editsRef.current;
      logRef.current = [...logRef.current, { action: next.action, count: next.ids.length, source }];
      setEdits({ ...before, ...editsFor(next, (id) => withEdit(baseValues(id) ?? {}, before[id]), before) });
      /* Undo puts back exactly the orders this change touched, leaving later changes to other orders alone. */
      return () => {
        const current = { ...editsRef.current };
        for (const id of next.ids) {
          if (before[id]) current[id] = before[id];
          else delete current[id];
        }
        setEdits(current);
        logRef.current = [...logRef.current, { action: next.action, count: next.ids.length, source, undone: true }];
      };
    },
    [setEdits],
  );

  const reset = React.useCallback(() => {
    logRef.current = [];
    setEdits({});
    setCards({});
  }, [setEdits]);
  const setCard = React.useCallback((id: string, state: CardState) => setCards((current) => ({ ...current, [id]: state })), []);

  const value = React.useMemo(
    () => ({ edits, getEdits, plan, valuesOf, run, getLog, markConfirmation, takeConfirmation, reset, cards, setCard }),
    [edits, getEdits, plan, valuesOf, run, getLog, markConfirmation, takeConfirmation, reset, cards, setCard],
  );
  return <EditsContext.Provider value={value}>{children}</EditsContext.Provider>;
}
