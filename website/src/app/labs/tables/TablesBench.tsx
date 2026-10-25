"use client";

import { useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { Badge } from "rift-ds/components/Badge/Badge";
import {
  DataTable,
  type DataTableColumn,
  type DataTableRow,
} from "rift-ds/components/DataTable/DataTable";
import { Prose } from "rift-ds/components/Prose/Prose";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import { Table } from "rift-ds/components/Table/Table";
import { ThemeToggle } from "rift-ds/components/ThemeToggle/ThemeToggle";
import { HiddenBackground } from "@/components/BlurBackground/BlurBackground";
import DotBackground from "@/components/DotBackground/DotBackground";
import { MarkdownTable } from "@/components/MarkdownTable/MarkdownTable";
import styles from "./TablesBench.module.css";

/* ---- Fictional data -------------------------------------------------- */

const STATUS = { Active: "positive", Paused: "warning", Failed: "error", Draft: "neutral" } as const;
type Status = keyof typeof STATUS;

const PEOPLE = ["Priya Shah", "Sam Rivera", "Jordan Lee", "Lee Chen", "Alex Morgan", "Rae Okafor"];
const PROJECTS = [
  "Website refresh", "Mobile app", "Billing migration", "Onboarding emails", "Partner portal",
  "Search tuning", "Pricing page", "Data export", "Help centre", "Status page", "Invoice redesign",
  "Team invites",
];

const projectRows: DataTableRow[] = PROJECTS.map((name, i) => ({
  id: `p${i + 1}`,
  values: {
    name,
    owner: PEOPLE[i % PEOPLE.length],
    status: (["Active", "Paused", "Failed", "Draft"] as Status[])[i % 4],
    region: ["North", "South", "East", "West"][i % 4],
    budget: 1200 + ((i * 7919) % 48000),
    spent: 300 + ((i * 3571) % 31000),
    tasks: 4 + ((i * 13) % 60),
    due: `2026-${String(((i * 5) % 12) + 1).padStart(2, "0")}-${String(((i * 7) % 27) + 1).padStart(2, "0")}`,
    note: "Waiting on the carrier to confirm the delivery window before the launch email goes out.",
  },
}));

/* A trend per row: a seeded random walk with a little momentum, so each
   row draws a plausible line and the same one on every render. */
const trendFor = (id: string) => {
  let seed = [...id].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761), 7) >>> 0;
  const random = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let value = 40 + random() * 20;
  let drift = (random() - 0.4) * 3;
  return Array.from({ length: 16 }, () => {
    drift = drift * 0.7 + (random() - 0.45) * 3;
    value = Math.max(5, value + drift);
    return Math.round(value);
  });
};

const money = (value: unknown) =>
  typeof value === "number" ? `$${value.toLocaleString("en-US")}` : "";

const statusCell = (row: DataTableRow) => {
  const status = row.values.status as Status;
  return <Badge label={status} variant={STATUS[status]} />;
};

const personCell = (row: DataTableRow) => (
  <span className={styles.person}>
    <Avatar name={String(row.values.owner)} size="sm" />
    {row.values.owner}
  </span>
);

const MARKDOWN = `| Widget | Entry point | Notes |
| --- | --- | --- |
| TickerStrip | \`live\` | Pass a refresh interval |
| QueueDepth | \`live\` | Reads the feed context |
| UplinkBadge | \`core\` | Presentational only |`;

/* ---- Stations -------------------------------------------------------- */

type Width = "desktop" | "tablet" | "phone";
const WIDTHS: Record<Width, string> = { desktop: "100%", tablet: "820px", phone: "390px" };

function Station({ id, title, note, children }: { id: string; title: string; note: string; children: ReactNode }) {
  const [width, setWidth] = useState<Width>("desktop");
  return (
    <section id={id} className={styles.station}>
      <header className={styles.stationHead}>
        <div>
          <h2 className={styles.stationTitle}>{title}</h2>
          <p className={styles.stationNote}>{note}</p>
        </div>
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
      </header>
      <div className={styles.stage} style={{ maxWidth: WIDTHS[width] }}>
        {children}
      </div>
    </section>
  );
}

export function TablesBench() {
  const listColumns: DataTableColumn[] = [
    { key: "name", header: "Project", sortable: true, rowHeader: true },
    { key: "owner", header: "Owner", sortable: true, render: personCell },
    { key: "status", header: "Status", sortable: true, render: statusCell },
    { key: "due", header: "Due", sortable: true, align: "right" },
  ];

  const wideColumns: DataTableColumn[] = [
    { key: "name", header: "Project", sortable: true, rowHeader: true, pin: "start", locked: true, width: "200px", cellText: "truncate" },
    { key: "owner", header: "Owner", sortable: true, render: personCell, width: "180px" },
    { key: "status", header: "Status", sortable: true, render: statusCell, width: "120px" },
    { key: "region", header: "Region", sortable: true, width: "120px" },
    { key: "budget", header: "Budget", sortable: true, align: "right", width: "130px", render: (r) => money(r.values.budget) },
    { key: "spent", header: "Spent", sortable: true, align: "right", width: "130px", render: (r) => money(r.values.spent) },
    { key: "tasks", header: "Tasks", sortable: true, align: "right", width: "100px" },
    { key: "due", header: "Due", sortable: true, width: "130px" },
    { key: "note", header: "Note", width: "260px", cellText: "lines-2" },
  ];

  const stressColumns: DataTableColumn[] = [
    ...wideColumns.slice(0, 3),
    {
      key: "trend",
      header: "Trend",
      width: "140px",
      render: (r) => <Sparkline data={trendFor(r.id)} width={100} height={24} label={`${r.values.name} trend`} />,
    },
    ...wideColumns.slice(3, 8),
    { key: "note", header: "Note", width: "220px", cellText: "truncate", pin: "end" },
  ];

  return (
    <div className={styles.bench}>
      <HiddenBackground />
      <DotBackground />
      <header className={styles.top}>
        <div>
          <h1 className={styles.title}>Tables</h1>
          <p className={styles.lede}>Every table the system offers, smallest first. Switch each one between desktop, tablet and phone width.</p>
        </div>
        <ThemeToggle size="compact" />
      </header>

      <Station id="bench-markdown" title="1. Markdown table" note="Plain content: a docs page through MarkdownTable, a chat reply through Prose. The basic tier.">
        <div className={styles.pair}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ table: MarkdownTable }}>
            {MARKDOWN}
          </ReactMarkdown>
          <Prose>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{MARKDOWN}</ReactMarkdown>
          </Prose>
        </div>
      </Station>

      <Station id="bench-table" title="2. Table" note="The presentational table: plain, striped, bordered and compact.">
        <div className={styles.pair}>
          <Table
            columns={[{ key: "a", header: "Project" }, { key: "b", header: "Owner" }, { key: "c", header: "Due", align: "right" }]}
            rows={projectRows.slice(0, 4).map((r) => ({ id: r.id, cells: { a: r.values.name, b: r.values.owner, c: r.values.due } }))}
            striped
            columnDividers
            caption="Striped, column dividers"
          />
          <Table
            columns={[{ key: "a", header: "Project" }, { key: "b", header: "Owner" }, { key: "c", header: "Due", align: "right" }]}
            rows={projectRows.slice(0, 4).map((r) => ({ id: r.id, cells: { a: r.values.name, b: r.values.owner, c: r.values.due } }))}
            bordered
            size="compact"
            caption="Bordered, compact"
          />
        </div>
      </Station>

      <Station id="bench-simple" title="3. Sortable" note="DataTable with nothing but sortable headers: a reading table, every control in the Tab order.">
        <DataTable columns={listColumns} rows={projectRows.slice(0, 6)} caption="Sortable projects" />
      </Station>

      <Station id="bench-list" title="4. List" note="Linear and Stripe shaped: a row header, status and people, search, and row actions on hover.">
        <DataTable
          columns={listColumns}
          rows={projectRows}
          searchable
          searchPlaceholder="Search projects"
          caption="Projects"
          rowActions={() => [
            { id: "edit", label: "Edit", icon: "edit", inline: true, onSelect: () => {} },
            { id: "duplicate", label: "Duplicate", icon: "content_copy", onSelect: () => {} },
            { id: "archive", label: "Archive", icon: "archive", onSelect: () => {} },
            { id: "delete", label: "Delete", icon: "delete", destructive: true, onSelect: () => {} },
          ]}
        />
      </Station>

      <Station id="bench-paged" title="5. Paged and selectable" note="Pages of five, row selection with a select-all header, the count in the footer.">
        <DataTable columns={listColumns} rows={projectRows} pageSize={5} selectable caption="Paged projects" />
      </Station>

      <Station id="bench-columns" title="6. Columns" note="Resize by an edge (double-click to fit), drag a header to move it, and each header's menu: sort, pin, move, fit, reset, hide. Project is locked and pinned; the table scrolls under it. Column dividers on, pages of eight.">
        <DataTable
          columns={wideColumns}
          rows={projectRows}
          resizableColumns
          reorderableColumns
          columnMenu
          columnDividers
          pageSize={8}
          caption="Project columns"
        />
      </Station>

      <Station id="bench-rows" title="7. Rows" note="Drag a row's grip, or Alt+Up and Alt+Down on it; the header sticks while the body scrolls in its frame.">
        <DataTable
          columns={listColumns}
          rows={projectRows}
          reorderableRows
          stickyHeader
          maxHeight={320}
          caption="Ordered projects"
        />
      </Station>

      <Station id="bench-stress" title="8. Everything" note="Every column and row control at once, selection, actions, pins at both edges, pages of ten, column dividers, and a trend column that redraws on every commit: the table the gesture check drags.">
        <DataTable
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
          columnDividers
          caption="Every control"
          rowActions={() => [
            { id: "edit", label: "Edit", icon: "edit", inline: true, onSelect: () => {} },
            { id: "delete", label: "Delete", icon: "delete", destructive: true, onSelect: () => {} },
          ]}
        />
      </Station>
    </div>
  );
}
