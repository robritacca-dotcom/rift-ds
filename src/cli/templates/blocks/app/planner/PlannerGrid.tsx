'use client';

/**
 * The plan: rows of work grouped by team, one editable column per week from
 * periodColumns, a row total from totalOf, each team's subtotal on its group
 * row and the sum of every week in the totals row. Edits are kept in this
 * component's state; save them to your own store in onCellEdit.
 */

import { useState } from 'react';
import { DataTable, periodColumns, totalOf, type DataTableColumn, type DataTableRow } from 'rift-ds/components/DataTable/DataTable';

/** The first week shown, as YYYY-MM-DD. Yours is probably this week's Monday. */
const START = '2026-03-02';
const WEEKS = periodColumns({
  start: START,
  count: 6,
  unit: 'week',
  keyPrefix: 'w:',
  column: { type: 'number', align: 'end', editable: true, aggregate: 'sum', minWidth: 88 },
});
const WEEK_KEYS = WEEKS.map((column) => column.key);

const COLUMNS: DataTableColumn[] = [
  { key: 'work', header: 'Work', rowHeader: true, pin: 'start', minWidth: 180 },
  { key: 'team', header: 'Team', groupable: true },
  ...WEEKS,
  { key: 'total', header: 'Total', type: 'number', align: 'end', compute: totalOf(WEEK_KEYS), aggregate: 'sum', pin: 'end' },
];

const PLAN: [string, string, number[]][] = [
  ['Checkout redesign', 'Design', [4, 5, 5, 3, 2, 0]],
  ['Help centre refresh', 'Design', [1, 1, 2, 3, 3, 2]],
  ['Payments migration', 'Engineering', [8, 8, 10, 10, 6, 4]],
  ['Search indexing', 'Engineering', [3, 3, 2, 2, 4, 5]],
  ['Spring launch', 'Marketing', [2, 2, 3, 5, 6, 6]],
];

const ROWS: DataTableRow[] = PLAN.map(([work, team, days], index) => ({
  id: `p${index + 1}`,
  values: { work, team, ...Object.fromEntries(WEEK_KEYS.map((key, i) => [key, days[i]])) },
}));

export function PlannerGrid() {
  const [rows, setRows] = useState(ROWS);
  return (
    <DataTable
      caption="Days planned by week"
      columns={COLUMNS}
      rows={rows}
      defaultGrouping={['team']}
      totalsRow
      onCellEdit={({ row, key, value }) =>
        setRows((current) => current.map((r) => (r.id === row.id ? { ...r, values: { ...r.values, [key]: value } } : r)))
      }
    />
  );
}
