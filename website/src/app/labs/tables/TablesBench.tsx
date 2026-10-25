"use client";

import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "rift-ds/components/Button/Button";
import { DataTable } from "rift-ds/components/DataTable/DataTable";
import { Prose } from "rift-ds/components/Prose/Prose";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Table } from "rift-ds/components/Table/Table";
import { ThemeToggle } from "rift-ds/components/ThemeToggle/ThemeToggle";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
import { HiddenBackground } from "@/components/BlurBackground/BlurBackground";
import DotBackground from "@/components/DotBackground/DotBackground";
import { MarkdownTable } from "@/components/MarkdownTable/MarkdownTable";
import {
  listColumns,
  projectRows,
  stressActions,
  stressColumns,
  wideColumns,
} from "./benchData";
import styles from "./TablesBench.module.css";

const MARKDOWN = `| Widget | Entry point | Notes |
| --- | --- | --- |
| TickerStrip | \`live\` | Pass a refresh interval |
| QueueDepth | \`live\` | Reads the feed context |
| UplinkBadge | \`core\` | Presentational only |`;

/* ---- Stations -------------------------------------------------------- */

type Width = "desktop" | "tablet" | "phone";
const WIDTHS: Record<Width, string> = {
  desktop: "100%",
  tablet: "820px",
  phone: "390px",
};

/** What a station's own controls set on its tables. */
type Tuning = { size: "default" | "compact"; lines: boolean };

function Station({
  id,
  title,
  note,
  tunable = true,
  defaultSize = "default",
  defaultLines = false,
  action,
  children,
}: {
  id: string;
  title: string;
  note: string;
  /** Shows the density switch and the column lines toggle (`density`: the switch alone), and hands their values to the tables. */
  tunable?: boolean | "density";
  defaultSize?: Tuning["size"];
  defaultLines?: boolean;
  /** A control at the end of the station's control row. */
  action?: ReactNode;
  children: ReactNode | ((tuning: Tuning) => ReactNode);
}) {
  const [width, setWidth] = useState<Width>("desktop");
  const [size, setSize] = useState<Tuning["size"]>(defaultSize);
  const [lines, setLines] = useState(defaultLines);
  return (
    <section id={id} className={styles.station}>
      <header className={styles.stationHead}>
        <div>
          <h2 className={styles.stationTitle}>{title}</h2>
          <p className={styles.stationNote}>{note}</p>
        </div>
      </header>
      <div className={styles.controls}>
        <SegmentedControl
          size="compact"
          aria-label={`${title} width`}
          segments={[
            { value: "desktop", label: "Desktop", icon: "desktop_windows" },
            { value: "tablet", label: "Tablet", icon: "tablet" },
            { value: "phone", label: "Phone", icon: "smartphone" },
          ]}
          value={width}
          onValueChange={(value) => setWidth(value as Width)}
        />
        {tunable && (
          <>
            <SegmentedControl
              size="compact"
              aria-label={`${title} density`}
              segments={[
                { value: "default", label: "Default" },
                { value: "compact", label: "Compact" },
              ]}
              value={size}
              onValueChange={(value) => setSize(value as Tuning["size"])}
            />
            {tunable !== "density" && (
              <ToggleSwitch
                size="compact"
                label="Column lines"
                checked={lines}
                onCheckedChange={setLines}
              />
            )}
          </>
        )}
        {action && <span className={styles.action}>{action}</span>}
      </div>
      <div className={styles.stage} style={{ maxWidth: WIDTHS[width] }}>
        {typeof children === "function" ? children({ size, lines }) : children}
      </div>
    </section>
  );
}

export function TablesBench() {
  return (
    <div className={styles.bench}>
      <HiddenBackground />
      <DotBackground />
      <header className={styles.top}>
        <div>
          <h1 className={styles.title}>Tables</h1>
          <p className={styles.lede}>
            Every table the system offers, smallest first. Switch each one
            between desktop, tablet and phone width.
          </p>
        </div>
        <ThemeToggle size="compact" />
      </header>

      <Station
        id="bench-markdown"
        title="1. Markdown table"
        note="Plain content: a docs page through MarkdownTable, a chat reply through Prose. The basic tier: density only, never column lines."
        tunable="density"
      >
        {({ size }) => (
          <div className={styles.pair}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: (props) => <MarkdownTable {...props} size={size} />,
              }}
            >
              {MARKDOWN}
            </ReactMarkdown>
            <Prose tableSize={size}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {MARKDOWN}
              </ReactMarkdown>
            </Prose>
          </div>
        )}
      </Station>

      <Station
        id="bench-table"
        title="2. Table"
        note="The presentational table: plain and striped, and bordered."
        defaultLines
      >
        {({ size, lines }) => (
          <div className={styles.pair}>
            <Table
              columns={[
                { key: "a", header: "Project" },
                { key: "b", header: "Owner" },
                { key: "c", header: "Due", align: "right" },
              ]}
              rows={projectRows.slice(0, 4).map((r) => ({
                id: r.id,
                cells: {
                  a: r.values.name,
                  b: r.values.owner,
                  c: r.values.due,
                },
              }))}
              striped
              size={size}
              columnDividers={lines}
              caption="Striped"
            />
            <Table
              columns={[
                { key: "a", header: "Project" },
                { key: "b", header: "Owner" },
                { key: "c", header: "Due", align: "right" },
              ]}
              rows={projectRows.slice(0, 4).map((r) => ({
                id: r.id,
                cells: {
                  a: r.values.name,
                  b: r.values.owner,
                  c: r.values.due,
                },
              }))}
              bordered
              size={size}
              columnDividers={lines}
              caption="Bordered"
            />
          </div>
        )}
      </Station>

      <Station
        id="bench-simple"
        title="3. Sortable"
        note="DataTable with nothing but sortable headers: a reading table, every control in the Tab order."
      >
        {({ size, lines }) => (
          <DataTable
            size={size}
            columnDividers={lines}
            columns={listColumns}
            rows={projectRows.slice(0, 6)}
            caption="Sortable projects"
          />
        )}
      </Station>

      <Station
        id="bench-list"
        title="4. List"
        note="Linear and Stripe shaped: a row header, status and people, search, and row actions on hover."
      >
        {({ size, lines }) => (
          <DataTable
            size={size}
            columnDividers={lines}
            columns={listColumns}
            rows={projectRows}
            searchable
            searchPlaceholder="Search projects"
            caption="Projects"
            rowActions={() => [
              {
                id: "edit",
                label: "Edit",
                icon: "edit",
                inline: true,
                onSelect: () => {},
              },
              {
                id: "duplicate",
                label: "Duplicate",
                icon: "content_copy",
                onSelect: () => {},
              },
              {
                id: "archive",
                label: "Archive",
                icon: "archive",
                onSelect: () => {},
              },
              {
                id: "delete",
                label: "Delete",
                icon: "delete",
                destructive: true,
                onSelect: () => {},
              },
            ]}
          />
        )}
      </Station>

      <Station
        id="bench-paged"
        title="5. Paged and selectable"
        note="Pages of five, row selection with a select-all header, the count in the footer."
      >
        {({ size, lines }) => (
          <DataTable
            size={size}
            columnDividers={lines}
            columns={listColumns}
            rows={projectRows}
            pageSize={5}
            selectable
            caption="Paged projects"
          />
        )}
      </Station>

      <Station
        id="bench-columns"
        defaultLines
        title="6. Columns"
        note="Resize by an edge (double-click to fit), drag a header to move it, and each header's menu: sort, pin, move, fit, reset, hide. Project is locked and pinned; the table scrolls under it. Column dividers on, pages of eight."
      >
        {({ size, lines }) => (
          <DataTable
            size={size}
            columnDividers={lines}
            columns={wideColumns}
            rows={projectRows}
            resizableColumns
            reorderableColumns
            columnMenu
            pageSize={8}
            caption="Project columns"
          />
        )}
      </Station>

      <Station
        id="bench-rows"
        title="7. Rows"
        note="Drag a row's grip, or Alt+Up and Alt+Down on it; the header sticks while the body scrolls in its frame."
      >
        {({ size, lines }) => (
          <DataTable
            size={size}
            columnDividers={lines}
            columns={listColumns}
            rows={projectRows}
            reorderableRows
            stickyHeader
            maxHeight={320}
            caption="Ordered projects"
          />
        )}
      </Station>

      <Station
        id="bench-stress"
        action={
          <Button
            variant="secondary"
            size="compact"
            iconLeft="open_in_full"
            href="/labs/tables/full"
          >
            Full page
          </Button>
        }
        defaultLines
        title="8. Everything"
        note="Every column and row control at once, selection, actions, pins at both edges, pages of ten, column dividers, and a trend column that redraws on every commit: the table the gesture check drags."
      >
        {({ size, lines }) => (
          <DataTable
            size={size}
            columnDividers={lines}
            columns={stressColumns}
            rows={projectRows}
            resizableColumns
            reorderableColumns
            columnMenu
            reorderableRows
            selectable
            stickyHeader
            maxHeight={420}
            pageSize={10}
            caption="Every control"
            rowActions={stressActions}
          />
        )}
      </Station>
    </div>
  );
}
