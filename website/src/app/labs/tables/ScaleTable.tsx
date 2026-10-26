"use client";

import { useCallback, useState } from "react";
import { DataTable } from "rift-ds/components/DataTable/DataTable";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import { makeProjectRows, wideColumns } from "./benchData";
import styles from "./TablesBench.module.css";

/* Ten thousand rows at once, or the same table fed a hundred at a time as
   the reader scrolls. Either way only the rows in view are drawn. */
const ALL_ROWS = makeProjectRows(10_000);
const BATCH = 100;
/* A fetch's pause, so the loading row is seen; the bench's own timer, not the table's. */
const FAKE_FETCH = 600;

export function ScaleTable({ size, lines }: { size: "default" | "compact"; lines: boolean }) {
  const [mode, setMode] = useState<"all" | "infinite">("all");
  const [loaded, setLoaded] = useState(BATCH);
  const loadMore = useCallback(() => {
    setTimeout(() => setLoaded((count) => Math.min(ALL_ROWS.length, count + BATCH)), FAKE_FETCH);
  }, []);
  const rows = mode === "all" ? ALL_ROWS : ALL_ROWS.slice(0, loaded);
  return (
    <div className={styles.phoneStation}>
      <SegmentedControl
        size="compact"
        aria-label="How the rows arrive"
        segments={[
          { value: "all", label: "All 10,000" },
          { value: "infinite", label: "100 at a time" },
        ]}
        value={mode}
        onValueChange={(value) => {
          setMode(value as "all" | "infinite");
          setLoaded(BATCH);
        }}
      />
      <DataTable
        columns={wideColumns}
        rows={rows}
        size={size}
        columnDividers={lines}
        columnMenu
        resizableColumns
        selectable
        multiSort
        maxHeight={560}
        hasMore={mode === "infinite" && loaded < ALL_ROWS.length}
        onLoadMore={loadMore}
        caption="Ten thousand projects"
        toolbar={<TableToolbar />}
      />
    </div>
  );
}
