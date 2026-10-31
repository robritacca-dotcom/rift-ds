/**
 * The browser's half of the table command over the order ledger: one sentence
 * and the table's setup to /api/table-command, a new setup and a one-line account
 * back. The merchant sales template and the labs bench share it, since the route
 * answers over the ledger they both show.
 */

import type { TableToolbarCommandRequest } from "rift-ds/components/TableToolbar/TableToolbar";

export type OrderLedgerTrace = {
  steps: string[];
  turns: number;
  ms: number;
  matching: number;
  usage: { input: number; cached: number; cacheWrite: number; output: number };
};

export async function askOrderLedger({ text, view, signal }: TableToolbarCommandRequest) {
  const response = await fetch("/api/table-command", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, view }),
    signal,
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error);
  return body as { view: TableToolbarCommandRequest["view"]; message: string; trace: OrderLedgerTrace };
}
