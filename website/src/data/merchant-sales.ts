/**
 * What the merchant sales screen states beyond its rows: the KPI band and the
 * columns the table opens with, read by the screen and by its chat, so the
 * assistant can never quote a different figure from the one beside it. The KPIs
 * are pinned strings read off the seeded ledger (order-ledger.ts): change the
 * seed or the row count and they need reading again.
 */

export const MERCHANT_KPIS = [
  { icon: "payments", label: "Net revenue", value: "$51.7M", delta: "+59.0%", trend: "up" },
  { icon: "shopping_cart", label: "Orders", value: "2,072", delta: "+55.9%", trend: "up" },
  { icon: "receipt_long", label: "Average order", value: "$25,494", delta: "+1.2%", trend: "up" },
  { icon: "percent", label: "Margin", value: "34.6%", delta: "+0.1 pts", trend: "up" },
] as const;

type KpiRow = { values: Record<string, unknown> };

/* The month the band reports, against the one before: placed on these days, inclusive. */
const OCTOBER = ["2026-10-01", "2026-10-30"] as const;
const SEPTEMBER = ["2026-09-01", "2026-09-30"] as const;

function monthTotals(rows: readonly KpiRow[], [from, to]: readonly [string, string]) {
  let orders = 0;
  let kept = 0;
  let revenue = 0;
  let margin = 0;
  for (const { values } of rows) {
    const placed = String(values.placedOn);
    if (placed < from || placed > to) continue;
    orders += 1;
    /* Cancelled orders count as orders and stay out of the money, as the band has always said. */
    if (values.status === "Cancelled") continue;
    kept += 1;
    revenue += Number(values.netRevenue) || 0;
    margin += Number(values.margin) || 0;
  }
  return { orders, revenue, average: kept ? revenue / kept : 0, rate: revenue ? (margin / revenue) * 100 : 0 };
}

const change = (now: number, before: number) => (before ? ((now - before) / before) * 100 : 0);
const signed = (value: number, digits: number, unit: string) => `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(digits)}${unit}`;

/**
 * The KPI band worked out from rows: October against September, in the band's
 * own wording. Run over the seeded ledger it gives MERCHANT_KPIS exactly; run
 * over the ledger with the page's edits laid on it, it gives the band the reader
 * has made, so cancelling orders moves Net revenue.
 */
export function computeKpis(rows: readonly KpiRow[]) {
  const now = monthTotals(rows, OCTOBER);
  const before = monthTotals(rows, SEPTEMBER);
  const figures = [
    { value: `$${(now.revenue / 1e6).toFixed(1)}M`, delta: change(now.revenue, before.revenue), unit: "%", digits: 1 },
    { value: now.orders.toLocaleString("en-US"), delta: change(now.orders, before.orders), unit: "%", digits: 1 },
    { value: `$${Math.round(now.average).toLocaleString("en-US")}`, delta: change(now.average, before.average), unit: "%", digits: 1 },
    { value: `${now.rate.toFixed(1)}%`, delta: now.rate - before.rate, unit: " pts", digits: 1 },
  ];
  return MERCHANT_KPIS.map((kpi, index) => {
    const figure = figures[index];
    return { ...kpi, value: figure.value, delta: signed(figure.delta, figure.digits, figure.unit), trend: figure.delta >= 0 ? "up" : "down" } as const;
  });
}

/** The columns the table opens with, in order. The rest wait in its Columns panel. */
export const MERCHANT_SHOWN_COLUMNS = [
  "orderId",
  "placedOn",
  "product",
  "category",
  "customer",
  "channel",
  "status",
  "units",
  "netRevenue",
  "marginPct",
  "carrier",
  "daysLate",
];

/** What the table opens on: the month the KPI band reports. */
export const MERCHANT_OPENING_FILTER = { id: "placedOn-1", column: "placedOn", operator: "after", value: "2026-09-30" } as const;

/** The sort the table opens with. */
export const MERCHANT_OPENING_SORT = { key: "placedOn", direction: "desc" } as const;
