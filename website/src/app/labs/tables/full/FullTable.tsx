"use client";

import { useState } from "react";
import { Button } from "rift-ds/components/Button/Button";
import { DataTable } from "rift-ds/components/DataTable/DataTable";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { ThemeToggle } from "rift-ds/components/ThemeToggle/ThemeToggle";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
import { HiddenBackground } from "@/components/BlurBackground/BlurBackground";
import { makeProjectRows, stressActions, stressColumns } from "../benchData";
import styles from "./FullTable.module.css";

const rows = makeProjectRows(60);

export function FullTable() {
  const [size, setSize] = useState<"default" | "compact">("default");
  const [lines, setLines] = useState(true);
  return (
    <div className={styles.page}>
      <HiddenBackground />
      <header className={styles.bar}>
        <div className={styles.titleRow}>
          <Button
            variant="tertiary"
            size="compact"
            iconLeft="arrow_back"
            href="/labs/tables"
          >
            Bench
          </Button>
          <h1 className={styles.title}>Projects</h1>
        </div>
        <div className={styles.controls}>
          <SegmentedControl
            size="compact"
            aria-label="Density"
            segments={[
              { value: "default", label: "Default" },
              { value: "compact", label: "Compact" },
            ]}
            value={size}
            onValueChange={(value) => setSize(value as "default" | "compact")}
          />
          <ToggleSwitch
            size="compact"
            label="Column lines"
            checked={lines}
            onCheckedChange={setLines}
          />
          <ThemeToggle size="compact" />
        </div>
      </header>
      <DataTable
        className={styles.table}
        size={size}
        columnDividers={lines}
        columns={stressColumns}
        rows={rows}
        toolbar={<TableToolbar />}
        resizableColumns
        reorderableColumns
        columnMenu
        reorderableRows
        selectable
        stickyHeader
        maxHeight="100%"
        pageSize={25}
        caption="Projects"
        rowActions={stressActions}
      />
    </div>
  );
}
