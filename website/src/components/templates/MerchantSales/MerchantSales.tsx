"use client";

/**
 * The merchant sales template: the sales view of Larkspur, a fictional commerce
 * back office, built from the design system alone. The shell is the template
 * family's (TemplateShell's switchable rail and surface, slim top bar, docked mock
 * assistant); the page is a breadcrumbed head, the month's numbers as a KPI band,
 * then the wired DataTable, which sits directly on the page because it brings its
 * own bordered chrome (design.md's Composition rule 2). Its control bar is the
 * library's TableToolbar, with the AI command live: Describe sends the sentence to
 * the same model route as the labs bench, over the same seeded 100,000 orders.
 * On a phone the rows stack as cards.
 *
 * The KPI band and the assistant's answers are pinned strings, read off the seeded
 * ledger (website/src/data/order-ledger.ts) for Oct 1 to 30, 2026 against September,
 * leaving out cancelled orders from the money, so the statically built HTML draws
 * them with no rows to hand. Change the ledger's seed and they need reading again.
 * All of it is fictional, so the route is excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import React from "react";
import dynamic from "next/dynamic";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { Breadcrumb } from "rift-ds/components/Breadcrumb/Breadcrumb";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { Input } from "rift-ds/components/Input/Input";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { Stat } from "rift-ds/components/Stat/Stat";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import styles from "./MerchantSales.module.css";
import { AppFrameTabBar, useAppFrame } from "../AppFrame/AppFrame";
import TemplateShell from "../TemplateShell/TemplateShell";
import StickyTopBar from "../TemplateShell/StickyTopBar";
import { ProductMark } from "../ProductMark/ProductMark";

const OrdersTable = dynamic(() => import("./OrdersTable"), { ssr: false });

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    items: [
      { key: "sales", icon: "monitoring", label: "Sales" },
      {
        key: "products",
        icon: "inventory_2",
        label: "Products",
        children: [
          { key: "products-catalogue", label: "Catalogue" },
          { key: "products-inventory", label: "Inventory" },
          { key: "products-pricing", label: "Pricing" },
        ],
      },
      { key: "customers", icon: "group", label: "Customers" },
      { key: "fulfilment", icon: "local_shipping", label: "Fulfilment" },
      { key: "returns", icon: "assignment_return", label: "Returns" },
      { key: "promotions", icon: "sell", label: "Promotions" },
    ],
  },
  {
    items: [
      { key: "support", icon: "headset_mic", label: "Support" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

const KPIS = [
  { icon: "payments", label: "Net revenue", value: "$249.6M", delta: "+62.7%", trend: "up" },
  { icon: "shopping_cart", label: "Orders", value: "10,346", delta: "+56.2%", trend: "up" },
  { icon: "receipt_long", label: "Average order", value: "$24,764", delta: "+4.0%", trend: "up" },
  { icon: "percent", label: "Margin", value: "35.9%", delta: "+0.1 pts", trend: "up" },
] as const;

const CHAT_SUGGESTIONS = [
  { id: "best", label: "What sold best in October?" },
  { id: "late", label: "Which carrier runs latest?" },
  { id: "overdue", label: "How much is overdue?" },
];

const CHAT_REPLIES: Record<string, string> = {
  best: "Industrial leads October at $90.4M from 1,459 orders, ahead of Software at $70.8M and Furniture at $48.2M. The best-selling product is the air compressor at $26.1M.",
  late: "Meridian runs latest, averaging 2.02 days late across 1,674 October orders, then Atlas Freight at 1.52. Swiftway is the quickest at 0.70.",
  overdue:
    "581 October orders have overdue payments, worth $15.9M in net revenue. To see them, press Describe above the table and ask for overdue orders, largest first.",
};

const CHAT_FALLBACK =
  "This assistant is a mock, so only the suggested questions have real answers. Describe, above the table, is live: tell it what to show and the table changes.";

/* ---------------------------------------------------------------- page */

export default function MerchantSales() {
  const [chatOpen, setChatOpen] = React.useState(false);
  /* The templates carousel's Mobile mode: previewed as a phone app. */
  const appFrame = useAppFrame();

  return (
    <TemplateShell
      sidebar={{
        sections: NAV_SECTIONS,
        profile: { name: "Priya Raman", email: "priya@larkspur.example" },
        activeKey: "sales",
        logo: <ProductMark />,
        logoText: "Larkspur",
      }}
      chatOpen={chatOpen}
      frame={{ title: "Sales", subtitle: "Larkspur · Merchant" }}
      contentClassName={styles.content}
      tabBar={
        <AppFrameTabBar
          sections={NAV_SECTIONS}
          activeKey="sales"
          productName="Larkspur"
          onAsk={() => setChatOpen(true)}
        />
      }
      assistant={
        <TemplateAssistant
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          title="Larkspur AI"
          askLine="Ask about best sellers, carriers or overdue payments"
          suggestions={CHAT_SUGGESTIONS}
          replies={CHAT_REPLIES}
          fallback={CHAT_FALLBACK}
          disclaimer="A mock assistant with canned answers over this month's sales."
        />
      }
    >
          {!appFrame && (
          <StickyTopBar>
            <div className={styles.topBar}>
              <div className={styles.search}>
                <Input
                  placeholder="Search Larkspur"
                  iconLeft="search"
                  aria-label="Search Larkspur"
                />
                <span className={styles.searchKbd} aria-hidden="true">
                  <Kbd size="compact">⌘</Kbd>
                  <Kbd size="compact">K</Kbd>
                </span>
              </div>
              <div className={styles.topBarActions}>
                {/* Mobile: the full search field folds to this icon, riding
                    with the other actions on the right. */}
                <CircularButton
                  icon="search"
                  variant="secondary"
                  ariaLabel="Search Larkspur"
                  className={styles.searchIconMobile}
                />
                <AiButton
                  label="Ask AI"
                  onClick={() => setChatOpen(true)}
                />
                <CircularButton
                  icon="notifications"
                  variant="secondary"
                  ariaLabel="Notifications"
                />
              </div>
            </div>
          </StickyTopBar>
          )}

          {/* --------------------------------------------- page head */}
          <header className={styles.pageHead}>
            {!appFrame && (
            <div>
              <Breadcrumb
                items={[
                  { label: "Larkspur", href: "#" },
                  { label: "Sales" },
                ]}
              />
              <h1 className={styles.title}>Sales</h1>
            </div>
            )}
            <div className={styles.headActions}>
              <Button
                variant="secondary"
                size="compact"
                label="Export"
                iconLeft="download"
              />
              <Button
                variant="primary"
                size="compact"
                label="New order"
                iconLeft="add"
              />
            </div>
          </header>

          {/* -------------------------------------------- the month */}
          <section className={styles.kpiGrid} aria-label="October against September">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className={styles.kpi}>
                <span className={styles.kpiIcon} aria-hidden="true">
                  <span className="material-symbols-rounded">{kpi.icon}</span>
                </span>
                <Stat
                  value={kpi.value}
                  label={kpi.label}
                  delta={kpi.delta}
                  trend={kpi.trend}
                  deltaPlacement="auto"
                />
              </div>
            ))}
          </section>

          {/* ----------------------------------------- table section */}
          {/* The table sits directly on the page: the DataTable brings its own
              bordered chrome, so a panel around it would double-box it. */}
          <section className={styles.tableSection} aria-label="Orders">
            <OrdersTable />
          </section>
    </TemplateShell>
  );
}
