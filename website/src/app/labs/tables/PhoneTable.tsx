"use client";

import { useState } from "react";
import { DataTable } from "rift-ds/components/DataTable/DataTable";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import { projectRows, stressActions, wideColumns } from "./benchData";
import styles from "./TablesBench.module.css";

/* The two phone layouts over the same wide table: scroll sideways with the
   row header pinned, or a card per row. */
export function PhoneTable({ size, lines }: { size: "default" | "compact"; lines: boolean }) {
  const [layout, setLayout] = useState<"scroll" | "stack">("stack");
  return (
    <div className={styles.phoneStation}>
      <SegmentedControl
        size="compact"
        aria-label="Phone layout"
        segments={[
          { value: "scroll", label: "Scroll" },
          { value: "stack", label: "Stack" },
        ]}
        value={layout}
        onValueChange={(value) => setLayout(value as "scroll" | "stack")}
      />
      <DataTable
        columns={wideColumns.map((col) => ({ ...col, pin: col.rowHeader ? undefined : col.pin, locked: false }))}
        rows={projectRows}
        size={size}
        columnDividers={lines}
        phoneLayout={layout}
        selectable
        rowActions={stressActions}
        defaultPageSize={5}
        caption="Projects on a phone"
        toolbar={
          <TableToolbar
            bulkActions={[
              { id: "archive", label: "Archive", icon: "archive", onSelect: () => {} },
              { id: "delete", label: "Delete", icon: "delete", destructive: true, onSelect: () => {} },
            ]}
          />
        }
      />
    </div>
  );
}
