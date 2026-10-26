"use client";

import { useState } from "react";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Button } from "rift-ds/components/Button/Button";
import { DataTable, type DataTableRow } from "rift-ds/components/DataTable/DataTable";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { listColumns, projectRows } from "./benchData";
import styles from "./TablesBench.module.css";

const money = (value: unknown) => `$${Number(value).toLocaleString("en-US")}`;

/* What a project's details hold: the figures the list leaves out, its note
   and an action, laid out as the app would. */
function ProjectDetail({ row }: { row: DataTableRow }) {
  const { budget, spent, tasks, note, region } = row.values;
  return (
    <div className={styles.detail}>
      <dl className={styles.detailFacts}>
        <div>
          <dt>Region</dt>
          <dd>{region}</dd>
        </div>
        <div>
          <dt>Budget</dt>
          <dd>{money(budget)}</dd>
        </div>
        <div>
          <dt>Spent</dt>
          <dd>{money(spent)}</dd>
        </div>
        <div>
          <dt>Open tasks</dt>
          <dd>
            <Badge label={String(tasks)} variant="neutral" />
          </dd>
        </div>
      </dl>
      <p className={styles.detailNote}>{String(note)}</p>
      <div>
        <Button variant="secondary" tone="neutral" size="compact" label="Open project" iconLeft="open_in_new" />
      </div>
    </div>
  );
}

export function DetailTable({ size, lines }: { size: "default" | "compact"; lines: boolean }) {
  const [mode, setMode] = useState<"multiple" | "single">("multiple");
  return (
    <div className={styles.phoneStation}>
      <SegmentedControl
        size="compact"
        aria-label="How many rows open"
        segments={[
          { value: "multiple", label: "Several open" },
          { value: "single", label: "One at a time" },
        ]}
        value={mode}
        onValueChange={(value) => setMode(value as "multiple" | "single")}
      />
      <DataTable
        columns={listColumns}
        rows={projectRows.slice(0, 6)}
        size={size}
        columnDividers={lines}
        selectable
        expandMode={mode}
        defaultExpandedIds={["p2"]}
        renderDetail={(row) => <ProjectDetail row={row} />}
        caption="Projects with details"
      />
    </div>
  );
}
