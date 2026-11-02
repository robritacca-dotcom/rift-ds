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
