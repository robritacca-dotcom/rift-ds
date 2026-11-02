"use client";

/**
 * The merchant sales template: the sales view of Larkspur, a fictional commerce
 * back office, built from the design system alone. The shell is the template
 * family's (TemplateShell's switchable rail and surface, slim top bar), with no
 * assistant: Describe is this screen's AI. The page is a breadcrumbed head, the month's numbers as a KPI band,
 * then the wired DataTable, which sits directly on the page because it brings its
 * own bordered chrome (design.md's Composition rule 2). Its control bar is the
 * library's TableToolbar, with the AI command live: Describe sends the sentence to
 * the same model route as the labs bench, over the same seeded orders.
 * On a phone the rows stack as cards.
 *
 * The KPI band is pinned strings, read off the seeded
 * ledger (website/src/data/order-ledger.ts) for Oct 1 to 30, 2026 against September,
 * leaving out cancelled orders from the money, so the statically built HTML draws
 * them with no rows to hand. Change the ledger's seed or its row count and they need reading again.
 * All of it is fictional, so the route is excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { Breadcrumb } from "rift-ds/components/Breadcrumb/Breadcrumb";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { Input } from "rift-ds/components/Input/Input";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { Stat } from "rift-ds/components/Stat/Stat";
import styles from "./MerchantSales.module.css";
import { AppFrameTabBar, useAppFrame } from "../AppFrame/AppFrame";
import TemplateShell from "../TemplateShell/TemplateShell";
import StickyTopBar from "../TemplateShell/StickyTopBar";
import { ProductMark } from "../ProductMark/ProductMark";
import OrdersTable from "./OrdersTable";

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
  { icon: "payments", label: "Net revenue", value: "$51.7M", delta: "+59.0%", trend: "up" },
  { icon: "shopping_cart", label: "Orders", value: "2,072", delta: "+55.9%", trend: "up" },
  { icon: "receipt_long", label: "Average order", value: "$25,494", delta: "+1.2%", trend: "up" },
  { icon: "percent", label: "Margin", value: "34.6%", delta: "+0.1 pts", trend: "up" },
] as const;

/* ---------------------------------------------------------------- page */

export default function MerchantSales() {
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
      chatOpen={false}
      frame={{ title: "Sales", subtitle: "Larkspur · Merchant" }}
      contentClassName={styles.content}
      tabBar={
        <AppFrameTabBar
          sections={NAV_SECTIONS}
          activeKey="sales"
          productName="Larkspur"
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
                  tone="neutral"
                  ariaLabel="Search Larkspur"
                  className={styles.searchIconMobile}
                />
                <CircularButton
                  icon="notifications"
                  variant="secondary"
                  tone="neutral"
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
