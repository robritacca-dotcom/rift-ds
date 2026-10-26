"use client";

import { useState } from "react";
import { Button } from "rift-ds/components/Button/Button";
import { DataTable } from "rift-ds/components/DataTable/DataTable";
import { Dialog } from "rift-ds/components/Dialog/Dialog";
import { Drawer } from "rift-ds/components/Drawer/Drawer";
import { EmptyState } from "rift-ds/components/EmptyState/EmptyState";
import { Dropdown } from "rift-ds/components/Dropdown/Dropdown";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import { listColumns, projectRows } from "./benchData";
import styles from "./TablesBench.module.css";

/* Every state a table shows instead of, or over, its rows, one at a time:
   nothing yet, nothing matching, the first load, a failed load, and a
   refetch that failed over the rows already on screen. Then the same table
   inside a Dialog and a Drawer, to prove Escape and focus come back. */
type State = "empty" | "noResults" | "loading" | "failed" | "refetchFailed";

const STATES: { value: State; label: string }[] = [
  { value: "empty", label: "No data" },
  { value: "noResults", label: "No results" },
  { value: "loading", label: "First load" },
  { value: "failed", label: "Failed load" },
  { value: "refetchFailed", label: "Refetch failed" },
];

export function LoadStatesTable({ size, lines }: { size: "default" | "compact"; lines: boolean }) {
  const [state, setState] = useState<State>("empty");
  const [overlay, setOverlay] = useState<"dialog" | "drawer" | null>(null);
  const withRows = state === "noResults" || state === "refetchFailed";

  const table = (
    <DataTable
      key={state}
      columns={listColumns}
      rows={state === "refetchFailed" || state === "noResults" ? projectRows.slice(0, 4) : []}
      size={size}
      columnDividers={lines}
      loading={state === "loading"}
      error={state === "failed" || state === "refetchFailed" ? "The server took too long to answer." : undefined}
      onRetry={() => {}}
      pageSize={5}
      defaultSearch={state === "noResults" ? "zzz" : undefined}
      emptyState={
        state === "empty" ? (
          <EmptyState
            icon="folder_open"
            title="No projects yet"
            description="Projects you create show here."
            action={<Button variant="primary" size="compact" iconLeft="add" label="New project" />}
            variant="bordered"
            size="compact"
          />
        ) : undefined
      }
      caption="Projects"
      toolbar={withRows ? <TableToolbar /> : undefined}
    />
  );

  return (
    <div className={styles.phoneStation}>
      <div className={styles.controls}>
        {/* Five states outrun a phone as segments, so they are a list. */}
        <Dropdown
          size="compact"
          aria-label="Table state"
          options={STATES}
          value={state}
          onValueChange={(value) => setState(value as State)}
        />
        <Button variant="secondary" tone="neutral" size="compact" label="Open in a dialog" onClick={() => setOverlay("dialog")} />
        <Button variant="secondary" tone="neutral" size="compact" label="Open in a drawer" onClick={() => setOverlay("drawer")} />
      </div>
      {table}
      <Dialog open={overlay === "dialog"} onOpenChange={(open) => !open && setOverlay(null)} title="Projects" size="lg">
        <DataTable columns={listColumns} rows={projectRows} size="compact" pageSize={5} columnMenu caption="Projects" toolbar={<TableToolbar />} />
      </Dialog>
      <Drawer open={overlay === "drawer"} onOpenChange={(open) => !open && setOverlay(null)} title="Projects" side="right" size="lg">
        <DataTable columns={listColumns} rows={projectRows} size="compact" pageSize={5} columnMenu caption="Projects" toolbar={<TableToolbar />} />
      </Drawer>
    </div>
  );
}
