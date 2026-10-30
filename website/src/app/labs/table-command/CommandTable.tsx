'use client';

import { useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from 'rift-ds/components/DataTable/DataTable';
import { TableToolbar, type TableToolbarCommand } from 'rift-ds/components/TableToolbar/TableToolbar';
import { LEDGER_COLUMNS, ledgerRows } from './_data/ledger';
import styles from './command.module.css';

type Trace = {
  steps: string[];
  turns: number;
  ms: number;
  matching: number;
  usage: { input: number; cached: number; cacheWrite: number; output: number };
};

/* Sonnet 5.5's rates per token: input, cache read, cache write, output. */
const costOf = ({ input, cached, cacheWrite, output }: Trace['usage']) =>
  (input * 2 + cached * 0.2 + cacheWrite * 2.5 + output * 10) / 1_000_000;

const COLUMNS = LEDGER_COLUMNS as unknown as DataTableColumn[];
const DEFAULT_HIDDEN = (LEDGER_COLUMNS as readonly { key: string; defaultHidden?: boolean }[])
  .filter((col) => col.defaultHidden)
  .map((col) => col.key);

export default function CommandTable() {
  const rows = useMemo(() => ledgerRows(), []);
  const [trace, setTrace] = useState<Trace | null>(null);

  const command = useMemo<TableToolbarCommand>(
    () => ({
      suggestions: ['Worst carrier by lateness', 'Top 10 customers by revenue', 'Overdue payments, largest first'],
      onSubmit: async ({ text, view, signal }) => {
        const response = await fetch('/api/table-command', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text, view }),
          signal,
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        setTrace(body.trace);
        return { view: body.view, message: body.message };
      },
    }),
    [],
  );

  return (
    <main className={styles.page}>
      <DataTable
        columns={COLUMNS}
        rows={rows}
        caption="Order ledger"
        defaultHiddenColumns={DEFAULT_HIDDEN}
        defaultPageSize={100}
        virtualize="auto"
        maxHeight="calc(100dvh - 180px)"
        stickyHeader
        columnMenu
        resizableColumns
        reorderableColumns
        multiSort
        selectable
        toolbar={<TableToolbar command={command} />}
      />
      {trace && (
        <p className={styles.trace}>
          {trace.matching.toLocaleString('en-US')} matching · {(trace.ms / 1000).toFixed(1)}s · {trace.turns} turns · ${costOf(trace.usage).toFixed(4)}
          {trace.steps.length > 0 && ` · ${trace.steps.join('; ')}`}
        </p>
      )}
    </main>
  );
}
