"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { AppToolbar } from "rift-ds/components/AppToolbar/AppToolbar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import { openSitePalette } from "@/components/SitePalette/palette-bus";
import { useDemoNotifications } from "@/components/AppToolbarDemo/useDemoNotifications";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const noop = () => {};

export default function AppToolbarPage() {
  const notifications = useDemoNotifications();
  const actions = [
    notifications.action,
    { id: "calendar", icon: "calendar_today", label: "Calendar" },
    { id: "help", icon: "help", label: "Help" },
    { id: "settings", icon: "settings", label: "Settings", href: "#settings" },
  ];

  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>App toolbar</h1>
        <PageLinks storybookPath="/?path=/docs/components-apptoolbar--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>The bar along the top of an app</p>
        <p className={styles.introBody}>
          Most app screens keep the same few things above the page: the
          search, a few icon controls, the AI button and the page&apos;s
          primary action. AppToolbar lays them out in one order every time:
          the search, space, the icon controls, the AI button and the
          primary action. An icon control can open a panel of its own, such
          as the notifications here. It folds in steps as the bar narrows. Seat it in AppLayout&apos;s toolbar slot and it stays
          pinned while the page scrolls.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="Default" />
        <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
          <AppToolbar onSearch={openSitePalette} actions={actions} onChat={noop} />
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Primary action" />
        <p className={styles.introBody}>
          The page&apos;s one primary action goes last, after the AI button:
          a primary button with a leading icon, the same height as the AI
          button beside it.
        </p>
        <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
          <AppToolbar
            onSearch={openSitePalette}
            actions={actions}
            onChat={noop}
            primaryAction={{ label: "Move money", icon: "swap_horiz" }}
          />
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Compact" />
        <p className={styles.introBody}>
          The compact size sets every control at the 32px row height, for a
          denser app. The search, the icon controls, the AI button and the
          primary action always share one height, at either size.
        </p>
        <div className={styles.variantStack} style={{ alignItems: "stretch" }}>
          <AppToolbar
            size="compact"
            onSearch={openSitePalette}
            actions={actions}
            onChat={noop}
            primaryAction={{ label: "Move money", icon: "swap_horiz" }}
          />
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Narrowing" />
        <p className={styles.introBody}>
          The bar measures itself, not the screen, so beside an open rail or
          chat it folds the same way it does on a phone. The search keeps a
          usable width until there is no room for it. Then it folds in three
          steps: the AI button and the primary action to their icons, the
          search to its icon, and the icon controls after the first into a
          More menu.
        </p>
        {[640, 480, 340].map((width) => (
          <div key={width} className={styles.variantStack} style={{ alignItems: "stretch", maxWidth: `${width}px` }}>
            <AppToolbar
              onSearch={openSitePalette}
              actions={actions}
              onChat={noop}
              primaryAction={{ label: "Move money", icon: "swap_horiz" }}
            />
          </div>
        ))}
      </section>

      <ComponentInstallStrip slug="app-toolbar" />
    </div>
  );
}
