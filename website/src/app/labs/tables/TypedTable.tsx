"use client";

import { useEffect, useState } from "react";
import {
  DataTable,
  type DataTableCellEdit,
  type DataTableColumn,
  type DataTableRow,
} from "rift-ds/components/DataTable/DataTable";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";

/* Every column type, on fictional accounts, with no `render` anywhere: each
   column's `type` draws, aligns, sorts and filters it. The editable columns
   open the editor their type brings. The rows live in this component's
   state, as an app's would. */

const PEOPLE = ["Priya Shah", "Sam Rivera", "Jordan Lee", "Lee Chen", "Alex Morgan", "Rae Okafor"];
const ACCOUNTS = [
  "Northwind",
  "Fabrikam",
  "Contoso",
  "Tailspin",
  "Litware",
  "Adatum",
  "Proseware",
  "Woodgrove",
];
const TAGS = ["enterprise", "renewal", "pilot", "upsell", "at risk", "new"];

export const typedColumns: DataTableColumn[] = [
  { key: "account", header: "Account", type: "text", rowHeader: true, sortable: true, pin: "start", width: "160px" },
  {
    key: "stage",
    header: "Stage",
    type: "status",
    sortable: true,
    editable: true,
    width: "140px",
    // The options' order is the sort: a pipeline reads in its own order, not alphabetically.
    options: [
      { value: "lead", label: "Lead", status: "neutral" },
      { value: "trial", label: "Trial", status: "info" },
      { value: "proposal", label: "Proposal", status: "warning" },
      { value: "won", label: "Won", status: "positive" },
      { value: "lost", label: "Lost", status: "error" },
    ],
  },
  {
    key: "owner",
    header: "Owner",
    type: "person",
    sortable: true,
    editable: true,
    width: "180px",
    options: PEOPLE.map((person) => ({ value: person, label: person })),
  },
  { key: "team", header: "Team", type: "person", width: "120px" },
  { key: "value", header: "Value", type: "currency", sortable: true, editable: true, width: "120px" },
  { key: "seats", header: "Seats", type: "number", sortable: true, width: "100px" },
  { key: "onboarded", header: "Onboarded", type: "progress", sortable: true, width: "180px" },
  { key: "renews", header: "Renews", type: "date", sortable: true, editable: true, width: "140px" },
  { key: "contacted", header: "Last contact", type: "date", format: { date: "relative" }, sortable: true, width: "140px" },
  { key: "tags", header: "Tags", type: "tags", width: "200px" },
  { key: "billable", header: "Billable", type: "checkbox", sortable: true, editable: true, width: "100px" },
  { key: "site", header: "Site", type: "link", width: "180px" },
];

const DAY_MS = 86_400_000;
/* Dates from a fixed origin, so the bench reads the same on every render;
   the last-contact dates sit around `today` so relative dates read naturally. */
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const ORIGIN = Date.UTC(2026, 9, 1);

// Left empty on one row: an empty value draws nothing.
const contactedOn = (today: number, i: number) => (i === 5 ? null : isoDay(today - ((i * 9) % 70) * DAY_MS));

const makeTypedRows = (today: number): DataTableRow[] =>
  ACCOUNTS.map((account, i) => ({
    id: `a${i + 1}`,
    values: {
      account,
      stage: ["lead", "trial", "proposal", "won", "lost"][i % 5],
      owner: PEOPLE[i % PEOPLE.length],
      team: PEOPLE.slice(i % 3, (i % 3) + 1 + (i % 4)),
      value: 4000 + ((i * 7919) % 92000),
      seats: 5 + ((i * 37) % 480),
      onboarded: (i * 23) % 101,
      renews: isoDay(ORIGIN + ((i * 41) % 300) * DAY_MS),
      contacted: contactedOn(today, i),
      tags: TAGS.filter((_, t) => (i + t) % 3 === 0),
      billable: i % 3 !== 1,
      site: `https://www.${account.toLowerCase()}.example/`,
    },
  }));

/** The accounts as state. The page is prerendered, so the server and the
    first client render date the last contacts from ORIGIN, never the clock:
    a build on one day and a visit on the next would otherwise disagree and
    fail hydration. Once mounted, they move to around the real today. */
export function useTypedRows() {
  const [rows, setRows] = useState(() => makeTypedRows(ORIGIN));
  useEffect(() => {
    const today = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the clock is only read after hydration
    setRows((current) =>
      current.map((r) => ({ ...r, values: { ...r.values, contacted: contactedOn(today, Number(r.id.slice(1)) - 1) } })),
    );
  }, []);
  return [rows, setRows] as const;
}

export function TypedTable({ size, lines }: { size: "default" | "compact"; lines: boolean }) {
  const [rows, setRows] = useTypedRows();
  const onCellEdit = ({ row, key, value }: DataTableCellEdit) =>
    setRows((current) =>
      current.map((r) => (r.id === row.id ? { ...r, values: { ...r.values, [key]: value } } : r)),
    );
  return (
    <DataTable
      columns={typedColumns}
      rows={rows}
      size={size}
      columnDividers={lines}
      columnMenu
      multiSort
      onCellEdit={onCellEdit}
      caption="Accounts"
      toolbar={<TableToolbar />}
    />
  );
}
