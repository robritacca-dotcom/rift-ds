'use client';

import { useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from 'rift-ds/components/DataTable/DataTable';
import { TableToolbar, type TableToolbarCommand } from 'rift-ds/components/TableToolbar/TableToolbar';
import BrandSwitcher from '@/components/BrandSwitcher/BrandSwitcher';
import { LEDGER_COLUMNS, ledgerRows } from '@/data/order-ledger';
import { askOrderLedger, type OrderLedgerTrace as Trace } from '@/lib/order-ledger-command';
import styles from './command.module.css';

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
      onSubmit: async (request) => {
        const { view, message, trace: next } = await askOrderLedger(request);
        setTrace(next);
        return { view, message };
      },
    }),
    [],
  );

  return (
    <main className={styles.page}>
      <div className={styles.bar}>
        <BrandSwitcher size="compact" />
      </div>
      <DataTable
        columns={COLUMNS}
        rows={rows}
        caption="Order ledger"
        defaultHiddenColumns={DEFAULT_HIDDEN}
        defaultPageSize={100}
        virtualize="auto"
        maxHeight="calc(100dvh - 230px)"
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
