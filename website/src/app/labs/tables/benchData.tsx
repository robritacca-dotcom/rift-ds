/**
 * The tables bench's fictional data and the columns its stations share, so
 * the bench and its full-page view draw the same tables.
 */

import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { Badge } from "rift-ds/components/Badge/Badge";
import type {
  DataTableColumn,
  DataTableRow,
  DataTableRowAction,
} from "rift-ds/components/DataTable/DataTable";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import styles from "./TablesBench.module.css";

const STATUS = {
  Active: "positive",
  Paused: "warning",
  Failed: "error",
  Draft: "neutral",
} as const;
type Status = keyof typeof STATUS;

const PEOPLE = [
  "Priya Shah",
  "Sam Rivera",
  "Jordan Lee",
  "Lee Chen",
  "Alex Morgan",
  "Rae Okafor",
];
const PROJECTS = [
  "Website refresh",
  "Mobile app",
  "Billing migration",
  "Onboarding emails",
  "Partner portal",
  "Search tuning",
  "Pricing page",
  "Data export",
  "Help centre",
  "Status page",
  "Invoice redesign",
  "Team invites",
];

/** Fictional projects, `count` of them: past the named twelve, the names repeat with a number. */
export const makeProjectRows = (count: number): DataTableRow[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    values: {
      name:
        i < PROJECTS.length
          ? PROJECTS[i]
          : `${PROJECTS[i % PROJECTS.length]} ${Math.floor(i / PROJECTS.length) + 1}`,
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

export const projectRows = makeProjectRows(PROJECTS.length);

/* A trend per row: a seeded random walk with a little momentum, so each
   row draws a plausible line and the same one on every render. */
const trendFor = (id: string) => {
  let seed =
    [...id].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761), 7) >>>
    0;
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

const choices = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

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

export const listColumns: DataTableColumn[] = [
  { key: "name", header: "Project", sortable: true, rowHeader: true },
  { key: "owner", header: "Owner", sortable: true, render: personCell },
  { key: "status", header: "Status", sortable: true, render: statusCell },
  { key: "due", header: "Due", sortable: true, align: "end" },
];

export const wideColumns: DataTableColumn[] = [
  {
    key: "name",
    header: "Project",
    sortable: true,
    rowHeader: true,
    pin: "start",
    locked: true,
    width: "200px",
    cellText: "truncate",
  },
  {
    key: "owner",
    header: "Owner",
    sortable: true,
    render: personCell,
    width: "180px",
    options: choices(PEOPLE),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: statusCell,
    width: "140px",
    options: choices(Object.keys(STATUS)),
  },
  {
    key: "region",
    header: "Region",
    sortable: true,
    width: "140px",
    options: choices(["North", "South", "East", "West"]),
  },
  {
    key: "budget",
    header: "Budget",
    sortable: true,
    align: "end",
    width: "130px",
    render: (r) => money(r.values.budget),
  },
  {
    key: "spent",
    header: "Spent",
    sortable: true,
    align: "end",
    width: "130px",
    render: (r) => money(r.values.spent),
  },
  {
    key: "tasks",
    header: "Tasks",
    sortable: true,
    align: "end",
    width: "100px",
  },
  { key: "due", header: "Due", sortable: true, width: "130px" },
  { key: "note", header: "Note", width: "260px", cellText: "lines-2" },
];

export const stressColumns: DataTableColumn[] = [
  ...wideColumns.slice(0, 3),
  {
    key: "trend",
    header: "Trend",
    width: "140px",
    render: (r) => (
      <Sparkline
        data={trendFor(r.id)}
        width={100}
        height={24}
        label={`${r.values.name} trend`}
      />
    ),
  },
  ...wideColumns.slice(3, 8),
  {
    key: "note",
    header: "Note",
    width: "220px",
    cellText: "truncate",
    pin: "end",
  },
];

/** The Everything table's row actions: an inline edit, and delete in the More menu. */
export const stressActions = (): DataTableRowAction[] => [
  { id: "edit", label: "Edit", icon: "edit", inline: true, onSelect: () => {} },
  {
    id: "delete",
    label: "Delete",
    icon: "delete",
    destructive: true,
    onSelect: () => {},
  },
];
