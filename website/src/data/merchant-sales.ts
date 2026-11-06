/**
 * What the merchant sales screen states beyond its rows: the KPI band, the two
 * charts under it and the columns the table opens with, read by the screen and
 * by its chat, so the assistant can never quote a different figure from the one
 * beside it. The KPIs and the charts are pinned figures read off the seeded
 * ledger (order-ledger.ts), and computeKpis and computeCharts reproduce them
 * exactly: change the seed, the row count or the date spread and they need
 * reading again.
 */

export const MERCHANT_KPIS = [
  { icon: "payments", label: "Net revenue", value: "$32.8M", delta: "+6.2%", trend: "up" },
  { icon: "shopping_cart", label: "Orders", value: "1,355", delta: "+8.7%", trend: "up" },
  { icon: "receipt_long", label: "Average order", value: "$24,735", delta: "−2.7%", trend: "down" },
  { icon: "percent", label: "Margin", value: "35.0%", delta: "+1.9 pts", trend: "up" },
] as const;

type KpiRow = { values: Record<string, unknown> };

/** The period every KPI card names after its label ("Net revenue, October"); its delta is on the month before. */
export const MERCHANT_KPI_PERIOD = "October";

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

/* ---------------------------------------------------------------- charts */

/** The orders chart's three series, in stacking order: the ledger's six channels, grouped by who takes the order. */
export const MERCHANT_CHANNEL_GROUPS = [
  { label: "Online", channels: ["Web", "Mobile app", "Marketplace"] },
  { label: "Sales team", channels: ["Field sales", "Phone"] },
  { label: "Partners", channels: ["Partner"] },
] as const;
export const MERCHANT_CHANNELS = MERCHANT_CHANNEL_GROUPS.map((group) => group.label);
type MerchantChannel = (typeof MERCHANT_CHANNEL_GROUPS)[number]["label"];
const GROUP_OF = new Map<string, MerchantChannel>(MERCHANT_CHANNEL_GROUPS.flatMap((group) => group.channels.map((channel) => [channel, group.label] as const)));

/** The twelve months the charts draw, November 2025 to October 2026, and the twelve before them for the deltas. */
const CHART_MONTHS = ["2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];
const PRIOR_MONTHS = CHART_MONTHS.map((month) => `${Number(month.slice(0, 4)) - 1}${month.slice(4)}`);
const SHORT_MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * The two charts as pinned strings and series, read off the seeded ledger as the
 * band is: net revenue by month with the margin rate over it (cancelled orders
 * out of the money), and every order placed by month, stacked by channel group.
 * computeCharts gives this exactly over the seeded rows.
 */
export type MerchantCharts = {
  revenue: { total: string; delta: string; trend: "up" | "down"; margin: string; average: string; marginRange: string; months: readonly number[]; margins: readonly number[] };
  orders: { total: string; delta: string; trend: "up" | "down"; channels: Record<MerchantChannel, readonly number[]> };
};

export const MERCHANT_CHARTS: MerchantCharts = {
  revenue: {
    total: "$304.3M",
    delta: "+79.4%",
    trend: "up",
    margin: "34.7%",
    average: "$25.4M",
    marginRange: "33.1 to 36.2%",
    /* Net revenue in $M, then the margin rate in %, one per month. */
    months: [18.16, 20.63, 23.56, 21.22, 25.9, 24.03, 26.87, 23.27, 26.06, 30.86, 30.89, 32.8],
    margins: [33.9, 35.4, 33.3, 35, 36.2, 35.2, 35.1, 34.8, 35.6, 34.3, 33.1, 35],
  },
  orders: {
    total: "12,745",
    delta: "+75.7%",
    trend: "up",
    /* Orders per month for each channel group, in MERCHANT_CHANNEL_GROUPS order. */
    channels: {
      Online: [391, 470, 505, 452, 514, 514, 528, 531, 630, 613, 640, 689],
      "Sales team": [299, 281, 283, 285, 334, 300, 387, 394, 413, 413, 402, 408],
      Partners: [122, 152, 127, 138, 172, 163, 164, 177, 188, 204, 204, 258],
    },
  },
};

/**
 * The charts worked out from rows, in MERCHANT_CHARTS's shape: run over the
 * seeded ledger it gives MERCHANT_CHARTS exactly; over the ledger with the
 * page's edits laid on it, the charts the reader has made.
 */
export function computeCharts(rows: readonly KpiRow[]): MerchantCharts {
  const index = new Map([...CHART_MONTHS, ...PRIOR_MONTHS].map((month, at) => [month, at]));
  const revenue = new Array(24).fill(0);
  const margin = new Array(24).fill(0);
  const orders = new Array(24).fill(0);
  const channels = Object.fromEntries(MERCHANT_CHANNELS.map((group) => [group, new Array(12).fill(0)])) as Record<MerchantChannel, number[]>;
  for (const { values } of rows) {
    const at = index.get(String(values.placedOn).slice(0, 7));
    if (at === undefined) continue;
    orders[at] += 1;
    if (at < 12) channels[GROUP_OF.get(String(values.channel))!][at] += 1;
    if (values.status === "Cancelled") continue;
    revenue[at] += Number(values.netRevenue) || 0;
    margin[at] += Number(values.margin) || 0;
  }
  const sum = (list: number[]) => list.reduce((total, value) => total + value, 0);
  const revenueNow = sum(revenue.slice(0, 12));
  const ordersNow = sum(orders.slice(0, 12));
  const revenueChange = change(revenueNow, sum(revenue.slice(12)));
  const marginRates = revenue.slice(0, 12).map((value, at) => (value ? Math.round((margin[at] / value) * 1000) / 10 : 0));
  const ordersChange = change(ordersNow, sum(orders.slice(12)));
  return {
    revenue: {
      total: `$${(revenueNow / 1e6).toFixed(1)}M`,
      delta: signed(revenueChange, 1, "%"),
      trend: revenueChange >= 0 ? "up" : "down",
      margin: `${(revenueNow ? (sum(margin.slice(0, 12)) / revenueNow) * 100 : 0).toFixed(1)}%`,
      average: `$${(revenueNow / 12 / 1e6).toFixed(1)}M`,
      marginRange: `${Math.min(...marginRates).toFixed(1)} to ${Math.max(...marginRates).toFixed(1)}%`,
      months: revenue.slice(0, 12).map((value) => Math.round(value / 1e4) / 100),
      margins: marginRates,
    },
    orders: {
      total: ordersNow.toLocaleString("en-US"),
      delta: signed(ordersChange, 1, "%"),
      trend: ordersChange >= 0 ? "up" : "down",
      channels,
    },
  };
}

/** What the two charts say, in the words the assistant is given: the totals, never the month-by-month series, which query_data reaches. */
export function chartFacts(charts: MerchantCharts) {
  const channels = MERCHANT_CHANNELS.map((channel) => `${channel} ${charts.orders.channels[channel].reduce((total, count) => total + count, 0).toLocaleString("en-US")}`).join(", ");
  return [
    `Net revenue, last 12 months: ${charts.revenue.total} (${charts.revenue.delta} on the twelve months before), drawn as a bar per month with the margin rate as a line. Under it: Monthly average ${charts.revenue.average}; Margin range ${charts.revenue.marginRange} across the months. Margin over the twelve months is ${charts.revenue.margin}.`,
    `Orders, last 12 months: ${charts.orders.total} (${charts.orders.delta} on the twelve months before), drawn per month stacked in three channel groups: ${channels}. ${MERCHANT_CHANNEL_GROUPS.map((group) => `${group.label} is ${group.channels.join(", ")}`).join("; ")}.`,
  ];
}

/** A month's short name ("Oct") for each of the charts' twelve, in order. */
export const MERCHANT_CHART_LABELS = CHART_MONTHS.map((month) => SHORT_MONTH[Number(month.slice(5)) - 1]);

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
