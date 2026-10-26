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
import { EditingTable } from "./EditingTable";
import { TypedTable } from "./TypedTable";
import { PhoneTable } from "./PhoneTable";
import { GroupedTable } from "./GroupedTable";
import { DetailTable } from "./DetailTable";
import { ViewsTable } from "./ViewsTable";
import { ScaleTable } from "./ScaleTable";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
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
  defaultWidth = "desktop",
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
  /** The width the station opens at. */
  defaultWidth?: Width;
  /** A control at the end of the station's control row. */
  action?: ReactNode;
  children: ReactNode | ((tuning: Tuning) => ReactNode);
}) {
  const [width, setWidth] = useState<Width>(defaultWidth);
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
        note="Pages of five, with a Rows per page picker (5, 10 or 20), row selection with a select-all header, the count in the footer."
      >
        {({ size, lines }) => (
          <DataTable
            size={size}
            columnDividers={lines}
            columns={listColumns}
            rows={projectRows}
            defaultPageSize={5}
            pageSizeOptions={[5, 10, 20]}
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
      <Station
        id="bench-toolbar"
        title="9. Toolbar and filters"
        note="TableToolbar in the table's toolbar slot: search, Filter with a chip per condition, Sort (two sorts set: Shift-click a header to add one, or order them in the panel), Group, Columns with a switch and a grip per column, the density switch as icons, and New project as a split button whose menu holds the other ways in and out. Tick a row and the bar becomes the bulk bar at the same height: Clear, the count, Select all N past the page, then every action in full, Delete last, with a More menu only for what does not fit. Each header menu ends in Filter…, the same filters as the chips. Status, Owner and Region filter as choices, Budget as a number, Due as a date, Project as text."
        tunable={false}
      >
        {() => (
          <DataTable
            columns={wideColumns}
            rows={projectRows}
            columnMenu
            resizableColumns
            selectable
            multiSort
            defaultSorts={[
              { key: "status", direction: "asc" },
              { key: "budget", direction: "desc" },
            ]}
            pageSize={8}
            caption="Filtered projects"
            defaultFilters={[
              {
                id: "status-1",
                column: "status",
                operator: "isAnyOf",
                value: ["Active", "Paused"],
              },
              {
                id: "owner-1",
                column: "owner",
                operator: "isAnyOf",
                value: ["Priya Shah", "Sam Rivera", "Alex Morgan"],
              },
              { id: "budget-1", column: "budget", operator: "gt", value: 5000 },
            ]}
            toolbar={
              <TableToolbar
                bulkActions={[
                  { id: "archive", label: "Archive", icon: "archive", onSelect: () => {} },
                  { id: "assign", label: "Assign owner", icon: "person_add", onSelect: () => {} },
                  { id: "export", label: "Export selected", icon: "download", onSelect: () => {} },
                  { id: "delete", label: "Delete", icon: "delete", destructive: true, onSelect: () => {} },
                ]}
                primaryAction={{
                  id: "new",
                  label: "New project",
                  icon: "add",
                  onSelect: () => {},
                  menu: [
                    { id: "template", label: "From a template", icon: "content_copy", onSelect: () => {} },
                    { id: "import", label: "Import", icon: "upload", onSelect: () => {} },
                    { id: "export", label: "Export all", icon: "download", onSelect: () => {} },
                  ],
                }}
              />
            }
          />
        )}
      </Station>

      <Station
        id="bench-editing"
        title="10. Editing"
        note="Every editor kind: text, select, combobox, number, tags, multi-select, date, time, textarea, and a live checkbox and switch. Double-click a cell, or focus it and press Enter, F2 or start typing; Enter saves and moves down, Tab saves and moves on, Escape cancels. A task needs a name; a budget saves after a moment and fails above $100,000, rolling back. Row editing opens a whole row with Save and Cancel."
      >
        {({ size, lines }) => <EditingTable size={size} lines={lines} />}
      </Station>

      <Station
        id="bench-types"
        title="11. Column types"
        note="Every column type, with no render function anywhere: text, status (sorted in its options' order), person and a person list, currency, number, progress, an absolute and a relative date, tags, checkbox and link. Each type sets its cell, alignment, sort and filter conditions, and Stage, Owner, Value, Renews and Billable are editable with the editor their type brings. One row has no last contact, and draws nothing there."
      >
        {({ size, lines }) => <TypedTable size={size} lines={lines} />}
      </Station>

      <Station
        id="bench-phone"
        title="12. Phone layouts"
        defaultWidth="phone"
        note="Narrower than a phone, measured on the table itself. Scroll keeps the rows and pins the row header while the rest scrolls sideways; Stack draws each row as a card, the project as its title, every other column as a label and value. Tick a row on a real phone and the bulk bar floats at the foot of the screen."
      >
        {({ size, lines }) => <PhoneTable size={size} lines={lines} />}
      </Station>

      <Station
        id="bench-groups"
        title="13. Groups and totals"
        note="The accounts grouped by stage, in the stage's own order: each group row carries its count and the totals (value and seats summed, onboarding averaged, renewals counted), its checkbox selects the group, and its chevron folds it. Group by Owner or Billable from a header menu or the bar's Group control. The footer's cells each pick a calculation; hover the footer to see Calculate on the rest."
      >
        {({ size, lines }) => <GroupedTable size={size} lines={lines} />}
      </Station>

      <Station
        id="bench-details"
        title="14. Row details"
        note="A chevron opens a row's details beneath it, across the table: the figures the list leaves out, the note and an action, rendered only once opened. On a focused row header in a grid, the right arrow opens and the left closes. Switch to One at a time and opening a row closes the rest."
      >
        {({ size, lines }) => <DetailTable size={size} lines={lines} />}
      </Station>

      <Station
        id="bench-views"
        title="15. Saved views"
        note="Three saved views as tabs over the bar: All accounts, Open pipeline (a filter and a sort) and By owner (grouped, three columns hidden). Pick one and the table takes its setup. Change anything and the active tab shows a dot; its menu saves, saves as new, resets, renames and deletes, and the plus saves the table as a new view."
      >
        {({ size, lines }) => <ViewsTable size={size} lines={lines} />}
      </Station>

      <Station
        id="bench-scale"
        title="16. Ten thousand rows"
        note="Ten thousand projects in one unpaged table: only the rows in view are drawn, so scrolling, sorting, filtering and selecting stay quick, and the server's HTML still holds the first screen. Switch to 100 at a time and the table asks for the next hundred as the loading row comes into view."
      >
        {({ size, lines }) => <ScaleTable size={size} lines={lines} />}
      </Station>
    </div>
  );
}
