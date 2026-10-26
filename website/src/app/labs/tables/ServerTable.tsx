"use client";

import { useEffect, useRef, useState } from "react";
import {
  DataTable,
  type DataTableFilter,
  type DataTableRow,
  type DataTableSort,
} from "rift-ds/components/DataTable/DataTable";
import { Slider } from "rift-ds/components/Slider/Slider";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
import { TableToolbar } from "rift-ds/components/TableToolbar/TableToolbar";
import { makeProjectRows, wideColumns } from "./benchData";
import styles from "./TablesBench.module.css";

/* A table whose rows live on a fake server: the table only reports what
   the reader asks for, and this component fetches a page that matches. The
   server sorts, filters, searches and pages a fixed list after a pause the
   reader sets, and fails the next request on demand. */
const SERVER_ROWS = makeProjectRows(240);
const PAGE_SIZE = 10;
const INITIAL_DELAY = 800;

type Query = { sorts: DataTableSort[]; filters: DataTableFilter[]; search: string; page: number; pageSize: number };
const INITIAL_QUERY: Query = { sorts: [], filters: [], search: "", page: 1, pageSize: PAGE_SIZE };

const text = (value: unknown) => (value == null ? "" : String(value)).toLowerCase();

/* The fake server's filter: the conditions the bench's columns offer. */
const passes = (filter: DataTableFilter, value: unknown) => {
  const v = filter.value;
  switch (filter.operator) {
    case "contains":
      return text(value).includes(text(v));
    case "notContains":
      return !text(value).includes(text(v));
    case "is":
      return text(value) === text(v);
    case "isNot":
      return text(value) !== text(v);
    case "isAnyOf":
      return Array.isArray(v) ? v.map(String).includes(String(value)) : true;
    case "gt":
      return Number(value) > Number(v);
    case "gte":
      return Number(value) >= Number(v);
    case "lt":
      return Number(value) < Number(v);
    case "lte":
      return Number(value) <= Number(v);
    case "eq":
      return Number(value) === Number(v);
    case "before":
      return String(value) < String(v);
    case "after":
      return String(value) > String(v);
    case "isEmpty":
      return value == null || value === "";
    case "isNotEmpty":
      return !(value == null || value === "");
    default:
      return true;
  }
};

function fetchPage(query: Query, delay: number, fail: boolean): Promise<{ rows: DataTableRow[]; total: number }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        reject(new Error("The server took too long to answer."));
        return;
      }
      const needle = query.search.trim().toLowerCase();
      let rows = SERVER_ROWS.filter(
        (row) =>
          (!needle || Object.values(row.values).some((value) => text(value).includes(needle))) &&
          query.filters.every((filter) => passes(filter, row.values[filter.column])),
      );
      rows = [...rows].sort((a, b) => {
        for (const { key, direction } of query.sorts) {
          const x = a.values[key];
          const y = b.values[key];
          const order =
            typeof x === "number" && typeof y === "number" ? x - y : text(x).localeCompare(text(y), "en");
          if (order !== 0) return direction === "asc" ? order : -order;
        }
        return 0;
      });
      const start = (query.page - 1) * query.pageSize;
      resolve({ rows: rows.slice(start, start + query.pageSize), total: rows.length });
    }, delay);
  });
}

export function ServerTable({ size, lines }: { size: "default" | "compact"; lines: boolean }) {
  const [delay, setDelay] = useState(INITIAL_DELAY);
  const [failNext, setFailNext] = useState(false);
  const [query, setQuery] = useState<Query>(INITIAL_QUERY);
  const [rows, setRows] = useState<DataTableRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const requestId = useRef(0);

  /* Every query, and every retry, is one request; a newer one wins. */
  const settle = (id: number, request: Promise<{ rows: DataTableRow[]; total: number }>) =>
    request.then(
      (result) => {
        if (id !== requestId.current) return;
        setRows(result.rows);
        setTotal(result.total);
        setError(undefined);
        setLoading(false);
      },
      (reason: Error) => {
        if (id !== requestId.current) return;
        setError(reason.message);
        setLoading(false);
      },
    );
  const run = (next: Query) => {
    setQuery(next);
    setLoading(true);
    if (failNext) setFailNext(false);
    requestId.current += 1;
    settle(requestId.current, fetchPage(next, delay, failNext));
  };
  /* The first page, fetched once on arrival. */
  useEffect(() => {
    settle(requestId.current, fetchPage(INITIAL_QUERY, INITIAL_DELAY, false));
  }, []);

  const update = (part: Partial<Query>) => run({ ...query, ...part });

  return (
    <div className={styles.phoneStation}>
      <div className={styles.serverControls}>
        <Slider
          size="compact"
          label="Latency (ms)"
          showValue
          min={0}
          max={3000}
          step={100}
          value={delay}
          onValueChange={setDelay}
        />
        <ToggleSwitch size="compact" label="Fail the next request" checked={failNext} onCheckedChange={setFailNext} />
      </div>
      <DataTable
        manual
        columns={wideColumns}
        rows={rows}
        rowCount={total}
        loading={loading}
        error={error}
        onRetry={() => run(query)}
        size={size}
        columnDividers={lines}
        selectable
        multiSort
        sorts={query.sorts}
        onSortsChange={(sorts) => update({ sorts, page: 1 })}
        filters={query.filters}
        onFiltersChange={(filters) => update({ filters, page: 1 })}
        search={query.search}
        onSearchChange={(search) => update({ search, page: 1 })}
        page={query.page}
        onPageChange={(page) => update({ page })}
        pageSize={query.pageSize}
        onPageSizeChange={(pageSize) => update({ pageSize: pageSize ?? PAGE_SIZE, page: 1 })}
        pageSizeOptions={[10, 25, 50]}
        caption="Projects on the server"
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
