"use client";

/**
 * The merchant sales template: the sales view of Larkspur, a fictional commerce
 * back office, built from the design system alone. The shell is the template
 * family's (TemplateShell's switchable rail and surface, slim top bar) and the
 * assistant is live, not the family's mock (MerchantChat.tsx, seated in
 * TemplateAssistant). The page is a breadcrumbed head, the month's numbers as a KPI band,
 * then the wired DataTable, which sits directly on the page because it brings its
 * own bordered chrome (design.md's Composition rule 2). Its control bar is the
 * library's TableToolbar, with the AI command live: Describe sends the sentence to
 * the same model route as the labs bench, over the same seeded orders.
 * On a phone the rows stack as cards.
 *
 * The KPI band is pinned strings (website/src/data/merchant-sales.ts), read off the
 * seeded ledger for Oct 1 to 30, 2026 against September, leaving out cancelled orders
 * from the money, so the statically built HTML draws them with no rows to hand.
 * All of it is fictional, so the route is excluded from the chat corpus
 * (see EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import React, { useEffect, useRef } from "react";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { useChatAgentState, useChatWidget } from "rift-ds/chat";
import { Breadcrumb } from "rift-ds/components/Breadcrumb/Breadcrumb";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { Input } from "rift-ds/components/Input/Input";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { Stat } from "rift-ds/components/Stat/Stat";
import styles from "./MerchantSales.module.css";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import { MerchantChatProvider, MerchantChatWidget, type TableBridge } from "./MerchantChat";
import { AppFrameTabBar, useAppFrame } from "../AppFrame/AppFrame";
import TemplateShell from "../TemplateShell/TemplateShell";
import StickyTopBar from "../TemplateShell/StickyTopBar";
import { ProductMark } from "../ProductMark/ProductMark";
import { MERCHANT_KPIS } from "@/data/merchant-sales";
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

/* ---------------------------------------------------------------- page */

export default function MerchantSales() {
  const bridge = useRef<TableBridge | null>(null);
  return (
    <MerchantChatProvider bridge={bridge}>
      <MerchantSalesScreen bridge={bridge} />
    </MerchantChatProvider>
  );
}

function MerchantSalesScreen({ bridge }: { bridge: React.RefObject<TableBridge | null> }) {
  const { open, setOpen, toggleOpen, view, setView, returnFocusRef } = useChatWidget();
  const agentState = useChatAgentState();
  /* Closing hands focus back to whatever opened it, as the launcher does. */
  useEffect(() => {
    if (!open) returnFocusRef.current?.focus();
  }, [open, returnFocusRef]);

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
      chatOpen={open && view !== "full"}
      frame={{ title: "Sales", subtitle: "Larkspur · Merchant" }}
      contentClassName={styles.content}
      tabBar={
        <AppFrameTabBar
          sections={NAV_SECTIONS}
          activeKey="sales"
          productName="Larkspur"
          onAsk={toggleOpen}
        />
      }
      assistant={
        <TemplateAssistant
          open={open}
          onClose={() => {
            setOpen(false);
            setView("panel");
          }}
          title="Larkspur AI"
          chat={<MerchantChatWidget />}
          view={view}
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
                <AiButton
                  label="Ask AI"
                  state={agentState}
                  aria-expanded={open}
                  onClick={(event) => {
                    returnFocusRef.current = event.currentTarget;
                    toggleOpen();
                  }}
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
            {MERCHANT_KPIS.map((kpi) => (
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
            <OrdersTable bridge={bridge} />
          </section>
    </TemplateShell>
  );
}
